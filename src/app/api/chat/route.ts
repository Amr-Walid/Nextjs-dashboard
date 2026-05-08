import adventureData from "../../../data/adventureworks.json";
import { DashboardData } from "@/services/adventureworks.service";

export const maxDuration = 30;
export const runtime = 'edge';

function getComprehensiveSummary() {
  const data = adventureData as unknown as DashboardData & { 
    customerIncome: { label: string; count: number }[],
    customerGender: { label: string; count: number }[],
    monthly: any[],
    quarterly: any[],
    groups: any[],
    kpis: any,
    yearly: any,
    territories: any,
    topProducts: any[]
  };
  
  // Send ALL data - gemini-2.5-flash handles it easily
  return JSON.stringify({
    kpis: data.kpis,
    yearly: data.yearly,
    // All products with full details
    topProducts: data.topProducts?.map((p) => ({
      name: p.name,
      sales: p.sales,
      profit: p.profit,
      profitMargin: p.profitMargin,
      qty: p.qty,
      orders: p.orders,
    })),
    // All territories with full details
    territories: data.territories,
    // Regional groups
    groups: data.groups,
    // Demographics
    demographics: {
      income: data.customerIncome,
      gender: data.customerGender
    },
    // Monthly trends (all months)
    monthly: data.monthly?.map((m) => ({
      month: m.month,
      sales: m.sales,
      profit: m.profit,
      orders: m.orders,
      qty: m.qty,
    })),
    // Quarterly data
    quarterly: data.quarterly,
  }, null, 0);
}

const dataSummary = getComprehensiveSummary();

const systemPrompt = `أنت الخبير التقني والمساعد الذكي للوحة تحكم AdventureWorks. 
لديك وصول كامل وشامل لجميع البيانات التالية:
${dataSummary}

قدراتك وصلاحياتك:
1. تحليل المبيعات (Sales) والأرباح (Profit) عبر السنين والشهور والأرباع والمناطق.
2. معرفة تفاصيل جميع المنتجات (الأسعار، المبيعات، الأرباح، هوامش الربح، الكميات).
3. تحليل ديموغرافية العملاء (توزيع الدخل والنوع).
4. المقارنة بين أداء المناطق الجغرافية والمجموعات (أمريكا الشمالية، أوروبا، المحيط الهادئ).
5. تحليل الاتجاهات الشهرية والفصلية ومعدلات النمو.

قواعد الرد:
- كن دقيقاً جداً في الأرقام (استخدم الأرقام من البيانات).
- قدم تحليلات ذكية ومقارنات عند الحاجة.
- استخدم لغة عربية احترافية وودودة.
- نظم ردودك باستخدام النقاط أو الجداول البسيطة إذا لزم الأمر.
- !!مهم جداً!! اجعل ردودك مختصرة ومركزة (لا تتجاوز 150 كلمة). ادخل في الموضوع مباشرة بدون مقدمات طويلة.
- لا تذكر أبداً أنك ترى "بيانات JSON" بل تحدث كخبير يحلل لوحة التحكم مباشرة.
- لا تكتب مقدمة ترحيبية أو خاتمة. فقط قدم المعلومات المطلوبة مباشرة.`;

async function callGemini(apiKey: string, contents: any[]): Promise<string> {
  const maxAttempts = 4;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: {
            maxOutputTokens: 1500,
          },
        }),
      }
    );

    if ((response.status === 503 || response.status === 429) && attempt < maxAttempts) {
      const delay = attempt * 2000; // 2s, 4s, 6s
      console.log(`[CHAT] Attempt ${attempt}/${maxAttempts} got ${response.status}, retrying in ${delay/1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      continue;
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error("[CHAT] API Error:", response.status, errText);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "عذراً، لم أتمكن من الإجابة.";
  }
  
  throw new Error("All attempts failed");
}

export async function POST(req: Request) {
  const t0 = Date.now();
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";
    
    const contents = (messages as any[]).map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: String(m.content || "") }],
    }));

    const text = await callGemini(apiKey, contents);
    console.log(`[CHAT] ✅ Response in ${Date.now() - t0}ms, length: ${text.length}`);

    // Send full response at once - no artificial delays that can cause mobile drops
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(text));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error: unknown) {
    console.error("Chat API Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

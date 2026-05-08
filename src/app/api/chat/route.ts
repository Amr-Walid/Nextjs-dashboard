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
  const maxAttempts = 5;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
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

    // Handle rate limits gracefully with longer waits
    if ((response.status === 503 || response.status === 429) && attempt < maxAttempts) {
      // Parse Google's recommended retry delay if available
      let delay = attempt * 3000; // 3s, 6s, 9s, 12s
      try {
        const errBody = await response.json();
        const retryInfo = errBody?.error?.details?.find((d: any) => d["@type"]?.includes("RetryInfo"));
        if (retryInfo?.retryDelay) {
          const seconds = parseFloat(retryInfo.retryDelay);
          if (!isNaN(seconds)) delay = Math.ceil(seconds * 1000) + 500;
        }
      } catch { /* ignore parse errors */ }
      
      console.log(`[CHAT] Attempt ${attempt}/${maxAttempts} got ${response.status}, retrying in ${delay / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      continue;
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error("[CHAT] API Error:", response.status, errText);
      
      // Return a friendly Arabic message instead of a raw error
      if (response.status === 429) {
        return "⏳ الخدمة مشغولة حالياً بسبب كثرة الطلبات. يرجى الانتظار 30 ثانية ثم المحاولة مرة أخرى.";
      }
      if (response.status === 503) {
        return "⏳ الخدمة غير متاحة مؤقتاً بسبب ضغط عالٍ. يرجى المحاولة بعد قليل.";
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "عذراً، لم أتمكن من الإجابة.";
  }

  return "⏳ الخدمة مشغولة حالياً. يرجى الانتظار 30 ثانية ثم المحاولة مرة أخرى.";
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

    // Send full response at once
    return new Response(text, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: unknown) {
    console.error("Chat API Error:", error);
    // Return friendly error message instead of JSON error
    return new Response("⚠️ حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.", {
      status: 200, // Return 200 so the frontend treats it as a message
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

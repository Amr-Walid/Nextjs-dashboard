import adventureData from "../../../data/adventureworks.json";
import { DashboardData } from "@/services/adventureworks.service";

export const maxDuration = 30;
export const runtime = 'edge';

function getComprehensiveSummary() {
  const data = adventureData as unknown as DashboardData & {
    customerIncome: { label: string; count: number }[],
    customerGender: { label: string; count: number }[],
    monthly: any[],
    kpis: any,
    yearly: any,
    territories: any,
    topProducts: any[]
  };

  // Restoring the "optimized" version from commit 0e2698e
  return JSON.stringify({
    kpis: data.kpis,
    yearly: data.yearly,
    topProducts: data.topProducts?.slice(0, 20).map((p: any) => ({
      name: p.name,
      sales: p.sales,
      profit: p.profit,
      qty: p.qty
    })),
    territories: data.territories,
    demographics: {
      income: data.customerIncome,
      gender: data.customerGender
    },
    monthlyTrends: data.monthly?.map((m: any) => ({
      m: m.month,
      s: m.sales,
      p: m.profit
    }))
  }, null, 0);
}

const dataSummary = getComprehensiveSummary();

const systemPrompt = `أنت الخبير التقني والمساعد الذكي للوحة تحكم AdventureWorks. 
لديك وصول كامل وشامل للبيانات التالية بصيغة JSON مضغوطة:
${dataSummary}

قدراتك وصلاحياتك:
1. تحليل المبيعات (Sales) والأرباح (Profit) عبر السنين والشهور والمناطق.
2. معرفة تفاصيل المنتجات الأكثر مبيعاً والأكثر ربحية.
3. تحليل ديموغرافية العملاء (الدخل والنوع).
4. المقارنة بين أداء المناطق الجغرافية المختلفة.

قواعد الرد:
- كن دقيقاً جداً في الأرقام (استخدم الأرقام المذكورة في البيانات).
- قدم تحليلات ذكية (مثلاً: "نلاحظ أن سنة 2007 كانت الأفضل من حيث المبيعات").
- استخدم لغة عربية احترافية وودودة.
- اجعل ردودك منظمة باستخدام النقاط أو الجداول البسيطة إذا لزم الأمر.
- لا تذكر أبداً أنك ترى "بيانات JSON" بل تحدث كخبير يحلل لوحة التحكم مباشرة.`;

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

    if ((response.status === 503 || response.status === 429) && attempt < maxAttempts) {
      const delay = attempt * 2000;
      console.log(`[CHAT] Attempt ${attempt}/${maxAttempts} got ${response.status}, retrying in ${delay / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      continue;
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error("[CHAT] API Error:", response.status, errText);
      if (response.status === 429) return "⏳ الخدمة مشغولة، يرجى الانتظار قليلاً ثم المحاولة مرة أخرى.";
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "عذراً، لم أتمكن من الإجابة.";
  }

  return "⏳ الخدمة مشغولة حالياً، يرجى المحاولة لاحقاً.";
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

    return new Response(text, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error: unknown) {
    console.error("Chat API Error:", error);
    return new Response("⚠️ حدث خطأ في الاتصال، يرجى المحاولة مرة أخرى.", {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

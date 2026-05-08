import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import adventureData from "../../../data/adventureworks.json";

export const maxDuration = 30;
export const runtime = 'edge';

function getComprehensiveSummary() {
  const data = adventureData as any;
  
  // Create a highly optimized but COMPREHENSIVE version of the data
  return JSON.stringify({
    kpis: data.kpis,
    // Send all yearly data
    yearly: data.yearly,
    // Send top 20 products (instead of 5)
    topProducts: data.topProducts?.slice(0, 20).map((p: any) => ({
      name: p.name,
      sales: p.sales,
      profit: p.profit,
      qty: p.qty
    })),
    // Send all territories
    territories: data.territories,
    // Send demographics
    demographics: {
      income: data.customerIncome,
      gender: data.customerGender
    },
    // Send monthly trends but only key metrics to save space
    monthlyTrends: data.monthly?.map((m: any) => ({
      m: m.month,
      s: m.sales,
      p: m.profit
    }))
  }, null, 0);
}

const dataSummary = getComprehensiveSummary();

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";
    
    const google = createGoogleGenerativeAI({ apiKey });
    const model = google("gemini-3.1-flash-lite");

    const coreMessages = messages.map((m: any) => ({
      role: m.role as "user" | "assistant",
      content: String(m.content || ""),
    }));

    const result = streamText({
      model,
      system: `أنت الخبير التقني والمساعد الذكي للوحة تحكم AdventureWorks. 
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
- لا تذكر أبداً أنك ترى "بيانات JSON" بل تحدث كخبير يحلل لوحة التحكم مباشرة.`,
      messages: coreMessages,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import adventureData from "../../../data/adventureworks.json";

export const maxDuration = 30;

function getDataSummary() {
  const data = adventureData as any;
  
  // Extracting data based on ACTUAL adventureworks.json structure
  const kpis = data.kpis || {};
  const topProducts = data.topProducts || [];
  const territories = data.territories || [];
  
  const summary = {
    overview: {
      totalSales: kpis.totalSales,
      totalOrders: kpis.totalOrders,
      totalCustomers: kpis.totalCustomers,
      totalProfit: kpis.totalProfit,
      profitMargin: kpis.profitMargin + "%"
    },
    bestSellingProducts: topProducts.slice(0, 5).map((p: any) => ({
      name: p.name,
      sales: p.sales,
      qty: p.qty
    })),
    topRegions: territories.slice(0, 3).map((t: any) => ({
      region: t.region,
      sales: t.sales
    }))
  };

  return JSON.stringify(summary, null, 0);
}

const dataSummary = getDataSummary();

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
      system: `أنت مساعد ذكي لخبير بيانات. إليك ملخص البيانات الحقيقية للوحة التحكم:
${dataSummary}

تعليمات:
1. أجب بدقة بناءً على الأرقام أعلاه.
2. إذا سألك المستخدم "اهلا" أو ما شابه، رحب به واذكر له ملخصاً سرياً عن المبيعات (مثلاً: إجمالي المبيعات هو 29 مليون).
3. استخدم العملة (دولار) والنسب المئوية.
4. الرد يكون باللغة العربية حصراً وبأسلوب احترافي.`,
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

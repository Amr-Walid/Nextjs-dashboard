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

  return JSON.stringify({
    kpis: data.kpis,
    yearly: data.yearly,
    topProducts: data.topProducts?.slice(0, 15).map((p: any) => ({
      name: p.name,
      sales: p.sales,
      profit: p.profit
    })),
    territories: data.territories,
    demographics: {
      income: data.customerIncome,
      gender: data.customerGender
    },
    monthlyTrends: data.monthly?.slice(-12).map((m: any) => ({
      m: m.month,
      s: m.sales,
      p: m.profit
    }))
  }, null, 0);
}

const dataSummary = getComprehensiveSummary();

const systemPrompt = `أنت مساعد ذكي للوحة تحكم AdventureWorks. 
لديك البيانات التالية:
${dataSummary}

قواعد:
1. استخدم الأرقام الدقيقة.
2. اجب بالعربية باختصار (أقل من 150 كلمة).
3. لا تذكر JSON.`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";

    const contents = (messages as any[]).map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: String(m.content || "") }],
    }));

    const maxAttempts = 4;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:streamGenerateContent?alt=sse&key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents,
            generationConfig: { maxOutputTokens: 1000 },
          }),
        }
      );

      // If it's 503 or 429, retry
      if ((response.status === 503 || response.status === 429) && attempt < maxAttempts) {
        console.log(`[CHAT] Attempt ${attempt} failed with ${response.status}. Retrying...`);
        await new Promise(resolve => setTimeout(resolve, attempt * 1500));
        continue;
      }

      if (!response.ok) {
        // Ultimate failure
        return new Response("⚠️ الخدمة مشغولة جداً الآن (High Demand). يرجى المحاولة بعد قليل.", { 
          status: 200, 
          headers: { "Content-Type": "text/plain; charset=utf-8" } 
        });
      }

      // Success! Return the stream
      return new Response(response.body, {
        headers: { "Content-Type": "text/event-stream" },
      });
    }
    
    return new Response("⚠️ تعذر الاتصال بالخدمة.", { 
      status: 200, 
      headers: { "Content-Type": "text/plain; charset=utf-8" } 
    });

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return new Response("⚠️ حدث خطأ في الاتصال.", { 
      status: 200, 
      headers: { "Content-Type": "text/plain; charset=utf-8" } 
    });
  }
}

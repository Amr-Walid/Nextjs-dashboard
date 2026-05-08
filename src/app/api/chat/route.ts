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

async function callGemini(apiKey: string, contents: any[]): Promise<string> {
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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

      if ((response.status === 503 || response.status === 429) && attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1500 * attempt));
        continue;
      }

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || "عذراً، لم أتمكن من الإجابة.";
    } catch (e) {
      if (attempt === maxAttempts) throw e;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return "⏳ الخدمة مشغولة، يرجى المحاولة بعد قليل.";
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";

    const contents = (messages as any[]).map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: String(m.content || "") }],
    }));

    const text = await callGemini(apiKey, contents);

    // Using a Stream for better mobile stability (keeps connection alive)
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const chunkSize = 20;
        for (let i = 0; i < text.length; i += chunkSize) {
          controller.enqueue(encoder.encode(text.slice(i, i + chunkSize)));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { 
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Transfer-Encoding": "chunked"
      },
    });
  } catch (error: any) {
    return new Response("⚠️ حدث خطأ في الاتصال، حاول مرة أخرى.", { status: 200 });
  }
}

import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { lang, data } = await req.json();
    let apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.log("AI_ERROR: GEMINI_API_KEY missing in .env");
      return NextResponse.json({ error: "NO_KEY", summary: "AI key missing in .env" }, { status: 200 });
    }

    // Initialize with 2026 SDK protocols
    const ai = new GoogleGenAI({
      apiKey: apiKey.trim()
    });

    const prompt = `
      You are Orbit.Pro - a friendly, witty, and slightly funny personal AI finance/habit assistant.
      User Data:
      - Balance: ${data.balance}
      - Efficiency: ${data.efficiency}%
      - Top Category: ${data.topExpense}
      - Recent: ${JSON.stringify(data.recentHighlights)}

      TASK: Provide a 1-sentence "Executive Summary" in ${lang}.
      Tone: "Friendly Observer", clever, funny, but professional.
      RESPOND ONLY with the 1-sentence text.
    `;

    console.log("--------------------------------AI_STRATEGIC_PROMPT (2026)-------------------------");
    console.log(prompt);
    console.log("----------------------------------------------------------------------------------");

    const tryGenerate = async () => {
      return await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });
    };

    let response;
    try {
      response = await tryGenerate();
    } catch (e: any) {
      if (e.message?.includes("500") || e.message?.includes("Internal error")) {
        console.log("AI_RETRY: Google 500 detected, retrying in 1s...");
        await new Promise(r => setTimeout(r, 1000));
        response = await tryGenerate();
      } else {
        throw e;
      }
    }

    const text = response.text;

    if (!text) {
      console.log("AI_ERROR: EMPTY_TEXT_RESPONSE", response);
      throw new Error("EMPTY_AI_RESPONSE");
    }

    console.log("--------------------------------AI_STRATEGIC_RESPONSE (2026)-----------------------");
    console.log(text.trim());
    console.log("----------------------------------------------------------------------------------");

    return NextResponse.json({ summary: text.trim() });
  } catch (error: any) {
    console.error("AI_STRATEGIC_ERROR:", error.message || error);
    return NextResponse.json({ error: "FAILED", summary: `AI Sync Error (2026): ${error.message || 'Unknown'}` }, { status: 200 });
  }
}

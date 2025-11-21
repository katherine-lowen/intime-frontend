// src/app/api/ai-note-assist/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { text, mode } = (await req.json()) as {
      text: string;
      mode?: "polish" | "shorten";
    };

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 },
      );
    }

    const style =
      mode === "shorten"
        ? "Make this note shorter but keep all key signal for a hiring manager."
        : "Rewrite this note to be clearer, concise, and professional for internal ATS notes.";

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You rewrite internal recruiter/hiring manager notes. Be concise, neutral, and factual.",
        },
        {
          role: "user",
          content: `${style}\n\nOriginal note:\n${text}`,
        },
      ],
      temperature: 0.3,
    });

    const newText = completion.choices[0].message.content ?? text;

    return NextResponse.json({ text: newText.trim() });
  } catch (err) {
    console.error("AI note assist error:", err);
    return NextResponse.json(
      { error: "Failed to rewrite note" },
      { status: 500 },
    );
  }
}

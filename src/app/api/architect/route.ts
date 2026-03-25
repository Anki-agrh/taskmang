import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { projectGoal } = await req.json();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are the ARCHITECT AGENT of an AI Operating System.
      Project Goal: "${projectGoal}"
      Break this into exactly 5 tasks.
      Output ONLY valid JSON in this format:
      [
        {"task_name": "...", "description": "...", "required_skill": "Senior/Mid/Junior", "estimated_time": "2h", "priority": "High/Med/Low"}
      ]
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/```json|```/g, "").trim();
    const tasks = JSON.parse(responseText);

    // Save to Firestore Audit Log
    await addDoc(collection(db, "logs"), {
      agent: "ARCHITECT",
      action: "TASK_CREATION",
      reason: `Project Started: ${projectGoal}`,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ success: true, tasks });
  } catch (error) {
    return NextResponse.json({ success: false, error: "AI Failed" });
  }
}
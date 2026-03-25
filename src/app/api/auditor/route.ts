import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase"; // Using relative path for safety
import { collection, addDoc } from "firebase/firestore";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { task } = await req.json();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are the QUALITY AUDITOR AGENT. 
      Analyze this completed task: ${JSON.stringify(task)}
      
      Action: Simulate a quality review.
      Return ONLY a JSON object with:
      "score": (a random number between 7 and 10),
      "quality_reason": "A brief explanation of why it passed",
      "improvement_tip": "One technical tip to make it better"
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/```json|```/g, "").trim();
    const auditResult = JSON.parse(responseText);

    // AUDIT LOG
    await addDoc(collection(db, "logs"), {
      agent: "QUALITY_AUDITOR",
      action: "TASK_STRESS_TEST",
      reason: `Audited task: ${task.task_name} with score ${auditResult.score}`,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, ...auditResult });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Audit failed" });
  }
}
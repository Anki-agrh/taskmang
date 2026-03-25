import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { tasks } = await req.json();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are the ORCHESTRATOR AGENT. 
      Input: A list of tasks: ${JSON.stringify(tasks)}
      Action: Assign each task to a specific AI Agent type (Junior, Mid, or Senior).
      Rules:
      - Junior: Simple UI or documentation.
      - Mid: Logic and API integration.
      - Senior: Security, Database architecture, or Complex AI logic.
      
      Return ONLY a JSON array of objects. Each object must include the original task details PLUS:
      "assigned_to": "Junior/Mid/Senior Agent",
      "assignment_reason": "Why this agent was chosen"
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/```json|```/g, "").trim();
    const assignedTasks = JSON.parse(responseText);

    // AUDIT LOG
    await addDoc(collection(db, "logs"), {
      agent: "ORCHESTRATOR",
      action: "TASK_ASSIGNMENT",
      reason: "Optimized workload distribution based on task complexity",
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, assignedTasks });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Orchestration failed" });
  }
}
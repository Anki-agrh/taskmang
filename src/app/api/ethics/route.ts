import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import { collection, getDocs, limit, query, orderBy } from "firebase/firestore";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function GET() {
  try {
    // 1. Fetch the last 20 logs from Firestore to analyze patterns
    const logsRef = collection(db, "logs");
    const q = query(logsRef, orderBy("timestamp", "desc"), limit(20));
    const querySnapshot = await getDocs(q);
    const logsData = querySnapshot.docs.map(doc => doc.data());

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are the ETHICS & RELIABILITY AGENT. 
      Analyze these system logs: ${JSON.stringify(logsData)}
      
      Tasks:
      1. Detect workload imbalance (e.g., is one agent getting all the tasks?).
      2. Check for scoring bias in the Auditor.
      
      Return ONLY a JSON object:
      {
        "fairness_score": (1-100),
        "bias_detected": true/false,
        "warning_message": "A professional warning if imbalance > 40%",
        "recommendation": "How to fix the system flow"
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/```json|```/g, "").trim();
    const ethicsReport = JSON.parse(responseText);

    return NextResponse.json({ success: true, ...ethicsReport });
  } catch (error) {
    console.error("Ethics Error:", error);
    return NextResponse.json({ success: false, error: "Ethics analysis failed" });
  }
}
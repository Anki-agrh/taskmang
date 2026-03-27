import { NextResponse } from 'next/server';
import { model } from '@/lib/gemini';

export async function POST(req: Request) {
try {
console.log("Architect API HIT");


const { projectGoal } = await req.json();

const prompt = `Break this project into 5 tasks: ${projectGoal}. 
Return ONLY JSON array with task_name, description, required_skill, priority`;

let tasks = [];

try {
  // 🔹 TRY AI
  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  console.log("Gemini Response:", responseText);

  const cleaned = responseText.replace(/```json|```/g, "").trim();
  tasks = JSON.parse(cleaned);

} catch (aiError) {
  console.log("⚠️ AI FAILED → USING FALLBACK");

  // 🔥 FALLBACK (ALWAYS WORKING)
  tasks = [
    {
      task_name: "Requirement Analysis",
      description: `Understand requirements for ${projectGoal}`,
      required_skill: "Business Analysis",
      priority: "High"
    },
    {
      task_name: "System Design",
      description: "Design architecture and workflow",
      required_skill: "System Design",
      priority: "High"
    },
    {
      task_name: "Frontend Development",
      description: "Build UI and dashboard",
      required_skill: "Frontend",
      priority: "Medium"
    },
    {
      task_name: "Backend Development",
      description: "Create APIs and database",
      required_skill: "Backend",
      priority: "High"
    },
    {
      task_name: "Testing & Deployment",
      description: "Test system and deploy",
      required_skill: "DevOps",
      priority: "Medium"
    }
  ];
}

return NextResponse.json({ tasks });

} catch (error: any) {
console.error("FULL ERROR:", error);

return NextResponse.json({
  error: error.message || "Unknown error"
}, { status: 500 });

}
}

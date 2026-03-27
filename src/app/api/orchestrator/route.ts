import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { tasks } = await req.json();

    // 🔥 Dummy team (THIS is what you were missing)
    const team = [
      { name: "Ankita", skill: "Frontend" },
      { name: "Rahul", skill: "Backend" },
      { name: "Priya", skill: "DevOps" },
      { name: "Amit", skill: "Business Analysis" }
    ];

    // 🔥 Assign tasks based on skill
    const assignedTasks = tasks.map((task: any, index: number) => {
      const member =
        team.find(t => t.skill === task.required_skill) ||
        team[index % team.length];

      return {
        ...task,
        assigned_to: member.name,
        status: "Pending"
      };
    });

    return NextResponse.json({ assignedTasks });

  } catch (error) {
    return NextResponse.json({ error: "Orchestrator failed" }, { status: 500 });
  }
}
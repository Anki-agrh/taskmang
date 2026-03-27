"use client";
import { useState } from "react";

export default function Home() {
const [goal, setGoal] = useState("");
const [tasks, setTasks] = useState([]);
const [loading, setLoading] = useState(false);

const handleBuild = async () => {
if (!goal) return;


setLoading(true);
setTasks([]);

try {
  console.log("START");

  // 🔹 ARCHITECT
  const res = await fetch("/api/architect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectGoal: goal }),
  });

  const data = await res.json();
  console.log("ARCH:", data);

  if (data.tasks) {
    setTasks(data.tasks);

    // 🔹 ORCHESTRATOR
    const orchRes = await fetch("/api/orchestrator", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tasks: data.tasks }),
    });

    const orchData = await orchRes.json();
    console.log("ORCH:", orchData);

    if (orchData.assignedTasks) {
      setTasks(orchData.assignedTasks);

      // 🔹 AUDITOR
      if (orchData.assignedTasks.length > 0) {
        const audRes = await fetch("/api/auditor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ task: orchData.assignedTasks[0] }),
        });

        const audData = await audRes.json();
        console.log("AUD:", audData);
      }
    }
  }

} catch (err) {
  console.error("ERROR:", err);
}

setLoading(false);


};

return ( <main className="min-h-screen bg-black text-white p-10"> <h1 className="text-3xl font-bold text-blue-500 mb-6">
AGENT_OS (Working Mode) </h1>


  <div className="flex gap-3 mb-8">
    <input
      value={goal}
      onChange={(e) => setGoal(e.target.value)}
      placeholder="Enter project..."
      className="flex-1 bg-zinc-900 p-3 rounded"
    />

    <button
      onClick={handleBuild}
      className="bg-blue-600 px-6 rounded"
    >
      {loading ? "Running..." : "Execute"}
    </button>
  </div>

  <div className="grid gap-4">
    {tasks.map((task: any, i) => (
      <div key={i} className="bg-zinc-900 p-4 rounded">
        <h3 className="text-blue-400">{task.task_name}</h3>
        <p className="text-sm text-zinc-400">{task.description}</p>

        <div className="text-xs mt-2">
          {task.required_skill} | {task.priority} | {task.assigned_to || "..." }
        </div>
      </div>
    ))}
  </div>
</main>


);
}

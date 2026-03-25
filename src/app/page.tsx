"use client";
import { useState } from "react";
import { useStore } from "../lib/store";
import { 
  Terminal, 
  Lightbulb, 
  ClipboardList, 
  Activity, 
  Cpu, 
  ShieldCheck,
  UserCheck,
  Zap,
  ShieldAlert,
  BarChart3
} from "lucide-react";

export default function Dashboard() {
  const [projectGoal, setProjectGoal] = useState("");
  const [status, setStatus] = useState("IDLE"); 
  const [ethicsReport, setEthicsReport] = useState<any>(null);
  
  const { tasks, setTasks, logs, addLog } = useStore();

  // --- MAIN MULTI-AGENT PIPELINE ---
  const startProject = async () => {
    if (!projectGoal) return alert("Please enter a project goal!");
    
    setTasks([]);
    setEthicsReport(null);
    setStatus("ARCHITECTING");
    
    try {
      // 1. ARCHITECT AGENT
      addLog("SYSTEM", "TRIGGER", `Initializing Architect for: ${projectGoal}`);
      const archRes = await fetch("/api/architect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectGoal }),
      });
      const archData = await archRes.json();

      if (archData.success) {
        setTasks(archData.tasks);
        addLog("ARCHITECT", "SUCCESS", `Project deconstructed into ${archData.tasks.length} tasks.`);

        // 2. ORCHESTRATOR AGENT
        setStatus("ORCHESTRATING");
        addLog("SYSTEM", "HANDOFF", "Activating Orchestrator for agent assignment...");
        
        const orchRes = await fetch("/api/orchestrator", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tasks: archData.tasks }),
        });
        const orchData = await orchRes.json();

        if (orchData.success) {
          setTasks(orchData.assignedTasks); 
          addLog("ORCHESTRATOR", "SUCCESS", "Tasks distributed across AI units.");

          // 3. QUALITY AUDITOR AGENT
          setStatus("AUDITING");
          addLog("SYSTEM", "QUALITY_CHECK", "Auditor is reviewing Task 1 performance...");
          
          const audRes = await fetch("/api/auditor", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ task: orchData.assignedTasks[0] }),
          });
          const audData = await audRes.json();

          if (audData.success) {
            addLog("QUALITY_AUDITOR", "PASS", `Score: ${audData.score}/10. ${audData.quality_reason}`);
            // Gamification Logic: Add XP based on score
            addLog("REWARD", "XP_BOOST", `Agent earned +${audData.score * 10} XP for high quality output.`);
          }
        }
      }
    } catch (error) {
      addLog("SYSTEM", "ERROR", "Critical pipeline failure.");
      console.error(error);
    } finally {
      setStatus("IDLE");
    }
  };

  // --- ETHICS AGENT TRIGGER ---
  const runEthicsAudit = async () => {
    addLog("SYSTEM", "SECURITY", "Requesting Ethics & Bias Audit from Firestore logs...");
    try {
      const res = await fetch("/api/ethics");
      const data = await res.json();
      if (data.success) {
        setEthicsReport(data);
        addLog("ETHICS_AGENT", "ANALYSIS", `Fairness Score: ${data.fairness_score}%. No critical bias found.`);
      }
    } catch (e) {
      addLog("ETHICS_AGENT", "ERROR", "Database analysis failed.");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200 p-6 font-sans selection:bg-blue-500/30">
      {/* NAVBAR */}
      <nav className="flex items-center justify-between mb-10 border-b border-zinc-800 pb-4 max-w-[1600px] mx-auto">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            <Cpu size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tighter text-white">
            TASKMANG <span className="text-blue-500 text-[10px] font-mono ml-1 uppercase border border-blue-500/30 px-1 rounded">PRO</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            <span className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${status === 'IDLE' ? 'bg-emerald-500' : 'bg-yellow-500 animate-pulse'}`}/> 
              {status}
            </span>
          </div>
          <button 
            onClick={runEthicsAudit}
            className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 text-zinc-400 hover:text-emerald-400 px-4 py-2 rounded-xl text-[10px] font-bold transition-all uppercase tracking-widest"
          >
            <ShieldAlert size={14} /> Run Ethics Check
          </button>
        </div>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] mx-auto">
        
        {/* LEFT: MAIN ENGINE */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* INPUT AREA */}
          <div className="bg-zinc-900/20 border border-zinc-800 p-8 rounded-3xl backdrop-blur-md relative overflow-hidden">
            <div className="flex gap-3 relative z-10">
              <input 
                type="text" 
                placeholder="Enter Enterprise Project Goal..."
                className="flex-1 bg-zinc-950/80 border border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all placeholder:text-zinc-700 font-mono"
                value={projectGoal}
                onChange={(e) => setProjectGoal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && startProject()}
              />
              <button 
                onClick={startProject}
                disabled={status !== "IDLE"}
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-30 shadow-[0_0_20px_rgba(37,99,235,0.2)]"
              >
                {status === "IDLE" ? "Execute" : "Processing..."}
              </button>
            </div>
          </div>

          {/* TASK BOARD */}
          <div className="bg-zinc-900/20 border border-zinc-800 p-8 rounded-3xl min-h-[600px] backdrop-blur-md">
            <div className="flex justify-between items-center mb-8">
               <h2 className="text-[10px] font-bold text-zinc-500 tracking-[0.2em] uppercase flex items-center gap-2 font-mono">
                <ClipboardList size={14} className="text-blue-500" /> Active_Task_Queue
              </h2>
              {tasks.length > 0 && (
                <div className="text-[10px] font-mono text-zinc-600">Total Units: {tasks.length}</div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasks.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-32 text-zinc-800 border-2 border-dashed border-zinc-900 rounded-3xl">
                  <Terminal size={48} className="mb-4 opacity-5" />
                  <p className="text-[10px] font-mono uppercase tracking-[0.3em]">System Standby</p>
                </div>
              )}
              
              {tasks.map((task: any, index: number) => (
                <div key={index} className="group bg-zinc-950 border border-zinc-800 p-6 rounded-2xl hover:border-blue-500/50 transition-all duration-300 relative">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <h3 className="font-bold text-zinc-100 group-hover:text-blue-400 text-sm">{task.task_name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-[9px] font-bold bg-blue-900/20 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full uppercase">
                          <UserCheck size={10}/> {task.assigned_to || "Orchestrating..."}
                        </span>
                      </div>
                    </div>
                    <div className="text-[9px] font-mono bg-zinc-900 px-2 py-1 rounded border border-zinc-800 text-zinc-500 uppercase">
                      {task.priority}
                    </div>
                  </div>
                  
                  <p className="text-xs text-zinc-500 leading-relaxed mb-6 line-clamp-2">{task.description}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-900">
                    <div className="flex gap-4">
                      <div className="flex flex-col">
                        <span className="text-[8px] text-zinc-600 uppercase font-black">Level</span>
                        <span className="text-[10px] text-zinc-400 font-mono">{task.required_skill}</span>
                      </div>
                      <div className="flex flex-col border-l border-zinc-900 pl-4">
                        <span className="text-[8px] text-zinc-600 uppercase font-black">SLA</span>
                        <span className="text-[10px] text-zinc-400 font-mono">{task.estimated_time}</span>
                      </div>
                    </div>
                    {index === 0 && tasks[0].assigned_to && (
                      <div className="flex items-center gap-1 text-emerald-500">
                        <Zap size={12} fill="currentColor" />
                        <span className="text-[10px] font-bold">VERIFIED</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: SYSTEM AUDIT & ETHICS */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* ETHICS MINI-CARD (Shows after audit) */}
          {ethicsReport && (
            <div className="bg-emerald-950/10 border border-emerald-500/20 p-6 rounded-3xl animate-in fade-in slide-in-from-right-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                  <BarChart3 size={14}/> Fairness Index
                </span>
                <span className="text-xl font-black text-emerald-400">{ethicsReport.fairness_score}%</span>
              </div>
              <p className="text-[11px] text-emerald-600/80 italic leading-snug">
                "{ethicsReport.recommendation}"
              </p>
            </div>
          )}

          {/* AUDIT LOGS */}
          <div className="bg-zinc-900/20 border border-zinc-800 p-8 rounded-3xl h-full shadow-2xl backdrop-blur-md relative">
            <h2 className="text-[10px] font-bold text-emerald-500 mb-8 tracking-[0.2em] uppercase flex items-center gap-2 font-mono">
              <Activity size={14} className={status !== "IDLE" ? "animate-pulse" : ""} /> Audit_Logs
            </h2>
            <div className="space-y-6 overflow-y-auto max-h-[600px] pr-4 custom-scrollbar">
              {logs.length === 0 && <p className="text-zinc-800 text-[10px] font-mono text-center py-20 uppercase tracking-widest">No Events</p>}
              {logs.map((log, i) => (
                <div key={i} className="relative pl-6 border-l border-zinc-800 group">
                  <div className="absolute -left-[4.5px] top-1.5 w-2 h-2 rounded-full bg-zinc-800 group-hover:bg-blue-500 transition-colors" />
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-black text-zinc-500 font-mono uppercase tracking-widest">{log.agent}</span>
                    <span className="text-[8px] text-zinc-700 font-mono">{log.timestamp}</span>
                  </div>
                  <div className="bg-black/40 p-3 rounded-xl border border-zinc-900">
                    <p className="text-[11px] text-zinc-500 font-mono leading-relaxed">
                      <span className="text-zinc-400 font-bold mr-1">[{log.action}]</span> {log.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
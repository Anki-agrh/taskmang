import { create } from 'zustand';

interface AppState {
  tasks: any[];
  logs: any[];
  setTasks: (tasks: any[]) => void;
  addLog: (agent: string, action: string, reason: string) => void;
}

export const useStore = create<AppState>((set) => ({
  tasks: [],
  logs: [],
  setTasks: (tasks) => set({ tasks }),
  addLog: (agent, action, reason) => set((state) => ({
    logs: [{
      agent,
      action,
      reason,
      timestamp: new Date().toLocaleTimeString()
    }, ...state.logs]
  })),
}));

import React, { useState } from 'react';
import { DailyPlan, DailyTask, TaskStatus } from '../types';

interface DailyPlannerViewProps {
  plan: DailyPlan;
  onBack: () => void;
  onUpdatePlan: (updated: DailyPlan) => void;
}

const DailyPlannerView: React.FC<DailyPlannerViewProps> = ({ plan, onBack, onUpdatePlan }) => {
  const [isSyncing, setIsSyncing] = useState(false);

  const updateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    const updatedTasks = plan.tasks.map(t => 
      t.id === taskId ? { ...t, status: newStatus } : t
    );
    onUpdatePlan({ ...plan, tasks: updatedTasks });
  };

  const handleSyncToCalendar = async () => {
    setIsSyncing(true);
    // Simulate API call to Node.js backend which handles Google Calendar Auth
    await new Promise(resolve => setTimeout(resolve, 2000));
    onUpdatePlan({ ...plan, isSynced: true });
    setIsSyncing(false);
    alert("Successfully synced plan to your Google Calendar!");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Execution OS</h2>
          <p className="text-slate-500 mt-1 font-mono text-xs uppercase tracking-widest">
            {plan.date} • {plan.isSynced ? 'Synced to Calendar' : 'Local Draft'}
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleSyncToCalendar}
            disabled={isSyncing || plan.isSynced}
            className="px-6 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-500 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isSyncing ? 'Syncing...' : plan.isSynced ? '✓ Synced' : 'Sync to Google Calendar'}
          </button>
          <button 
            onClick={onBack}
            className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
        </div>
      </header>

      {/* Behavioral Strategy Brief */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-white/5 rounded-[32px] p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center text-xs font-bold">
              !
            </div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Inhibitory Prompt</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Stop Target</p>
              <p className="text-lg font-bold text-white leading-tight">{plan.habit_intervention}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Replacement Protocol</p>
              <p className="text-sm text-blue-400 font-medium">{plan.replacement_action}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-600/5 border border-blue-500/10 rounded-[32px] p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-xs font-bold">
              Ψ
            </div>
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest">Behavioral Rationale</h3>
          </div>
          <div className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed italic">
              "{plan.psychology_rationale}"
            </p>
            <div className="p-4 bg-white/5 rounded-2xl">
              <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Contingency Plan</p>
              <p className="text-[11px] text-slate-400">{plan.fallback_plan}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Task List */}
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em]">Time-Boxed Blocks</h3>
            <div className="grid gap-4">
              {plan.tasks.map((task, i) => (
                <div 
                  key={task.id} 
                  className={`bg-slate-900/40 border p-6 rounded-2xl flex items-start gap-4 group transition-all ${
                    task.status === 'completed' ? 'border-green-500/30 opacity-60' : 
                    task.status === 'skipped' ? 'border-red-500/20 opacity-40' : 
                    'border-white/5 hover:border-blue-500/30'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-[10px] font-mono font-bold text-slate-500">{task.start_time}</div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="text-[10px] font-mono font-bold text-slate-500">{task.end_time}</div>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className={`font-bold transition-all ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-white'}`}>
                        {task.task}
                      </h4>
                      <div className="flex gap-2">
                        {task.status === 'pending' ? (
                          <>
                            <button 
                              onClick={() => updateTaskStatus(task.id, 'completed')}
                              className="w-8 h-8 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center hover:bg-green-500/20 transition-all"
                              title="Complete"
                            >
                              ✓
                            </button>
                            <button 
                              onClick={() => updateTaskStatus(task.id, 'skipped')}
                              className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-all"
                              title="Skip"
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => updateTaskStatus(task.id, 'pending')}
                            className="text-[10px] font-bold text-slate-500 uppercase hover:text-white"
                          >
                            Undo
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-xs text-slate-400 leading-relaxed">{task.purpose}</p>
                    
                    <div className="flex gap-4 pt-1">
                      <span className={`text-[10px] uppercase font-bold flex items-center gap-1 ${
                        task.energy_level === 'high' ? 'text-red-400' : task.energy_level === 'medium' ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {task.energy_level} energy
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-600">
                        {task.duration}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {plan.gentle_note && (
            <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-2xl">
              <p className="text-sm text-blue-200 italic">
                " {plan.gentle_note} "
              </p>
            </div>
          )}
        </div>

        {/* Schedule Visualization */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Efficiency Flow</h3>
          <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6">
             <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500">
                    <span>Task Progress</span>
                    <span>{Math.round((plan.tasks.filter(t => t.status === 'completed').length / (plan.tasks.length || 1)) * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-1000" 
                      style={{ width: `${(plan.tasks.filter(t => t.status === 'completed').length / (plan.tasks.length || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="pt-4 space-y-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Morning Window</p>
                    <p className="text-xs text-slate-300">Prioritizing high-energy logic tasks for peak brain state.</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Afternoon Buffer</p>
                    <p className="text-xs text-slate-300">Space for reactive tasks and low-energy administrative work.</p>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyPlannerView;

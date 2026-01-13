
import React from 'react';

const ArchitectureView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-16 py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <header className="border-b border-white/10 pb-6">
        <h2 className="text-3xl font-bold text-blue-400 font-mono">Multi-Agent System Architecture</h2>
        <p className="text-slate-400 mt-2">Future-You Simulator | Production Backend Orchestration</p>
      </header>

      {/* 1. Folder Structure */}
      <section>
        <h3 className="text-xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mr-3 text-sm">1</span>
          Backend Project Structure
        </h3>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl mono text-xs md:text-sm text-blue-100">
{`project-root/
├── server.ts             # Express Entry & Orchestration Logic
├── types.ts              # Global Shared Types
├── services/
│   ├── agents.ts         # Agent Registry & Gemini Wrappers
│   └── storage.ts        # Persistence & Cache Layer
└── components/           # Frontend React Layers`}
        </div>
      </section>

      {/* 2. Agent Logic Flow */}
      <section>
        <h3 className="text-xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mr-3 text-sm">2</span>
          Agent Orchestration Sequence
        </h3>
        <div className="grid gap-4">
          {[
            { name: "Habit Requirement Agent", role: "Identifies required behaviors for target goal.", model: "Gemini 3 Flash" },
            { name: "Habit Extraction Agent", role: "Parses unstructured daily text into metrics.", model: "Gemini 3 Flash" },
            { name: "Gap Analyzer", role: "Detects mismatches between Current vs. Required.", model: "Gemini 3 Flash" },
            { name: "Tracker Generator", role: "Creates measurable baselines and targets.", model: "Gemini 3 Flash" },
            { name: "Simulation Agents", role: "Projects Life Outcomes (Baseline & Optimized).", model: "Gemini 3 Pro" },
            { name: "Narrative Synthesizer", role: "Generates reflective tone-mapped comparison.", model: "Gemini 3 Pro" }
          ].map((agent, i) => (
            <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="text-blue-500 font-mono text-xs font-bold w-4">0{i+1}</div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-100">{agent.name}</p>
                <p className="text-xs text-slate-500">{agent.role}</p>
              </div>
              <div className="text-[10px] font-mono px-2 py-1 bg-blue-500/10 text-blue-400 rounded border border-blue-500/20">
                {agent.model}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. API Specification */}
      <section>
        <h3 className="text-xl font-semibold mb-4 text-white flex items-center">
          <span className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mr-3 text-sm">3</span>
          Endpoint: POST /api/simulate
        </h3>
        <div className="space-y-4">
          <div className="p-6 bg-slate-900 border border-white/5 rounded-xl">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Request JSON Payload</h4>
            <pre className="text-xs text-blue-300 font-mono">
{`{
  "goal": "Frontend Developer",
  "timeHorizon": "6_months",
  "dailyLifeText": "I scroll a lot, sleep too much..."
}`}
            </pre>
          </div>
          <div className="p-4 bg-blue-600/5 border border-blue-500/20 rounded-xl">
            <h4 className="text-sm font-bold text-blue-300 mb-2">Security: Rate Limiting & Hashing</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every request is hashed (SHA-256) and checked against Firestore cache to minimize redundant AI inference costs. JWT-based Auth ensures multi-tenancy isolation.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ArchitectureView;

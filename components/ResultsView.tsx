
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SimulationResponse } from '../types';

interface ResultsViewProps {
  data: SimulationResponse;
  onReset: () => void;
  onGeneratePlan: () => void;
  isGeneratingPlan: boolean;
}

const ResultsView: React.FC<ResultsViewProps> = ({ data, onReset, onGeneratePlan, isGeneratingPlan }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24 animate-in zoom-in-95 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
        <div>
          <h2 className="text-3xl font-bold text-white">Your Future Path</h2>
          <p className="text-slate-500 mt-2 text-sm">
            Based on a <span className="text-blue-400 font-bold">{data.context.time_horizon}</span> horizon focused on <span className="text-white font-bold">{data.context.impact_focus}</span>.
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={onReset}
            className="px-6 py-3 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-700 transition-all"
          >
            Adjust variables
          </button>
          <button 
            onClick={onGeneratePlan}
            disabled={isGeneratingPlan}
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2"
          >
            {isGeneratingPlan ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Plan...
              </>
            ) : (
              'Generate Daily Plan'
            )}
          </button>
        </div>
      </div>

      {/* Key Narrative */}
      <section className="bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/20 p-8 md:p-12 rounded-[32px] relative overflow-hidden">
        <div className="absolute top-8 right-8 text-blue-500/10 scale-150 pointer-events-none">
          <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H16.017C14.9124 8 14.017 7.10457 14.017 6V3L14.017 3C11.8079 3 10.017 4.79086 10.017 7V17C10.017 19.2091 11.8079 21 14.017 21ZM4 21L4 18C4 16.8954 4.89543 16 6 16H9C9.55228 16 10 15.5523 10 15V9C10 8.44772 9.55228 8 9 8H6C4.89543 8 4 7.10457 4 6V3L4 3C1.79086 3 0 4.79086 0 7V17C0 19.2091 1.79086 21 4 21Z" /></svg>
        </div>
        <h3 className="text-xs font-bold text-blue-400 uppercase tracking-[0.3em] mb-6">The Synthesis</h3>
        <p className="text-xl md:text-2xl text-slate-100 leading-relaxed font-medium italic">
          "{data.comparisonNarrative}"
        </p>
      </section>

      {/* The One Change */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900/50 border border-white/5 rounded-[32px] p-8 space-y-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             </div>
             <h3 className="text-xl font-bold">The Strategic Pivot</h3>
          </div>
          <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">High Leverage Action</p>
            <p className="text-lg font-bold text-white leading-tight">{data.pivotHabit}</p>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            {data.pivotRationale}
          </p>
        </div>

        {/* Chart */}
        <div className="bg-slate-900/50 border border-white/5 rounded-[32px] p-8">
          <h3 className="text-lg font-bold mb-8">Performance Projection</h3>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.timeframeMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="period" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
                <Line type="monotone" dataKey="baseline" stroke="#475569" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                <Line type="monotone" dataKey="optimized" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-6 text-[10px] font-bold uppercase tracking-widest">
            <span className="flex items-center gap-2 text-slate-500">Current Path</span>
            <span className="flex items-center gap-2 text-blue-500">Optimized Path</span>
          </div>
        </div>
      </div>

      {/* Path Detailed Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900/20 border border-white/5 p-8 rounded-[32px] space-y-6 opacity-60">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">If you change nothing</h4>
          <p className="text-sm text-slate-300 leading-relaxed italic">{data.baselinePath.summary}</p>
          <div className="space-y-3">
             {(data.baselinePath.milestones ?? []).slice(0, 3).map((m, i) => (
               <div key={i} className="flex gap-3 items-start text-xs text-slate-500">
                 <span className="mt-1 opacity-50">•</span>
                 <span>{m}</span>
               </div>
             ))}
          </div>
        </div>

        <div className="bg-blue-600/5 border border-blue-500/20 p-8 rounded-[32px] space-y-6">
          <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest">With one small shift</h4>
          <p className="text-sm text-slate-200 leading-relaxed font-medium italic">{data.optimizedPath.summary}</p>
          <div className="space-y-3">
             {(data.optimizedPath.milestones ?? []).slice(0, 3).map((m, i) => (
               <div key={i} className="flex gap-3 items-start text-xs text-slate-200">
                 <div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                 <span>{m}</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsView;

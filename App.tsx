
import React, { useState } from 'react';
import { AppTab, SimulationResponse, AppState, TimeHorizon, Habit, DailyPlan } from './types';
import ArchitectureView from './components/ArchitectureView';
import ResultsView from './components/ResultsView';
import AuthView from './components/AuthView';
import InputView from './components/InputView';
import DailyPlannerView from './components/DailyPlannerView';
import { AuthProvider, useAuth } from './services/auth';
import { 
  habitRequirementAgent, 
  habitGapAnalyzer, 
  autoTrackerGenerator, 
  baselineSimulator, 
  microChangeSimulator, 
  narrativeSynthesizer, 
  metricsGenerator,
  dailyPlannerAgent
} from './services/agents';

const MainApp: React.FC = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.SIMULATOR);
  const [appState, setAppState] = useState<AppState>('INPUT');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [goal, setGoal] = useState('');
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>('3 months');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [simulationResult, setSimulationResult] = useState<SimulationResponse | null>(null);
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#030712]">
      <div className="animate-pulse text-blue-500 font-bold uppercase tracking-widest text-xs">Initializing Engine...</div>
    </div>
  );

  if (!user) return <AuthView />;

  const handleSimulate = async () => {
    const validHabits = habits.filter(h => h.name.trim() !== '');
    if (!goal) return alert("Please set a goal for your future.");
    if (validHabits.length === 0) return alert("Please add at least one current habit with a name.");
    
    setLoading(true);
    setSimulationResult(null); 
    
    try {
      setLoadingStep('Analyzing Habit Alignment');
      const requiredHabits = await habitRequirementAgent(goal, timeHorizon);
      
      setLoadingStep('Detecting Potential Gaps');
      const extractedCurrent = validHabits.map(h => ({ 
        habit: h.name, 
        estimated_level: h.frequency, 
        category: h.category 
      }));
      
      const gaps = await habitGapAnalyzer(requiredHabits, extractedCurrent as any);
      const tracker = await autoTrackerGenerator(extractedCurrent as any, gaps);

      setLoadingStep('Simulating Future Trajectories');
      const [baseline, optimized] = await Promise.all([
        baselineSimulator(extractedCurrent as any, timeHorizon, goal),
        microChangeSimulator(extractedCurrent as any, gaps, timeHorizon, goal)
      ]);

      setLoadingStep('Synthesizing Narrative Reports');
      const comparison = await narrativeSynthesizer(baseline.summary, optimized.optimized.summary, timeHorizon);
      
      const bHealth = baseline.metrics?.health ?? 50;
      const bCareer = baseline.metrics?.career ?? 50;
      const oHealth = optimized.optimized.metrics?.health ?? 70;
      const oCareer = optimized.optimized.metrics?.career ?? 75;

      const metrics = await metricsGenerator(
        (bHealth + bCareer) / 2, 
        (oHealth + oCareer) / 2, 
        timeHorizon
      );

      setSimulationResult({
        requiredHabits,
        currentHabits: extractedCurrent as any,
        habitGaps: gaps,
        habitTracker: tracker,
        baselinePath: baseline,
        optimizedPath: optimized.optimized,
        pivotHabit: optimized.pivot,
        pivotRationale: optimized.rationale,
        comparisonNarrative: comparison,
        timeframeMetrics: metrics,
        context: {
          time_horizon: timeHorizon,
          impact_focus: goal,
          habit_consistency_level: "Analyzing Path",
          goal_alignment_strength: "Calculated",
          risk_level: baseline.key_outcomes?.risk_summary || "Normal"
        }
      });

      setAppState('RESULTS');
    } catch (error) {
      console.error("Simulation Pipeline Error:", error);
      alert("The simulation logic encountered an error. Please try clicking Generate again.");
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleGeneratePlan = async () => {
    if (!simulationResult) return;
    setIsGeneratingPlan(true);
    try {
      const plan = await dailyPlannerAgent(goal, simulationResult.pivotHabit, simulationResult.habitGaps);
      setDailyPlan(plan);
      setAppState('PLANNER');
    } catch (error) {
      console.error("Planner Pipeline Error:", error);
      alert("Failed to generate your daily plan. Please try again.");
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const resetSimulation = () => {
    setSimulationResult(null);
    setAppState('INPUT');
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-50 flex flex-col selection:bg-blue-500/30">
      <nav className="sticky top-0 z-50 bg-[#030712]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">
              FY
            </div>
            <span className="font-bold text-lg tracking-tight">
              Future-You <span className="text-blue-500">Simulator</span>
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] uppercase font-bold text-slate-500">Authenticated as</span>
              <span className="text-xs text-white">{user.email}</span>
            </div>
            <button 
              onClick={logout}
              className="text-[10px] uppercase font-bold text-slate-400 hover:text-red-400 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto">
        {activeTab === AppTab.ARCHITECTURE ? <ArchitectureView /> : (
          <>
            {appState === 'INPUT' && (
              <InputView 
                goal={goal} setGoal={setGoal}
                horizon={timeHorizon} setHorizon={setTimeHorizon}
                habits={habits} setHabits={setHabits}
                onSimulate={handleSimulate} loading={loading}
                loadingStep={loadingStep}
              />
            )}
            {appState === 'RESULTS' && simulationResult && (
              <div className="max-w-7xl mx-auto py-8 px-4">
                <ResultsView 
                  data={simulationResult} 
                  onReset={resetSimulation} 
                  onGeneratePlan={handleGeneratePlan}
                  isGeneratingPlan={isGeneratingPlan}
                />
              </div>
            )}
            {appState === 'PLANNER' && dailyPlan && (
              <div className="max-w-7xl mx-auto py-8 px-4">
                <DailyPlannerView 
                  plan={dailyPlan} 
                  onBack={() => setAppState('RESULTS')} 
                  onUpdatePlan={(updated) => setDailyPlan(updated)}
                />
              </div>
            )}
          </>
        )}
      </main>

      <div className="fixed bottom-4 left-4 opacity-10 hover:opacity-100 transition-opacity">
        <button 
          onClick={() => setActiveTab(activeTab === AppTab.SIMULATOR ? AppTab.ARCHITECTURE : AppTab.SIMULATOR)}
          className="text-[10px] font-mono text-slate-500 underline"
        >
          [DEV_ARCHITECTURE]
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <MainApp />
  </AuthProvider>
);

export default App;

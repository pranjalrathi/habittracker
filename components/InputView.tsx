
import React, { useState } from 'react';
import { Habit, TimeHorizon, HorizonLabels } from '../types';
import { habitExtractionAgent } from '../services/agents';

interface InputViewProps {
  goal: string;
  setGoal: (val: string) => void;
  horizon: TimeHorizon;
  setHorizon: (val: TimeHorizon) => void;
  habits: Habit[];
  setHabits: (habits: Habit[]) => void;
  onSimulate: () => void;
  loading: boolean;
  loadingStep?: string;
}

const VALID_CATEGORIES = ['Health', 'Focus', 'Learning', 'Finance', 'Digital'];

const InputView: React.FC<InputViewProps> = ({ 
  goal, setGoal, horizon, setHorizon, habits, setHabits, onSimulate, loading, loadingStep 
}) => {
  const [description, setDescription] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  const handleAddHabit = () => {
    // Explicitly set default to 'Focus' to avoid the 'Health' first-option default bug
    const newHabit: Habit = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      category: 'Focus',
      frequency: 'Daily'
    };
    setHabits([...habits, newHabit]);
  };

  const updateHabit = (id: string, field: keyof Habit, value: string) => {
    setHabits(habits.map(h => h.id === id ? { ...h, [field]: value } : h));
  };

  const removeHabit = (id: string) => {
    setHabits(habits.filter(h => h.id !== id));
  };

  const handleAnalyzeRoutine = async () => {
    if (!description.trim()) return;
    setIsExtracting(true);
    try {
      const extracted = await habitExtractionAgent(description);
      // Validate categories from AI to ensure they match UI options perfectly
      const newHabits: Habit[] = extracted.map(e => ({
        id: Math.random().toString(36).substr(2, 9),
        name: e.habit,
        category: (VALID_CATEGORIES.includes(e.category) ? e.category : 'Focus') as Habit['category'],
        frequency: e.estimated_level || 'Daily'
      }));
      setHabits([...habits, ...newHabits]);
      setDescription('');
    } catch (error) {
      console.error("Routine Analysis Error:", error);
      alert("I couldn't quite understand that routine. Please try being a bit more specific about your habits.");
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="text-center space-y-4">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
          Where are you <span className="text-blue-500">headed?</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
          Tell us about your current day and your future goal. We'll explore the path together.
        </p>
      </header>

      <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 space-y-10 shadow-2xl backdrop-blur-md">
        {/* Goal & Horizon */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">My Main Goal</label>
            <input 
              type="text" 
              placeholder="e.g. Become a Senior Developer"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-700"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Explore my future in...</label>
            <select 
              value={horizon}
              onChange={(e) => setHorizon(e.target.value as TimeHorizon)}
              className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
            >
              {(Object.keys(HorizonLabels) as TimeHorizon[]).map(key => (
                <option key={key} value={key}>{HorizonLabels[key]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Unstructured Input */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">My Current Daily Routine</label>
            {isExtracting && <span className="text-[10px] text-blue-400 animate-pulse font-bold">UNDERSTANDING YOUR DAY...</span>}
          </div>
          <div className="relative group">
            <textarea 
              placeholder="Example: I usually wake up around 8am, spend an hour on my phone, skip breakfast, and then work until late..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800/50 border border-white/10 rounded-2xl px-5 py-4 text-sm min-h-[120px] focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-700 resize-none"
            />
            <button 
              onClick={handleAnalyzeRoutine}
              disabled={isExtracting || !description.trim()}
              className="absolute bottom-4 right-4 bg-slate-700 hover:bg-slate-600 disabled:opacity-20 text-white text-[10px] font-bold px-4 py-2 rounded-lg transition-all"
            >
              Analyze My Day
            </button>
          </div>
        </div>

        {/* Habit List */}
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Current Habits</label>
            <button 
              onClick={handleAddHabit}
              className="text-xs text-blue-400 font-bold hover:text-blue-300 transition-colors"
            >
              + Add a habit
            </button>
          </div>

          {habits.length === 0 ? (
            <div className="text-center py-8 text-slate-600 text-sm italic">
              No habits listed yet. Describe your day above or add one manually.
            </div>
          ) : (
            <div className="grid gap-3">
              {habits.map((habit) => (
                <div key={habit.id} className="flex flex-col md:flex-row gap-3 bg-slate-800/30 p-4 rounded-xl border border-white/5 items-center">
                  <input 
                    className="flex-1 bg-transparent border-b border-white/10 focus:border-blue-500 outline-none text-sm py-1"
                    placeholder="Habit name..."
                    value={habit.name}
                    onChange={(e) => updateHabit(habit.id, 'name', e.target.value)}
                  />
                  <select 
                    className="bg-slate-900 border border-white/10 rounded-lg text-[10px] px-3 py-1.5 outline-none cursor-pointer"
                    value={habit.category}
                    onChange={(e) => updateHabit(habit.id, 'category', e.target.value as Habit['category'])}
                  >
                    <option value="Focus">Focus</option>
                    <option value="Learning">Learning</option>
                    <option value="Health">Health</option>
                    <option value="Finance">Finance</option>
                    <option value="Digital">Digital</option>
                  </select>
                  <select 
                    className="bg-slate-900 border border-white/10 rounded-lg text-[10px] px-3 py-1.5 outline-none cursor-pointer"
                    value={habit.frequency}
                    onChange={(e) => updateHabit(habit.id, 'frequency', e.target.value)}
                  >
                    <option>Daily</option>
                    <option>Weekly</option>
                  </select>
                  <button onClick={() => removeHabit(habit.id)} className="text-slate-600 hover:text-red-400 transition-colors px-2">
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Generate Button */}
        <button 
          disabled={loading || habits.length === 0 || !goal}
          onClick={onSimulate}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-20 text-white font-bold py-5 rounded-2xl shadow-xl transition-all transform active:scale-[0.98] flex flex-col items-center justify-center gap-1"
        >
          {loading ? (
            <>
              <div className="flex items-center gap-3">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-lg">Exploring Future Paths...</span>
              </div>
              {loadingStep && <span className="text-[10px] font-mono text-blue-200 uppercase tracking-widest mt-1 opacity-70">{loadingStep}</span>}
            </>
          ) : (
            <span className="text-lg">Generate My Simulation</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default InputView;

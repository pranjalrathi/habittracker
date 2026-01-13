
export type TimeHorizon = '1 week' | '1 month' | '3 months' | '6 months' | '1 year' | '3 years' | '5 years';

export const HorizonLabels: Record<TimeHorizon, string> = {
  '1 week': '1 Week (Immediate Awareness)',
  '1 month': '1 Month (Building Momentum)',
  '3 months': '3 Months (Habit Formation)',
  '6 months': '6 Months (Visible Growth)',
  '1 year': '1 Year (Identity Shift)',
  '3 years': '3 Years (Life Direction)',
  '5 years': '5 Years (Transformation)'
};

export interface Habit {
  id: string;
  name: string;
  frequency: string;
  category: 'Health' | 'Focus' | 'Learning' | 'Finance' | 'Digital';
}

export interface HabitSuggestion {
  habit: string;
  category: Habit['category'];
  importance: 'high' | 'medium' | 'low';
}

export interface ExtractedHabit {
  habit: string;
  estimated_level: string;
  category: Habit['category'];
}

export interface HabitGap {
  habit: string;
  current_state: string;
  desired_state: string;
  gap_level: 'high' | 'medium' | 'low';
}

export interface TrackableHabit {
  habit: string;
  baseline_metric: string;
  target_metric: string;
  tracking_method: string;
}

export interface SimulationMetric {
  period: string;
  baseline: number;
  optimized: number;
}

export interface ScenarioResult {
  summary: string;
  milestones: string[];
  metrics: {
    health: number;
    wealth: number;
    happiness: number;
    career: number;
  };
}

export interface BaselineScenarioResult extends ScenarioResult {
  key_outcomes: {
    career_or_progress: string;
    mental_state: string;
    confidence_level: string;
    risk_summary: string;
  };
}

export interface SimulationResponse {
  id?: string;
  requiredHabits: HabitSuggestion[];
  currentHabits: ExtractedHabit[];
  habitGaps: HabitGap[];
  habitTracker: TrackableHabit[];
  baselinePath: BaselineScenarioResult;
  optimizedPath: ScenarioResult;
  pivotHabit: string;
  pivotRationale: string;
  comparisonNarrative: string;
  timeframeMetrics: SimulationMetric[];
  context: {
    time_horizon: string;
    impact_focus: string;
    habit_consistency_level: string;
    goal_alignment_strength: string;
    risk_level: string;
  };
}

export type TaskStatus = 'pending' | 'accepted' | 'skipped' | 'completed';

export interface DailyTask {
  id: string;
  task: string;
  duration: string;
  purpose: string;
  energy_level: 'low' | 'medium' | 'high';
  start_time: string;
  end_time: string;
  status: TaskStatus;
}

export interface CalendarEvent {
  title: string;
  start_time: string;
  end_time: string;
  description: string;
}

export interface DailyPlan {
  date: string;
  tasks: DailyTask[];
  gentle_note: string;
  habit_intervention: string;
  replacement_action: string;
  psychology_rationale: string;
  fallback_plan: string;
  isSynced?: boolean;
}

export enum AppTab {
  SIMULATOR = 'simulator',
  ARCHITECTURE = 'architecture'
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export type AppState = 'AUTH' | 'INPUT' | 'RESULTS' | 'PLANNER';


import { GoogleGenAI, Type } from "@google/genai";
import { TimeHorizon, HabitSuggestion, ExtractedHabit, HabitGap, TrackableHabit, BaselineScenarioResult, ScenarioResult, SimulationMetric, DailyPlan } from "../types";

// Always use process.env.API_KEY as per system requirements
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const safeParse = <T>(text: string | undefined): T => {
  if (!text) throw new Error("Agent returned an empty response.");
  try {
    const jsonStr = text.replace(/```json|```/g, '').trim();
    if (!jsonStr) throw new Error("Empty JSON block in agent response.");
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    console.error("JSON Parse Error. Original text:", text);
    throw new Error("The simulation data was malformed. Please try again.");
  }
};

export const habitRequirementAgent = async (goal: string, horizon: TimeHorizon): Promise<HabitSuggestion[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `GOAL: ${goal}\nTIME HORIZON: ${horizon}`,
    config: {
      systemInstruction: "Identify 5-7 habits required for this goal. Categories: Health, Focus, Learning, Digital, Finance. Return JSON only with key 'required_habits'.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          required_habits: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                habit: { type: Type.STRING },
                category: { type: Type.STRING, enum: ['Health', 'Focus', 'Learning', 'Digital', 'Finance'] },
                importance: { type: Type.STRING, enum: ['high', 'medium', 'low'] }
              },
              required: ["habit", "category", "importance"]
            }
          }
        },
        required: ["required_habits"]
      }
    }
  });
  return safeParse<{ required_habits: HabitSuggestion[] }>(response.text).required_habits;
};

export const habitExtractionAgent = async (text: string): Promise<ExtractedHabit[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: text,
    config: {
      systemInstruction: "Extract habits from routine. Categories: Health, Focus, Learning, Digital, Finance. Return JSON only with key 'current_habits'.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          current_habits: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                habit: { type: Type.STRING },
                estimated_level: { type: Type.STRING },
                category: { type: Type.STRING, enum: ['Health', 'Focus', 'Learning', 'Digital', 'Finance'] }
              },
              required: ["habit", "estimated_level", "category"]
            }
          }
        },
        required: ["current_habits"]
      }
    }
  });
  return safeParse<{ current_habits: ExtractedHabit[] }>(response.text).current_habits;
};

export const habitGapAnalyzer = async (required: HabitSuggestion[], current: ExtractedHabit[]): Promise<HabitGap[]> => {
  const context = `REQUIRED: ${JSON.stringify(required)}\nCURRENT: ${JSON.stringify(current)}`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: context,
    config: {
      systemInstruction: "Detect mismatches between required and current habits. Return JSON only with key 'habit_gaps'.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          habit_gaps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                habit: { type: Type.STRING },
                current_state: { type: Type.STRING },
                desired_state: { type: Type.STRING },
                gap_level: { type: Type.STRING, enum: ['high', 'medium', 'low'] }
              },
              required: ["habit", "current_state", "desired_state", "gap_level"]
            }
          }
        },
        required: ["habit_gaps"]
      }
    }
  });
  return safeParse<{ habit_gaps: HabitGap[] }>(response.text).habit_gaps;
};

export const autoTrackerGenerator = async (current: ExtractedHabit[], gaps: HabitGap[]): Promise<TrackableHabit[]> => {
  const context = `CURRENT: ${JSON.stringify(current)}\nGAPS: ${JSON.stringify(gaps)}`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: context,
    config: {
      systemInstruction: "Generate trackable metrics for gaps. Return JSON only with key 'tracker'.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tracker: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                habit: { type: Type.STRING },
                baseline_metric: { type: Type.STRING },
                target_metric: { type: Type.STRING },
                tracking_method: { type: Type.STRING }
              },
              required: ["habit", "baseline_metric", "target_metric", "tracking_method"]
              }
            }
          },
          required: ["tracker"]
      }
    }
  });
  return safeParse<{ tracker: TrackableHabit[] }>(response.text).tracker;
};

export const baselineSimulator = async (current: ExtractedHabit[], horizon: TimeHorizon, goal: string): Promise<BaselineScenarioResult> => {
  const context = `HABITS: ${JSON.stringify(current)}\nHORIZON: ${horizon}\nGOAL: ${goal}`;
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: context,
    config: {
      systemInstruction: "Project future assuming NO change. Return JSON matching BaselineScenarioResult schema.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          key_outcomes: {
            type: Type.OBJECT,
            properties: {
              career_or_progress: { type: Type.STRING },
              mental_state: { type: Type.STRING },
              confidence_level: { type: Type.STRING },
              risk_summary: { type: Type.STRING }
            },
            required: ["career_or_progress", "mental_state", "confidence_level", "risk_summary"]
          },
          milestones: { type: Type.ARRAY, items: { type: Type.STRING } },
          metrics: {
            type: Type.OBJECT,
            properties: {
              health: { type: Type.NUMBER },
              wealth: { type: Type.NUMBER },
              happiness: { type: Type.NUMBER },
              career: { type: Type.NUMBER }
            },
            required: ["health", "wealth", "happiness", "career"]
          }
        },
        required: ["summary", "key_outcomes", "milestones", "metrics"]
      }
    }
  });
  return safeParse<BaselineScenarioResult>(response.text);
};

export const microChangeSimulator = async (current: ExtractedHabit[], gaps: HabitGap[], horizon: TimeHorizon, goal: string): Promise<{ optimized: ScenarioResult, pivot: string, rationale: string }> => {
  const context = `HABITS: ${JSON.stringify(current)}\nGAPS: ${JSON.stringify(gaps)}\nHORIZON: ${horizon}\nGOAL: ${goal}`;
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: context,
    config: {
      systemInstruction: "Identify ONE pivot change. Return JSON with 'optimized' (ScenarioResult), 'pivot', and 'rationale'.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          optimized: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              milestones: { type: Type.ARRAY, items: { type: Type.STRING } },
              metrics: {
                type: Type.OBJECT,
                properties: {
                  health: { type: Type.NUMBER },
                  wealth: { type: Type.NUMBER },
                  happiness: { type: Type.NUMBER },
                  career: { type: Type.NUMBER }
                },
                required: ["health", "wealth", "happiness", "career"]
              }
            },
            required: ["summary", "milestones", "metrics"]
          },
          pivot: { type: Type.STRING },
          rationale: { type: Type.STRING }
        },
        required: ["optimized", "pivot", "rationale"]
      }
    }
  });
  return safeParse<{ optimized: ScenarioResult, pivot: string, rationale: string }>(response.text);
};

export const narrativeSynthesizer = async (baseline: string, optimized: string, horizon: TimeHorizon): Promise<string> => {
  const context = `BASELINE: ${baseline}\nOPTIMIZED: ${optimized}\nHORIZON: ${horizon}`;
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: context,
    config: {
      systemInstruction: "Synthesize a comparative narrative in plain English. No judgment.",
    }
  });
  return (response.text || "").trim();
};

export const dailyPlannerAgent = async (goal: string, pivotHabit: string, gaps: HabitGap[]): Promise<DailyPlan> => {
  const context = `GOAL: ${goal}\nPIVOT HABIT: ${pivotHabit}\nHABIT GAPS: ${JSON.stringify(gaps)}`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: context,
    config: {
      systemInstruction: `Act as a Behavioral Science AI and High-Performance Coach. 
      Your mission is to generate TODAY'S execution plan using behavioral science principles:
      
      1. CRITICAL: Identify the single most destructive habit based on gaps.
      2. INTERVENTION: Replace it with a friction-based intervention (e.g., if phone scrolling is a gap, put phone in another room).
      3. STRATEGY: Prefer subtraction (removing friction/distraction) over addition. 
      4. FLOW: Use energy matching (high-complexity tasks during morning hours).
      5. SAFETY: Provide a fallback plan if willpower fails.
      
      Return JSON only matching the DailyPlan schema.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          daily_plan: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING },
              habit_intervention: { type: Type.STRING, description: "The specific destructive habit to stop today." },
              replacement_action: { type: Type.STRING, description: "The high-friction/low-willpower replacement." },
              psychology_rationale: { type: Type.STRING, description: "The psychological reason why this works." },
              fallback_plan: { type: Type.STRING, description: "What to do if the user slips up." },
              tasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    task: { type: Type.STRING },
                    duration: { type: Type.STRING },
                    purpose: { type: Type.STRING },
                    energy_level: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
                    start_time: { type: Type.STRING },
                    end_time: { type: Type.STRING },
                    status: { type: Type.STRING, enum: ['pending'] }
                  },
                  required: ["id", "task", "duration", "purpose", "energy_level", "start_time", "end_time", "status"]
                }
              },
              gentle_note: { type: Type.STRING }
            },
            required: ["date", "habit_intervention", "replacement_action", "psychology_rationale", "fallback_plan", "tasks", "gentle_note"]
          }
        },
        required: ["daily_plan"]
      }
    }
  });
  const data = safeParse<{ daily_plan: DailyPlan }>(response.text).daily_plan;
  return { ...data, isSynced: false };
};

export const metricsGenerator = async (baselineScore: number, optimizedScore: number, horizon: TimeHorizon): Promise<SimulationMetric[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Horizon: ${horizon}, Baseline End Score: ${baselineScore}, Optimized End Score: ${optimizedScore}`,
    config: {
      systemInstruction: "Generate chart data (5-6 points). Return JSON only with key 'metrics'.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          metrics: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                period: { type: Type.STRING },
                baseline: { type: Type.NUMBER },
                optimized: { type: Type.NUMBER }
              },
              required: ["period", "baseline", "optimized"]
            }
          }
        },
        required: ["metrics"]
      }
    }
  });
  return safeParse<{ metrics: SimulationMetric[] }>(response.text).metrics;
}

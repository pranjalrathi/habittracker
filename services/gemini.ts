
import { GoogleGenAI, Type } from "@google/genai";
import { Habit, SimulationResponse, TimeHorizon, HabitSuggestion, ExtractedHabit, HabitGap } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Habit Requirement Agent: Identifies key habits required for a goal.
 */
export const suggestHabitsForGoal = async (goal: string, horizon: TimeHorizon): Promise<HabitSuggestion[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Goal: ${goal}\nHorizon: ${horizon}`,
    config: {
      systemInstruction: "You are a Habit Requirement Agent. Identify 5-7 key measurable habits required to move toward the user's goal. Focus on habits, not outcomes. Output JSON only.",
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
                category: { type: Type.STRING, enum: ['Health', 'Finance', 'Career', 'Relationships', 'Mindset'] },
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
  const data = JSON.parse(response.text);
  return data.required_habits;
};

/**
 * Habit Extraction Agent: Extracts habits from unstructured text.
 */
export const extractHabitsFromDescription = async (text: string): Promise<ExtractedHabit[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: text,
    config: {
      systemInstruction: "You are a Habit Extraction Agent. Extract measurable habits and behavioral patterns from unstructured text. Convert vague language into metrics. No judgment or advice. Output JSON only.",
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
                category: { type: Type.STRING, enum: ['Health', 'Finance', 'Career', 'Relationships', 'Mindset'] }
              },
              required: ["habit", "estimated_level", "category"]
            }
          }
        },
        required: ["current_habits"]
      }
    }
  });
  const data = JSON.parse(response.text);
  return data.current_habits;
};

/**
 * Habit Gap Analyzer: Identifies mismatches between required and current habits.
 */
export const analyzeHabitGaps = async (required: HabitSuggestion[], current: Habit[]): Promise<HabitGap[]> => {
  const ai = getAI();
  const context = `
    REQUIRED HABITS: ${JSON.stringify(required)}
    CURRENT HABITS: ${JSON.stringify(current)}
  `;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: context,
    config: {
      systemInstruction: "You are a Habit Gap Analyzer. Identify mismatches and prioritize gaps that matter most. No advice, no motivation. Just gap detection. Output JSON only.",
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
  const data = JSON.parse(response.text);
  return data.habit_gaps;
};

export const runSimulation = async (habits: Habit[], goal: string, horizon: TimeHorizon): Promise<SimulationResponse> => {
  const ai = getAI();
  
  const habitsPrompt = habits.map(h => `- ${h.name} (${h.category}, ${h.frequency})`).join('\n');
  
  const systemInstruction = `
    ACT AS: A High-Fidelity Behavioral Simulation Engine with a specialized multi-agent pipeline.
    
    ### AGENT 1: CONTEXT BUILDER AGENT
    Convert raw user habits and goals into structured context.
    - Focus on behavioral/emotional effects for short horizons (1 week, 6 months).
    - Focus on career/identity/life effects for long horizons (1 year, 5 years).

    ### AGENT 2: BASELINE FUTURE SIMULATION AGENT (INERTIA SPECIALIST)
    Simulate the future assuming NO habit changes. 
    - RULES: No advice. No motivation. No exaggeration. Strictly analytical.

    ### AGENT 3: HABIT GAP ANALYZER (GAP DETECTOR)
    Identify specific mismatches between current vectors and the goal's requirements.

    ### AGENT 4: MICRO-CHANGE OPTIMIZER
    Identify the ONE high-leverage "Bottleneck Habit". 
    Propose a pivot and project the delta.

    ### AGENT 5: NARRATIVE SYNTHESIZER AGENT
    Final task: Convert simulation data into a short, human-readable comparison paragraph.
    - RULES: No advice. No judgment. Strictly comparative.
    - TONE MAPPING based on Horizon:
      - 1 week: Reflective (Focus on immediate energy and state).
      - 6 months: Grounding (Focus on established patterns and momentum).
      - 1 year: Clarity-building (Focus on trajectory and skill set).
      - 5 years: Identity-focused (Focus on long-term character and life position).
    - OUTPUT: A concise paragraph comparing the 'Path of Inertia' vs the 'Optimized Path'.
  `;

  const prompt = `
    [USER PROFILE]
    TIME HORIZON: ${horizon}
    GOAL: ${goal}
    CURRENT HABITS:
    ${habitsPrompt}

    Synthesize a final report including a comparison narrative for the ${horizon} window.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          context: {
            type: Type.OBJECT,
            properties: {
              time_horizon: { type: Type.STRING },
              impact_focus: { type: Type.STRING },
              habit_consistency_level: { type: Type.STRING },
              goal_alignment_strength: { type: Type.STRING },
              risk_level: { type: Type.STRING }
            },
            required: ["time_horizon", "impact_focus", "habit_consistency_level", "goal_alignment_strength", "risk_level"]
          },
          baselinePath: {
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
                }
              }
            },
            required: ["summary", "key_outcomes", "milestones", "metrics"]
          },
          optimizedPath: {
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
                }
              }
            },
            required: ["summary", "milestones", "metrics"]
          },
          pivotHabit: { type: Type.STRING },
          pivotRationale: { type: Type.STRING },
          comparisonNarrative: { type: Type.STRING },
          timeframeMetrics: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                period: { type: Type.STRING },
                baseline: { type: Type.NUMBER },
                optimized: { type: Type.NUMBER }
              }
            }
          }
        },
        required: ["context", "baselinePath", "optimizedPath", "pivotHabit", "pivotRationale", "comparisonNarrative", "timeframeMetrics"]
      }
    }
  });

  return JSON.parse(response.text);
};

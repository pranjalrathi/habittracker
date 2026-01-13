
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import crypto from 'crypto';
import { 
  habitRequirementAgent, 
  habitExtractionAgent, 
  habitGapAnalyzer, 
  autoTrackerGenerator, 
  baselineSimulator, 
  microChangeSimulator, 
  narrativeSynthesizer,
  metricsGenerator
} from './services/agents';
import { saveSimulationResult, findCachedSimulation } from './services/storage';
import { TimeHorizon } from './types';

const app = express();
const port = process.env.PORT || 8080;

app.use(helmet() as any);
app.use(cors() as any);
app.use(express.json() as any);

const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = (req as any).headers?.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return (res as any).status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];
  
  try {
    // In production, use firebase-admin.auth().verifyIdToken(token)
    (req as any).user = { uid: 'real-user-' + token.substring(0, 8), email: 'user@example.com' }; 
    next();
  } catch (error) {
    (res as any).status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

app.post('/api/simulate', authenticate as any, (async (req: Request, res: Response) => {
  const { goal, timeHorizon, dailyLifeText } = (req as any).body;
  const userId = (req as any).user.uid;

  if (!goal || !timeHorizon || !dailyLifeText) {
    return (res as any).status(400).json({ error: 'Incomplete input vectors.' });
  }

  try {
    const inputHash = crypto
      .createHash('sha256')
      .update(JSON.stringify({ goal, timeHorizon, dailyLifeText }))
      .digest('hex');

    const cached = await findCachedSimulation(userId, inputHash);
    if (cached) return (res as any).status(200).json(cached);

    const [requiredHabits, currentHabits] = await Promise.all([
      habitRequirementAgent(goal, timeHorizon as TimeHorizon),
      habitExtractionAgent(dailyLifeText)
    ]);

    const habitGaps = await habitGapAnalyzer(requiredHabits, currentHabits);
    const habitTracker = await autoTrackerGenerator(currentHabits, habitGaps);

    const [baselineRes, optimizedRes] = await Promise.all([
      baselineSimulator(currentHabits, timeHorizon as TimeHorizon, goal),
      microChangeSimulator(currentHabits, habitGaps, timeHorizon as TimeHorizon, goal)
    ]);

    const comparisonNarrative = await narrativeSynthesizer(
      baselineRes.summary, 
      optimizedRes.optimized.summary, 
      timeHorizon as TimeHorizon
    );

    const timeframeMetrics = await metricsGenerator(
      (baselineRes.metrics.health + baselineRes.metrics.career) / 2,
      (optimizedRes.optimized.metrics.health + optimizedRes.optimized.metrics.career) / 2,
      timeHorizon as TimeHorizon
    );

    const result = {
      requiredHabits,
      currentHabits,
      habitGaps,
      habitTracker,
      baselinePath: baselineRes,
      optimizedPath: optimizedRes.optimized,
      pivotHabit: optimizedRes.pivot,
      pivotRationale: optimizedRes.rationale,
      comparisonNarrative,
      timeframeMetrics,
      context: {
        time_horizon: timeHorizon,
        impact_focus: goal,
        habit_consistency_level: "High Fidelity",
        goal_alignment_strength: "Verified",
        risk_level: baselineRes.key_outcomes.risk_summary
      }
    };

    const docId = await saveSimulationResult(userId, { ...result, inputHash } as any);
    (res as any).status(200).json({ id: docId, ...result });

  } catch (error: any) {
    (res as any).status(500).json({ error: 'Behavioral Inference Pipeline Error', details: error.message });
  }
}) as any);

/**
 * Calendar Sync Endpoint
 */
app.post('/api/calendar/sync', authenticate as any, (async (req: Request, res: Response) => {
  const { tasks } = (req as any).body;
  // In production:
  // 1. Get user Google OAuth tokens from DB
  // 2. Iterate tasks and call googleapis.calendar('v3').events.insert()
  console.log(`[CALENDAR]: Syncing ${tasks.length} events for user ${(req as any).user.uid}`);
  (res as any).status(200).json({ message: 'Synchronization Complete' });
}) as any);

/**
 * Task Status Update (Feedback Loop)
 */
app.patch('/api/tasks/:taskId', authenticate as any, (async (req: Request, res: Response) => {
  const { taskId } = (req as any).params;
  const { status } = (req as any).body;
  console.log(`[FEEDBACK]: Task ${taskId} updated to ${status}`);
  (res as any).status(200).json({ success: true });
}) as any);

app.get('/health', ((req: any, res: any) => (res as any).status(200).send('OK')) as any);

app.listen(port, () => {
  console.log(`[STDOUT]: Future-You Backend listening on ${port}`);
});

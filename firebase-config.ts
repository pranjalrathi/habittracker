
/**
 * FIREBASE PRODUCTION CONFIGURATION
 * 
 * 1. FIRESTORE SECURITY RULES:
 * 
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     // Users can only read/write their own profile
 *     match /users/{userId} {
 *       allow read, write: if request.auth != null && request.auth.uid == userId;
 *       
 *       // Simulations are nested for automatic scoping
 *       match /simulations/{simulationId} {
 *         allow read, write: if request.auth != null && request.auth.uid == userId;
 *         
 *         // Validation for Simulation Data
 *         allow create: if request.resource.data.timestamp == request.time
 *                      && request.resource.data.goal is string;
 *       }
 *     }
 *   }
 * }
 * 
 * 2. INDEXING STRATEGY:
 * - Collection Group Index: None (Not needed for this use case)
 * - Composite Index: users/{userId}/simulations [timestamp: DESC, goal: ASC]
 * 
 * 3. AUTHENTICATION:
 * - Providers: Google (Primary), Email/Password (Recovery)
 * - Session: Persistence 'LOCAL' for long-term tracking
 */

export const FIREBASE_COLLECTIONS = {
  USERS: 'users',
  SIMULATIONS: 'simulations'
};

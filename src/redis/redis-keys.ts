// helper functions for generating session keys
export function sessionKey(role: string, userId: string, sessionId: string) {
  return `${role}:${userId}:session:${sessionId}`;
}
export function refreshKey(role: string, userId: string, sessionId: string) {
  return `${role}:${userId}:refresh:${sessionId}`;
}
export function sessionsKey(role: string, userId: string) {
  return `${role}:${userId}:sessions`;
}

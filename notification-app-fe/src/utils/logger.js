export function logEvent(event, details = {}) {
  console.info("[notification-app]", {
    event,
    details,
    timestamp: new Date().toISOString(),
  });
}

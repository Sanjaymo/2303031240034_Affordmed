import { logEvent } from "../utils/logger";

const API_URL =
  import.meta.env.VITE_NOTIFICATIONS_API_URL ??
  "http://4.224.186.213/evaluation-service/notifications";

const fallbackNotifications = [
  ["d146095a-0d86-4a34-9e69-3900a14576bc", "Result", "mid-sem", "2026-04-22 17:51:30"],
  ["b283218f-ea5a-4b7c-93a9-1f2f240d64b0", "Placement", "CSX Corporation hiring", "2026-04-22 17:51:18"],
  ["81589ada-0ad3-4f77-9554-f52fb558e09d", "Event", "farewell", "2026-04-22 17:51:06"],
  ["0005513a-142b-4bbc-8678-eefec65e1ede", "Result", "mid-sem", "2026-04-22 17:50:54"],
  ["ea836726-c25e-4f21-a72f-544a6af8a37f", "Result", "project-review", "2026-04-22 17:50:42"],
  ["003cb427-8fc6-47f7-bb00-be228f6b0d2c", "Result", "external", "2026-04-22 17:50:30"],
  ["e5c4ff20-31bf-4d40-8f02-72fda59e8918", "Result", "project-review", "2026-04-22 17:50:18"],
  ["1cfce5ee-ad37-4894-8946-d707627176a5", "Event", "tech-fest", "2026-04-22 17:50:06"],
  ["cf2885a6-45ac-4ba0-b548-6e9e9d4c52c8", "Result", "project-review", "2026-04-22 17:49:54"],
  ["8a7412bd-6065-4d09-8501-a37f11cc848b", "Placement", "Advanced Micro Devices Inc. hiring", "2026-04-22 17:49:42"],
].map(([id, type, message, timestamp]) => ({ id, type, message, timestamp }));

const weights = { Placement: 3, Result: 2, Event: 1 };

function normalizeNotification(notification) {
  return {
    id: notification.ID ?? notification.id,
    type: notification.Type ?? notification.type,
    message: notification.Message ?? notification.message,
    timestamp: notification.Timestamp ?? notification.timestamp,
  };
}

export function getPriorityNotifications(notifications, limit) {
  return [...notifications]
    .sort((a, b) => {
      const typeScore = (weights[b.type] ?? 0) - (weights[a.type] ?? 0);
      if (typeScore !== 0) return typeScore;
      return new Date(b.timestamp) - new Date(a.timestamp);
    })
    .slice(0, limit);
}

export async function fetchNotifications({ page, limit, type }) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });

  if (type !== "All") {
    params.set("notification_type", type);
  }

  logEvent("api:notifications:request", { page, limit, type });

  try {
    const response = await fetch(`${API_URL}?${params.toString()}`, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    const notifications = (payload.notifications ?? []).map(normalizeNotification);

    logEvent("api:notifications:success", { count: notifications.length });
    return {
      notifications,
      total: payload.total ?? notifications.length,
      warning: "",
    };
  } catch (error) {
    logEvent("api:notifications:fallback", { message: error.message });

    const filtered =
      type === "All"
        ? fallbackNotifications
        : fallbackNotifications.filter((notification) => notification.type === type);
    const start = (page - 1) * limit;

    return {
      notifications: filtered.slice(start, start + limit),
      total: filtered.length,
      warning: "API unavailable, showing bundled sample notifications.",
    };
  }
}

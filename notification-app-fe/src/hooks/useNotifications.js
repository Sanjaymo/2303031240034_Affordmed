import { useEffect, useMemo, useState } from "react";
import { fetchNotifications, getPriorityNotifications } from "../api/notifications";
import { logEvent } from "../utils/logger";

const STORAGE_KEY = "affordmed-viewed-notifications";

function getStoredViewedIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}

export function useNotifications({ page, limit, filter, priorityLimit }) {
  const [notifications, setNotifications] = useState([]);
  const [viewedIds, setViewedIds] = useState(getStoredViewedIds);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const data = await fetchNotifications({ page, limit, type: filter });
        if (!active) return;

        setNotifications(data.notifications);
        setTotal(data.total);
        setWarning(data.warning);
      } catch (caughtError) {
        if (!active) return;
        setError(caughtError.message);
        logEvent("notifications:load:error", { message: caughtError.message });
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [page, limit, filter]);

  const notificationsWithState = useMemo(
    () =>
      notifications.map((notification) => ({
        ...notification,
        viewed: viewedIds.has(notification.id),
      })),
    [notifications, viewedIds],
  );

  const priorityNotifications = useMemo(
    () => getPriorityNotifications(notificationsWithState, priorityLimit),
    [notificationsWithState, priorityLimit],
  );

  function persistViewedIds(next) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
  }

  function markViewed(id) {
    setViewedIds((current) => {
      const next = new Set(current);
      next.add(id);
      persistViewedIds(next);
      logEvent("notification:viewed", { id });
      return next;
    });
  }

  function markAllViewed() {
    setViewedIds((current) => {
      const next = new Set(current);
      notifications.forEach((notification) => next.add(notification.id));
      persistViewedIds(next);
      logEvent("notifications:viewed:all", { count: notifications.length });
      return next;
    });
  }

  return {
    notifications: notificationsWithState,
    priorityNotifications,
    unreadCount: notificationsWithState.filter((notification) => !notification.viewed).length,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    loading,
    error,
    warning,
    markViewed,
    markAllViewed,
  };
}

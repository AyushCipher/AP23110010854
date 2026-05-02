export const CONFIG = {
  API: {
    NOTIFICATIONS_ENDPOINT: process.env.NOTIFICATIONS_API || "http://20.207.122.201/evaluation-service/notifications",
    TIMEOUT: parseInt(process.env.API_TIMEOUT || "30000"),
    RETRY_ATTEMPTS: parseInt(process.env.API_RETRY || "3"),
  },
  NOTIFICATION: {
    PRIORITY_MAP: {
      Placement: 3,
      Result: 2,
      Event: 1,
    } as const,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },
  LOG: {
    FLUSH_INTERVAL: 5000,
    QUEUE_THRESHOLD: 10,
  },
};

export type NotificationType = keyof typeof CONFIG.NOTIFICATION.PRIORITY_MAP;

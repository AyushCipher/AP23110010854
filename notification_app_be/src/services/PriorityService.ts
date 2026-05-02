import { Log } from "../middleware/Logger";
import { Notification, PriorityNotification, NotificationType } from "../types";
import { CONFIG } from "../config/constants";
import { calculateSortKey, parseTimestamp } from "../utils/helpers";

export class PriorityService {
  getTypePriority(type: string): number {
    return (CONFIG.NOTIFICATION.PRIORITY_MAP as Record<string, number>)[type] || 0;
  }

  applyPrioritySorting(notifications: Notification[]): PriorityNotification[] {
    Log("service", "debug", "service", `Processing ${notifications.length} notifications`);

    const prioritized: PriorityNotification[] = notifications.map((notif) => {
      const priority = this.getTypePriority(notif.Type);
      const timestamp = parseTimestamp(notif.Timestamp);
      const sortKey = calculateSortKey(priority, timestamp);

      return {
        ...notif,
        Priority: priority,
        SortKey: sortKey,
      };
    });

    prioritized.sort((a, b) => {
      if (a.Priority !== b.Priority) {
        return b.Priority - a.Priority;
      }

      const timestampA = parseTimestamp(a.Timestamp);
      const timestampB = parseTimestamp(b.Timestamp);
      return timestampB - timestampA;
    });

    Log("service", "info", "service", "Applied priority sorting successfully");
    return prioritized;
  }

  getTopNotifications(
    notifications: PriorityNotification[],
    limit: number = CONFIG.NOTIFICATION.DEFAULT_LIMIT
  ): PriorityNotification[] {
    const top = notifications.slice(0, Math.min(limit, CONFIG.NOTIFICATION.MAX_LIMIT));
    Log(
      "service",
      "info",
      "service",
      `Selected top ${top.length} of ${notifications.length} notifications`
    );
    return top;
  }

  filterByType(notifications: Notification[], type: NotificationType): Notification[] {
    return notifications.filter((n) => n.Type === type);
  }
}

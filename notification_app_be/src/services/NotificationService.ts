import { Log } from "../middleware/Logger";
import { Notification, PriorityInboxResponse, FetchOptions } from "../types";
import { CONFIG } from "../config/constants";
import { validateAccessToken, validateNotificationType, validateLimit } from "../utils/helpers";
import { ValidationError, NotificationFetchError } from "../errors/AppError";
import { HttpClient } from "./HttpClient";
import { PriorityService } from "./PriorityService";

export class NotificationService {
  private httpClient: HttpClient;
  private priorityService: PriorityService;

  constructor() {
    this.httpClient = new HttpClient();
    this.priorityService = new PriorityService();
  }

  private validateFetchOptions(options: FetchOptions): void {
    if (!validateAccessToken(options.accessToken)) {
      throw new ValidationError("Invalid or missing access token");
    }
  }

  private buildHeaders(accessToken: string): Record<string, string> {
    return {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };
  }

  async fetchNotifications(options: FetchOptions): Promise<Notification[]> {
    try {
      this.validateFetchOptions(options);
      Log("service", "info", "api", "Fetching notifications from API");

      const response = await this.httpClient.get<{ notifications: Notification[] }>(
        CONFIG.API.NOTIFICATIONS_ENDPOINT,
        this.buildHeaders(options.accessToken)
      );

      const notifications = response.notifications || [];
      Log("service", "info", "api", `Fetched ${notifications.length} notifications`);

      return notifications;
    } catch (error) {
      Log("service", "error", "api", `Failed to fetch notifications: ${error}`);
      if (error instanceof ValidationError) throw error;
      throw new NotificationFetchError(
        `Failed to fetch notifications: ${error instanceof Error ? error.message : String(error)}`,
        error
      );
    }
  }

  async getPriorityInbox(options: FetchOptions, limit: number = CONFIG.NOTIFICATION.DEFAULT_LIMIT): Promise<PriorityInboxResponse> {
    try {
      if (!validateLimit(limit)) {
        throw new ValidationError(`Invalid limit. Must be between 1 and ${CONFIG.NOTIFICATION.MAX_LIMIT}`);
      }

      Log("handler", "info", "controller", "getPriorityInbox called");

      const notifications = await this.fetchNotifications(options);
      const prioritized = this.priorityService.applyPrioritySorting(notifications);
      const topNotifications = this.priorityService.getTopNotifications(prioritized, limit);

      const response: PriorityInboxResponse = {
        success: true,
        data: {
          top_notifications: topNotifications,
          total_processed: notifications.length,
          top_returned: topNotifications.length,
        },
      };

      Log("handler", "info", "controller", `Priority inbox generated: ${topNotifications.length} notifications`);
      return response;
    } catch (error) {
      Log("backend", "fatal", "controller", `Failed to generate priority inbox: ${error}`);
      return {
        success: false,
        data: {
          top_notifications: [],
          total_processed: 0,
          top_returned: 0,
        },
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async getNotificationsByType(
    options: FetchOptions,
    type: string,
    limit: number = CONFIG.NOTIFICATION.DEFAULT_LIMIT
  ): Promise<PriorityInboxResponse> {
    try {
      if (!validateNotificationType(type)) {
        throw new ValidationError(`Invalid notification type: ${type}`);
      }

      if (!validateLimit(limit)) {
        throw new ValidationError(`Invalid limit. Must be between 1 and ${CONFIG.NOTIFICATION.MAX_LIMIT}`);
      }

      Log("service", "info", "api", `Fetching ${type} notifications`);

      const notifications = await this.fetchNotifications(options);
      const filtered = this.priorityService.filterByType(notifications, type);
      const prioritized = this.priorityService.applyPrioritySorting(filtered);
      const topNotifications = this.priorityService.getTopNotifications(prioritized, limit);

      return {
        success: true,
        data: {
          top_notifications: topNotifications,
          total_processed: filtered.length,
          top_returned: topNotifications.length,
        },
      };
    } catch (error) {
      Log("backend", "error", "controller", `Failed to fetch ${type} notifications: ${error}`);
      return {
        success: false,
        data: {
          top_notifications: [],
          total_processed: 0,
          top_returned: 0,
        },
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

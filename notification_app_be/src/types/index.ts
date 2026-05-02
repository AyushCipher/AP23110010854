export type NotificationType = "Result" | "Placement" | "Event";

export interface Notification {
  ID: string;
  Type: NotificationType;
  Message: string;
  Timestamp: string;
}

export interface PriorityNotification extends Notification {
  Priority: number;
  SortKey: number;
}

export interface PriorityInboxResponse {
  success: boolean;
  data: {
    top_notifications: PriorityNotification[];
    total_processed: number;
    top_returned: number;
  };
  error?: string;
}

export interface FetchOptions {
  accessToken: string;
  timeout?: number;
  retryAttempts?: number;
}

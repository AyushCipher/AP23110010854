export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class APIError extends AppError {
  constructor(message: string, statusCode: number, details?: unknown) {
    super("API_ERROR", message, statusCode, details);
    this.name = "APIError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super("VALIDATION_ERROR", message, 400, details);
    this.name = "ValidationError";
  }
}

export class NotificationFetchError extends AppError {
  constructor(message: string, details?: unknown) {
    super("NOTIFICATION_FETCH_ERROR", message, 502, details);
    this.name = "NotificationFetchError";
  }
}

export class PriorityCalculationError extends AppError {
  constructor(message: string, details?: unknown) {
    super("PRIORITY_CALC_ERROR", message, 500, details);
    this.name = "PriorityCalculationError";
  }
}

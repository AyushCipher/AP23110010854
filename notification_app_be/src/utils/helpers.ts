import { CONFIG } from "../config/constants";

export function validateAccessToken(token: string): boolean {
  if (!token || typeof token !== "string" || token.trim().length === 0) {
    return false;
  }
  return true;
}

export function validateNotificationType(type: string): type is "Result" | "Placement" | "Event" {
  return ["Result", "Placement", "Event"].includes(type);
}

export function validateLimit(limit: unknown): boolean {
  if (typeof limit !== "number") return false;
  return limit > 0 && limit <= CONFIG.NOTIFICATION.MAX_LIMIT;
}

export function parseTimestamp(timestampStr: string): number {
  try {
    const date = new Date(timestampStr.replace(" ", "T"));
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date");
    }
    return Math.floor(date.getTime() / 1000);
  } catch {
    return 0;
  }
}

export function calculateSortKey(typePriority: number, timestamp: number): number {
  return typePriority * 1000000 + timestamp;
}

export async function retryAsync<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }
  }

  throw lastError || new Error("Max retry attempts reached");
}

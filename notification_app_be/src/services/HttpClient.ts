import { Log } from "../middleware/Logger";
import { APIError } from "../errors/AppError";
import { retryAsync } from "../utils/helpers";
import { CONFIG } from "../config/constants";

export class HttpClient {
  private timeout: number;
  private retryAttempts: number;

  constructor(timeout: number = CONFIG.API.TIMEOUT, retryAttempts: number = CONFIG.API.RETRY_ATTEMPTS) {
    this.timeout = timeout;
    this.retryAttempts = retryAttempts;
  }

  async get<T>(url: string, headers: Record<string, string>): Promise<T> {
    return retryAsync(
      async () => {
        Log("service", "debug", "api", `GET request to ${url}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
          const response = await fetch(url, {
            method: "GET",
            headers,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new APIError(
              `API returned ${response.status}`,
              response.status,
              await response.text()
            );
          }

          const data = await response.json();
          Log("service", "debug", "api", "API request succeeded");
          return data as T;
        } catch (error) {
          clearTimeout(timeoutId);
          if (error instanceof APIError) throw error;
          throw new APIError(
            `API request failed: ${error instanceof Error ? error.message : String(error)}`,
            502,
            error
          );
        }
      },
      this.retryAttempts
    );
  }
}

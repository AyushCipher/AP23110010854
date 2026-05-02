interface LogPayload {
  stack: string;
  level: "debug" | "info" | "warn" | "error" | "fatal";
  package: string;
  message: string;
  timestamp?: string;
  logID?: string;
}

class NotificationLogger {
  private apiEndpoint = "http://20.207.122.201/evaluation-service/logs";
  private accessToken: string = "";
  private logQueue: LogPayload[] = [];
  private queueFlushInterval = 5000;

  constructor(accessToken?: string) {
    if (accessToken) {
      this.accessToken = accessToken;
    }
    this.startQueueProcessor();
  }

  public Log(
    stack: string,
    level: "debug" | "info" | "warn" | "error" | "fatal",
    pkg: string,
    message: string
  ): void {
    const logPayload: LogPayload = {
      stack,
      level,
      package: pkg,
      message,
      timestamp: new Date().toISOString(),
      logID: this.generateLogID(),
    };

    this.logQueue.push(logPayload);
    this.logToConsole(logPayload);

    if (this.logQueue.length >= 10) {
      this.flushLogs();
    }
  }

  private async flushLogs(): Promise<void> {
    if (this.logQueue.length === 0) {
      return;
    }

    const logsToSend = [...this.logQueue];
    this.logQueue = [];

    try {
      await fetch(this.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({
          logs: logsToSend,
        }),
      });
    } catch (error) {
      this.logQueue = [...logsToSend, ...this.logQueue];
      console.error("Failed to flush logs:", error);
    }
  }

  private startQueueProcessor(): void {
    setInterval(() => {
      if (this.logQueue.length > 0) {
        this.flushLogs();
      }
    }, this.queueFlushInterval);
  }

  private generateLogID(): string {
    return `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private logToConsole(payload: LogPayload): void {
    const styleMap = {
      debug: "color: #7f8c8d; font-weight: bold;",
      info: "color: #3498db; font-weight: bold;",
      warn: "color: #f39c12; font-weight: bold;",
      error: "color: #e74c3c; font-weight: bold;",
      fatal: "color: #c0392b; font-weight: bold; font-size: 1.1em;",
    };

    const style = styleMap[payload.level];
    const prefix = `[${payload.timestamp}] [${payload.stack}] [${payload.package}]`;

    console.log(
      `%c${prefix} ${payload.level.toUpperCase()}: ${payload.message}`,
      style
    );
  }

  public setAccessToken(token: string): void {
    this.accessToken = token;
  }

  public async shutdown(): Promise<void> {
    await this.flushLogs();
  }
}

export const logger = new NotificationLogger();

export function Log(
  stack: string,
  level: "debug" | "info" | "warn" | "error" | "fatal",
  pkg: string,
  message: string
): void {
  logger.Log(stack, level, pkg, message);
}

export default logger;

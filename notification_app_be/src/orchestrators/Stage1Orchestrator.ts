import { Log, logger } from "../middleware/Logger";
import { NotificationService } from "../services/NotificationService";
import { CONFIG } from "../config/constants";

export class Stage1Orchestrator {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  async run(accessToken: string): Promise<void> {
    try {
      if (!accessToken || accessToken === "YOUR_ACCESS_TOKEN_HERE") {
        throw new Error("Missing or invalid access token");
      }

      logger.setAccessToken(accessToken);
      Log("backend", "info", "controller", "Stage 1 Orchestrator started");

      const result = await this.notificationService.getPriorityInbox(
        { accessToken },
        CONFIG.NOTIFICATION.DEFAULT_LIMIT
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      this.printResults(result);
      Log("handler", "info", "controller", "Stage 1 completed successfully");
    } catch (error) {
      Log("backend", "fatal", "controller", `Stage 1 failed: ${error}`);
      console.error("Fatal error:", error);
      throw error;
    } finally {
      await logger.shutdown();
    }
  }

  private printResults(result: any): void {
    console.log("\n========== STAGE 1: PRIORITY INBOX RESULTS ==========");
    console.log(`Total Processed: ${result.data.total_processed}`);
    console.log(`Top Returned: ${result.data.top_returned}`);
    console.log("\n--- Top Notifications ---\n");

    result.data.top_notifications.forEach((notif: any, index: number) => {
      console.log(`${index + 1}. [${notif.Type}] ${notif.Message}`);
      console.log(`   ID: ${notif.ID}`);
      console.log(`   Timestamp: ${notif.Timestamp}`);
      console.log(`   Priority: ${notif.Priority}`);
      console.log("");
    });
  }
}

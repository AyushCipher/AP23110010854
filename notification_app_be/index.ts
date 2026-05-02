import { Stage1Orchestrator } from "./src/orchestrators/Stage1Orchestrator";
import { Log, logger } from "./src/middleware/Logger";

async function main() {
  const ACCESS_TOKEN = process.env.ACCESS_TOKEN || "YOUR_ACCESS_TOKEN_HERE";

  if (!ACCESS_TOKEN || ACCESS_TOKEN === "YOUR_ACCESS_TOKEN_HERE") {
    console.error(
      "❌ ERROR: Please set your ACCESS_TOKEN from the .env file or environment variables"
    );
    Log(
      "backend",
      "fatal",
      "handler",
      "Missing access token for Stage 1"
    );
    process.exit(1);
  }

  logger.setAccessToken(ACCESS_TOKEN);
  const orchestrator = new Stage1Orchestrator();
  await orchestrator.run(ACCESS_TOKEN);
  await logger.shutdown();
}

main().catch((error) => {
  Log(
    "backend",
    "fatal",
    "service",
    `Application failed: ${error}`
  );
  console.error("Fatal error:", error);
  process.exit(1);
});

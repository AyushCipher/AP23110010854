import { Stage1Orchestrator } from "./src/orchestrators/Stage1Orchestrator";

async function main(): Promise<void> {
  const accessToken = process.env.ACCESS_TOKEN || "YOUR_ACCESS_TOKEN_HERE";
  
  const orchestrator = new Stage1Orchestrator();
  await orchestrator.run(accessToken);
}

main().catch((error) => {
  console.error("Application error:", error);
  process.exit(1);
});

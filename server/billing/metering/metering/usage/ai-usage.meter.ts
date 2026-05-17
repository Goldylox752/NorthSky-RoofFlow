import { trackUsage } from "../services/metering.service";

export async function trackAITokens({
  contractorId,
  promptTokens,
  completionTokens,
  workflow,
}: {
  contractorId: string;
  promptTokens: number;
  completionTokens: number;
  workflow: string;
}) {
  const totalTokens =
    promptTokens + completionTokens;

  await trackUsage({
    contractorId,
    type: "ai_tokens",
    units: totalTokens,
    metadata: {
      workflow,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
    },
  });
}
import OpenAI from "openai";
import type { ZodType } from "zod";

const nvidiaApiKey = process.env.NVIDIA_API_KEY?.trim() ?? "";
const nvidiaBaseUrl =
  process.env.NVIDIA_BASE_URL?.trim() || "https://integrate.api.nvidia.com/v1";

const embeddingDimension = Number(process.env.NVIDIA_EMBEDDING_DIM) || 2048;

export const reasoningModel =
  process.env.NVIDIA_MODEL_REASONING || "nvidia/nemotron-3-ultra-550b-a55b";
export const fastModel =
  process.env.NVIDIA_MODEL_FAST || "nvidia/nemotron-3.5-lightning-30b-a3b";
export const embeddingModel =
  process.env.NVIDIA_EMBEDDING_MODEL || "nvidia/nemotron-3-embed-1b";

let client: OpenAI | null = null;

export function isAiConfigured(): boolean {
  if (!nvidiaApiKey) return false;
  return !/^(replace|change|your|missing|example)/i.test(nvidiaApiKey);
}

function getClient(): OpenAI {
  if (!isAiConfigured()) {
    throw new Error("AI provider is not configured.");
  }

  if (!client) {
    client = new OpenAI({
      apiKey: nvidiaApiKey,
      baseURL: nvidiaBaseUrl,
      timeout: 20_000,
      maxRetries: 0,
    });
  }

  return client;
}

interface MessageWithReasoning {
  content?: string | null;
  reasoning_content?: string | null;
}

function messageText(message: MessageWithReasoning | undefined): string {
  const content = message?.content?.trim();
  if (content) return content;
  return message?.reasoning_content?.trim() ?? "";
}

function parseJsonContent(content: string): unknown {
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  const candidate = jsonMatch ? jsonMatch[0] : content;

  const cleaned = candidate
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  return JSON.parse(cleaned) as unknown;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await getClient().embeddings.create({
    model: embeddingModel,
    input: text.replace(/\n+/g, " ").trim().slice(0, 8000),
  });

  const embedding = response.data[0]?.embedding;
  if (!embedding) {
    throw new Error("AI provider returned no embedding.");
  }

  if (embedding.length !== embeddingDimension) {
    throw new Error(
      `Embedding dimension mismatch: expected ${embeddingDimension}, received ${embedding.length}.`
    );
  }

  return embedding;
}

export async function generateStructuredOutput<T>(
  systemPrompt: string,
  userPrompt: string,
  schema: ZodType<T>,
  useFastModel = false
): Promise<T> {
  const model = useFastModel ? fastModel : reasoningModel;

  const response = await getClient().chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: `${systemPrompt}\nRespond only with valid JSON. Do not include markdown fences.`,
      },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.2,
    max_tokens: 1500,
  });

  const content = messageText(
    response.choices[0]?.message as MessageWithReasoning | undefined
  );

  if (!content) {
    throw new Error("AI provider returned an empty response.");
  }

  const parsed = schema.safeParse(parseJsonContent(content));
  if (!parsed.success) {
    throw new Error("AI output did not match the expected schema.");
  }

  return parsed.data;
}

export async function generateText(
  systemPrompt: string,
  userPrompt: string,
  useFastModel = false
): Promise<string> {
  const model = useFastModel ? fastModel : reasoningModel;

  const response = await getClient().chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.3,
    max_tokens: 800,
  });

  return messageText(
    response.choices[0]?.message as MessageWithReasoning | undefined
  ).slice(0, 2000);
}

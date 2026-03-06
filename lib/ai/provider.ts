import { customProvider } from "ai";
import { openrouter } from "@openrouter/ai-sdk-provider";
import { chatModels, DEVELOPMENT_CHAT_MODEL } from "./models";

const NODE_ENV = process.env.NODE_ENV!;

export const isProduction = NODE_ENV === "production";

const createLanguageModels = (isProduction: boolean) => {
  const models: Record<string, any> = {};

  // All chat models use OpenRouter directly
  chatModels.forEach(
    (model) => (models[model.id] = openrouter.languageModel(model.id)),
  );

  // Title model uses a fast free model
  models["title-model"] = openrouter.languageModel(
    isProduction ? "google/gemini-1.5-flash" : DEVELOPMENT_CHAT_MODEL,
  );

  return models;
};

export const myProvider = customProvider({
  languageModels: createLanguageModels(isProduction),
});

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: ChatModel[] = [
  {
    id: "meta-llama/llama-3.3-70b-instruct:free",
    name: "Llama 3.3 70B",
    description: "Meta's most capable open model with excellent reasoning",
  },
  {
    id: "google/gemma-3-27b-it:free",
    name: "Gemma 3 27B",
    description: "Google's powerful instruction-tuned model, great for coding",
  },
  {
    id: "stepfun/step-3.5-flash:free",
    name: "StepFun Step 3.5 Flash",
    description: "Fast and efficient, excellent quality for its size",
  },
  {
    id: "nvidia/nemotron-3-nano-30b-a3b:free",
    name: "NVIDIA Nemotron 3 Nano 30B A3B",
    description: "Nvidia's fast, multimodal model with strong reasoning",
  },
  {
    id: "qwen/qwen3-next-80b-a3b-instruct:free",
    name: "Qwen3 Next 80B A3B Instruct",
    description: "Qwen's model, good for quick responses",
  },
  {
    id: "z-ai/glm-4.5-air:free",
    name: "GLM 4.5 Air",
    description: "Compact but powerful, ideal for fast interactions",
  },
  {
    id: "meta-llama/llama-3.2-3b-instruct:free",
    name: "Llama 3.2 3B",
    description: "Very fast, lightweight model for quick tasks",
  },
];

export const DEFAULT_MODEL_ID = chatModels[0].id;
export const DEVELOPMENT_CHAT_MODEL = "google/gemini-1.5-flash";

export const MODEL_OPTIONS = chatModels.map((m) => ({
  value: m.id,
  label: m.name,
}));

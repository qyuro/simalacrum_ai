import { GoogleGenAI, Type } from "@google/genai";
import { Agent, AgentActionResponse, Mood } from "../types";

// Note: In a real app, strict error handling would be here.
// We assume process.env.API_KEY is available via built-in tooling (e.g. Vite define) or the user has it.
// Since we can't show an input field for it per instructions, we assume it's set.

const getAiClient = () => {
  // Prefer Vite env for frontend builds, fall back to other env vars for server/local setups
  const apiKey = ((import.meta as any).env?.VITE_GOOGLE_API_KEY) || process.env.GEMINI_API_KEY || process.env.API_KEY || '';
  if (!apiKey) {
    console.warn('API Key is missing. Simulation will use mock responses if not provided.');
  }
  return new GoogleGenAI({ apiKey });
};

export const generateAgentAction = async (
  agent: Agent,
  allAgents: Agent[],
  recentLogs: string[],
  globalContext: string
): Promise<AgentActionResponse> => {
  
  const ai = getAiClient();
  
  // Filter out self from potential targets
  const otherAgents = allAgents.filter(a => a.id !== agent.id).map(a => ({
    id: a.id,
    name: a.name,
    role: a.role,
    relationship: agent.relationships.find(r => r.targetAgentId === a.id)?.affinity || 0
  }));

  const systemPrompt = `
    Ты играешь роль персонажа в симуляции. Твое имя: ${agent.name}.
    Твоя роль: ${agent.role}.
    Твоя личность: ${agent.personality}.
    Твое текущее настроение: ${agent.mood}.
    
    Твои недавние воспоминания: ${agent.memories.slice(-5).join('; ')}.
    Последние события в мире: ${recentLogs.join('; ')}.
    Глобальный контекст: ${globalContext}.

    Другие агенты рядом: ${JSON.stringify(otherAgents)}.

    Ты должен выбрать одно действие. Если ты выбираешь TALK (разговор), выбери ID агента.
    Если ты реагируешь на чьи-то слова, ответь им.
    Контент должен быть на русском языке.
    
    AffinityChange: если ты общаешься, как изменилось твое отношение к этому агенту? (-5 до +5).
    NewMood: выбери новое настроение из списка [Счастье, Грусть, Злость, Спокойствие, Волнение, Усталость, Любопытство].
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Что ты будешь делать сейчас?`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            actionType: { type: Type.STRING, enum: ['TALK', 'THINK', 'WORK', 'REST', 'MOVE'] },
            targetAgentId: { type: Type.STRING, nullable: true },
            content: { type: Type.STRING },
            newMood: { type: Type.STRING, enum: Object.values(Mood) },
            affinityChange: { type: Type.INTEGER, nullable: true }
          },
          required: ['actionType', 'content', 'newMood']
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AgentActionResponse;
    }
    throw new Error("Empty response");
  } catch (error) {
    console.error("Gemini Error:", error);
    // Fallback logic if API fails or key is missing
    return {
      actionType: 'THINK',
      content: 'Интересно, почему я чувствую пустоту в мыслях... (API Error)',
      newMood: Mood.CURIOUS,
      affinityChange: 0
    };
  }
};
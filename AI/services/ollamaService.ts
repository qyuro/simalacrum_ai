import { Agent, AgentActionResponse, Mood } from "../types";

// Локальный Ollama: запросы к http://localhost:11434 (OpenAI-совместимый API).
// Модель задаётся через VITE_OLLAMA_MODEL (например llama3.2, qwen2.5:3b).

const getOllamaConfig = () => {
  const baseUrl =
    (import.meta as any).env?.VITE_OLLAMA_BASE_URL ||
    process.env.VITE_OLLAMA_BASE_URL ||
    "http://localhost:11434/";
  const model =
    (import.meta as any).env?.VITE_OLLAMA_MODEL ||
    process.env.VITE_OLLAMA_MODEL ||
    "nemotron-3-nano:30b-cloud ";
  return { baseUrl: baseUrl.replace(/\/$/, ""), model };
};

export const generateAgentAction = async (
  agent: Agent,
  allAgents: Agent[],
  recentLogs: string[],
  globalContext: string,
): Promise<AgentActionResponse> => {
  const { baseUrl, model } = getOllamaConfig();

  const otherAgents = allAgents
    .filter((a) => a.id !== agent.id)
    .map((a) => ({
      id: a.id,
      name: a.name,
      role: a.role,
      relationship:
        agent.relationships.find((r) => r.targetAgentId === a.id)?.affinity ||
        0,
    }));

  const systemPrompt = `
    Ты играешь роль персонажа в симуляции. Твое имя: ${agent.name}.
    Твоя роль: ${agent.role}.
    Твоя личность: ${agent.personality}.
    Твое текущее настроение: ${agent.mood}.

    Твои недавние воспоминания: ${agent.memories.slice(-5).join("; ")}.
    Последние события в мире: ${recentLogs.join("; ")}.
    Глобальный контекст: ${globalContext}.

    Другие агенты рядом: ${JSON.stringify(otherAgents)}.

    Ты должен выбрать одно действие. Если ты выбираешь TALK (разговор), выбери ID агента.
    Если ты реагируешь на чьи-то слова, ответь им.
    Контент должен быть на русском языке.

    AffinityChange: если ты общаешься, как изменилось твое отношение к этому агенту? (-5 до +5).
    NewMood: выбери новое настроение из списка [Счастье, Грусть, Злость, Спокойствие, Волнение, Усталость, Любопытство].

    Ответь только валидным JSON без markdown и пояснений, в формате:
    {"actionType":"TALK|THINK|WORK|REST|MOVE","targetAgentId":"id или null","content":"текст","newMood":"одно из настроений выше","affinityChange":число или null}
  `;

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: "Что ты будешь делать сейчас? Ответь только JSON.",
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Ollama error response:", errorText);
      throw new Error(
        `Ollama API error: ${response.status} ${response.statusText}`,
      );
    }

    const data: any = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content || typeof content !== "string") {
      throw new Error("Empty or invalid Ollama response content");
    }

    const parsed = JSON.parse(content) as AgentActionResponse;
    if (!parsed.actionType || !parsed.content || !parsed.newMood) {
      throw new Error("Invalid agent action shape from model");
    }
    return parsed;
  } catch (error) {
    console.error("Ollama Error:", error);
    return {
      actionType: "THINK",
      content:
        "Интересно, почему я чувствую пустоту в мыслях... (Ollama недоступна или ошибка)",
      newMood: Mood.CURIOUS,
      affinityChange: 0,
    };
  }
};

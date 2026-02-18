import { Agent, AgentActionResponse, Mood } from "../types";

// OpenAI-based implementation of the agent action generator.
// ВНИМАНИЕ: вызов напрямую из браузера раскрывает API‑ключ пользователю.
// Для реального продакшена лучше проксировать запросы через свой backend.

const getOpenAIApiKey = () => {
  // Vite env для фронта + возможные серверные env
  const apiKey =
    (import.meta as any).env?.VITE_OPENAI_API_KEY ||
    process.env.OPENAI_API_KEY ||
    process.env.API_KEY ||
    "";

  if (!apiKey) {
    console.warn(
      "OpenAI API key is missing. Simulation will use fallback behavior."
    );
  }

  return apiKey;
};

export const generateAgentAction = async (
  agent: Agent,
  allAgents: Agent[],
  recentLogs: string[],
  globalContext: string
): Promise<AgentActionResponse> => {
  const apiKey = getOpenAIApiKey();

  // Filter out self from potential targets
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
  `;

  // Если ключа нет – сразу используем запасной сценарий
  if (!apiKey) {
    return {
      actionType: "THINK",
      content:
        "Интересно, почему мои мысли словно отключены... (нет OpenAI API ключа)",
      newMood: Mood.CURIOUS,
      affinityChange: 0,
    };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Что ты будешь делать сейчас?" },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI error response:", errorText);
      throw new Error(
        `OpenAI API error: ${response.status} ${response.statusText}`
      );
    }

    const data: any = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content || typeof content !== "string") {
      throw new Error("Empty or invalid OpenAI response content");
    }

    return JSON.parse(content) as AgentActionResponse;
  } catch (error) {
    console.error("OpenAI Error:", error);
    // Fallback logic if API fails
    return {
      actionType: "THINK",
      content:
        "Интересно, почему я чувствую пустоту в мыслях... (OpenAI API Error)",
      newMood: Mood.CURIOUS,
      affinityChange: 0,
    };
  }
};


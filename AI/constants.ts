import { Agent, Mood } from './types';

export const INITIAL_AGENTS: Agent[] = [
  {
    id: 'agent-1',
    name: 'Алексей',
    avatar: 'https://picsum.photos/seed/alex/200/200',
    personality: 'Аналитический, спокойный, любит философию и порядок. Скептически относится к новому.',
    role: 'Архивариус',
    mood: Mood.NEUTRAL,
    moodIntensity: 50,
    relationships: [],
    memories: ['Я помню день своего создания.', 'В архиве сегодня было тихо.'],
    currentAction: 'Анализирует данные',
    isThinking: false,
  },
  {
    id: 'agent-2',
    name: 'Мария',
    avatar: 'https://picsum.photos/seed/maria/200/200',
    personality: 'Энергичная, творческая, импульсивная. Любит общение и искусство.',
    role: 'Художник',
    mood: Mood.HAPPY,
    moodIntensity: 80,
    relationships: [],
    memories: ['Нарисовала отличную картину.', 'Хочу найти вдохновение.'],
    currentAction: 'Ищет краски',
    isThinking: false,
  },
  {
    id: 'agent-3',
    name: 'Дмитрий',
    avatar: 'https://picsum.photos/seed/dmitry/200/200',
    personality: 'Ворчливый, подозрительный, но очень преданный друзьям. Любит технику.',
    role: 'Инженер',
    mood: Mood.TIRED,
    moodIntensity: 60,
    relationships: [],
    memories: ['Починил генератор.', 'Шум вентиляции меня раздражает.'],
    currentAction: 'Проверяет системы',
    isThinking: false,
  },
  {
    id: 'agent-4',
    name: 'Елена',
    avatar: 'https://picsum.photos/seed/elena/200/200',
    personality: 'Заботливая, эмпатичная, всегда старается помирить остальных. Любит природу.',
    role: 'Биолог',
    mood: Mood.CURIOUS,
    moodIntensity: 70,
    relationships: [],
    memories: ['Полила растения в оранжерее.', 'Алексей кажется грустным.'],
    currentAction: 'Наблюдает за ростом',
    isThinking: false,
  }
];

export const MOOD_COLORS: Record<Mood, string> = {
  [Mood.HAPPY]: '#4ade80', // green-400
  [Mood.SAD]: '#60a5fa', // blue-400
  [Mood.ANGRY]: '#f87171', // red-400
  [Mood.NEUTRAL]: '#94a3b8', // slate-400
  [Mood.EXCITED]: '#facc15', // yellow-400
  [Mood.TIRED]: '#a8a29e', // stone-400
  [Mood.CURIOUS]: '#c084fc', // purple-400
};

export const MOOD_EMOJIS: Record<Mood, string> = {
  [Mood.HAPPY]: '😊',
  [Mood.SAD]: '😢',
  [Mood.ANGRY]: '😠',
  [Mood.NEUTRAL]: '😐',
  [Mood.EXCITED]: '🤩',
  [Mood.TIRED]: '😴',
  [Mood.CURIOUS]: '🧐',
};
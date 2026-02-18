export enum Mood {
  HAPPY = 'Счастье',
  SAD = 'Грусть',
  ANGRY = 'Злость',
  NEUTRAL = 'Спокойствие',
  EXCITED = 'Волнение',
  TIRED = 'Усталость',
  CURIOUS = 'Любопытство'
}

export interface Relationship {
  targetAgentId: string;
  affinity: number; // -100 to 100
  history: string[]; // Summary of interactions
}

export interface Agent {
  id: string;
  name: string;
  avatar: string;
  personality: string; // Description for LLM
  role: string; // Job/Role
  mood: Mood;
  moodIntensity: number; // 0-100
  relationships: Relationship[];
  memories: string[]; // Short-term/Long-term event log
  currentAction: string;
  isThinking: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  agentId?: string;
  type: 'ACTION' | 'SYSTEM' | 'INTERACTION';
  content: string;
}

export interface SimulationState {
  isPlaying: boolean;
  speed: number; // Multiplier, 1x to 10x
  ticks: number;
}

export interface AgentActionResponse {
  actionType: 'TALK' | 'THINK' | 'WORK' | 'REST' | 'MOVE';
  targetAgentId?: string; // If talking
  content: string; // What they say or think
  newMood: Mood;
  affinityChange?: number; // If interaction, how it changed opinion
}
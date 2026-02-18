import React from 'react';
import { Agent, Mood } from '../types';
import { MOOD_LABELS } from '../constants';

interface AgentCardProps {
  agent: Agent;
  onClick: () => void;
  isActive: boolean;
}

const moodColors: Record<Mood, string> = {
  [Mood.Happy]: 'bg-green-500',
  [Mood.Sad]: 'bg-blue-500',
  [Mood.Angry]: 'bg-red-500',
  [Mood.Neutral]: 'bg-slate-400',
  [Mood.Excited]: 'bg-yellow-500',
  [Mood.Anxious]: 'bg-purple-500',
  [Mood.Curious]: 'bg-indigo-500',
  [Mood.Tired]: 'bg-gray-500',
};

const AgentCard: React.FC<AgentCardProps> = ({ agent, onClick, isActive }) => {
  return (
    <div 
      onClick={onClick}
      className={`relative p-4 rounded-xl border transition-all cursor-pointer hover:shadow-lg hover:-translate-y-1 
        ${isActive ? 'bg-slate-800 border-indigo-500 shadow-indigo-500/20' : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'}
      `}
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <img 
            src={agent.avatar} 
            alt={agent.name} 
            className="w-12 h-12 rounded-full object-cover border-2 border-slate-600"
          />
          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-800 ${moodColors[agent.mood]}`} title={MOOD_LABELS[agent.mood]} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-bold text-slate-100 truncate">{agent.name}</h3>
            {isActive && <span className="flex w-2 h-2 bg-indigo-500 rounded-full animate-pulse"/>}
          </div>
          <p className="text-xs text-slate-400 truncate">{agent.status}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1">
        {agent.traits.map(trait => (
          <span key={trait} className="px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded bg-slate-700 text-slate-300">
            {trait}
          </span>
        ))}
      </div>
    </div>
  );
};

export default AgentCard;
import React from 'react';
import { Agent, Mood } from '../types';
import { MOOD_COLORS, MOOD_EMOJIS } from '../constants';

interface AgentInspectorProps {
  agent: Agent;
  onClose: () => void;
  agents: Agent[]; // To resolve names in relationships
}

const AgentInspector: React.FC<AgentInspectorProps> = ({ agent, onClose, agents }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-600 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 bg-slate-700 border-b border-slate-600 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="relative">
                <img 
                    src={agent.avatar} 
                    alt={agent.name} 
                    className="w-16 h-16 rounded-full border-2 object-cover"
                    style={{ borderColor: MOOD_COLORS[agent.mood] }}
                />
                <span className="absolute -bottom-1 -right-1 text-2xl" role="img" aria-label="mood">
                    {MOOD_EMOJIS[agent.mood]}
                </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{agent.name}</h2>
              <p className="text-slate-300">{agent.role}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700/50 p-3 rounded-lg">
                <span className="text-xs text-slate-400 uppercase tracking-wider">Настроение</span>
                <div className="text-lg font-medium" style={{ color: MOOD_COLORS[agent.mood] }}>
                    {agent.mood} ({agent.moodIntensity}%)
                </div>
            </div>
            <div className="bg-slate-700/50 p-3 rounded-lg">
                <span className="text-xs text-slate-400 uppercase tracking-wider">Действие</span>
                <div className="text-lg font-medium text-slate-200 truncate">
                    {agent.isThinking ? 'Размышляет...' : agent.currentAction}
                </div>
            </div>
          </div>

          {/* Personality */}
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">Личность</h3>
            <p className="text-slate-200 bg-slate-900/50 p-3 rounded border border-slate-700">
                {agent.personality}
            </p>
          </div>

          {/* Relationships */}
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">Отношения</h3>
            {agent.relationships.length === 0 ? (
                <p className="text-slate-500 italic">Пока никого не знает близко.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {agent.relationships.map((rel, idx) => {
                        const target = agents.find(a => a.id === rel.targetAgentId);
                        if (!target) return null;
                        return (
                            <div key={idx} className="flex justify-between items-center bg-slate-900/50 p-2 rounded border border-slate-700">
                                <span className="text-slate-200">{target.name}</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full"
                                            style={{ 
                                                width: `${Math.abs(rel.affinity)}%`,
                                                backgroundColor: rel.affinity > 0 ? '#4ade80' : '#f87171' 
                                            }}
                                        />
                                    </div>
                                    <span className="text-xs w-6 text-right font-mono">{rel.affinity}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
          </div>

          {/* Memories */}
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">Ключевые воспоминания</h3>
            <ul className="space-y-2">
                {agent.memories.slice(-5).reverse().map((mem, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="text-slate-500 mt-1">•</span>
                        <span>{mem}</span>
                    </li>
                ))}
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AgentInspector;
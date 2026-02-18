import React, { useState } from 'react';
import { Agent, Mood, Relationship } from '../types';
import { MOOD_LABELS } from '../constants';

interface InspectorPanelProps {
  agent: Agent | null;
  onClose: () => void;
  allAgents: Agent[];
  onUpdateAgent: (agentId: string, updates: Partial<Agent>) => void;
  onSendMessage: (agentId: string, message: string) => void;
}

const InspectorPanel: React.FC<InspectorPanelProps> = ({ 
  agent, onClose, allAgents, onUpdateAgent, onSendMessage 
}) => {
  const [whisper, setWhisper] = useState('');
  const [editingPlan, setEditingPlan] = useState(false);
  const [planDraft, setPlanDraft] = useState('');

  if (!agent) return null;

  const handleSendMessage = () => {
    if (whisper.trim()) {
      onSendMessage(agent.id, whisper);
      setWhisper('');
    }
  };

  const startEditPlan = () => {
    setPlanDraft(agent.plans);
    setEditingPlan(true);
  };

  const savePlan = () => {
    onUpdateAgent(agent.id, { plans: planDraft });
    setEditingPlan(false);
  };

  const changeMood = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateAgent(agent.id, { mood: e.target.value as Mood });
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-slate-900 shadow-2xl border-l border-slate-700 transform transition-transform duration-300 z-50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="relative h-32 bg-gradient-to-br from-indigo-900 to-slate-900 flex-shrink-0">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-1 z-10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="absolute -bottom-10 left-6">
          <img src={agent.avatar} alt={agent.name} className="w-20 h-20 rounded-full border-4 border-slate-900 shadow-lg" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pt-12 px-6 pb-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        
        <div>
          <h2 className="text-2xl font-bold text-white break-words leading-tight">{agent.name}</h2>
          <p className="text-indigo-400 text-sm font-mono">{agent.id}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800 p-3 rounded-lg">
            <span className="text-xs text-slate-500 uppercase block mb-1">Настроение</span>
            <span className="text-white font-medium flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getMoodColor(agent.mood)}`}></span>
              <span className="truncate" title={MOOD_LABELS[agent.mood]}>{MOOD_LABELS[agent.mood]}</span>
            </span>
          </div>
          <div className="bg-slate-800 p-3 rounded-lg">
             <span className="text-xs text-slate-500 uppercase block mb-1">Статус</span>
             {/* Use line-clamp for status to show more context but strictly limit to 3 lines */}
             <span className="text-white font-medium text-sm line-clamp-3 leading-tight" title={agent.status}>
               {agent.status}
             </span>
          </div>
        </div>

        {/* Management / Actions */}
        <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-3 space-y-3">
          <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Управление Агентом</h3>
          
          {/* Send Message */}
          <div className="flex gap-2">
            <input 
              type="text" 
              value={whisper}
              onChange={(e) => setWhisper(e.target.value)}
              placeholder="Шепнуть агенту..."
              className="flex-1 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-slate-200 focus:border-indigo-500 outline-none min-w-0"
            />
            <button onClick={handleSendMessage} disabled={!whisper.trim()} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded text-xs flex-shrink-0">
              →
            </button>
          </div>

          {/* Force Mood */}
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs text-slate-400 whitespace-nowrap">Задать настроение:</label>
            <select 
              value={agent.mood} 
              onChange={changeMood}
              className="bg-slate-900 border border-slate-600 text-slate-200 text-xs rounded px-2 py-1 outline-none focus:border-indigo-500 flex-1 min-w-0"
            >
              {Object.entries(MOOD_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>


        {/* Traits */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Характер</h3>
          <div className="flex flex-wrap gap-2">
            {agent.traits.map(t => (
              <span key={t} className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-xs border border-slate-700 break-words max-w-full">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Plans */}
        <div>
           <div className="flex justify-between items-center mb-2">
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Текущая цель</h3>
             {!editingPlan && <button onClick={startEditPlan} className="text-[10px] text-indigo-400 hover:underline">Изменить</button>}
           </div>
           
           {editingPlan ? (
             <div className="space-y-2">
               <textarea 
                  value={planDraft}
                  onChange={(e) => setPlanDraft(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-slate-200 focus:border-indigo-500 outline-none"
                  rows={3}
               />
               <div className="flex justify-end gap-2">
                 <button onClick={() => setEditingPlan(false)} className="text-xs text-slate-400 hover:text-white">Отмена</button>
                 <button onClick={savePlan} className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded">Сохранить</button>
               </div>
             </div>
           ) : (
             <div className="bg-slate-800/50 p-3 rounded border-l-2 border-indigo-500 text-sm text-slate-300 italic break-words">
               "{agent.plans}"
             </div>
           )}
        </div>

        {/* Relationships */}
        <div>
           <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Отношения</h3>
           <div className="space-y-2">
             {Object.keys(agent.relationships).length === 0 && <p className="text-xs text-slate-600">Нет установленных связей.</p>}
             {Object.entries(agent.relationships).map(([targetId, rel]) => {
               const relationship = rel as Relationship;
               const target = allAgents.find(a => a.id === targetId);
               if(!target) return null;
               return (
                 <div key={targetId} className="flex items-center justify-between text-sm bg-slate-800 p-2 rounded gap-3">
                    <span className="text-slate-300 truncate flex-1" title={target.name}>{target.name}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${relationship.affinity > 0 ? 'bg-green-500' : 'bg-red-500'}`} 
                          style={{ width: `${Math.abs(relationship.affinity)}%` }}
                        />
                      </div>
                      <span className={`text-xs w-8 text-right ${relationship.affinity > 0 ? 'text-green-400' : 'text-red-400'}`}>{relationship.affinity}</span>
                    </div>
                 </div>
               );
             })}
           </div>
        </div>

        {/* Memories */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Память</h3>
          <ul className="space-y-2">
            {agent.memories.slice().reverse().slice(0, 5).map(m => (
              <li key={m.id} className="text-xs text-slate-400 border-l border-slate-700 pl-3 py-1 break-words">
                {m.description}
                <span className="block text-[10px] text-slate-600 mt-0.5">T+{m.timestamp}</span>
              </li>
            ))}
            {agent.memories.length === 0 && <li className="text-xs text-slate-600">Чистый лист.</li>}
          </ul>
        </div>

      </div>
    </div>
  );
};

function getMoodColor(mood: Mood) {
  switch (mood) {
    case Mood.Happy: return 'bg-green-500';
    case Mood.Sad: return 'bg-blue-500';
    case Mood.Angry: return 'bg-red-500';
    default: return 'bg-slate-400';
  }
}

export default InspectorPanel;
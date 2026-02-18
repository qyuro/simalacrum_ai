import React, { useState } from 'react';

interface ControlPanelProps {
  speed: number;
  setSpeed: (s: number) => void;
  isPlaying: boolean;
  setIsPlaying: (p: boolean) => void;
  onAddEvent: (text: string) => void;
  onAddAgent: (name: string, role: string, persona: string) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  speed, setSpeed, isPlaying, setIsPlaying, onAddEvent, onAddAgent 
}) => {
  const [customEventText, setCustomEventText] = useState('');
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [newAgentData, setNewAgentData] = useState({ name: '', role: '', persona: '' });

  const handleSendEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (customEventText.trim()) {
      onAddEvent(customEventText);
      setCustomEventText('');
    }
  };

  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAgentData.name && newAgentData.role) {
      onAddAgent(newAgentData.name, newAgentData.role, newAgentData.persona);
      setNewAgentData({ name: '', role: '', persona: '' });
      setShowAddAgent(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-600 pb-3">
        <h3 className="font-bold text-slate-200">Управление</h3>
        <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1 rounded text-sm font-bold ${isPlaying ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}`}
        >
            {isPlaying ? 'PAUSE' : 'PLAY'}
        </button>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-slate-400 uppercase">Скорость времени: {speed}x</label>
        <input 
            type="range" 
            min="1" 
            max="10" 
            step="1"
            value={speed}
            onChange={(e) => setSpeed(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>

      <form onSubmit={handleSendEvent} className="space-y-2">
        <label className="text-xs text-slate-400 uppercase">Божественное вмешательство</label>
        <div className="flex gap-2">
            <input 
                type="text" 
                value={customEventText} 
                onChange={e => setCustomEventText(e.target.value)}
                placeholder="Например: Нашли клад..."
                className="flex-1 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm">
                SEND
            </button>
        </div>
      </form>

      <div className="pt-2 border-t border-slate-600">
        {!showAddAgent ? (
            <button 
                onClick={() => setShowAddAgent(true)}
                className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 py-2 rounded text-sm transition-colors"
            >
                + Добавить Агента
            </button>
        ) : (
            <form onSubmit={handleCreateAgent} className="space-y-2 bg-slate-900/50 p-2 rounded animate-in fade-in slide-in-from-top-2">
                <input 
                    placeholder="Имя" 
                    className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                    value={newAgentData.name}
                    onChange={e => setNewAgentData({...newAgentData, name: e.target.value})}
                    required
                />
                <input 
                    placeholder="Роль (напр. Врач)" 
                    className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                    value={newAgentData.role}
                    onChange={e => setNewAgentData({...newAgentData, role: e.target.value})}
                    required
                />
                <textarea 
                    placeholder="Личность" 
                    className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white resize-none"
                    rows={2}
                    value={newAgentData.persona}
                    onChange={e => setNewAgentData({...newAgentData, persona: e.target.value})}
                    required
                />
                <div className="flex gap-2">
                    <button type="submit" className="flex-1 bg-green-600 hover:bg-green-500 text-white py-1 rounded text-xs">Создать</button>
                    <button type="button" onClick={() => setShowAddAgent(false)} className="flex-1 bg-red-600/50 hover:bg-red-600 text-white py-1 rounded text-xs">Отмена</button>
                </div>
            </form>
        )}
      </div>
    </div>
  );
};

export default ControlPanel;
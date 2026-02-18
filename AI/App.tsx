import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Agent, LogEntry, Mood, Relationship } from './types';
import { INITIAL_AGENTS, MOOD_COLORS } from './constants';
import RelationshipGraph from './components/RelationshipGraph';
import EventLog from './components/EventLog';
import AgentInspector from './components/AgentInspector';
import ControlPanel from './components/ControlPanel';
import { generateAgentAction } from './services/ollamaService';

const App: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // 1 = 5s tick, 10 = 0.5s tick
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [globalContext, setGlobalContext] = useState("Мир спокоен.");
  
  // Refs for loop management to avoid stale closures in setInterval
  const agentsRef = useRef(agents);
  const logsRef = useRef(logs);
  const isPlayingRef = useRef(isPlaying);
  const processingAgentRef = useRef<string | null>(null); // Mutex for one agent acting at a time

  useEffect(() => { agentsRef.current = agents; }, [agents]);
  useEffect(() => { logsRef.current = logs; }, [logs]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  const addLog = useCallback((text: string, type: LogEntry['type'] = 'SYSTEM', agentId?: string) => {
    const newLog: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      content: text,
      type,
      agentId
    };
    setLogs(prev => [...prev.slice(-99), newLog]); // Keep last 100
  }, []);

  // -- Simulation Helpers --

  const updateRelationship = (sourceId: string, targetId: string, change: number) => {
    setAgents(prev => prev.map(a => {
      if (a.id !== sourceId) return a;
      
      const existingRelIndex = a.relationships.findIndex(r => r.targetAgentId === targetId);
      let newRels = [...a.relationships];

      if (existingRelIndex >= 0) {
        newRels[existingRelIndex] = {
          ...newRels[existingRelIndex],
          affinity: Math.max(-100, Math.min(100, newRels[existingRelIndex].affinity + change))
        };
      } else {
        newRels.push({ targetAgentId: targetId, affinity: change, history: [] });
      }
      return { ...a, relationships: newRels };
    }));
  };

  const executeTurn = async () => {
    if (processingAgentRef.current) return; // Busy

    // 1. Pick a random idle agent
    const idleAgents = agentsRef.current.filter(a => !a.isThinking);
    if (idleAgents.length === 0) return;

    const activeAgent = idleAgents[Math.floor(Math.random() * idleAgents.length)];
    processingAgentRef.current = activeAgent.id;

    // Mark as thinking UI
    setAgents(prev => prev.map(a => a.id === activeAgent.id ? { ...a, isThinking: true } : a));

    try {
        // Collect recent context strings
        const recentEvents = logsRef.current.slice(-5).map(l => `[${new Date(l.timestamp).toLocaleTimeString()}] ${l.content}`);
        
        const decision = await generateAgentAction(activeAgent, agentsRef.current, recentEvents, globalContext);

        // Apply Decision
        let logText = '';
        if (decision.actionType === 'TALK' && decision.targetAgentId) {
            const target = agentsRef.current.find(a => a.id === decision.targetAgentId);
            const targetName = target ? target.name : 'Unknown';
            logText = `${activeAgent.name} говорит ${targetName}: "${decision.content}"`;
            
            // Interaction effect
            if (decision.affinityChange && target) {
                updateRelationship(activeAgent.id, target.id, decision.affinityChange);
                // Simple reciprocal change for simplicity
                updateRelationship(target.id, activeAgent.id, Math.floor(decision.affinityChange / 2)); 
            }
        } else {
            logText = `${activeAgent.name} (${decision.actionType}): ${decision.content}`;
        }

        addLog(logText, decision.actionType === 'TALK' ? 'INTERACTION' : 'ACTION', activeAgent.id);

        // Update Agent State
        setAgents(prev => prev.map(a => {
            if (a.id !== activeAgent.id) return a;
            return {
                ...a,
                isThinking: false,
                currentAction: decision.actionType === 'TALK' ? `Говорит` : decision.content.substring(0, 30) + '...',
                mood: decision.newMood,
                memories: [...a.memories, logText].slice(-20) // Keep last 20 memories
            };
        }));

    } catch (e) {
        console.error("Turn error", e);
        setAgents(prev => prev.map(a => a.id === activeAgent.id ? { ...a, isThinking: false } : a));
    } finally {
        processingAgentRef.current = null;
    }
  };

  // -- Main Loop --
  useEffect(() => {
    const intervalMs = Math.max(500, 5000 / speed);
    const interval = setInterval(() => {
      if (isPlayingRef.current) {
        executeTurn();
      }
    }, intervalMs);
    return () => clearInterval(interval);
  }, [speed]);


  // -- User Actions --

  const handleAddEvent = (text: string) => {
    addLog(`БОГ: ${text}`, 'SYSTEM');
    setGlobalContext(text); // Update global context for agents
    // Affect random agent mood slightly
    setAgents(prev => prev.map(a => ({
        ...a, 
        moodIntensity: Math.min(100, a.moodIntensity + 10)
    })));
  };

  const handleAddAgent = (name: string, role: string, persona: string) => {
    const newAgent: Agent = {
        id: `agent-${Date.now()}`,
        name,
        role,
        personality: persona,
        avatar: `https://picsum.photos/seed/${name}/200/200`,
        mood: Mood.NEUTRAL,
        moodIntensity: 50,
        currentAction: 'Только что прибыл',
        isThinking: false,
        memories: ['Я прибыл в этот мир.'],
        relationships: []
    };
    setAgents(prev => [...prev, newAgent]);
    addLog(`В мир прибыл новый агент: ${name} (${role})`, 'SYSTEM');
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      
      {/* Sidebar - Agent List */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex">
        <div className="p-4 border-b border-slate-800">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            SIMULACRUM
          </h1>
          <p className="text-xs text-slate-500">Автономная Экосистема</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {agents.map(agent => (
                <div 
                    key={agent.id} 
                    onClick={() => setSelectedAgentId(agent.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-slate-800 ${agent.isThinking ? 'border-yellow-500/50' : 'border-slate-700'}`}
                >
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <img src={agent.avatar} className="w-10 h-10 rounded-full bg-slate-700 object-cover" alt={agent.name} />
                            <div 
                                className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900" 
                                style={{ backgroundColor: MOOD_COLORS[agent.mood] }} 
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline">
                                <h3 className="font-bold text-sm truncate">{agent.name}</h3>
                                {agent.isThinking && <span className="text-[10px] text-yellow-500 animate-pulse">Думает...</span>}
                            </div>
                            <p className="text-xs text-slate-400 truncate">{agent.currentAction}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Bar (Mobile Agent List Toggle could go here) */}
        <div className="h-14 border-b border-slate-800 flex items-center px-4 justify-between bg-slate-900/50 backdrop-blur">
            <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
                    Статус симуляции: {isPlaying ? 'АКТИВНА' : 'ПАУЗА'}
                </span>
            </div>
            <div className="text-xs text-slate-500 font-mono">
                TICKS: {logs.length}
            </div>
        </div>

        {/* Dashboard Grid */}
        <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
            
            {/* Center: Graph */}
            <div className="lg:col-span-2 flex flex-col min-h-[300px]">
                <RelationshipGraph agents={agents} onAgentClick={setSelectedAgentId} />
            </div>

            {/* Right: Controls & Log */}
            <div className="flex flex-col gap-4 overflow-hidden">
                <ControlPanel 
                    speed={speed} 
                    setSpeed={setSpeed} 
                    isPlaying={isPlaying} 
                    setIsPlaying={setIsPlaying}
                    onAddEvent={handleAddEvent}
                    onAddAgent={handleAddAgent}
                />
                <EventLog logs={logs} />
            </div>
        </div>
      </div>

      {/* Modals */}
      {selectedAgentId && (
        <AgentInspector 
            agent={agents.find(a => a.id === selectedAgentId)!} 
            agents={agents}
            onClose={() => setSelectedAgentId(null)} 
        />
      )}

    </div>
  );
};

export default App;
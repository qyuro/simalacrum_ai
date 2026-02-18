import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface EventLogProps {
  logs: LogEntry[];
}

const EventLog: React.FC<EventLogProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      <div className="p-3 bg-slate-700 border-b border-slate-600 font-bold text-slate-200">
        Лог Событий
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {logs.length === 0 && <div className="text-slate-500 text-center italic">Тишина...</div>}
        
        {logs.map((log) => (
          <div key={log.id} className={`flex flex-col text-sm border-l-2 pl-3 py-1 ${
            log.type === 'SYSTEM' ? 'border-yellow-500 bg-yellow-500/10' :
            log.type === 'INTERACTION' ? 'border-blue-500 bg-blue-500/10' :
            'border-green-500 bg-slate-700/30'
          }`}>
            <span className="text-xs text-slate-400 font-mono mb-1">{formatTime(log.timestamp)}</span>
            <p className="text-slate-200 break-words leading-relaxed">{log.content}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default EventLog;
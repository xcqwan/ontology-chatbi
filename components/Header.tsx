import React from 'react';
import { Network, Settings } from 'lucide-react';

interface HeaderProps {
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => (
  <header className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800 shrink-0">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
        <Network size={20} className="text-white" />
      </div>
      <h1 className="text-xl font-semibold tracking-tight">Ontology<span className="text-indigo-400"> Chat</span> BI</h1>
    </div>
    <div className="flex items-center gap-4 text-sm text-slate-400">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        Operational
      </div>
      
      <div className="flex items-center gap-4 pl-4 border-l border-slate-700">
        <button 
          onClick={onOpenSettings}
          className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-md hover:bg-slate-800"
          title="Settings"
        >
          <Settings size={18} />
        </button>
      </div>
    </div>
  </header>
);
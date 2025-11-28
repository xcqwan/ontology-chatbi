import React, { useState } from 'react';
import { Terminal, X, Code, Bot, ChevronUp, ChevronDown, Maximize2, FileText } from 'lucide-react';

export const CodeModal = ({ code, isOpen, onClose }: { code: string, isOpen: boolean, onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 rounded-xl shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col border border-slate-700">
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900 rounded-t-xl">
          <div className="flex items-center gap-2 text-slate-300">
            <Terminal size={18} />
            <span className="font-mono text-sm font-medium">Generated Logic</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-1.5 rounded-md transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6 font-mono text-sm text-slate-300 bg-black/20">
          <pre className="whitespace-pre-wrap break-words">
            {code}
          </pre>
        </div>
      </div>
    </div>
  );
};

export const DebugConsole = ({ 
  code, 
  result, 
  metrics,
  llmInput
}: { 
  code?: string, 
  result?: any, 
  metrics?: { codingTimeMs: number, explanationTimeMs: number },
  llmInput?: string
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'result' | 'input'>('code');
  const [isMaximized, setIsMaximized] = useState(false);

  if (!code && !result) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden text-xs w-full max-w-full">
      <CodeModal code={code || ''} isOpen={isMaximized} onClose={() => setIsMaximized(false)} />
      
      {/* Debug Header / Toggle */}
      <div 
        className="flex items-center justify-between px-3 py-2 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <Terminal size={12} />
            <span>Debug Console</span>
          </div>
          {metrics && (
            <div className="flex items-center gap-2 text-[10px] text-slate-500 border-l border-slate-300 pl-3">
              <span className="flex items-center gap-1" title="Coding Time">
                <Code size={10} /> {(metrics.codingTimeMs / 1000).toFixed(2)}s
              </span>
              <span className="flex items-center gap-1" title="Response Time">
                <Bot size={10} /> {(metrics.explanationTimeMs / 1000).toFixed(2)}s
              </span>
            </div>
          )}
        </div>
        {isExpanded ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-slate-200">
          <div className="flex border-b border-slate-200 bg-white overflow-x-auto">
            <button 
              className={`px-3 py-1.5 font-medium transition-colors whitespace-nowrap ${activeTab === 'code' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setActiveTab('code')}
            >
              JavaScript Code
            </button>
            <button 
              className={`px-3 py-1.5 font-medium transition-colors whitespace-nowrap ${activeTab === 'result' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setActiveTab('result')}
            >
              Execution Result
            </button>
            <button 
              className={`px-3 py-1.5 font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${activeTab === 'input' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setActiveTab('input')}
            >
              <FileText size={10} /> LLM Input Context
            </button>
            <div className="ml-auto px-2 flex items-center">
              {activeTab === 'code' && (
                <button onClick={(e) => { e.stopPropagation(); setIsMaximized(true); }} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-600" title="Maximize Code">
                  <Maximize2 size={12} />
                </button>
              )}
            </div>
          </div>
          
          <div className="max-h-60 overflow-auto p-3 bg-white font-mono text-slate-700 w-full">
            {activeTab === 'code' && (
              <pre className="whitespace-pre-wrap break-words">{code || '// No code generated'}</pre>
            )}
            {activeTab === 'result' && (
              <pre className="whitespace-pre-wrap break-words">{JSON.stringify(result, null, 2) || '// No result'}</pre>
            )}
            {activeTab === 'input' && (
              <pre className="whitespace-pre-wrap break-words text-[10px] text-slate-500">{llmInput || '// No context available'}</pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
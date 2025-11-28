
import React, { useState, useEffect } from 'react';
import { X, Save, MessageSquare, Bot, List, Plus, Trash2 } from 'lucide-react';

export interface AppSettings {
  model: string;
  welcomeMessage: string;
  recommendedQuestions: string[];
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [newQuestion, setNewQuestion] = useState('');

  // Sync state when opening
  useEffect(() => {
    if (isOpen) {
      setFormData(settings);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const addQuestion = () => {
    if (newQuestion.trim()) {
      setFormData(prev => ({
        ...prev,
        recommendedQuestions: [...prev.recommendedQuestions, newQuestion.trim()]
      }));
      setNewQuestion('');
    }
  };

  const removeQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      recommendedQuestions: prev.recommendedQuestions.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            Settings
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Model Selection */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Bot size={16} className="text-indigo-600" />
              AI Model
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className={`relative flex flex-col p-4 border rounded-xl cursor-pointer transition-all ${formData.model === 'gemini-2.5-flash' ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}`}>
                <input 
                  type="radio" 
                  name="model" 
                  value="gemini-2.5-flash"
                  checked={formData.model === 'gemini-2.5-flash'}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="hidden"
                />
                <span className="font-semibold text-slate-900">Gemini 2.5 Flash</span>
                <span className="text-xs text-slate-500 mt-1">Fast, efficient, and great for standard queries.</span>
              </label>

              <label className={`relative flex flex-col p-4 border rounded-xl cursor-pointer transition-all ${formData.model === 'gemini-3-pro-preview' ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}`}>
                <input 
                  type="radio" 
                  name="model" 
                  value="gemini-3-pro-preview"
                  checked={formData.model === 'gemini-3-pro-preview'}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="hidden"
                />
                <span className="font-semibold text-slate-900">Gemini 3 Pro</span>
                <span className="text-xs text-slate-500 mt-1">Advanced reasoning for complex data analysis tasks.</span>
              </label>
            </div>
          </section>

          {/* Welcome Message */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <MessageSquare size={16} className="text-indigo-600" />
              Welcome Message
            </h3>
            <textarea
              value={formData.welcomeMessage}
              onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none h-24 resize-none"
              placeholder="Enter the initial message displayed to users..."
            />
            <p className="text-xs text-slate-500">Supports Markdown (e.g., **bold**, - list).</p>
          </section>

          {/* Recommended Questions */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <List size={16} className="text-indigo-600" />
              Recommended Questions
            </h3>
            
            <div className="space-y-2">
              {formData.recommendedQuestions.map((q, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700">
                    {q}
                  </div>
                  <button 
                    onClick={() => removeQuestion(idx)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-2">
              <input 
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addQuestion()}
                placeholder="Type a suggested question..."
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <button 
                onClick={addQuestion}
                disabled={!newQuestion.trim()}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors flex items-center gap-1"
              >
                <Plus size={16} /> Add
              </button>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
          >
            <Save size={18} />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

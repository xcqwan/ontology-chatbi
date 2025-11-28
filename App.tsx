import React, { useState, useEffect } from 'react';
import { Network, Database, Sparkles } from 'lucide-react';
import { OntologySchema, ObjectMapping, DataSource, ChatMessage, ObjectType } from './types';
import { INITIAL_ONTOLOGY, MOCK_DATA_SOURCES, INITIAL_MAPPINGS } from './constants';
import { Header } from './components/Header';
import { OntologyView } from './components/OntologyView';
import { DataMappingView } from './components/DataMappingView';
import { ChatInterface } from './components/ChatInterface';
import { SettingsModal, AppSettings } from './components/SettingsModal';
import { ICON_MAP } from './utils';

const DEFAULT_SETTINGS: AppSettings = {
  model: 'gemini-2.5-flash',
  welcomeMessage: "Hello! I'm your Ontology-aware BI assistant. I can analyze your data using the structure you've defined. Ask me about **Customers**, **Orders**, or **Products**.",
  recommendedQuestions: [
    "Show top 5 customers by Lifetime Value",
    "What is the total sales amount by store city?",
    "List products with stock level below 20"
  ]
};

export const App = () => {
  const [activeTab, setActiveTab] = useState<'ontology' | 'data' | 'chat'>('ontology');
  const [schema, setSchema] = useState<OntologySchema>(INITIAL_ONTOLOGY);
  // Initialize with pre-configured mock sources and mappings
  const [mappings, setMappings] = useState<ObjectMapping[]>(INITIAL_MAPPINGS);
  const [availableSources, setAvailableSources] = useState<DataSource[]>(MOCK_DATA_SOURCES);
  
  // Settings State
  const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Chat State lifted here for persistence
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: DEFAULT_SETTINGS.welcomeMessage,
      timestamp: new Date(),
      type: 'text'
    }
  ]);

  const handleAddSource = (source: DataSource) => {
    setAvailableSources(prev => [...prev, source]);
  };

  const handleUpdateMapping = (mapping: ObjectMapping) => {
    setMappings(prev => {
      const existing = prev.findIndex(m => m.objectTypeId === mapping.objectTypeId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = mapping;
        return updated;
      }
      return [...prev, mapping];
    });
  };

  const handleSaveObjectType = (newObj: ObjectType) => {
    setSchema(prev => {
      const existingIdx = prev.objectTypes.findIndex(o => o.id === newObj.id);
      let newObjectTypes;
      
      if (existingIdx >= 0) {
        // Update existing
        newObjectTypes = [...prev.objectTypes];
        newObjectTypes[existingIdx] = newObj;
      } else {
        // Add new
        newObjectTypes = [...prev.objectTypes, newObj];
      }
      
      return {
        ...prev,
        objectTypes: newObjectTypes
      };
    });
  };

  const handleDeleteObjectType = (id: string) => {
    setSchema(prev => ({
      ...prev,
      objectTypes: prev.objectTypes.filter(obj => obj.id !== id),
      relations: prev.relations.filter(rel => rel.sourceTypeId !== id && rel.targetTypeId !== id)
    }));

    setMappings(prev => prev.filter(m => m.objectTypeId !== id));
  };

  const handleImportData = (data: any) => {
    if (!data || !data.schema || !data.mappings || !data.dataSources) {
      alert('Invalid configuration file format.');
      return;
    }

    // Hydrate icons from iconKey to React Components
    const hydratedSchema = {
      ...data.schema,
      objectTypes: data.schema.objectTypes.map((obj: any) => ({
        ...obj,
        icon: ICON_MAP[obj.iconKey] || ICON_MAP['Box'] // Restore the icon component or default
      }))
    };

    // Confirmation is handled in the UI Popover before reaching here
    setSchema(hydratedSchema);
    setMappings(data.mappings);
    setAvailableSources(data.dataSources);
    
    setChatMessages([{
      id: Date.now().toString(),
      role: 'assistant',
      content: "Configuration loaded successfully. How can I help you with the new data?",
      timestamp: new Date(),
      type: 'text'
    }]);
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setAppSettings(newSettings);
    // If chat only has the initial welcome message, update it to the new one
    if (chatMessages.length === 1 && chatMessages[0].role === 'assistant') {
      setChatMessages([{
        ...chatMessages[0],
        content: newSettings.welcomeMessage
      }]);
    }
  };

  // Navigation
  const tabs = [
    { id: 'ontology', label: 'Ontology Schema', icon: Network },
    { id: 'data', label: 'Data Source & Mapping', icon: Database },
    { id: 'chat', label: 'ChatBI', icon: Sparkles },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans">
      <Header 
        onOpenSettings={() => setIsSettingsOpen(true)} 
      />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <nav className="w-20 bg-white border-r border-slate-200 flex flex-col items-center py-6 gap-6 shrink-0 z-10">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative group flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
                  isActive ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                }`}
                title={tab.label}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && <div className="absolute left-0 w-1 h-6 bg-indigo-600 rounded-r-full -ml-4" />}
              </button>
            );
          })}
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden relative">
          {activeTab === 'ontology' && (
            <OntologyView 
              schema={schema} 
              onSaveObjectType={handleSaveObjectType}
              onDeleteObjectType={handleDeleteObjectType}
              exportData={{ schema, mappings, dataSources: availableSources }}
              onImportData={handleImportData}
            />
          )}
          
          {activeTab === 'data' && (
            <DataMappingView 
              schema={schema} 
              availableSources={availableSources} 
              mappings={mappings}
              onAddSource={handleAddSource}
              onUpdateMapping={handleUpdateMapping}
            />
          )}
          
          {activeTab === 'chat' && (
            <ChatInterface 
              schema={schema}
              mappings={mappings}
              dataSources={availableSources}
              messages={chatMessages}
              onSendMessage={setChatMessages}
              selectedModel={appSettings.model}
              recommendedQuestions={appSettings.recommendedQuestions}
            />
          )}
        </main>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={appSettings}
        onSave={handleSaveSettings}
      />
    </div>
  );
};
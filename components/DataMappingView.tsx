import React, { useState, useRef, useEffect } from 'react';
import { 
  CheckCircle2, 
  Upload, 
  Tag, 
  ArrowRight, 
  Link as LinkIcon, 
  Table as TableIcon, 
  Database,
  X,
  FileSpreadsheet,
  ChevronRight,
  Network,
  Server,
  Loader2,
  Plug
} from 'lucide-react';
import { OntologySchema, DataSource, ObjectMapping } from '../types';
import { MOCK_DATA_SOURCES } from '../constants';

interface DataMappingViewProps {
  schema: OntologySchema;
  availableSources: DataSource[];
  mappings: ObjectMapping[];
  onAddSource: (source: DataSource) => void;
  onUpdateMapping: (mapping: ObjectMapping) => void;
}

export const DataMappingView: React.FC<DataMappingViewProps> = ({ 
  schema, 
  availableSources, 
  mappings, 
  onAddSource,
  onUpdateMapping 
}) => {
  // Safely initialize selectedTypeId
  const [selectedTypeId, setSelectedTypeId] = useState<string>(schema.objectTypes[0]?.id || '');
  const [isAddingSource, setIsAddingSource] = useState(false);
  const [addSourceTab, setAddSourceTab] = useState<'file' | 'database'>('file');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Database Form State
  const [dbConfig, setDbConfig] = useState({
    type: 'postgres',
    host: 'localhost',
    port: '5432',
    database: 'production_db',
    username: '',
    password: ''
  });
  const [dbStatus, setDbStatus] = useState<'idle' | 'connecting' | 'success' | 'error'>('idle');

  // Update selectedTypeId if the selected object is deleted or if schema changes
  useEffect(() => {
    if (schema.objectTypes.length === 0) {
      setSelectedTypeId('');
    } else if (!schema.objectTypes.find(t => t.id === selectedTypeId)) {
      setSelectedTypeId(schema.objectTypes[0].id);
    }
  }, [schema.objectTypes, selectedTypeId]);

  // Handle case where no object types exist
  if (schema.objectTypes.length === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-slate-50 text-slate-500">
        <div className="w-20 h-20 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-6">
          <Network size={40} className="text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-700">No Object Types Defined</h3>
        <p className="text-slate-500 mt-2 max-w-md text-center">
          You need to define your Ontology (Object Types) before you can map data to them. 
          Please go to the <strong>Ontology Schema</strong> tab to get started.
        </p>
      </div>
    );
  }

  // Fallback to first object if selected is invalid (though useEffect handles this, this is render safety)
  const selectedType = schema.objectTypes.find(t => t.id === selectedTypeId) || schema.objectTypes[0];
  
  // Safety check if something went wrong finding the type
  if (!selectedType) return null;

  const currentMapping = mappings.find(m => m.objectTypeId === selectedType.id) || {
    objectTypeId: selectedType.id,
    dataSourceId: null,
    propertyMappings: {},
    relationMappings: {},
    isComplete: false
  };

  const currentSource = availableSources.find(s => s.id === currentMapping.dataSourceId);

  // Helper to handle simulation of adding a source
  const handleSimulateAddSource = (sourceTemplate: DataSource) => {
    // Check if already added
    if (availableSources.find(s => s.id === sourceTemplate.id)) {
      alert("Source already added!");
      return;
    }
    onAddSource(sourceTemplate);
    setIsAddingSource(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length < 2) {
        alert("Invalid CSV file: insufficient data.");
        return;
      }

      // Parse Headers
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

      // Parse Data
      const data = lines.slice(1).map(line => {
        const rowData: Record<string, any> = {};
        const splitValues = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

        headers.forEach((header, index) => {
          let val = splitValues[index]?.trim();
          if (val) {
            val = val.replace(/^"|"$/g, ''); // Remove outer quotes
            // Try numeric conversion
            if (!isNaN(Number(val)) && val !== '') {
              rowData[header] = Number(val);
            } else {
              rowData[header] = val;
            }
          } else {
            rowData[header] = null;
          }
        });
        return rowData;
      });

      const newSource: DataSource = {
        id: `src_upload_${Date.now()}`,
        name: file.name,
        type: 'csv',
        rowCount: data.length,
        columns: headers,
        data: data,
        description: 'Uploaded CSV file'
      };

      onAddSource(newSource);
      setIsAddingSource(false);
    };
    reader.readAsText(file);
  };

  const handleConnectDatabase = (e: React.FormEvent) => {
    e.preventDefault();
    setDbStatus('connecting');
    
    // Simulate connection delay
    setTimeout(() => {
        setDbStatus('success');
        
        // Mock DB Data based on context
        // We'll just create a generic 'Transactions' table for demo purposes
        const mockDbData = Array.from({ length: 50 }, (_, i) => ({
             id: i + 1,
             transaction_uuid: `TX-${2024000 + i}`,
             amount: Math.floor(Math.random() * 5000) + 100,
             status: ['PENDING', 'COMPLETED', 'FAILED'][Math.floor(Math.random() * 3)],
             created_at: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
             user_id: `U-${100 + (i % 10)}`
        }));
        
        const newSource: DataSource = {
            id: `src_db_${Date.now()}`,
            name: `${dbConfig.database}.${dbConfig.type === 'postgres' ? 'public.' : ''}transactions`,
            type: 'database',
            rowCount: 50,
            columns: ['id', 'transaction_uuid', 'amount', 'status', 'created_at', 'user_id'],
            data: mockDbData,
            description: `${dbConfig.type} @ ${dbConfig.host}:${dbConfig.port}`
        };

        // Auto close after success
        setTimeout(() => {
            onAddSource(newSource);
            setIsAddingSource(false);
            setDbStatus('idle');
        }, 800);
    }, 1500);
  };

  const handlePropertyMap = (propId: string, column: string) => {
    const updatedMapping = {
      ...currentMapping,
      propertyMappings: { ...currentMapping.propertyMappings, [propId]: column }
    };
    onUpdateMapping(updatedMapping);
  };

  const handleRelationMap = (relId: string, column: string) => {
    const updatedMapping = {
      ...currentMapping,
      relationMappings: { ...currentMapping.relationMappings, [relId]: column }
    };
    onUpdateMapping(updatedMapping);
  };

  const handleSourceSelect = (sourceId: string) => {
    onUpdateMapping({
      ...currentMapping,
      dataSourceId: sourceId,
      propertyMappings: {}, // Reset mappings on source change
      relationMappings: {}
    });
  };

  const relationsToMap = schema.relations.filter(rel => rel.targetTypeId === selectedType.id && rel.cardinality === 'one-to-many');

  return (
    <div className="flex h-full bg-white">
      {/* Sidebar: Object Types */}
      <div className="w-64 border-r border-slate-200 bg-slate-50 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-700">Object Types</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {schema.objectTypes.map(type => {
            const mapping = mappings.find(m => m.objectTypeId === type.id);
            const isComplete = mapping?.isComplete;
            const Icon = type.icon;
            
            return (
              <button
                key={type.id}
                onClick={() => setSelectedTypeId(type.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  selectedTypeId === type.id 
                    ? 'bg-white shadow-sm border border-slate-200 text-indigo-600 font-medium' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className={`w-6 h-6 rounded flex items-center justify-center ${type.color} ${type.textColor}`}>
                  <Icon size={14} />
                </div>
                <span className="flex-1 text-left">{type.displayName}</span>
                {isComplete && <CheckCircle2 size={16} className="text-emerald-500" />}
              </button>
            );
          })}
        </div>
        
        <div className="p-4 border-t border-slate-200 bg-white">
          <button 
            onClick={() => setIsAddingSource(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Upload size={16} /> Connect Data
          </button>
        </div>
      </div>

      {/* Main Mapping Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedType && (
          <div className="flex-1 flex flex-col h-full">
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-200">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl ${selectedType.color} ${selectedType.textColor} flex items-center justify-center`}>
                  <selectedType.icon size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Map {selectedType.displayName}</h2>
                  <p className="text-slate-500 text-sm">Connect a data source and map columns to properties.</p>
                </div>
              </div>

              {/* Source Selection */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-slate-700">Data Source:</label>
                <select 
                  className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm min-w-[250px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={currentMapping.dataSourceId || ''}
                  onChange={(e) => handleSourceSelect(e.target.value)}
                >
                  <option value="">-- Select a Source --</option>
                  {availableSources.map(src => (
                    <option key={src.id} value={src.id}>{src.name} ({src.rowCount} rows)</option>
                  ))}
                </select>
                {currentSource && (
                   <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs border border-slate-200 font-mono">
                     {currentSource.type.toUpperCase()} • {currentSource.columns.length} Cols
                   </span>
                )}
              </div>
            </div>

            {/* Mapping Workspace */}
            {currentMapping.dataSourceId && currentSource ? (
              <div className="flex-1 overflow-y-auto p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Property Mapping Section */}
                  <div className="space-y-6">
                    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                          <Tag size={16} /> Property Mapping
                        </h3>
                        <span className="text-xs text-slate-500">
                           {Object.keys(currentMapping.propertyMappings).length} / {selectedType.properties.length} mapped
                        </span>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {selectedType.properties.map(prop => (
                          <div key={prop.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-700">{prop.displayName}</span>
                                {prop.isPrimaryKey && <span className="text-[10px] text-amber-500 border border-amber-200 bg-amber-50 px-1 rounded font-bold">PK</span>}
                              </div>
                              <span className="text-xs text-slate-400 font-mono">{prop.type}</span>
                            </div>
                            
                            <ArrowRight size={16} className="text-slate-300 mx-4" />
                            
                            <select
                              className={`text-sm border rounded px-2 py-1.5 w-48 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                                currentMapping.propertyMappings[prop.id] ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-slate-300 text-slate-600'
                              }`}
                              value={currentMapping.propertyMappings[prop.id] || ''}
                              onChange={(e) => handlePropertyMap(prop.id, e.target.value)}
                            >
                              <option value="">Select Column...</option>
                              {currentSource.columns.map(col => (
                                <option key={col} value={col}>{col}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Relation Mapping Section (Foreign Keys) */}
                    {relationsToMap.length > 0 && (
                       <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                            <LinkIcon size={16} /> Relationship Linking
                          </h3>
                        </div>
                        <div className="divide-y divide-slate-100">
                          {relationsToMap.map(rel => {
                             const sourceType = schema.objectTypes.find(t => t.id === rel.sourceTypeId);
                             if (!sourceType) return null;
                             return (
                               <div key={rel.id} className="p-4">
                                 <div className="mb-2 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-slate-700">
                                      Link to <span className="font-bold">{sourceType.displayName}</span> via
                                    </div>
                                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">Foreign Key</span>
                                 </div>
                                 <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500 italic">Select column containing {sourceType.displayName} ID:</span>
                                    <select
                                      className={`text-sm border rounded px-2 py-1.5 w-48 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                                        currentMapping.relationMappings[rel.id] ? 'border-purple-300 bg-purple-50 text-purple-700' : 'border-slate-300 text-slate-600'
                                      }`}
                                      value={currentMapping.relationMappings[rel.id] || ''}
                                      onChange={(e) => handleRelationMap(rel.id, e.target.value)}
                                    >
                                      <option value="">Select Column...</option>
                                      {currentSource.columns.map(col => (
                                        <option key={col} value={col}>{col}</option>
                                      ))}
                                    </select>
                                 </div>
                               </div>
                             );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Data Preview Section */}
                  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col shadow-sm h-[500px]">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                      <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                         <TableIcon size={16} /> Data Preview
                      </h3>
                    </div>
                    <div className="flex-1 overflow-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium sticky top-0">
                          <tr>
                            {currentSource.columns.slice(0, 5).map(col => (
                              <th key={col} className="px-4 py-2 border-b border-slate-200 whitespace-nowrap">{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {currentSource.data.slice(0, 20).map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                               {currentSource.columns.slice(0, 5).map(col => (
                                 <td key={col} className="px-4 py-2 whitespace-nowrap text-slate-600">
                                   {typeof row[col] === 'object' && row[col] !== null ? JSON.stringify(row[col]) : row[col]}
                                 </td>
                               ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 bg-slate-50/50">
                 <div className="w-16 h-16 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center mb-4">
                   <Database size={32} className="text-slate-300" />
                 </div>
                 <p className="font-medium text-lg text-slate-600">No Data Source Connected</p>
                 <p className="text-sm mt-1 max-w-md text-center">Select a data source from the dropdown above or connect a new file to start mapping your {selectedType.displayName} objects.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Source Modal */}
      {isAddingSource && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900">Connect Data Source</h3>
              <button onClick={() => setIsAddingSource(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            
            <div className="flex border-b border-slate-200">
              <button 
                onClick={() => setAddSourceTab('file')}
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${addSourceTab === 'file' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
              >
                File Upload
              </button>
              <button 
                onClick={() => setAddSourceTab('database')}
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${addSourceTab === 'database' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
              >
                Database Connection
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              
              {/* FILE TAB */}
              {addSourceTab === 'file' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-700">Sample Datasets (Simulated)</h4>
                    {MOCK_DATA_SOURCES.map(src => (
                      <div 
                        key={src.id} 
                        onClick={() => handleSimulateAddSource(src)}
                        className="flex items-center p-3 border border-slate-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 cursor-pointer transition-all group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                          <FileSpreadsheet size={16} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 text-sm">{src.name}</h4>
                          <p className="text-xs text-slate-500 line-clamp-1">{src.description}</p>
                        </div>
                        <span className="text-xs font-mono text-slate-400 mr-2">{src.rowCount} rows</span>
                        <ChevronRight className="text-slate-300 group-hover:text-indigo-500" size={16} />
                      </div>
                    ))}
                  </div>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-2 text-xs text-slate-400 font-medium uppercase tracking-wider">Local File</span>
                    </div>
                  </div>

                  <div>
                    <input 
                        type="file" 
                        accept=".csv" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        className="hidden" 
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed border-slate-300 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-colors group text-slate-500 hover:text-indigo-600"
                    >
                      <div className="p-3 bg-slate-100 rounded-full group-hover:bg-white transition-colors">
                         <Upload size={24} />
                      </div>
                      <span className="font-semibold text-sm">Upload CSV File</span>
                      <span className="text-xs text-slate-400 group-hover:text-indigo-400">Drag & drop or click to browse</span>
                    </button>
                  </div>
                </div>
              )}

              {/* DATABASE TAB */}
              {addSourceTab === 'database' && (
                <form onSubmit={handleConnectDatabase} className="space-y-5">
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-xs font-semibold text-slate-500 mb-1">Database Type</label>
                       <select 
                         className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50"
                         value={dbConfig.type}
                         onChange={e => setDbConfig({...dbConfig, type: e.target.value})}
                       >
                         <option value="postgres">PostgreSQL</option>
                         <option value="mysql">MySQL</option>
                         <option value="sqlserver">SQL Server</option>
                       </select>
                     </div>
                     <div>
                       <label className="block text-xs font-semibold text-slate-500 mb-1">Port</label>
                       <input 
                         type="text" 
                         className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                         value={dbConfig.port}
                         onChange={e => setDbConfig({...dbConfig, port: e.target.value})}
                       />
                     </div>
                   </div>

                   <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Host / Endpoint</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        placeholder="e.g. db.production.internal"
                        value={dbConfig.host}
                        onChange={e => setDbConfig({...dbConfig, host: e.target.value})}
                      />
                   </div>

                   <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Database Name</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        placeholder="production_db"
                        value={dbConfig.database}
                        onChange={e => setDbConfig({...dbConfig, database: e.target.value})}
                      />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Username</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          value={dbConfig.username}
                          onChange={e => setDbConfig({...dbConfig, username: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Password</label>
                        <input 
                          type="password" 
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          value={dbConfig.password}
                          onChange={e => setDbConfig({...dbConfig, password: e.target.value})}
                        />
                      </div>
                   </div>

                   <div className="pt-2 flex items-center justify-end gap-3">
                     <button type="button" className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg" onClick={() => setIsAddingSource(false)}>Cancel</button>
                     <button 
                       type="submit" 
                       disabled={dbStatus === 'connecting'}
                       className="px-6 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-70 flex items-center gap-2"
                     >
                       {dbStatus === 'connecting' ? <Loader2 size={16} className="animate-spin" /> : <Plug size={16} />}
                       {dbStatus === 'connecting' ? 'Connecting...' : 'Connect Database'}
                     </button>
                   </div>
                   
                   {dbStatus === 'success' && (
                     <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                       <CheckCircle2 size={16} /> Connection established successfully!
                     </div>
                   )}
                </form>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
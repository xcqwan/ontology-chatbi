import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Check } from 'lucide-react';
import { ObjectType, PropertyDefinition, PropertyType } from '../types';
import { ICON_MAP } from '../utils';

interface OntologyEditorProps {
  isOpen: boolean;
  initialData: ObjectType | null;
  onSave: (data: ObjectType) => void;
  onClose: () => void;
}

const COLORS = [
  { bg: 'bg-slate-100', text: 'text-slate-700' },
  { bg: 'bg-blue-100', text: 'text-blue-700' },
  { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  { bg: 'bg-purple-100', text: 'text-purple-700' },
  { bg: 'bg-orange-100', text: 'text-orange-700' },
  { bg: 'bg-rose-100', text: 'text-rose-700' },
  { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  { bg: 'bg-amber-100', text: 'text-amber-700' },
];

export const OntologyEditor: React.FC<OntologyEditorProps> = ({ isOpen, initialData, onSave, onClose }) => {
  const [formData, setFormData] = useState<Partial<ObjectType>>({
    name: '',
    displayName: '',
    description: '',
    color: 'bg-slate-100',
    textColor: 'text-slate-700',
    properties: []
  });
  const [selectedIconKey, setSelectedIconKey] = useState<string>('Box');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
        // Find icon key
        if (initialData.iconKey) {
            setSelectedIconKey(initialData.iconKey);
        } else {
             // Fallback lookup if iconKey is missing
            const iconEntry = Object.entries(ICON_MAP).find(([_, component]) => component === initialData.icon);
            if (iconEntry) setSelectedIconKey(iconEntry[0]);
        }
      } else {
        // Reset for new entry
        setFormData({
          id: '',
          name: '',
          displayName: '',
          description: '',
          color: 'bg-blue-100',
          textColor: 'text-blue-700',
          properties: [
            { id: 'new_id', name: 'id', displayName: 'ID', type: 'id', isPrimaryKey: true }
          ]
        });
        setSelectedIconKey('Box');
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!formData.displayName || !formData.name) return;

    // Generate ID if missing
    const id = formData.id || formData.name.toLowerCase().replace(/\s+/g, '_');
    
    const finalData: ObjectType = {
      ...formData as ObjectType,
      id,
      icon: ICON_MAP[selectedIconKey] || ICON_MAP['Box'],
      iconKey: selectedIconKey // Persist the key for serialization
    };
    onSave(finalData);
  };

  const addProperty = () => {
    const newProp: PropertyDefinition = {
      id: `prop_${Date.now()}`,
      name: 'new_property',
      displayName: 'New Property',
      type: 'string',
      isPrimaryKey: false
    };
    setFormData(prev => ({
      ...prev,
      properties: [...(prev.properties || []), newProp]
    }));
  };

  const updateProperty = (index: number, updates: Partial<PropertyDefinition>) => {
    const updatedProps = [...(formData.properties || [])];
    updatedProps[index] = { ...updatedProps[index], ...updates };
    setFormData(prev => ({ ...prev, properties: updatedProps }));
  };

  const removeProperty = (index: number) => {
    const updatedProps = [...(formData.properties || [])];
    updatedProps.splice(index, 1);
    setFormData(prev => ({ ...prev, properties: updatedProps }));
  };

  const SelectedIcon = ICON_MAP[selectedIconKey];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">
            {initialData ? 'Edit Object Type' : 'Create New Object Type'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Basic Info */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Display Name</label>
                <input 
                  type="text" 
                  value={formData.displayName}
                  onChange={e => setFormData({...formData, displayName: e.target.value, name: e.target.value.toLowerCase().replace(/\s+/g, '_')})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="e.g. Support Ticket"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Internal Name (ID)</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 font-mono text-slate-500"
                  placeholder="support_ticket"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none h-24 resize-none"
                  placeholder="Describe what this object represents..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Color Theme</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => setFormData({...formData, color: c.bg, textColor: c.text})}
                      className={`w-8 h-8 rounded-full border-2 ${c.bg} ${c.text} flex items-center justify-center transition-transform hover:scale-110 ${formData.color === c.bg ? 'border-slate-900 ring-2 ring-offset-2 ring-slate-300' : 'border-transparent'}`}
                    >
                      {formData.color === c.bg && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Icon</label>
                <div className="grid grid-cols-6 gap-2 p-2 border border-slate-200 rounded-lg bg-slate-50 max-h-40 overflow-y-auto">
                  {Object.entries(ICON_MAP).map(([key, Icon]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedIconKey(key)}
                      className={`p-2 rounded hover:bg-white hover:shadow-sm transition-all flex items-center justify-center ${selectedIconKey === key ? 'bg-white shadow ring-1 ring-indigo-500 text-indigo-600' : 'text-slate-500'}`}
                      title={key}
                    >
                      <Icon size={18} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Properties */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">Properties</h3>
                <button 
                  onClick={addProperty}
                  className="text-xs flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 font-medium transition-colors"
                >
                  <Plus size={14} /> Add Property
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                      <th className="px-4 py-2 w-1/4">Display Name</th>
                      <th className="px-4 py-2 w-1/4">System Name</th>
                      <th className="px-4 py-2 w-1/4">Type</th>
                      <th className="px-4 py-2 w-16 text-center">PK</th>
                      <th className="px-4 py-2 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {formData.properties?.map((prop, idx) => (
                      <tr key={idx} className="group hover:bg-slate-50">
                        <td className="px-4 py-2">
                          <input 
                            type="text" 
                            value={prop.displayName}
                            onChange={e => updateProperty(idx, { displayName: e.target.value })}
                            className="w-full bg-transparent border-b border-transparent focus:border-indigo-300 focus:outline-none"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input 
                            type="text" 
                            value={prop.name}
                            onChange={e => updateProperty(idx, { name: e.target.value })}
                            className="w-full bg-transparent border-b border-transparent focus:border-indigo-300 focus:outline-none font-mono text-xs text-slate-500"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <select 
                            value={prop.type}
                            onChange={e => updateProperty(idx, { type: e.target.value as PropertyType })}
                            className="w-full bg-transparent text-xs py-1 focus:outline-none"
                          >
                            <option value="string">String</option>
                            <option value="number">Number</option>
                            <option value="currency">Currency</option>
                            <option value="date">Date</option>
                            <option value="status">Status</option>
                            <option value="id">ID</option>
                          </select>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <input 
                            type="radio" 
                            name="primary_key"
                            checked={prop.isPrimaryKey}
                            onChange={() => {
                              // Reset others
                              const newProps = formData.properties?.map((p, i) => ({ ...p, isPrimaryKey: i === idx }));
                              setFormData(prev => ({ ...prev, properties: newProps }));
                            }}
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button 
                            onClick={() => removeProperty(idx)}
                            className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {formData.properties?.length === 0 && (
                       <tr>
                         <td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">No properties defined.</td>
                       </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={!formData.name}
            className="px-6 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={18} />
            Save Object Type
          </button>
        </div>
      </div>
    </div>
  );
};
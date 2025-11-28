
import React, { useRef, useState, useEffect } from 'react';
import { Download, Upload, AlertTriangle } from 'lucide-react';
import { OntologySchema, ObjectMapping, DataSource } from '../types';

interface ImportExportControlsProps {
  exportData: {
    schema: OntologySchema;
    mappings: ObjectMapping[];
    dataSources: DataSource[];
  };
  onImport: (data: any) => void;
}

export const ImportExportControls: React.FC<ImportExportControlsProps> = ({ exportData, onImport }) => {
  const [isImportPopoverOpen, setIsImportPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsImportPopoverOpen(false);
      }
    };

    if (isImportPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isImportPopoverOpen]);

  const handleExport = () => {
    const data = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      ...exportData
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ontology_config_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        onImport(json);
      } catch (err) {
        alert('Failed to parse JSON file');
        console.error(err);
      }
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />
      
      <div className="relative">
        <button
          onClick={() => setIsImportPopoverOpen(!isImportPopoverOpen)}
          className={`flex items-center gap-2 px-3 py-2 bg-white border text-slate-600 rounded-lg transition-colors text-sm font-medium shadow-sm ${isImportPopoverOpen ? 'bg-slate-50 border-slate-300' : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}
          title="Import Configuration"
        >
          <Upload size={16} />
          Import
        </button>

        {isImportPopoverOpen && (
          <div
            ref={popoverRef}
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 z-50 p-4 animate-in fade-in zoom-in-95 duration-200 cursor-default"
          >
             <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-amber-50 rounded-lg shrink-0">
                    <AlertTriangle size={20} className="text-amber-600" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-slate-900">Overwrite Configuration?</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Importing a file will <strong>replace</strong> your current Ontology Schema, Mappings, and Data Sources. This action cannot be undone.
                    </p>
                </div>
             </div>
             <div className="flex justify-end gap-2">
                <button
                    onClick={() => setIsImportPopoverOpen(false)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={() => {
                        fileInputRef.current?.click();
                        setIsImportPopoverOpen(false);
                    }}
                    className="px-3 py-1.5 text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 rounded-md transition-colors shadow-sm"
                >
                    Continue Import
                </button>
             </div>
          </div>
        )}
      </div>

      <button
        onClick={handleExport}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors text-sm font-medium shadow-sm"
        title="Export Configuration"
      >
        <Download size={16} />
        Export
      </button>
    </div>
  );
};

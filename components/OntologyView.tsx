
import React, { useState, useRef, useEffect } from 'react';
import { Settings, Tag, Link as LinkIcon, ArrowRightLeft, Plus, Trash2 } from 'lucide-react';
import { OntologySchema, ObjectType, RelationDefinition, ObjectMapping, DataSource } from '../types';
import { TypeBadge } from './TypeBadge';
import { OntologyEditor } from './OntologyEditor';
import { ImportExportControls } from './ImportExportControls';

interface ObjectTypeCardProps {
  objectType: ObjectType;
  relations: RelationDefinition[];
  allTypes: ObjectType[];
  onEdit: (obj: ObjectType) => void;
  onDelete: (id: string) => void;
}

const ObjectTypeCard: React.FC<ObjectTypeCardProps> = ({ 
  objectType, 
  relations,
  allTypes,
  onEdit,
  onDelete
}) => {
  const Icon = objectType.icon;
  const [isDeletePopoverOpen, setIsDeletePopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const relevantRelations = relations.filter(
    r => r.sourceTypeId === objectType.id || r.targetTypeId === objectType.id
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsDeletePopoverOpen(false);
      }
    };

    if (isDeletePopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDeletePopoverOpen]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col h-full group z-0">
      <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${objectType.color} ${objectType.textColor} flex items-center justify-center shadow-sm`}>
            <Icon size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg">{objectType.displayName}</h3>
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">{objectType.name}</p>
          </div>
        </div>
        
        {/* Actions Toolbar */}
        <div className={`flex items-center gap-1 transition-opacity ${isDeletePopoverOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <button 
            onClick={() => onEdit(objectType)}
            className="text-slate-400 hover:text-indigo-600 p-1.5 hover:bg-indigo-50 rounded transition-all"
            title="Edit Object Type"
          >
            <Settings size={16} />
          </button>
          
          {/* Delete Button with Popover */}
          <div className="relative">
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsDeletePopoverOpen(!isDeletePopoverOpen);
              }}
              className={`text-slate-400 p-1.5 rounded transition-all ${isDeletePopoverOpen ? 'text-red-600 bg-red-50' : 'hover:text-red-600 hover:bg-red-50'}`}
              title="Delete Object Type"
            >
              <Trash2 size={16} />
            </button>

            {isDeletePopoverOpen && (
              <div 
                ref={popoverRef}
                className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 z-50 p-4 animate-in fade-in zoom-in-95 duration-200 cursor-default"
                onClick={(e) => e.stopPropagation()}
              >
                <h4 className="text-sm font-bold text-slate-900 mb-2">Delete Object Type?</h4>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  This will permanently delete "<span className="font-medium text-slate-700">{objectType.displayName}</span>" and remove all associated data mappings and relationships.
                </p>
                <div className="flex items-center justify-end gap-2">
                  <button 
                    type="button"
                    onClick={() => setIsDeletePopoverOpen(false)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      onDelete(objectType.id);
                      setIsDeletePopoverOpen(false);
                    }}
                    className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white hover:bg-red-700 rounded-md transition-colors shadow-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 py-3 border-b border-slate-100 bg-white min-h-[60px]">
        <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">{objectType.description}</p>
      </div>

      <div className="flex-1 p-5 bg-white">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Tag size={12} /> Properties
        </h4>
        <div className="space-y-2">
          {objectType.properties.map(prop => (
            <div key={prop.id} className="flex items-center justify-between group/prop">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${prop.isPrimaryKey ? 'text-slate-900' : 'text-slate-600'}`}>
                  {prop.displayName}
                </span>
                {prop.isPrimaryKey && <span className="text-[10px] text-amber-500 font-bold ml-1" title="Primary Key">PK</span>}
              </div>
              <TypeBadge type={prop.type} />
            </div>
          ))}
        </div>

        {relevantRelations.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <LinkIcon size={12} /> Links
            </h4>
            <div className="space-y-2">
              {relevantRelations.map(rel => {
                const isSource = rel.sourceTypeId === objectType.id;
                const otherTypeId = isSource ? rel.targetTypeId : rel.sourceTypeId;
                const otherType = allTypes.find(t => t.id === otherTypeId);
                
                if (!otherType) return null;
                const OtherIcon = otherType.icon;

                return (
                  <div key={rel.id} className="flex items-center justify-between text-sm p-2 rounded bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-xs">{isSource ? rel.displayName : 'Linked by'}</span>
                      <ArrowRightLeft size={10} className="text-slate-300" />
                      <div className="flex items-center gap-1.5 font-medium text-slate-700">
                        <OtherIcon size={12} className="text-slate-500" />
                        {otherType.displayName}
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded uppercase">
                      {rel.cardinality === 'one-to-many' ? '1:N' : rel.cardinality === 'many-to-many' ? 'M:N' : '1:1'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface OntologyViewProps {
  schema: OntologySchema;
  onSaveObjectType: (obj: ObjectType) => void;
  onDeleteObjectType: (id: string) => void;
  exportData: {
    schema: OntologySchema;
    mappings: ObjectMapping[];
    dataSources: DataSource[];
  };
  onImportData: (data: any) => void;
}

export const OntologyView = ({ 
  schema, 
  onSaveObjectType,
  onDeleteObjectType,
  exportData,
  onImportData
}: OntologyViewProps) => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingObject, setEditingObject] = useState<ObjectType | null>(null);

  const handleCreateNew = () => {
    setEditingObject(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (obj: ObjectType) => {
    setEditingObject(obj);
    setIsEditorOpen(true);
  };

  const handleSave = (obj: ObjectType) => {
    onSaveObjectType(obj);
    setIsEditorOpen(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto pb-24 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Ontology Schema</h2>
          <p className="text-slate-500 mt-1">Define your business objects, properties, and the relationships that bind them.</p>
        </div>
        <div className="flex items-center gap-3">
          <ImportExportControls exportData={exportData} onImport={onImportData} />
          <button 
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm ml-2"
          >
            <Plus size={18} />
            New Object Type
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schema.objectTypes.map(objType => (
          <ObjectTypeCard 
            key={objType.id} 
            objectType={objType} 
            relations={schema.relations}
            allTypes={schema.objectTypes}
            onEdit={handleEdit}
            onDelete={onDeleteObjectType}
          />
        ))}
      </div>

      <OntologyEditor 
        isOpen={isEditorOpen}
        initialData={editingObject}
        onSave={handleSave}
        onClose={() => setIsEditorOpen(false)}
      />
    </div>
  );
};

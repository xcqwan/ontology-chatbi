import React from 'react';

export type PropertyType = 'string' | 'number' | 'currency' | 'date' | 'status' | 'id';

export interface PropertyDefinition {
  id: string;
  name: string;
  displayName: string;
  type: PropertyType;
  description?: string;
  isPrimaryKey?: boolean;
}

export interface RelationDefinition {
  id: string;
  sourceTypeId: string;
  targetTypeId: string;
  name: string; // Internal name
  displayName: string; // Human readable link name (e.g., "Places", "Contains")
  cardinality: 'one-to-one' | 'one-to-many' | 'many-to-many';
}

export interface ObjectType {
  id: string;
  name: string;
  displayName: string;
  icon: React.ElementType;
  iconKey?: string; // Used for serialization/deserialization
  description: string;
  properties: PropertyDefinition[];
  color: string;
  textColor: string;
}

// The core data structure holding our "World Model"
export interface OntologySchema {
  objectTypes: ObjectType[];
  relations: RelationDefinition[];
}

// Data Source Types
export interface DataSource {
  id: string;
  name: string;
  type: 'csv' | 'database' | 'api';
  rowCount: number;
  columns: string[];
  data: Record<string, any>[]; // Array of rows
  description: string;
}

// Mapping Configuration
export interface ObjectMapping {
  objectTypeId: string;
  dataSourceId: string | null;
  propertyMappings: Record<string, string>; // propertyId -> sourceColumn
  relationMappings: Record<string, string>; // relationId -> sourceColumn (Foreign Key)
  isComplete: boolean;
}

// Chat Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type: 'text' | 'kpi' | 'chart-bar' | 'chart-line' | 'table' | 'error';
  data?: any; // Payload for visualizations
  relatedObjects?: string[]; // IDs of object types involved
  debugCode?: string; // To show the code that was executed
  llmInputContext?: string; // The full prompt/context sent to LLM for debugging
  rawExecutionResult?: any; // The raw JSON result from the sandbox
  metrics?: {
    codingTimeMs: number;
    explanationTimeMs: number;
  };
}
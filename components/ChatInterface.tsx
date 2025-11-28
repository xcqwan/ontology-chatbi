
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Loader2, Send, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { OntologySchema, ObjectMapping, DataSource, ChatMessage } from '../types';
import { SimpleMarkdown } from '../utils';
import { DebugConsole } from './ChatComponents';

// --- Sub-component for Table Pagination ---
const TableRenderer = ({ title, data }: { title: string, data: any[] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  
  // Safe guard if data is not an array
  const safeData = Array.isArray(data) ? data : [];
  
  const totalPages = Math.ceil(safeData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = safeData.slice(startIndex, startIndex + rowsPerPage);

  if (!safeData || safeData.length === 0) return <div className="text-xs text-slate-400 italic p-4">No data available</div>;

  return (
    <div className="mt-4 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
      <div className="px-4 py-2 border-b border-slate-200 bg-slate-100 flex justify-between items-center">
        <h4 className="text-xs font-bold text-slate-600 uppercase">{title}</h4>
        <span className="text-[10px] text-slate-400 font-mono">Total: {safeData.length}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-white text-slate-500">
            <tr>
              {Object.keys(safeData[0] || {}).map(k => <th key={k} className="px-3 py-2 border-b border-slate-100 font-semibold">{k}</th>)}
            </tr>
          </thead>
          <tbody>
            {currentData.map((row, i) => (
              <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                {Object.values(row).map((v: any, j) => (
                  <td key={j} className="px-3 py-2 text-slate-700 whitespace-nowrap">
                    {typeof v === 'object' && v !== null ? JSON.stringify(v) : v?.toString()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="bg-slate-50 px-3 py-2 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[10px] text-slate-500">
            Showing {startIndex + 1} - {Math.min(startIndex + rowsPerPage, safeData.length)} of {safeData.length} rows
          </span>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-600"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-[10px] font-medium text-slate-600 px-2">
              {currentPage} / {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-600"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface ChatInterfaceProps {
  schema: OntologySchema;
  mappings: ObjectMapping[];
  dataSources: DataSource[];
  messages: ChatMessage[];
  onSendMessage: (newMessages: ChatMessage[]) => void;
  selectedModel: string;
  recommendedQuestions: string[];
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  schema, 
  mappings, 
  dataSources,
  messages,
  onSendMessage,
  selectedModel,
  recommendedQuestions
}) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- LLM Integration Logic ---
  
  // 1. Prepare Data Context (Materialize the Ontology-Mapped Data)
  const prepareDataContext = useMemo(() => {
    const context: Record<string, any[]> = {};
    
    mappings.forEach(mapping => {
      const source = dataSources.find(ds => ds.id === mapping.dataSourceId);
      if (!source) return;

      const objType = schema.objectTypes.find(t => t.id === mapping.objectTypeId);
      if (!objType) return;

      // Transform rows based on property mappings
      const transformedRows = source.data.map(row => {
        const newRow: any = {};
        Object.entries(mapping.propertyMappings).forEach(([propId, colName]) => {
          const propDef = objType.properties.find(p => p.id === propId);
          let val = row[colName];
          
          // Simple type casting
          if (propDef?.type === 'number' || propDef?.type === 'currency') {
            val = parseFloat(String(val).replace(/[^0-9.-]+/g,""));
          }
          newRow[propDef?.name || propId] = val;
        });
        
        // Also Include raw FKs for joining if mapped
        Object.entries(mapping.relationMappings).forEach(([relId, colName]) => {
           newRow[`_fk_${relId}`] = row[colName];
        });
        
        return newRow;
      });

      // Key the data by the Object Type Name (e.g., "Customer", "Order") for easier LLM usage
      context[objType.name] = transformedRows;
    });
    
    return context;
  }, [mappings, dataSources, schema]);

  // 2. Generate Analysis Code using LLM
  const generateAnalysisCode = async (query: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Construct Schema Description
    const schemaDesc = schema.objectTypes.map(t => `
      Object: ${t.name} (${t.description})
      Properties: ${t.properties.map(p => `${p.name} (${p.type})`).join(', ')}
    `).join('\n');

    const prompt = `
    You are an expert Data Analyst JavaScript Developer.
    
    CONTEXT:
    I have a dataset loaded in memory representing a business ontology.
    The data is available in a global object called \`dataContext\`.
    
    ONTOLOGY SCHEMA:
    ${schemaDesc}
    
    AVAILABLE DATA KEYS:
    ${Object.keys(prepareDataContext).join(', ')}
    
    USER QUERY: "${query}"
    
    TASK:
    Write a JavaScript function called \`analyze\` that takes \`dataContext\` as an argument and returns the answer to the User Query.
    
    REQUIREMENTS:
    1. The code MUST be a pure synchronous function.
    2. It must return a JSON object with this structure:
       {
         "type": "kpi" | "bar_chart" | "line_chart" | "table" | "text",
         "title": "Short title of the result",
         "data": <the calculated data>,
         "summary": "A very short text summary of the finding"
       }
    3. For "bar_chart" or "line_chart", "data" must be [{ label: "...", value: 123 }].
    4. For "table", "data" must be an array of objects.
    5. Do NOT use external libraries (lodash, etc). Use native JS (filter, map, reduce).
    6. Handle edge cases (empty data).
    
    OUTPUT FORMAT:
    Return ONLY the raw JavaScript code for the function. Do not wrap in markdown blocks. Do not add explanations.
    Start with: function analyze(dataContext) { ... }
    `;

    const response = await ai.models.generateContent({
      model: selectedModel, // Use dynamic model
      contents: prompt,
      config: { temperature: 0.1 }
    });

    let code = response.text.trim();
    // Cleanup markdown if present
    if (code.startsWith('```javascript')) code = code.replace('```javascript', '').replace('```', '');
    if (code.startsWith('```js')) code = code.replace('```js', '').replace('```', '');
    if (code.startsWith('```')) code = code.replace('```', '');
    
    return { code, prompt };
  };

  // 3. Execute the generated code in a sandbox
  const executeGeneratedCode = (code: string, context: any) => {
    try {
      // Create a safe function from the string
      // The function expects 'dataContext'
      // We wrap the LLM code to ensure it defines 'analyze' and returns 'analyze(dataContext)'
      const wrappedCode = `
        ${code}
        return analyze(dataContext);
      `;
      
      const func = new Function('dataContext', wrappedCode);
      const result = func(context);
      return { success: true, result };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  // 4. Generate Natural Language Response based on Result
  const generateNaturalLanguageResponse = async (query: string, result: any) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
    User asked: "${query}"
    
    I executed a data analysis script and got this result:
    ${JSON.stringify(result, null, 2)}
    
    Please provide a friendly, helpful response to the user summarizing this data.
    - Use markdown formatting (bold, lists) to make it readable.
    - If it's a chart, describe the trend or key insights briefly.
    - If it's a list, show top 3-5 items as examples in the text.
    - Keep it concise but professional.
    `;

    const response = await ai.models.generateContent({
      model: selectedModel, // Use dynamic model
      contents: prompt
    });

    return response.text;
  };

  const handleSendMessage = async (text?: string) => {
    const contentToSend = text || input;
    if (!contentToSend.trim()) return;
    
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: contentToSend,
      timestamp: new Date(),
      type: 'text'
    };
    
    const newHistory = [...messages, userMsg];
    onSendMessage(newHistory);
    setInput('');
    setIsTyping(true);

    try {
      // 1. Generate Code (Time it)
      const t0 = performance.now();
      const { code, prompt } = await generateAnalysisCode(userMsg.content);
      const t1 = performance.now();
      const codingTimeMs = t1 - t0;
      
      // 2. Execute Code
      const execution = executeGeneratedCode(code, prepareDataContext);
      
      if (!execution.success) {
        throw new Error(`Execution Error: ${execution.error}`);
      }

      // 3. Generate Explanation (Time it)
      const t2 = performance.now();
      const explanation = await generateNaturalLanguageResponse(userMsg.content, execution.result);
      const t3 = performance.now();
      const explanationTimeMs = t3 - t2;

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: explanation, // The friendly text
        timestamp: new Date(),
        type: 'text', // The main type is text, but we attach data for visual renderers
        data: execution.result, // Attach the structured result
        debugCode: code,
        llmInputContext: prompt, // Save the prompt for debugging
        rawExecutionResult: execution.result,
        metrics: {
            codingTimeMs,
            explanationTimeMs
        }
      };
      
      onSendMessage([...newHistory, aiMsg]);

    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I encountered an error analyzing your request: ${err.message}. Please try rephrasing.`,
        timestamp: new Date(),
        type: 'error'
      };
      onSendMessage([...newHistory, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, index) => (
          <div key={msg.id} className="flex flex-col gap-2">
            <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                
                {/* Debug Console - Placed Above Message Bubble for Assistant */}
                {msg.role === 'assistant' && (
                  <div className="mb-2 w-full max-w-2xl">
                     <DebugConsole 
                      code={msg.debugCode} 
                      result={msg.rawExecutionResult} 
                      llmInput={msg.llmInputContext}
                      metrics={msg.metrics}
                    />
                  </div>
                )}

                {/* Message Bubble */}
                <div className={`w-full ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm shadow-sm'} p-5`}>
                  
                  {/* Text Content (Markdown Support) */}
                  <div className={`text-sm leading-relaxed ${msg.role === 'user' ? 'text-white' : 'text-slate-800'}`}>
                    {msg.role === 'assistant' ? <SimpleMarkdown text={msg.content} /> : msg.content}
                  </div>

                  {/* Dynamic Visualizations based on Data Payload */}
                  {msg.role === 'assistant' && msg.data && msg.data.type === 'kpi' && (
                    <div className="mt-4 bg-slate-50 rounded-lg p-4 border border-slate-200 flex flex-col items-center text-center">
                      <span className="text-slate-500 text-xs uppercase font-semibold tracking-wider mb-1">{msg.data.title}</span>
                      <span className="text-3xl font-bold text-indigo-600">
                        {typeof msg.data.data === 'object' ? JSON.stringify(msg.data.data) : msg.data.data}
                      </span>
                    </div>
                  )}

                  {msg.role === 'assistant' && msg.data && (msg.data.type === 'bar_chart' || msg.data.type === 'line_chart') && (
                     <div className="mt-4 bg-slate-50 rounded-lg p-4 border border-slate-200">
                       <h4 className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">{msg.data.title}</h4>
                       <div className="space-y-2">
                         {(msg.data.data as any[]).slice(0, 8).map((item, idx) => {
                           // Simple HTML Bar Chart
                           const maxVal = Math.max(...(msg.data!.data as any[]).map((d: any) => d.value));
                           const pct = (item.value / maxVal) * 100;
                           return (
                             <div key={idx} className="flex items-center text-xs gap-3">
                               <span className="w-24 truncate text-slate-600 text-right">{item.label}</span>
                               <div className="flex-1 h-5 bg-slate-200 rounded-sm overflow-hidden">
                                 <div className="h-full bg-indigo-500" style={{ width: `${pct}%` }}></div>
                               </div>
                               <span className="w-12 text-slate-900 font-mono">{typeof item.value === 'number' ? item.value.toLocaleString() : item.value}</span>
                             </div>
                           )
                         })}
                       </div>
                       {(msg.data.data as any[]).length > 8 && <p className="text-[10px] text-center text-slate-400 mt-2">Showing top 8 of {(msg.data.data as any[]).length} items</p>}
                     </div>
                  )}

                   {msg.role === 'assistant' && msg.data && msg.data.type === 'table' && (
                     <TableRenderer title={msg.data.title} data={msg.data.data} />
                  )}

                  <span className={`text-[10px] mt-2 block opacity-60 ${msg.role === 'user' ? 'text-indigo-100' : 'text-slate-400'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Render Recommended Questions after the welcome message (if it's the only message or the last is from assistant and we want to nudge) */}
            {index === messages.length - 1 && msg.role === 'assistant' && recommendedQuestions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 ml-1">
                {recommendedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(q)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full transition-colors border border-indigo-100"
                  >
                    <Sparkles size={12} />
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
        
        {isTyping && (
          <div className="flex justify-start animate-pulse">
             <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
               <Loader2 size={16} className="animate-spin text-indigo-600" />
               <span className="text-xs text-slate-500">Analyzing data with {selectedModel === 'gemini-3-pro-preview' ? 'Gemini 3 Pro' : 'Gemini 2.5 Flash'}...</span>
             </div>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-white border-t border-slate-200 shrink-0">
        <div className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask about sales, customers, or products..."
            className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm text-sm"
          />
          <button 
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-2">
          AI can make mistakes. Review generated code in the Debug Console.
        </p>
      </div>
    </div>
  );
};

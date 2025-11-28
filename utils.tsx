import React from 'react';
import { 
  Users, ShoppingCart, Box, Activity, Calendar, FileText, MapPin, 
  User, Building, Truck, Wallet, CreditCard, Tag, Layers, Database,
  Briefcase, CircleDollarSign, ClipboardList, Package
} from 'lucide-react';

export const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
export const formatDate = (val: string) => new Date(val).toLocaleDateString();

export const ICON_MAP: Record<string, React.ElementType> = {
  Users, ShoppingCart, Box, Activity, Calendar, FileText, MapPin, 
  User, Building, Truck, Wallet, CreditCard, Tag, Layers, Database,
  Briefcase, CircleDollarSign, ClipboardList, Package
};

// Helper component for Markdown rendering
export const SimpleMarkdown = ({ text }: { text: string }) => {
  if (!text) return null;

  // Split by newlines to handle block elements
  const lines = text.split('\n');
  
  return (
    <div className="text-sm leading-relaxed space-y-2 text-slate-700">
      {lines.map((line, i) => {
        const trimLine = line.trim();
        // Headers
        if (trimLine.startsWith('### ')) return <h3 key={i} className="font-bold text-slate-900 mt-3 text-sm uppercase tracking-wide">{parseInline(trimLine.replace('### ', ''))}</h3>;
        if (trimLine.startsWith('## ')) return <h2 key={i} className="font-bold text-slate-900 text-base mt-4 border-b border-slate-200 pb-1">{parseInline(trimLine.replace('## ', ''))}</h2>;
        if (trimLine.startsWith('# ')) return <h1 key={i} className="font-bold text-slate-900 text-lg mt-4">{parseInline(trimLine.replace('# ', ''))}</h1>;
        
        // Lists
        if (trimLine.startsWith('- ')) return <div key={i} className="flex gap-2 ml-2"><span className="text-slate-400">•</span><span>{parseInline(trimLine.replace('- ', ''))}</span></div>;
        if (trimLine.match(/^\d+\. /)) return <div key={i} className="ml-2 pl-4 -indent-4">{parseInline(trimLine)}</div>;
        
        // Code Blocks (very simple detection)
        if (trimLine.startsWith('```')) return null; // Skip code fence lines in this simple parser

        // Empty lines
        if (trimLine === '') return <div key={i} className="h-1"></div>;

        return <div key={i}>{parseInline(line)}</div>;
      })}
    </div>
  );
};

const parseInline = (text: string) => {
  // Handle bold **text** and code `text`
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={index} className="bg-slate-100 text-indigo-600 px-1 py-0.5 rounded text-xs font-mono border border-slate-200">{part.slice(1, -1)}</code>;
    }
    return part;
  });
};
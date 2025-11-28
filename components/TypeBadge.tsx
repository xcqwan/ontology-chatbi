import React from 'react';
import { PropertyType } from '../types';

export const TypeBadge = ({ type }: { type: PropertyType }) => {
  const styles: Record<PropertyType, string> = {
    string: 'bg-slate-100 text-slate-600',
    number: 'bg-blue-50 text-blue-600',
    currency: 'bg-emerald-50 text-emerald-600',
    date: 'bg-orange-50 text-orange-600',
    status: 'bg-purple-50 text-purple-600',
    id: 'bg-slate-800 text-slate-300 font-mono text-xs',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${styles[type]}`}>
      {type}
    </span>
  );
};


import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface InputGroupProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  icon?: React.ReactNode;
  placeholder?: string;
}

export const InputGroup: React.FC<InputGroupProps> = ({ label, value, onChange, icon, placeholder }) => {
  const isPending = value === 0;

  return (
    <div className="flex flex-col gap-1.5 group">
      <label className={`text-[10px] font-black uppercase tracking-widest flex items-center justify-between transition-colors ${
        isPending ? 'text-amber-500/70' : 'text-slate-500 group-focus-within:text-sky-400'
      }`}>
        <span className="flex items-center gap-2">
          {icon}
          {label}
        </span>
        {isPending && (
          <span className="flex items-center gap-1 text-[8px] text-amber-500 animate-pulse">
            <AlertTriangle size={10} /> pendente
          </span>
        )}
      </label>
      <div className="relative group/input">
        <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm transition-colors ${
          isPending ? 'text-amber-500/50' : 'text-slate-500 group-focus-within/input:text-sky-400'
        }`}>
          R$
        </span>
        <input
          type="number"
          inputMode="decimal"
          value={value === 0 ? '' : value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          placeholder={placeholder || "0,00"}
          className={`w-full bg-slate-900/40 border rounded-2xl py-3.5 pl-10 pr-4 font-medium focus:outline-none focus:ring-2 transition-all placeholder:text-slate-700 ${
            isPending 
              ? 'border-amber-500/20 hover:border-amber-500/40 focus:ring-amber-500/10 focus:border-amber-500' 
              : 'border-slate-800 hover:border-slate-700 focus:ring-sky-500/20 focus:border-sky-500 text-slate-200'
          }`}
        />
      </div>
    </div>
  );
};

import React from 'react';
import { X, Save, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

interface DataChangesModalProps {
    changes: string[];
    onConfirm: () => void;
    onCancel: () => void;
}

export const DataChangesModal: React.FC<DataChangesModalProps> = ({ changes, onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-[#0f172a]/95 backdrop-blur-md animate-in fade-in" onClick={onCancel}></div>
            <div className="relative w-full max-w-md bg-slate-900 border border-sky-500/30 rounded-[2rem] p-8 shadow-2xl shadow-sky-500/10 animate-in zoom-in-95 duration-200">
                <button onClick={onCancel} className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white transition-colors">
                    <X size={20} />
                </button>

                <div className="mb-6 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-sky-500/10 rounded-xl flex items-center justify-center text-sky-400 border border-sky-500/20 mb-3">
                        <Save size={24} />
                    </div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter">
                        Atualizar Diagnóstico
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 font-medium">
                        Identificamos as seguintes alterações nos seus dados:
                    </p>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-700/50 max-h-60 overflow-y-auto custom-scrollbar">
                    {changes.length > 0 ? (
                        <ul className="space-y-2">
                            {changes.map((change, idx) => (
                                <li key={idx} className="flex gap-2 items-start text-[10px] text-slate-300">
                                    <div className="mt-0.5 text-sky-400 shrink-0"><CheckCircle2 size={12} /></div>
                                    <span>{change}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-4 text-slate-500 gap-2">
                            <AlertCircle size={20} />
                            <span className="text-xs font-bold">Nenhuma alteração detectada.</span>
                        </div>
                    )}
                </div>

                <button
                    onClick={onConfirm}
                    className="w-full py-4 bg-sky-500 text-[#0f172a] rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-sky-500/20 active:scale-95 transition-all hover:bg-sky-400 flex items-center justify-center gap-2"
                >
                    Confirmar Atualização <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
};

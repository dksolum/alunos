import React from 'react';
import { Printer, FileText, CreditCard, TrendingDown, Target, ListTodo } from 'lucide-react';

interface ReportsStageM4Props {
    onPrintReview: () => void;
    onPrintExpenses: () => void;
    onPrintDebts: () => void;
    onPrintStatus: () => void;
    onPrintDreams: () => void;
}

export const ReportsStageM4: React.FC<ReportsStageM4Props> = ({
    onPrintReview,
    onPrintExpenses,
    onPrintDebts,
    onPrintStatus,
    onPrintDreams
}) => {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400">
                        <Printer size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Relatórios e Impressão</h3>
                        <p className="text-slate-400">
                            Gere e imprima os relatórios detalhados desta etapa da mentoria.
                            Os documentos serão ajustados automaticamente para o formato A4.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Card Revisão */}
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-emerald-500/30 transition-all group">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-lg leading-tight">Revisão de Orçamento</h4>
                            <p className="text-xs text-slate-500 mt-1">Orçado vs Realizado</p>
                        </div>
                    </div>

                    <button
                        onClick={onPrintReview}
                        className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold uppercase text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                        <Printer size={16} />
                        Imprimir
                    </button>
                </div>

                {/* Card Gastos Não Recorrentes */}
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-emerald-500/30 transition-all group">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                            <CreditCard size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-lg leading-tight">Gastos Anuais</h4>
                            <p className="text-xs text-slate-500 mt-1">Mapeamento & Reservas</p>
                        </div>
                    </div>

                    <button
                        onClick={onPrintExpenses}
                        className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold uppercase text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                        <Printer size={16} />
                        Imprimir
                    </button>
                </div>

                {/* Card Atualização de Dívidas */}
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-emerald-500/30 transition-all group">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                            <TrendingDown size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-lg leading-tight">Atualização de Dívidas</h4>
                            <p className="text-xs text-slate-500 mt-1">Status de Negociações</p>
                        </div>
                    </div>

                    <button
                        onClick={onPrintDebts}
                        className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold uppercase text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                        <Printer size={16} />
                        Imprimir
                    </button>
                </div>

                {/* Card Status Plano (NOVO) */}
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-purple-500/30 transition-all group">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                            <ListTodo size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-lg leading-tight">Status do Plano</h4>
                            <p className="text-xs text-slate-500 mt-1">Acompanhamento M3</p>
                        </div>
                    </div>

                    <button
                        onClick={onPrintStatus}
                        className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold uppercase text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                        <Printer size={16} />
                        Imprimir
                    </button>
                </div>

                {/* Card Sonhos e Objetivos */}
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-emerald-500/30 transition-all group">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                            <Target size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-lg leading-tight">Sonhos e Objetivos</h4>
                            <p className="text-xs text-slate-500 mt-1">Planejamento Futuro</p>
                        </div>
                    </div>

                    <button
                        onClick={onPrintDreams}
                        className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold uppercase text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                        <Printer size={16} />
                        Imprimir
                    </button>
                </div>
            </div>
        </div>
    );
};

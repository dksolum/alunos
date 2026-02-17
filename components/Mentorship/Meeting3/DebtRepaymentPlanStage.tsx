import React, { useState } from 'react';
import { TrendingUp, Target, AlertCircle, ChevronRight, Calculator, PieChart, ArrowUpCircle } from 'lucide-react';

interface DebtRepaymentPlanStageProps {
    meetingData: any;
    onUpdateMeetingData: (data: any) => void;
    readOnly?: boolean;
}

export const DebtRepaymentPlanStage: React.FC<DebtRepaymentPlanStageProps> = ({
    meetingData,
    onUpdateMeetingData,
    readOnly = false
}) => {
    const debtUpdates = meetingData?.debtUpdates || [];
    const [selectedDebtId, setSelectedDebtId] = useState<string>(meetingData?.priorityDebtId || '');
    const [repaymentStrategy, setRepaymentStrategy] = useState(meetingData?.repaymentStrategy || '');

    // Priority filtering: debts not being paid first
    const sortedDebts = [...debtUpdates].sort((a, b) => {
        if (a.isPaid === b.isPaid) return 0;
        return a.isPaid ? 1 : -1; // unpaid (isPaid=false) first
    });

    const handleSelectDebt = (id: string) => {
        if (readOnly) return;
        setSelectedDebtId(id);
        onUpdateMeetingData({ ...meetingData, priorityDebtId: id });
    };

    const handleStrategyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (readOnly) return;
        const val = e.target.value;
        setRepaymentStrategy(val);
        onUpdateMeetingData({ ...meetingData, repaymentStrategy: val });
    };

    const selectedDebt = debtUpdates.find((d: any) => d.id === selectedDebtId);

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Intro Hero */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-purple-900/20">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <TrendingUp size={160} />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                            <ArrowUpCircle className="text-white" size={24} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-purple-100">O Ponto de Virada</span>
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tight mb-4">Plano de Quitação e Crescimento</h2>
                    <p className="text-purple-100 font-medium leading-relaxed">
                        Esta é a reunião da virada. Agora que estabilizamos o caos e revisamos as dívidas,
                        vamos focar em zerar as pendências e começar a olhar para a construção do seu patrimônio.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Selection Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-sky-500/10 text-sky-400 rounded-lg flex items-center justify-center">
                            <Target size={18} />
                        </div>
                        <h3 className="text-lg font-bold text-white uppercase tracking-tight">1. Seleção da Prioridade</h3>
                    </div>

                    <div className="space-y-3">
                        {sortedDebts.length === 0 ? (
                            <div className="p-8 bg-slate-900/50 border border-slate-800 rounded-2xl text-center">
                                <AlertCircle className="mx-auto text-slate-600 mb-3" size={32} />
                                <p className="text-slate-500 text-sm">Nenhuma dívida disponível para planejar.</p>
                            </div>
                        ) : (
                            sortedDebts.map(debt => (
                                <button
                                    key={debt.id}
                                    onClick={() => handleSelectDebt(debt.id)}
                                    disabled={readOnly}
                                    className={`w-full p-4 rounded-2xl border transition-all text-left flex items-center gap-4 group ${selectedDebtId === debt.id
                                        ? 'bg-sky-500/10 border-sky-500/50 shadow-lg shadow-sky-500/5'
                                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${selectedDebtId === debt.id ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-500 group-hover:text-slate-300'}`}>
                                        <PieChart size={20} />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="flex items-center gap-2">
                                            <h4 className={`font-bold truncate ${selectedDebtId === debt.id ? 'text-sky-400' : 'text-slate-200'}`}>{debt.name}</h4>
                                            {!debt.isPaid && (
                                                <span className="text-[8px] bg-rose-500/20 text-rose-400 border border-rose-500/30 px-1.5 py-0.5 rounded font-black uppercase">Crítico</span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold truncate">{debt.creditor}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-slate-300">R$ {debt.newInstallment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                        <p className="text-[10px] text-slate-500 font-bold">{debt.newQuantity}x restantes</p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Strategy Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center">
                            <Calculator size={18} />
                        </div>
                        <h3 className="text-lg font-bold text-white uppercase tracking-tight">2. Estratégia de Quitação</h3>
                    </div>

                    {selectedDebt ? (
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 animate-in zoom-in-95 duration-300">
                            <div className="bg-slate-950/50 rounded-2xl p-4 border border-slate-800/50">
                                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Resumo da Dívida Alvo</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Parcela</p>
                                        <p className="text-xl font-black text-white">R$ {selectedDebt.newInstallment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Prazo Total</p>
                                        <p className="text-xl font-black text-sky-400">{selectedDebt.newQuantity} meses</p>
                                    </div>
                                    <div className="space-y-1 col-span-2 pt-2 border-t border-slate-800">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Data Estimada de Quitação</p>
                                        <p className="text-lg font-black text-emerald-400 uppercase tracking-tight">{selectedDebt.endDate}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-bold text-slate-300 uppercase tracking-tight">Como pretendemos quitar esta dívida?</label>
                                <textarea
                                    value={repaymentStrategy}
                                    onChange={handleStrategyChange}
                                    readOnly={readOnly}
                                    placeholder="Ex: Utilizar 50% do bônus de Junho para amortização extraordinária, ou focar em quitar as 3 parcelas finais com desconto..."
                                    className="w-full min-h-[150px] bg-slate-950 border border-slate-800 rounded-2xl p-4 text-slate-300 text-sm italic placeholder:text-slate-700 outline-none focus:border-emerald-500 transition-all resize-none"
                                />
                            </div>

                            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 flex gap-4">
                                <div className="p-2 bg-emerald-500/10 rounded-xl h-fit">
                                    <TrendingUp className="text-emerald-500" size={20} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-emerald-400">Visão de Futuro</p>
                                    <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                                        Ao quitar esta dívida, liberamos <span className="text-emerald-400 font-black">R$ {selectedDebt.newInstallment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span> mensais que serão redirecionados 100% para seus novos investimentos.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[300px] border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center p-8">
                            <Target size={48} className="text-slate-700 mb-4" />
                            <p className="text-slate-500 font-medium">Selecione uma dívida ao lado para definir o plano de quitação.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

import React, { useState } from 'react';
import { TrendingUp, Activity, Target, CheckCircle2, Lock, Unlock, ShieldAlert, History, MessageSquare, AlertCircle } from 'lucide-react';

interface DreamGoal {
    id: string;
    description: string;
    targetValue: number;
    savedValue?: number;
    targetDate: string;
    status: 'Não Iniciado' | 'Em Andamento' | 'Concluído';
    origin?: 'M4' | 'M5' | 'M6';
}

interface ValueProposalM6Props {
    meetingData: any;
    m3Data?: any;
    currentUser: { id: string; role: 'ADMIN' | 'USER' | 'SECRETARY' };
    readOnly?: boolean;
    onUpdateMeetingData: (data: any) => void;
}

export const ValueProposalM6: React.FC<ValueProposalM6Props> = ({ meetingData, m3Data, currentUser, readOnly, onUpdateMeetingData }) => {
    // Lock state logic
    const [isLocked, setIsLocked] = useState(meetingData.valueProposalLocked || false);

    const toggleLock = () => {
        if (currentUser.role === 'USER') return;
        const newState = !isLocked;
        setIsLocked(newState);
        onUpdateMeetingData({ ...meetingData, valueProposalLocked: newState });
    };

    const canEditLock = currentUser.role === 'ADMIN' || currentUser.role === 'SECRETARY';

    // 1. Debt Tracking Logic (from M6 Checklist and M3 Priority)
    const priorityDebtId = m3Data?.priorityDebtId;
    const allDebts = m3Data?.debtUpdates || [];

    // The debt being tracked
    const trackedDebtData = allDebts.find((d: any) => d.id === priorityDebtId);

    // Its observations from M6 and inherited from M4/M5
    const trackedDebtStatus = meetingData?.debtPriorityStatus?.find((ps: any) => ps.id === priorityDebtId)
        || meetingData?.debtPriorityStatus?.[0]; // fallback

    // Remaining debts (not tracked)
    const remainingDebts = allDebts.filter((d: any) => d.id !== priorityDebtId && Number(d.outstandingBalance) > 0);

    const debtTrackingData = meetingData.debtStatusTracking || [];
    const totalOriginalDebt = debtTrackingData.reduce((acc: number, curr: any) => acc + (Number(curr.installmentValue) || 0), 0);
    const totalPaidDebt = debtTrackingData.filter((d: any) => d.status === 'Feito').reduce((acc: number, curr: any) => acc + (Number(curr.installmentValue) || 0), 0);
    const debtProgress = totalOriginalDebt > 0 ? (totalPaidDebt / totalOriginalDebt) * 100 : 0;

    // 2. Dreams and Goals Logic
    const dreamsGoals: DreamGoal[] = meetingData.dreamsGoals || [];
    const totalGoalTarget = dreamsGoals.reduce((acc, curr) => acc + (Number(curr.targetValue) || 0), 0);
    const totalGoalSaved = dreamsGoals.reduce((acc, curr) => acc + (Number(curr.savedValue) || 0), 0);
    const goalsStartedCount = dreamsGoals.filter(g => g.status === 'Em Andamento' || g.status === 'Concluído').length;
    const goalsCompletedCount = dreamsGoals.filter(g => g.status === 'Concluído').length;
    const goalsProgress = totalGoalTarget > 0 ? (totalGoalSaved / totalGoalTarget) * 100 : 0;

    // 3. Future Topics
    const futureTopics = [
        "MILHAS",
        "CARTÃO DE CRÉDITO",
        "SEPARAÇÃO DA CONTA DA EMPRESA COM PF",
        "SEGUROS",
        "PLANO DE SAÚDE",
        "CONSÓRCIO",
        "RESERVA DE EMERGÊNCIA",
        "SUCESSÃO PATRIMONIAL",
        "INVESTIMENTOS",
        "NEGOCIAÇÃO DE DÍVIDAS",
        "TRANSIÇÃO DE CARREIRA"
    ];

    const isVisibleToUser = !isLocked || canEditLock;

    if (!isVisibleToUser) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-12 text-center flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 bg-slate-950 rounded-full flex items-center justify-center border border-slate-800">
                    <Lock className="text-slate-500" size={24} />
                </div>
                <h3 className="text-xl font-black text-white">Proposta de Valor Bloqueada</h3>
                <p className="text-slate-400 max-w-md">O acesso a esta consolidação está temporariamente restrito e será liberado pelo seu consultor em breve.</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-900 text-slate-200 border border-emerald-500/20 rounded-[2rem] overflow-hidden shadow-2xl shadow-emerald-500/5 transition-all duration-500 relative">

            {/* Lock Toggle Button for Admins/Secretaries */}
            {canEditLock && !readOnly && (
                <button
                    onClick={toggleLock}
                    className={`absolute top-6 right-6 p-3 rounded-full flex items-center gap-2 transition-all shadow-lg ${isLocked ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'}`}
                    title={isLocked ? "Desbloquear para o usuário" : "Bloquear para o usuário"}
                >
                    {isLocked ? (
                        <>
                            <Lock size={18} />
                            <span className="text-xs font-bold uppercase tracking-wider hidden sm:block">Desbloquear Vista</span>
                        </>
                    ) : (
                        <>
                            <Unlock size={18} />
                            <span className="text-xs font-bold uppercase tracking-wider hidden sm:block">Bloquear Vista</span>
                        </>
                    )}
                </button>
            )}

            {/* Header */}
            <div className="p-8 pb-6 border-b border-slate-800/50 bg-slate-900">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-3">
                                Proposta de Valor da Mentoria
                                {isLocked && <span className="flex items-center gap-1 text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/20"><ShieldAlert size={12} /> Oculto p/ Usuário</span>}
                            </h2>
                            <p className="text-sm font-medium tracking-tight text-slate-400">Continuidade, Metas e Próximos Passos</p>
                        </div>
                    </div>
                </div>
                <p className="text-xs text-emerald-400/80 mt-4 leading-relaxed font-medium">
                    Precisamos dar continuidade no pagamento de todas as dívidas e concluir todas as metas, além de manter o controle e organização dos gastos.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-800">

                {/* DÍVIDAS PANEL */}
                <div className="p-8 flex flex-col gap-6 bg-slate-900/40">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                            <Activity size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-200">Plano de Quitação</h3>
                            <p className="text-[10px] text-slate-500">Acompanhamento e Próximos Passos</p>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-6">

                        {/* Tracked Debt Section */}
                        {trackedDebtStatus ? (
                            <div className="bg-slate-950/50 p-5 rounded-2xl border border-indigo-500/20 shadow-inner">
                                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/50">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-0.5">Dívida Acompanhada (Alvo)</p>
                                        <h4 className="text-white font-bold">{trackedDebtStatus.name}</h4>
                                        <p className="text-xs text-slate-500">{trackedDebtStatus.creditor}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-lg border ${trackedDebtStatus.status === 'Finalizado' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            trackedDebtStatus.status === 'Em Andamento' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                                                'bg-slate-800 text-slate-400 border-slate-700'
                                        }`}>
                                        {trackedDebtStatus.status}
                                    </span>
                                </div>

                                {/* Current and Previous Observations */}
                                <div className="space-y-4">
                                    {(trackedDebtStatus.observation || trackedDebtStatus.previousObservation) ? (
                                        <>
                                            {trackedDebtStatus.previousObservation && (
                                                <div>
                                                    <div className="flex items-center gap-1.5 mb-1 text-slate-500">
                                                        <History size={12} />
                                                        <span className="text-[10px] uppercase font-black tracking-widest">Histórico (R4, R5)</span>
                                                    </div>
                                                    <p className="text-xs text-slate-400 italic bg-slate-900/50 p-3 rounded-xl border border-slate-800 whitespace-pre-wrap">
                                                        {trackedDebtStatus.previousObservation}
                                                    </p>
                                                </div>
                                            )}
                                            {trackedDebtStatus.observation && (
                                                <div>
                                                    <div className="flex items-center gap-1.5 mb-1 text-indigo-400">
                                                        <MessageSquare size={12} />
                                                        <span className="text-[10px] uppercase font-black tracking-widest">Anotações Reunião 6</span>
                                                    </div>
                                                    <p className="text-xs text-slate-300 font-medium bg-indigo-500/5 p-3 rounded-xl border border-indigo-500/10 whitespace-pre-wrap">
                                                        {trackedDebtStatus.observation}
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-xs text-slate-500 italic text-center py-2">Nenhuma observação registrada.</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center">
                                <AlertCircle size={24} className="text-slate-600 mx-auto mb-2" />
                                <p className="text-xs font-medium text-slate-400">Nenhuma dívida prioritária sendo acompanhada no momento.</p>
                            </div>
                        )}

                        {/* Progress Tracker (From checklist tracking) */}
                        {debtTrackingData.length > 0 && (
                            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-xs font-bold text-slate-400">Parcelas Pagas no Fluxo</span>
                                    <span className="text-base font-black text-white">R$ {totalPaidDebt.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden mb-1.5">
                                    <div
                                        className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${Math.min(debtProgress, 100)}%` }}
                                    />
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                                    <span>Progresso</span>
                                    <span className="text-indigo-400">{debtProgress.toFixed(1)}%</span>
                                </div>
                            </div>
                        )}

                        {/* Remaining Debts To Plan */}
                        {remainingDebts.length > 0 && (
                            <div className="mt-2">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 ml-1">Restantes (Aguardando Plano)</h4>
                                <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
                                    {remainingDebts.map((d: any) => (
                                        <div key={d.id} className="bg-slate-900 border border-slate-800/50 rounded-xl p-3 flex justify-between items-center">
                                            <div>
                                                <p className="text-xs font-bold text-slate-300">{d.name}</p>
                                                <p className="text-[10px] text-slate-500">{d.creditor}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-black text-rose-400">R$ {Number(d.outstandingBalance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* SONHOS E OBJETIVOS PANEL */}
                <div className="p-8 flex flex-col gap-6 bg-slate-900/40">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center border border-pink-500/20">
                            <Target size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-200">Metas e Sonhos</h3>
                            <p className="text-[10px] text-slate-500">Evolução do Patrimônio Direcionado</p>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center gap-6">

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Iniciados</span>
                                <span className="text-xl font-black text-white">{goalsStartedCount} <span className="text-xs text-slate-500">/ {dreamsGoals.length}</span></span>
                            </div>
                            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Concluídos</span>
                                <span className="text-xl font-black text-emerald-400">{goalsCompletedCount}</span>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xs font-bold text-slate-400">Total Acumulado</span>
                                <span className="text-lg font-black text-emerald-400">R$ {totalGoalSaved.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            {/* Progress Bar */}
                            <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 mb-2">
                                <div
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${Math.min(goalsProgress, 100)}%` }}
                                />
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                                <span>Alvo: R$ {totalGoalTarget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                <span className="text-emerald-400">{goalsProgress.toFixed(1)}%</span>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

            {/* FUTURE TOPICS (Acompanhamento) */}
            <div className="p-8 border-t border-slate-800 bg-slate-900/80">
                <div className="flex items-center gap-2 mb-6">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">Próximos Temas do Acompanhamento</h3>
                </div>

                <div className="flex flex-wrap gap-2">
                    {futureTopics.map((topic, idx) => (
                        <div key={idx} className="bg-slate-800/50 border border-slate-700/50 text-slate-300 px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wide uppercase">
                            {topic}
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};

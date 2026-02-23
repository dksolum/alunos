import React, { useState } from 'react';
import { TrendingUp, Activity, Target, CheckCircle2, Lock, Unlock, ShieldAlert, History, MessageSquare, AlertCircle, ExternalLink, CreditCard, Link as LinkIcon, Eye, EyeOff } from 'lucide-react';

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

    // Continuation Link State
    const [continuationLink, setContinuationLink] = useState(meetingData.continuationLink || '');
    const [isContLinkVisible, setIsContLinkVisible] = useState(meetingData.isContinuationLinkVisible || false);

    const handleUpdateContinuationSettings = (field: 'continuationLink' | 'isContinuationLinkVisible', value: any) => {
        if (currentUser.role === 'USER') return;
        if (field === 'continuationLink') setContinuationLink(value);
        if (field === 'isContinuationLinkVisible') setIsContLinkVisible(value);
        onUpdateMeetingData({ ...meetingData, [field]: value });
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

    const totalDebtsCount = allDebts.length;
    const plannedDebtsCount = priorityDebtId ? 1 : 0;
    const debtsCoverageProgress = totalDebtsCount > 0 ? (plannedDebtsCount / totalDebtsCount) * 100 : 0;

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
        "TRANSIÇÃO DE CARREIRA",
        "APOSENTADORIA"
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

                        {/* Resumo de Cobertura do Plano */}
                        {totalDebtsCount > 0 && (
                            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-xs font-bold text-slate-400">Dívidas Mapeadas com Plano</span>
                                    <span className="text-base font-black text-white">{plannedDebtsCount} de {totalDebtsCount}</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden mb-1.5">
                                    <div
                                        className="h-full bg-rose-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${Math.min(debtsCoverageProgress, 100)}%` }}
                                    />
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                                    <span>Cobertura do Plano Geral</span>
                                    <span className="text-rose-400">{debtsCoverageProgress.toFixed(1)}%</span>
                                </div>
                            </div>
                        )}

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

                        {/* Top 3 Goals List */}
                        {dreamsGoals.length > 0 && (
                            <div className="mt-2">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 ml-1">Foco e Continuidade</h4>
                                <div className="flex flex-col gap-2">
                                    {dreamsGoals.slice(0, 3).map((goal) => (
                                        <div key={goal.id} className="bg-slate-900 border border-slate-800/50 rounded-xl p-3 flex justify-between items-center">
                                            <div className="flex-1 min-w-0 pr-3">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <p className="text-xs font-bold text-slate-300 truncate">{goal.description || 'Meta Sem Título'}</p>
                                                    {goal.status === 'Concluído' ? (
                                                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">Concluído</span>
                                                    ) : (
                                                        <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[8px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">Alvo</span>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-slate-500">Meta: {goal.targetDate ? new Date(goal.targetDate + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : 'Indefinido'}</p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-xs font-black text-emerald-400">R$ {Number(goal.targetValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                                <p className="text-[10px] font-bold text-slate-500">
                                                    {Number(goal.savedValue || 0) > 0 ? `Salvo: R$ ${Number(goal.savedValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Não iniciado'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}

                                    {dreamsGoals.length > 3 && (
                                        <div className="text-center mt-2 p-3 border border-dashed border-slate-700/50 rounded-xl bg-slate-900/30">
                                            <p className="text-[11px] font-bold text-slate-400 tracking-tight">
                                                e mais <span className="text-white">{dreamsGoals.length - 3}</span> metas ativas aguardando acompanhamento...
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

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

            {/* ADMIN CONTROLS: Continuation Link */}
            {canEditLock && !readOnly && (
                <div className="p-8 border-t border-slate-800 bg-slate-950/80">
                    <div className="flex items-center gap-2 mb-6">
                        <LinkIcon size={16} className="text-purple-400" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">Configuração do Checkout (Admin)</h3>
                    </div>

                    <div className="flex flex-col md:flex-row items-end gap-4">
                        <div className="flex-1 w-full">
                            <label className="text-[10px] uppercase font-bold text-slate-500 mb-1.5 block">Link de Pagamento / Continuação</label>
                            <input
                                type="url"
                                placeholder="Ex: https://sun.eduzz.com/..."
                                value={continuationLink}
                                onChange={(e) => handleUpdateContinuationSettings('continuationLink', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 placeholder:text-slate-600 focus:border-purple-500 outline-none transition-all"
                            />
                        </div>
                        <button
                            onClick={() => handleUpdateContinuationSettings('isContinuationLinkVisible', !isContLinkVisible)}
                            className={`px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all w-full md:w-auto h-[46px] border ${isContLinkVisible
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                                }`}
                        >
                            {isContLinkVisible ? <><Eye size={18} /> Visível para Usuário</> : <><EyeOff size={18} /> Oculto</>}
                        </button>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium mt-3">
                        Quando visível e com um link preenchido, os usuários verão um grande botão de fechamento abaixo.
                    </p>
                </div>
            )}

            {/* CONTINUATION BUTTON (Visible based on config) */}
            {isContLinkVisible && continuationLink && (
                <div className={`p-8 border-t flex flex-col items-center justify-center ${canEditLock ? 'border-dashed border-purple-500/30 bg-purple-500/5' : 'border-slate-800 bg-slate-950'} relative overflow-hidden`}>
                    {/* Background effects for standard view */}
                    {!canEditLock && (
                        <>
                            <div className="absolute top-[-50%] left-[-10%] w-[120%] h-[200%] bg-emerald-500/5 blur-[100px] pointer-events-none" />
                            <div className="absolute bottom-[-50%] right-[-10%] w-[120%] h-[200%] bg-sky-500/5 blur-[100px] pointer-events-none" />
                        </>
                    )}

                    {canEditLock && (
                        <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 bg-purple-500/20 rounded-md border border-purple-500/30 text-purple-400">
                            <Eye size={12} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Prévia Admin</span>
                        </div>
                    )}

                    <div className="text-center max-w-xl mx-auto mb-6 relative z-10">
                        <h4 className="text-xl font-black text-white mb-2">Pronto para o Próximo Nível?</h4>
                        <p className="text-sm font-medium text-slate-400">
                            Você já organizou suas finanças e definiu seus objetivos. Agora é a hora de acelerar a realização dos seus sonhos com o acompanhamento contínuo da Mentoria.
                        </p>
                    </div>

                    <a
                        href={continuationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative group w-full max-w-md"
                    >
                        {/* Glow effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500 group-hover:duration-200" />

                        <div className="relative w-full bg-slate-900 border border-slate-700/50 hover:border-slate-600 px-8 py-5 rounded-2xl flex items-center justify-between transition-all duration-300 overflow-hidden">
                            {/* Inner moving gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                                    <TrendingUp size={24} />
                                </div>
                                <div className="text-left">
                                    <span className="block text-[10px] uppercase font-black tracking-widest text-emerald-400 mb-0.5">Acelere seus Resultados</span>
                                    <span className="block text-lg font-black text-white group-hover:text-emerald-300 transition-colors">Continuar Mentoria</span>
                                </div>
                            </div>

                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 transform group-hover:-translate-y-1 group-hover:translate-x-1 relative z-10">
                                <ExternalLink size={18} />
                            </div>
                        </div>
                    </a>

                    <div className="flex items-center justify-center gap-4 mt-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 relative z-10">
                        <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-500/70" /> Suporte VIP</span>
                        <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                        <span className="flex items-center gap-1.5"><ShieldAlert size={12} className="text-sky-500/70" /> Acompanhamento</span>
                        <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                        <span className="flex items-center gap-1.5"><Target size={12} className="text-indigo-500/70" /> Foco</span>
                    </div>
                </div>
            )}

        </div>
    );
};

import React, { useState } from 'react';
import { TrendingUp, Target, AlertCircle, PieChart, ArrowUpCircle, Plus, Trash2, GripVertical, ChevronLeft, ArrowRight, Save, Info, CheckCircle2, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

interface RepaymentSubStep {
    id: string;
    title: string;
    isChecked?: boolean;
    showInputs?: boolean;
    monthlyValue?: number;
    installments?: number;
    hasBetterOffer?: boolean;
    observation?: string;
    options?: string[];
    selectedOption?: string;
    status?: 'done' | 'not_applicable' | 'pending';
    type?: 'checkbox' | 'simple' | 'conditional_offer' | 'margin_check';
}

interface RepaymentStep {
    id: string;
    title: string;
    subSteps: RepaymentSubStep[];
}

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

    // repaymentPlans = { debtId: RepaymentStep[] }
    const plans = meetingData?.repaymentPlans || {};

    const getTemplates = (debtName: string, isPaid: boolean): RepaymentStep[] => {
        if (!isPaid) {
            return [
                {
                    id: 'unpaid-1',
                    title: '1. Parar de ignorar o credor',
                    subSteps: [
                        { id: '1.1', title: 'Existem propostas ativas (SERASA e outros)?', type: 'checkbox', isChecked: false, showInputs: true },
                        { id: '1.2', title: 'Buscar canal oficial para verificar a situação e propostas', type: 'conditional_offer', isChecked: false }
                    ]
                },
                {
                    id: 'unpaid-2',
                    title: '2. Não negociar sem dinheiro',
                    subSteps: [
                        { id: '2.1', title: 'Não assinar nada na hora, só levar a proposta e analisar', type: 'simple' },
                        { id: '2.2', title: 'Verificar a margem mensal disponível atualmente', type: 'simple' },
                        { id: '2.3', title: 'Possui margem com folga?', type: 'margin_check', isChecked: false, options: ['Guardar sobra para pagar à vista (maior desconto)', 'Pagar parcelado (sem comprometer toda a margem)'] }
                    ]
                },
                {
                    id: 'unpaid-3',
                    title: '3. Buscar desconto',
                    subSteps: [
                        { id: '3.1', title: 'Quanto maior o tempo, maior o juro. O desconto é fundamental.', type: 'simple' },
                        { id: '3.2', title: 'Levar contraproposta sem revelar o valor máximo disponível (Canal Oficial)', type: 'simple' },
                        { id: '3.3', title: 'Se não baixar, informar o limite disponível como única via (Canal Oficial)', type: 'simple' },
                        { id: '3.4', title: 'Verificar feirões e acordos online (geralmente melhores oportunidades)', type: 'simple' }
                    ]
                },
                {
                    id: 'unpaid-4',
                    title: '4. Formalizar acordo',
                    subSteps: [
                        { id: '4.1', title: 'Exigir proposta formal ou baixar a proposta', type: 'simple' },
                        { id: '4.2', title: 'Conferir prazo de retirada do nome (se negativada)', type: 'simple' }
                    ]
                }
            ];
        } else {
            return [
                {
                    id: 'paid-1',
                    title: '1. Avaliar possibilidade de antecipação',
                    subSteps: [
                        { id: '1.1', title: 'Verificar se existe desconto para antecipação ou amortização', type: 'simple' }
                    ]
                },
                {
                    id: 'paid-2',
                    title: '2. Avaliar portabilidade',
                    subSteps: [
                        { id: '2.1', title: 'Existe outra instituição que oferece juros menores?', type: 'simple' }
                    ]
                },
                {
                    id: 'paid-3',
                    title: '3. Revisar orçamento',
                    subSteps: [
                        { id: '3.1', title: 'Verificar margem mensal para amortização (sem usar 100% da sobra)', type: 'simple' },
                        { id: '3.2', title: `Criar conta bancária: Quitar a dívida ${debtName}`, type: 'simple' },
                        { id: '3.3', title: 'Verificar possibilidade de corte temporário de gastos para acelerar', type: 'simple' }
                    ]
                }
            ];
        }
    };

    const handleSelectDebt = (id: string) => {
        if (readOnly) return;
        setSelectedDebtId(id);

        const debt = debtUpdates.find((d: any) => d.id === id);
        if (debt) {
            let updatedPlans = { ...plans };

            if (!plans[id]) {
                // Initialize with template
                updatedPlans[id] = getTemplates(debt.name, debt.isPaid);
            } else {
                // Check if migration is needed for existing plan
                const existingPlan = plans[id];
                if (existingPlan.some((s: any) => !s.subSteps)) {
                    updatedPlans[id] = migrateLegacyPlan(existingPlan);
                }
            }

            onUpdateMeetingData({
                ...meetingData,
                priorityDebtId: id,
                repaymentPlans: updatedPlans
            });
        }
    };

    const handleResetTemplate = () => {
        if (readOnly || !selectedDebt) return;

        const confirmReset = window.confirm("Deseja mesmo redefinir esta estratégia? Todo o conteúdo atual será perdido e substituído pelo template padrão para o status atual desta dívida.");

        if (confirmReset) {
            const template = getTemplates(selectedDebt.name, selectedDebt.isPaid);
            const updatedPlans = { ...plans, [selectedDebtId]: template };
            onUpdateMeetingData({
                ...meetingData,
                repaymentPlans: updatedPlans
            });
        }
    };

    const handleDeselectDebt = () => {
        if (readOnly) return;
        setSelectedDebtId('');
        onUpdateMeetingData({ ...meetingData, priorityDebtId: '' });
    };

    const selectedDebt = debtUpdates.find((d: any) => d.id === selectedDebtId);
    const currentPlan: RepaymentStep[] = plans[selectedDebtId] || [];

    const updatePlan = (newPlan: RepaymentStep[]) => {
        if (readOnly) return;
        const updatedPlans = { ...plans, [selectedDebtId]: newPlan };
        onUpdateMeetingData({ ...meetingData, repaymentPlans: updatedPlans });
    };

    const migrateLegacyPlan = (plan: any[]): RepaymentStep[] => {
        return plan.map(step => {
            if (step.subSteps) return step;

            // Migrate legacy 'observation' to a subStep
            return {
                id: step.id,
                title: step.title,
                subSteps: step.observation ? [
                    { id: crypto.randomUUID(), title: step.observation, type: 'simple' }
                ] : []
            };
        });
    };

    const handleUpdateSubStep = (stepId: string, subStepId: string, updates: Partial<RepaymentSubStep>) => {
        const newPlan = currentPlan.map(step => {
            if (step.id === stepId) {
                return {
                    ...step,
                    subSteps: (step.subSteps || []).map(ss => ss.id === subStepId ? { ...ss, ...updates } : ss)
                };
            }
            return step;
        });
        updatePlan(newPlan);
    };

    const handleAddStep = () => {
        const newStep: RepaymentStep = {
            id: crypto.randomUUID(),
            title: `Novo Bloco ${currentPlan.length + 1}`,
            subSteps: []
        };
        updatePlan([...currentPlan, newStep]);
    };

    const handleRemoveStep = (id: string) => {
        updatePlan(currentPlan.filter(s => s.id !== id));
    };

    const handleAddSubStep = (stepId: string) => {
        const newPlan = currentPlan.map(step => {
            if (step.id === stepId) {
                const newSS: RepaymentSubStep = {
                    id: crypto.randomUUID(),
                    title: 'Novo item',
                    type: 'simple'
                };
                return { ...step, subSteps: [...(step.subSteps || []), newSS] };
            }
            return step;
        });
        updatePlan(newPlan);
    };

    const handleRemoveSubStep = (stepId: string, subStepId: string) => {
        const newPlan = currentPlan.map(step => {
            if (step.id === stepId) {
                return { ...step, subSteps: (step.subSteps || []).filter(ss => ss.id !== subStepId) };
            }
            return step;
        });
        updatePlan(newPlan);
    };

    const handleMoveStep = (index: number, direction: 'up' | 'down') => {
        const newPlan = [...currentPlan];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= newPlan.length) return;
        [newPlan[index], newPlan[newIndex]] = [newPlan[newIndex], newPlan[index]];
        updatePlan(newPlan);
    };

    const sortedDebts = [...debtUpdates].sort((a, b) => {
        if (a.isPaid === b.isPaid) return 0;
        return a.isPaid ? 1 : -1;
    });

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
                    <p className="text-purple-100 font-medium leading-relaxed italic">
                        "O primeiro passo para sair do buraco é parar de cavar." - Defina a estratégia de ataque.
                    </p>
                </div>
            </div>

            {!selectedDebt ? (
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-sky-500/10 text-sky-400 rounded-lg flex items-center justify-center">
                            <Target size={18} />
                        </div>
                        <h3 className="text-lg font-bold text-white uppercase tracking-tight">Escolha a Dívida Alvo</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sortedDebts.length === 0 ? (
                            <div className="col-span-full p-12 bg-slate-900/50 border border-slate-800 rounded-3xl text-center">
                                <AlertCircle className="mx-auto text-slate-600 mb-4" size={48} />
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Nenhuma dívida para planejar</p>
                            </div>
                        ) : (
                            sortedDebts.map(debt => (
                                <button
                                    key={debt.id}
                                    onClick={() => handleSelectDebt(debt.id)}
                                    disabled={readOnly}
                                    className="p-6 rounded-[2rem] border bg-slate-900/50 border-slate-800 hover:border-sky-500/50 hover:bg-sky-500/5 transition-all text-left group"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 bg-slate-800 text-slate-500 group-hover:bg-sky-500 group-hover:text-white rounded-2xl flex items-center justify-center transition-colors">
                                            <PieChart size={24} />
                                        </div>
                                        {!debt.isPaid && (
                                            <span className="text-[9px] bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Prioritária</span>
                                        )}
                                    </div>
                                    <h4 className="font-black text-white group-hover:text-sky-400 transition-colors uppercase tracking-tight mb-1">{debt.name}</h4>
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-4 truncate">{debt.creditor}</p>

                                    <div className="pt-4 border-t border-slate-800 flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Status</p>
                                            <p className={`text-xs font-black ${debt.isPaid ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {debt.isPaid ? 'SENDO PAGA' : 'NÃO ESTÁ SENDO PAGA'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Parcela</p>
                                            <p className="text-sm font-black text-slate-200">R$ {debt.newInstallment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                    {/* LEFT COLUMN: SUMMARY */}
                    <div className="lg:col-span-1 space-y-6">
                        <button
                            onClick={handleDeselectDebt}
                            className="flex items-center gap-2 text-sky-400 hover:text-white transition-colors text-xs font-black uppercase tracking-widest mb-4"
                        >
                            <ChevronLeft size={16} />
                            Trocar Dívida
                        </button>

                        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 space-y-6">
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-1 line-clamp-2">{selectedDebt.name}</h3>
                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{selectedDebt.creditor}</p>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-800">
                                <div className="flex justify-between">
                                    <span className="text-[10px] text-slate-500 uppercase font-black">Planilha Mensal</span>
                                    <span className="text-sm font-black text-white">R$ {selectedDebt.newInstallment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[10px] text-slate-500 uppercase font-black">Meses Restantes</span>
                                    <span className="text-sm font-black text-sky-400">{selectedDebt.newQuantity}x</span>
                                </div>
                                <div className="pt-4 border-t border-slate-800">
                                    <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Previsão Fim</p>
                                    <p className="text-lg font-black text-emerald-400 uppercase">{selectedDebt.endDate}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: REPAYMENT STEPS */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedDebt.isPaid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                    <ArrowRight size={18} />
                                </div>
                                Estratégia: {selectedDebt.isPaid ? 'Quitação Acelerada' : 'Resgate de Controle'}
                            </h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleResetTemplate}
                                    disabled={readOnly}
                                    title="Redefinir Template"
                                    className="p-2 bg-slate-800 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 rounded-xl transition-all"
                                >
                                    <RefreshCw size={16} />
                                </button>
                                <button
                                    onClick={handleAddStep}
                                    disabled={readOnly}
                                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                    <Plus size={16} />
                                    Novo Bloco
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {currentPlan.map((step, sIndex) => (
                                <div key={step.id} className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden group">
                                    <div className="p-5 border-b border-slate-800 bg-slate-950/20 flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="flex flex-col gap-1 print:hidden opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleMoveStep(sIndex, 'up')} disabled={sIndex === 0 || readOnly} className="text-slate-600 hover:text-white"><ChevronUp size={14} /></button>
                                                <button onClick={() => handleMoveStep(sIndex, 'down')} disabled={sIndex === currentPlan.length - 1 || readOnly} className="text-slate-600 hover:text-white"><ChevronDown size={14} /></button>
                                            </div>
                                            <input
                                                type="text"
                                                value={step.title}
                                                onChange={(e) => {
                                                    const newPlan = currentPlan.map(s => s.id === step.id ? { ...s, title: e.target.value } : s);
                                                    updatePlan(newPlan);
                                                }}
                                                readOnly={readOnly}
                                                className="bg-transparent text-lg font-black text-white outline-none focus:text-sky-400 w-full"
                                            />
                                        </div>
                                        <button onClick={() => handleRemoveStep(step.id)} disabled={readOnly} className="text-slate-700 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                                    </div>

                                    <div className="p-6 space-y-4">
                                        {(step.subSteps || []).map(ss => (
                                            <div key={ss.id} className="space-y-4 bg-slate-950/30 p-4 rounded-2xl border border-slate-800/50">
                                                <div className="flex items-start gap-4">
                                                    {ss.type !== 'simple' ? (
                                                        <button
                                                            onClick={() => handleUpdateSubStep(step.id, ss.id, { isChecked: !ss.isChecked })}
                                                            disabled={readOnly}
                                                            className={`mt-1 w-5 h-5 rounded border transition-all flex items-center justify-center ${ss.isChecked ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'bg-slate-900 border-slate-700 text-transparent'}`}
                                                        >
                                                            <CheckCircle2 size={14} />
                                                        </button>
                                                    ) : (
                                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]"></div>
                                                    )}

                                                    <div className="flex-1">
                                                        <input
                                                            type="text"
                                                            value={ss.title}
                                                            onChange={(e) => handleUpdateSubStep(step.id, ss.id, { title: e.target.value })}
                                                            readOnly={readOnly}
                                                            placeholder="Título do item..."
                                                            className={`w-full bg-transparent text-sm font-bold transition-all outline-none focus:text-sky-400 border-b border-transparent focus:border-sky-500/30 pb-0.5 ${ss.status === 'done' ? 'text-emerald-400' : ss.status === 'not_applicable' ? 'text-slate-500 line-through' : 'text-slate-200'}`}
                                                        />

                                                        {/* CONDITIONAL CONTENT */}
                                                        {ss.isChecked && ss.type === 'checkbox' && (
                                                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in slide-in-from-top-2 duration-300">
                                                                <div className="space-y-2">
                                                                    <p className="text-[10px] text-slate-500 uppercase font-black">Valor Mensal</p>
                                                                    <div className="relative">
                                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-600">R$</span>
                                                                        <input
                                                                            type="number"
                                                                            value={ss.monthlyValue || 0}
                                                                            onChange={(e) => handleUpdateSubStep(step.id, ss.id, { monthlyValue: Number(e.target.value) })}
                                                                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 pl-8 text-sm font-black text-white outline-none focus:border-emerald-500"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <p className="text-[10px] text-slate-500 uppercase font-black">Parcelas</p>
                                                                    <input
                                                                        type="number"
                                                                        value={ss.installments || 0}
                                                                        onChange={(e) => handleUpdateSubStep(step.id, ss.id, { installments: Number(e.target.value) })}
                                                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-sm font-black text-white outline-none focus:border-emerald-500"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <p className="text-[10px] text-slate-500 uppercase font-black">Total Acordo</p>
                                                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2 text-sm font-black text-emerald-400 text-center">
                                                                        R$ {((ss.monthlyValue || 0) * (ss.installments || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {ss.isChecked && ss.type === 'conditional_offer' && (
                                                            <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
                                                                <div className="flex items-center gap-6">
                                                                    <p className="text-xs font-black text-slate-400 uppercase">Conseguiu proposta melhor?</p>
                                                                    <div className="flex gap-2">
                                                                        {['Sim', 'Não'].map(opt => (
                                                                            <button
                                                                                key={opt}
                                                                                onClick={() => handleUpdateSubStep(step.id, ss.id, { hasBetterOffer: opt === 'Sim' })}
                                                                                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${ss.hasBetterOffer === (opt === 'Sim') ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-800 text-slate-500 hover:text-white'}`}
                                                                            >
                                                                                {opt}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                {ss.hasBetterOffer && (
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                        <div className="space-y-2">
                                                                            <p className="text-[10px] text-slate-500 uppercase font-black">Novo Valor Mensal</p>
                                                                            <input
                                                                                type="number"
                                                                                value={ss.monthlyValue || 0}
                                                                                onChange={(e) => handleUpdateSubStep(step.id, ss.id, { monthlyValue: Number(e.target.value) })}
                                                                                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-sm font-black text-white outline-none"
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <p className="text-[10px] text-slate-500 uppercase font-black">Novo Parcelamento</p>
                                                                            <input
                                                                                type="number"
                                                                                value={ss.installments || 0}
                                                                                onChange={(e) => handleUpdateSubStep(step.id, ss.id, { installments: Number(e.target.value) })}
                                                                                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-sm font-black text-white outline-none"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                <div className="space-y-2">
                                                                    <p className="text-[10px] text-slate-500 uppercase font-black">Observações Canal Oficial</p>
                                                                    <textarea
                                                                        value={ss.observation || ''}
                                                                        onChange={(e) => handleUpdateSubStep(step.id, ss.id, { observation: e.target.value })}
                                                                        placeholder="O que foi negociado ou qual foi a justificativa para não baixar?"
                                                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-slate-300 outline-none h-20 resize-none"
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}

                                                        {ss.isChecked && ss.type === 'margin_check' && (
                                                            <div className="mt-4 space-y-3 animate-in slide-in-from-top-2 duration-300">
                                                                <p className="text-xs font-black text-purple-400 uppercase italic">Recomendação Estratégica:</p>
                                                                <div className="grid gap-2">
                                                                    {(ss.options || []).map(opt => (
                                                                        <button
                                                                            key={opt}
                                                                            onClick={() => handleUpdateSubStep(step.id, ss.id, { selectedOption: opt })}
                                                                            className={`w-full text-left p-3 rounded-xl border transition-all text-[11px] font-bold ${ss.selectedOption === opt ? 'bg-sky-500/20 border-sky-500/50 text-white' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'}`}
                                                                        >
                                                                            {opt}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <button
                                                        onClick={() => handleRemoveSubStep(step.id, ss.id)}
                                                        className="print:hidden p-1.5 text-slate-700 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>

                                                {/* STATUS SELECTION BARS */}
                                                <div className="flex gap-2 pt-2 border-t border-slate-800/30">
                                                    {[
                                                        { id: 'done', label: 'Feito', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' },
                                                        { id: 'not_applicable', label: 'Não se aplica', color: 'bg-slate-800/50 text-slate-400 border-slate-700 hover:bg-slate-800' }
                                                    ].map(opt => (
                                                        <button
                                                            key={opt.id}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                // If clicking an option, set it and clear the other.
                                                                // If clicking the current option, set to pending.
                                                                const newStatus = ss.status === opt.id ? 'pending' : opt.id as any;

                                                                // Link status to 'isChecked' for items that use it
                                                                const updates: Partial<RepaymentSubStep> = { status: newStatus };
                                                                if (newStatus === 'done') updates.isChecked = true;
                                                                if (newStatus === 'not_applicable') updates.isChecked = false;

                                                                handleUpdateSubStep(step.id, ss.id, updates);
                                                            }}
                                                            disabled={readOnly}
                                                            className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${ss.status === opt.id ? opt.color.replace('text-', 'bg-').split(' ')[0].replace('/10', '') + ' text-white border-transparent' : opt.color}`}
                                                        >
                                                            {opt.id === 'done' && ss.status === 'done' && <CheckCircle2 size={10} className="inline mr-1" />}
                                                            {opt.label}
                                                        </button>
                                                    ))}

                                                    {ss.status && ss.status !== 'pending' && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleUpdateSubStep(step.id, ss.id, { status: 'pending' });
                                                            }}
                                                            className="text-[9px] font-black uppercase text-slate-600 hover:text-slate-400 underline underline-offset-2 ml-auto"
                                                        >
                                                            Limpar status
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => handleAddSubStep(step.id)}
                                            className="w-full py-2 border-2 border-dashed border-slate-800 rounded-2xl text-[10px] font-black text-slate-600 uppercase hover:border-slate-700 hover:text-slate-500 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Plus size={14} />
                                            Adicionar Item a este Bloco
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-center py-6">
                            <div className="bg-slate-950/50 border border-slate-800/50 rounded-2xl px-6 py-3 flex items-center gap-3 text-[11px] font-bold text-slate-600 uppercase tracking-widest italic">
                                <Save size={14} />
                                Salvamento Dinâmico Ativado
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

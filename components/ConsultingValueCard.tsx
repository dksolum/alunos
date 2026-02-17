import React from 'react';
import { TrendingUp, Activity, Target, Scissors, AlertCircle, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { FinancialData, ChecklistData, DebtMapItem } from '../types';

interface ConsultingValueCardProps {
    financialData: FinancialData;
    checklistData: ChecklistData;
    debtMapItems?: DebtMapItem[];
}

export const ConsultingValueCard: React.FC<ConsultingValueCardProps> = ({ financialData, checklistData, debtMapItems = [] }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);

    // 1. Cost of Living Comparison
    // Before: From FinancialData (all income - balance is not cost of living, we want total expenses)
    const calculateTotalExpenses = (): number => {
        const estimated = financialData.estimatedExpenses.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
        const fixed = financialData.fixedExpenses.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
        const creditCards = financialData.creditCard.cards.reduce((acc, curr) => acc + (Number(curr.oneTime) || 0), 0);
        const installments = financialData.creditCard.installments.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
        const debts = financialData.debts.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);

        return estimated + fixed + creditCards + installments + debts;
    };

    const totalBefore = calculateTotalExpenses();

    // After: From Checklist Stage 6, Subitem 3
    const parseLimits = (): number => {
        const subItem = checklistData[6]?.subItems?.[3];
        if (!subItem?.value) return 0;
        try {
            const limits = JSON.parse(subItem.value) as Record<string, any>;
            return Object.values(limits).reduce((acc: number, val: any) => {
                // val is a string like "R$ 500,00" or just "500"
                const numericValue = parseFloat(val.toString().replace('R$', '').replace('.', '').replace(',', '.')) || 0;
                return acc + numericValue;
            }, 0);
        } catch (e) {
            return 0;
        }
    };

    const totalAfter: number = parseLimits();
    const costReduction: number = totalBefore - totalAfter;
    const reductionPercentage: number = totalBefore > 0 ? (costReduction / totalBefore) * 100 : 0;

    // 2. Debt Status
    const getDebtSummary = () => {
        // Use debtMapItems if available, otherwise fallback to financialData (initial diagnosis)
        const originalInstallmentSum = debtMapItems.length > 0
            ? debtMapItems.reduce((acc, curr) => acc + (Number(curr.installmentValue) || 0), 0)
            : financialData.debts.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);

        const negotiationValue = checklistData[11]?.subItems?.[2]?.value;
        let currentInstallmentSum = 0;
        let negotiatedCount = 0;

        // If we have debts in the mapping, we iterate through them
        if (debtMapItems.length > 0) {
            let negotiations: any[] = [];
            try {
                negotiations = negotiationValue ? JSON.parse(negotiationValue) : [];
                if (!Array.isArray(negotiations)) negotiations = [];
            } catch (e) {
                negotiations = [];
            }

            debtMapItems.forEach(debt => {
                const neg = negotiations.find((n: any) => n.debtId === debt.id);
                // Check if value was actually entered (not empty)
                const hasNegotiatedValue = neg && neg.installmentValue !== undefined && neg.installmentValue !== '';
                const negotiatedVal = hasNegotiatedValue ? parseFloat(neg.installmentValue?.replace(/[^\d.,]/g, '').replace(',', '.')) : 0;

                if (hasNegotiatedValue) {
                    currentInstallmentSum += negotiatedVal;
                    negotiatedCount++;
                } else {
                    // IF NO NEGOTIATED VALUE INFORMED, MAINTAIN ORIGINAL
                    currentInstallmentSum += Number(debt.installmentValue) || 0;
                }
            });
        } else {
            // Fallback to old simplified logic if no mapping
            currentInstallmentSum = originalInstallmentSum;
        }

        const statusText = negotiatedCount > 0
            ? `${negotiatedCount} dívida${negotiatedCount > 1 ? 's' : ''} com valores de negociação definidos.`
            : "Nenhuma negociação registrada (mantendo valores originais).";

        return { originalInstallmentSum, currentInstallment: currentInstallmentSum, negotiatedCount, statusText };
    };

    const { originalInstallmentSum, currentInstallment, negotiatedCount, statusText } = getDebtSummary();
    const negotiationStatus = statusText;

    // Estimate impact based on installment reduction
    const installmentImpact = originalInstallmentSum - currentInstallment;
    const debtReductionPercentage = originalInstallmentSum > 0 ? (installmentImpact / originalInstallmentSum) * 100 : 0;

    // 3. Budget Control (Ceilings)
    const hasCeilingsBreached = checklistData[13]?.subItems?.[1]?.checked || false;
    const ceilingComment = checklistData[13]?.subItems?.[1]?.value || "";

    // 4. Cuts & Avoidance
    const getCutsList = () => {
        const p1Cuts = checklistData[5]?.subItems?.[3]?.value || "";
        const p2Cuts = checklistData[14]?.subItems?.[1]?.value || "";

        const allCuts = [];
        if (p1Cuts) allCuts.push(...p1Cuts.split('\n').filter(l => l.trim()));
        if (p2Cuts) allCuts.push(...p2Cuts.split('\n').filter(l => l.trim()));

        return allCuts;
    };

    const cutsList = getCutsList();

    return (
        <div className="bg-slate-900 border border-emerald-500/20 rounded-[2rem] overflow-hidden shadow-2xl shadow-emerald-500/5 transition-all duration-500 hover:border-emerald-500/40">
            {/* Header / Summary Bar */}
            <div className="p-8 pb-6">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">Proposta de Valor da Consultoria</h2>
                            <p className="text-sm text-slate-400 font-medium tracking-tight">Análise Comparativa: Sua Evolução Financeira</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase text-emerald-500/60 tracking-widest mb-1">Impacto Estimado (Mês)</span>
                        <div className="bg-emerald-500/10 px-4 py-2 rounded-xl text-emerald-400 font-black text-lg">
                            {costReduction + installmentImpact > 0 ? `R$ ${(costReduction + installmentImpact).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Em processamento'}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Cost of Living Card */}
                    <div className="p-5 bg-slate-800/40 border border-slate-700/50 rounded-[1.5rem] flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-sky-400">
                            <Target size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Custo de Vida</span>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between items-end">
                                <span className="text-[9px] font-bold text-slate-500 uppercase">Antes</span>
                                <span className={`text-sm font-bold text-slate-300 ${totalAfter > 0 && totalAfter < totalBefore ? 'text-line-through decoration-slate-600/50' : ''}`}>R$ {totalBefore.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between items-end pt-1 border-t border-slate-700/50">
                                <span className="text-[9px] font-black text-emerald-400 uppercase">Depois</span>
                                <div className="relative">
                                    {totalAfter > 0 && totalAfter < totalBefore && <div className="absolute -inset-2 bg-emerald-500/10 blur-xl rounded-full animate-pulse" />}
                                    <span className="text-lg font-black text-white relative">R$ {totalAfter > 0 ? totalAfter.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '---'}</span>
                                </div>
                            </div>
                        </div>
                        {reductionPercentage > 0 && (
                            <div className="mt-1 flex items-center gap-1.5 text-[9px] font-black text-emerald-400 uppercase">
                                <Activity size={10} /> Redução de {reductionPercentage.toFixed(1)}% no padrão
                            </div>
                        )}
                    </div>

                    {/* Debt Card */}
                    <div className="p-5 bg-slate-800/40 border border-slate-700/50 rounded-[1.5rem] flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-indigo-400">
                            <Activity size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Passivo sob Controle</span>
                        </div>
                        <div className="space-y-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-bold text-slate-500 uppercase">Parcela Mensal (Total)</span>
                                <div className="flex justify-between items-baseline">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-slate-500 uppercase">Antes</span>
                                        <span className="text-sm font-bold text-slate-400 text-line-through decoration-slate-600/50">R$ {originalInstallmentSum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="text-slate-600">→</div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[9px] font-black text-indigo-400 uppercase">Depois</span>
                                        <div className="relative">
                                            {installmentImpact > 0 && <div className="absolute -inset-2 bg-emerald-500/10 blur-xl rounded-full animate-pulse" />}
                                            <span className="text-lg font-black text-white relative">R$ {currentInstallment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {debtReductionPercentage > 0 && (
                            <div className="mt-1 flex items-center gap-1.5 text-[9px] font-black text-emerald-400 uppercase bg-emerald-500/5 border border-emerald-500/10 p-2 rounded-lg">
                                <CheckCircle2 size={10} /> Impacto de {debtReductionPercentage.toFixed(1)}% na vida
                            </div>
                        )}
                        <div className="mt-auto px-2 py-1 bg-indigo-500/5 border border-indigo-500/10 rounded-lg">
                            <p className="text-[8px] text-indigo-400 font-bold leading-tight line-clamp-2 uppercase italic text-center">
                                {negotiationStatus}
                            </p>
                        </div>
                    </div>

                    {/* Budget Control Card */}
                    <div className="p-5 bg-slate-800/40 border border-slate-700/50 rounded-[1.5rem] flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-amber-400">
                            <CheckCircle2 size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Controle de Fluxo</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${hasCeilingsBreached ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
                                <span className={`text-[10px] font-black uppercase ${hasCeilingsBreached ? 'text-amber-400' : 'text-emerald-400'}`}>
                                    {hasCeilingsBreached ? 'Tetos Extrapolados' : 'Orçamento em Dia'}
                                </span>
                            </div>
                            <p className="text-[9px] text-slate-400 font-medium leading-relaxed line-clamp-2">
                                {hasCeilingsBreached ? ceilingComment : "Parabéns! Você manteve o controle sobre todos os limites estabelecidos no primeiro mês."}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-center">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 hover:text-emerald-400 transition-colors"
                    >
                        {isExpanded ? 'Esconder Detalhes' : 'Ver Todos os Cortes Identificados'}
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                </div>
            </div>

            {/* Expanded Content: Cuts & Avoidance */}
            {isExpanded && (
                <div className="p-8 pt-2 border-t border-slate-800 bg-slate-900/50 animate-in slide-in-from-top duration-300">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 py-4">
                            <Scissors size={18} className="text-emerald-400" />
                            <h3 className="text-xs font-black text-white uppercase tracking-widest">Lista de Cortes e Substituições</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {cutsList.length > 0 ? cutsList.map((cut, idx) => (
                                <div key={idx} className="flex gap-3 p-4 bg-slate-800/30 border border-slate-700/50 rounded-2xl group hover:border-emerald-500/20 transition-all">
                                    <div className="w-5 h-5 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                                        <CheckCircle2 size={12} />
                                    </div>
                                    <span className="text-xs text-slate-300 font-medium leading-relaxed">{cut}</span>
                                </div>
                            )) : (
                                <div className="col-span-2 text-center py-6 text-slate-500 italic text-sm border border-dashed border-slate-800 rounded-2xl">
                                    Nenhum corte específico registrado. Continue focado no orçamento planejado.
                                </div>
                            )}
                        </div>

                        <div className="bg-amber-500/5 border border-amber-500/10 p-5 rounded-2xl flex gap-4">
                            <AlertCircle size={20} className="text-amber-500 shrink-0 mt-1" />
                            <div className="space-y-1">
                                <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Observação Consultoria</h4>
                                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                                    Esta análise é baseada nas suas respostas do checklist e no seu diagnóstico inicial.
                                    A economia real depende exclusivamente da execução diária do que foi planejado.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

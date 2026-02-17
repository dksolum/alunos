import React from 'react';
import { TrendingUp, Activity, Target, Scissors, AlertCircle, ChevronDown, ChevronUp, CheckCircle2, Printer } from 'lucide-react';
import { FinancialData, ChecklistData, DebtMapItem, User } from '../types';
import { PrintHeader } from './Mentorship/Meeting1/PrintHeader';
import { PrintPortal } from './PrintPortal';

interface ConsultingValueCardProps {
    financialData: FinancialData;
    checklistData: ChecklistData;
    debtMapItems?: DebtMapItem[];
    user: User;
}

export const ConsultingValueCard: React.FC<ConsultingValueCardProps> = ({ financialData, checklistData, debtMapItems = [], user }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [isPrinting, setIsPrinting] = React.useState(false);

    const handlePrint = () => {
        setIsPrinting(true);
        setTimeout(() => {
            window.print();
            setIsPrinting(false);
        }, 100);
    };

    // 1. Cost of Living Comparison
    // ... (logic remains same)
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
        const originalInstallmentSum = debtMapItems.length > 0
            ? debtMapItems.reduce((acc, curr) => acc + (Number(curr.installmentValue) || 0), 0)
            : financialData.debts.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);

        const negotiationValue = checklistData[11]?.subItems?.[2]?.value;
        let currentInstallmentSum = 0;
        let negotiatedCount = 0;

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
                const hasNegotiatedValue = neg && neg.installmentValue !== undefined && neg.installmentValue !== '';
                const negotiatedVal = hasNegotiatedValue ? parseFloat(neg.installmentValue?.replace(/[^\d.,]/g, '').replace(',', '.')) : 0;

                if (hasNegotiatedValue) {
                    currentInstallmentSum += negotiatedVal;
                    negotiatedCount++;
                } else {
                    currentInstallmentSum += Number(debt.installmentValue) || 0;
                }
            });
        } else {
            currentInstallmentSum = originalInstallmentSum;
        }

        const statusText = negotiatedCount > 0
            ? `${negotiatedCount} dívida${negotiatedCount > 1 ? 's' : ''} com valores de negociação definidos.`
            : "Nenhuma negociação registrada (mantendo valores originais).";

        return { originalInstallmentSum, currentInstallment: currentInstallmentSum, negotiatedCount, statusText };
    };

    const { originalInstallmentSum, currentInstallment, negotiatedCount, statusText } = getDebtSummary();
    const negotiationStatus = statusText;
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

    const renderContent = (isPrint = false) => (
        <div className={`${isPrint ? 'bg-white text-black p-0' : 'bg-slate-900 text-slate-200 border border-emerald-500/20 rounded-[2rem] overflow-hidden shadow-2xl shadow-emerald-500/5 transition-all duration-500 hover:border-emerald-500/40'}`}>
            {/* Header / Summary Bar */}
            <div className={`${isPrint ? 'p-0 mb-8' : 'p-8 pb-6'}`}>
                <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isPrint ? 'bg-gray-100 text-gray-900 border' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <h2 className={`text-xl font-black uppercase tracking-tight ${isPrint ? 'text-black' : 'text-white'}`}>Proposta de Valor da Consultoria</h2>
                            <p className={`text-sm font-medium tracking-tight ${isPrint ? 'text-gray-600' : 'text-slate-400'}`}>Análise Comparativa: Sua Evolução Financeira</p>
                        </div>
                    </div>
                    {!isPrint && (
                        <button
                            onClick={handlePrint}
                            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700/50"
                            title="Imprimir Card"
                        >
                            <Printer size={20} />
                        </button>
                    )}
                    <div className="flex flex-col items-end shrink-0 ml-4">
                        <span className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isPrint ? 'text-gray-500' : 'text-emerald-500/60'}`}>Impacto Estimado (Mês)</span>
                        <div className={`px-4 py-2 rounded-xl font-black text-lg ${isPrint ? 'bg-gray-100 text-black border' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            {costReduction + installmentImpact > 0 ? `R$ ${(costReduction + installmentImpact).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Em processamento'}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Cost of Living Card */}
                    <div className={`p-5 rounded-[1.5rem] flex flex-col gap-3 ${isPrint ? 'bg-white border-2 border-gray-200' : 'bg-slate-800/40 border border-slate-700/50'}`}>
                        <div className={`flex items-center gap-2 ${isPrint ? 'text-gray-900' : 'text-sky-400'}`}>
                            <Target size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Custo de Vida</span>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between items-end">
                                <span className={`text-[9px] font-bold uppercase ${isPrint ? 'text-gray-500' : 'text-slate-500'}`}>Antes</span>
                                <span className={`text-sm font-bold ${isPrint ? 'text-gray-700' : 'text-slate-300'} ${totalAfter > 0 && totalAfter < totalBefore ? 'text-line-through decoration-slate-600/50' : ''}`}>R$ {totalBefore.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className={`flex justify-between items-end pt-1 border-t ${isPrint ? 'border-gray-100' : 'border-slate-700/50'}`}>
                                <span className={`text-[9px] font-black uppercase ${isPrint ? 'text-black' : 'text-emerald-400'}`}>Depois</span>
                                <span className={`text-lg font-black ${isPrint ? 'text-black' : 'text-white'}`}>R$ {totalAfter > 0 ? totalAfter.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '---'}</span>
                            </div>
                        </div>
                        {reductionPercentage > 0 && (
                            <div className={`mt-1 flex items-center gap-1.5 text-[9px] font-black uppercase ${isPrint ? 'text-gray-700' : 'text-emerald-400'}`}>
                                <Activity size={10} /> Redução de {reductionPercentage.toFixed(1)}% no padrão
                            </div>
                        )}
                    </div>

                    {/* Debt Card */}
                    <div className={`p-5 rounded-[1.5rem] flex flex-col gap-3 ${isPrint ? 'bg-white border-2 border-gray-200' : 'bg-slate-800/40 border border-slate-700/50'}`}>
                        <div className={`flex items-center gap-2 ${isPrint ? 'text-gray-900' : 'text-indigo-400'}`}>
                            <Activity size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Passivo sob Controle</span>
                        </div>
                        <div className="space-y-4">
                            <div className="flex flex-col gap-1">
                                <span className={`text-[9px] font-bold uppercase ${isPrint ? 'text-gray-500' : 'text-slate-500'}`}>Parcela Mensal (Total)</span>
                                <div className="flex justify-between items-baseline">
                                    <div className="flex flex-col">
                                        <span className={`text-[9px] font-black uppercase ${isPrint ? 'text-gray-400' : 'text-slate-500'}`}>Antes</span>
                                        <span className={`text-sm font-bold text-line-through decoration-slate-600/50 ${isPrint ? 'text-gray-500' : 'text-slate-400'}`}>R$ {originalInstallmentSum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="text-slate-600">→</div>
                                    <div className="flex flex-col items-end">
                                        <span className={`text-[9px] font-black uppercase ${isPrint ? 'text-black' : 'text-indigo-400'}`}>Depois</span>
                                        <span className={`text-lg font-black ${isPrint ? 'text-black' : 'text-white'}`}>R$ {currentInstallment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {debtReductionPercentage > 0 && (
                            <div className={`mt-1 flex items-center gap-1.5 text-[9px] font-black uppercase p-2 rounded-lg ${isPrint ? 'bg-gray-100 border border-gray-200 text-black' : 'bg-emerald-500/5 border border-emerald-500/10 text-emerald-400'}`}>
                                <CheckCircle2 size={10} /> Impacto de {debtReductionPercentage.toFixed(1)}% na vida
                            </div>
                        )}
                        <div className={`mt-auto px-2 py-1 rounded-lg ${isPrint ? 'bg-gray-50 border border-gray-100' : 'bg-indigo-500/5 border border-indigo-500/10'}`}>
                            <p className={`text-[8px] font-bold leading-tight uppercase italic text-center ${isPrint ? 'text-gray-500' : 'text-indigo-400'}`}>
                                {negotiationStatus}
                            </p>
                        </div>
                    </div>

                    {/* Budget Control Card */}
                    <div className={`p-5 rounded-[1.5rem] flex flex-col gap-3 ${isPrint ? 'bg-white border-2 border-gray-200' : 'bg-slate-800/40 border border-slate-700/50'}`}>
                        <div className={`flex items-center gap-2 ${isPrint ? 'text-gray-900' : 'text-amber-400'}`}>
                            <CheckCircle2 size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Controle de Fluxo</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${hasCeilingsBreached ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                <span className={`text-[10px] font-black uppercase ${hasCeilingsBreached ? (isPrint ? 'text-amber-600' : 'text-amber-400') : (isPrint ? 'text-emerald-600' : 'text-emerald-400')}`}>
                                    {hasCeilingsBreached ? 'Tetos Extrapolados' : 'Orçamento em Dia'}
                                </span>
                            </div>
                            <p className={`text-[9px] font-medium leading-relaxed ${isPrint ? 'text-gray-700' : 'text-slate-400'}`}>
                                {hasCeilingsBreached ? ceilingComment : "Parabéns! Você manteve o controle sobre todos os limites estabelecidos no primeiro mês."}
                            </p>
                        </div>
                    </div>
                </div>

                {!isPrint && (
                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 hover:text-emerald-400 transition-colors"
                        >
                            {isExpanded ? 'Esconder Detalhes' : 'Ver Todos os Cortes Identificados'}
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                    </div>
                )}
            </div>

            {/* Expanded Content: Cuts & Avoidance */}
            {(isExpanded || isPrint) && (
                <div className={`${isPrint ? 'p-0 mt-8' : 'p-8 pt-2 border-t border-slate-800 bg-slate-900/50'}`}>
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 py-4">
                            <Scissors size={18} className={isPrint ? 'text-black' : 'text-emerald-400'} />
                            <h3 className={`text-xs font-black uppercase tracking-widest ${isPrint ? 'text-black' : 'text-white'}`}>Lista de Cortes e Substituições</h3>
                        </div>

                        <div className={`grid grid-cols-1 ${isPrint ? 'grid-cols-1' : 'md:grid-cols-2'} gap-3`}>
                            {cutsList.length > 0 ? cutsList.map((cut, idx) => (
                                <div key={idx} className={`flex gap-3 p-4 rounded-2xl ${isPrint ? 'bg-white border-2 border-gray-100' : 'bg-slate-800/30 border border-slate-700/50'}`}>
                                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${isPrint ? 'bg-gray-100 text-black' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                        <CheckCircle2 size={12} />
                                    </div>
                                    <span className={`text-xs font-medium leading-relaxed ${isPrint ? 'text-gray-800' : 'text-slate-300'}`}>{cut}</span>
                                </div>
                            )) : (
                                <div className={`col-span-2 text-center py-6 italic text-sm border-dashed rounded-2xl ${isPrint ? 'border-2 border-gray-200 text-gray-400' : 'border border-slate-800 text-slate-500'}`}>
                                    Nenhum corte específico registrado. Continue focado no orçamento planejado.
                                </div>
                            )}
                        </div>

                        <div className={`p-5 rounded-2xl flex gap-4 ${isPrint ? 'bg-white border-2 border-amber-100' : 'bg-amber-500/5 border border-amber-500/10'}`}>
                            <AlertCircle size={20} className="text-amber-500 shrink-0 mt-1" />
                            <div className="space-y-1">
                                <h4 className={`text-[10px] font-black uppercase tracking-widest ${isPrint ? 'text-amber-600' : 'text-amber-500'}`}>Observação Consultoria</h4>
                                <p className={`text-[11px] leading-relaxed font-medium ${isPrint ? 'text-gray-700' : 'text-slate-400'}`}>
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

    return (
        <>
            {renderContent(false)}

            {isPrinting && (
                <PrintPortal>
                    <div className="p-8">
                        <PrintHeader user={user} title="Proposta de Valor da Consultoria" />
                        {renderContent(true)}
                    </div>
                </PrintPortal>
            )}
        </>
    );
};

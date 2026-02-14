import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Circle, ChevronDown, ChevronUp, AlertCircle, Clock, Target, ListChecks, ShieldCheck } from 'lucide-react';
import { ChecklistData, FinancialData } from '../types';

interface ChecklistModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialProgress?: number[];
    initialData?: ChecklistData;
    onSave?: (progress: number[], data: ChecklistData) => Promise<void>;
    readOnly?: boolean;
    financialData?: FinancialData;
    phase?: 'LOCKED' | 'PHASE_1' | 'PHASE_2';
}

interface SubItemConfig {
    id: number;
    text: string;
    conditionalInput?: {
        trigger: 'unchecked' | 'checked'; // When to show input
        label: string;
        placeholder?: string;
    };
    info?: { // Informational text on check
        trigger: 'checked';
        text: string;
    };
}

interface StepConfig {
    id: number;
    title: string;
    description: string;
    subItems?: SubItemConfig[];
}

const PHASE1_STEPS: StepConfig[] = [
    { id: 1, title: "Grupo no WhatsApp", description: "Acompanhamento individual, tirar dúvidas e envio de informações relevantes para o seu financeiro." },
    { id: 2, title: "Envio do acesso ao sistema Solum", description: "Gerenciamento de todas as informações financeiras registradas." },
    { id: 3, title: "Preenchimento do diagnóstico inicial", description: "Base para estruturação do plano de ataque." },
    {
        id: 4,
        title: "Sangria de Dívidas",
        description: "Estancar o sangramento para retornar o combate.",
        subItems: [
            {
                id: 1,
                text: "Estão em dia?",
                conditionalInput: {
                    trigger: 'unchecked',
                    label: "Quais não estão em dia?",
                    placeholder: "Liste as dívidas em atraso..."
                }
            },
            {
                id: 2,
                text: "As parcelas estão cabendo no orçamento sem dificuldade?",
                conditionalInput: {
                    trigger: 'unchecked',
                    label: "Plano de Ação Inicial",
                    placeholder: "É necessário diminuir o valor das parcelas inicialmente..."
                },
                info: {
                    trigger: 'checked',
                    text: "Ótimo! Manter o pagamento em dia é prioridade."
                }
            }
        ]
    },
    {
        id: 5,
        title: "Plano de Ataque",
        description: "Definir gastos necessários e prioridades.",
        subItems: [
            {
                id: 1,
                text: "Está sobrando?",
                info: { trigger: 'checked', text: "Informe o valor que está sobrando:" },
                conditionalInput: { trigger: 'checked', label: "Valor Sobrando", placeholder: "R$ 0,00" }
            },
            {
                id: 2,
                text: "Verificar quais categorias possuem os maiores valores.",
                conditionalInput: { trigger: 'checked', label: "Por que esses valores estão altos?", placeholder: "Explique o motivo..." }
            },
            {
                id: 3,
                text: "Quais gastos desnecessários podem ser diminuídos?",
                conditionalInput: { trigger: 'checked', label: "Quais gastos?", placeholder: "Esses gastos precisam ser evitados..." }
            }
        ]
    },
    {
        id: 6,
        title: "Ação no Objetivo",
        description: "Seguir o planejamento sem baixas e sem desistências.",
        subItems: [
            { id: 1, text: "Criar carteiras na Solum" },
            { id: 2, text: "Cadastrar as dívidas na Solum" },
            { id: 3, text: "Criar gastos e definir os limites na Solum" },
            { id: 4, text: "Deixar o orçamento com valor sobrando" }
        ]
    },
    {
        id: 7,
        title: "Blindagem",
        description: "Estrutura simples para manter a ordem e o progresso.",
        subItems: [
            {
                id: 1,
                text: "Centralizar banco principal",
                info: { trigger: 'checked', text: "Use 1 conta corrente central para criar relacionamento." }
            },
            {
                id: 2,
                text: "Uso de até 2 cartões",
                info: { trigger: 'checked', text: "Um à vista e outro a prazo, se necessário." }
            }
        ]
    },
    {
        id: 8,
        title: "Suprimentos",
        description: "Construção das reservas para eventualidades.",
        subItems: [
            {
                id: 1,
                text: "Reserva Quebra-Galho",
                info: { trigger: 'checked', text: "Para coisas simples do dia a dia." }
            },
            {
                id: 2,
                text: "Reserva Colchão de Segurança",
                info: { trigger: 'checked', text: "Meta: 3 a 6 meses do custo mensal (construção gradual)." }
            }
        ]
    },
    {
        id: 9,
        title: "Dúvidas",
        description: "Tirar dúvidas e esclarecer o caminho.",
        subItems: [
            {
                id: 1,
                text: "Dúvidas ou Observações",
                conditionalInput: { trigger: 'checked', label: "Descreva suas dúvidas:", placeholder: "Escreva aqui..." }
            }
        ]
    }
];

const PHASE2_STEPS: StepConfig[] = [
    {
        id: 11,
        title: "Negociação com Credores",
        description: "Fase ativa de contato e renegociação para redução de juros e parcelas.",
        subItems: [
            {
                id: 1,
                text: "Entrou em contato com todos os credores?",
                info: { trigger: 'checked', text: "Mantenha o registro de todos os protocolos." }
            },
            {
                id: 2,
                text: "Conseguiu reduzir juros ou parcelas?",
                conditionalInput: { trigger: 'checked', label: "Resumo das conquistas", placeholder: "Descreva o que foi negociado..." },
                info: { trigger: 'checked', text: "Parabéns! Cada redução conta." }
            }
        ]
    },
    {
        id: 12,
        title: "Reconciliação Financeira",
        description: "Rotina de acompanhamento para não perder o controle.",
        subItems: [
            { id: 1, text: "Revisão diária do extrato bancário" },
            { id: 2, text: "Ajuste de categorias na Solum conforme gastos reais" }
        ]
    },
    {
        id: 13,
        title: "Monitoramento de Tetos",
        description: "Acompanhamento rigoroso dos limites estabelecidos.",
        subItems: [
            {
                id: 1,
                text: "Você estourou algum teto este mês?",
                conditionalInput: { trigger: 'checked', label: "Quais categorias e por quê?", placeholder: "Ex: Alimentação estourou devido a imprevisto..." },
                info: { trigger: 'checked', text: "Identifique a causa raiz para evitar recorrência." }
            }
        ]
    },
    {
        id: 14,
        title: "Lista de Cortes e O que Evitar",
        description: "Refinamento contínuo para otimizar o orçamento.",
        subItems: [
            {
                id: 1,
                text: "Identificou novos cortes possíveis?",
                conditionalInput: { trigger: 'checked', label: "O que pode ser cortado?", placeholder: "Ex: Assinatura de streaming não utilizada..." }
            }
        ]
    }
];

export const ChecklistModal: React.FC<ChecklistModalProps> = ({
    isOpen,
    onClose,
    initialProgress = [],
    initialData = {},
    onSave,
    readOnly = true,
    financialData,
    phase = 'PHASE_1'
}) => {
    // Tab state for Phase 2 users
    const [activeTab, setActiveTab] = useState<'phase1' | 'phase2'>('phase1');

    // Flattened progress for the main steps (backward compatibility + visual progress)
    const [completedSteps, setCompletedSteps] = useState<number[]>(initialProgress);
    // Detailed data for sub-items and inputs
    const [checklistData, setChecklistData] = useState<ChecklistData>(initialData);

    const [expandedSteps, setExpandedSteps] = useState<number[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Sync state with props when modal opens
    useEffect(() => {
        if (isOpen) {
            setCompletedSteps(initialProgress);
            setChecklistData(initialData || {});

            // Set initial tab based on phase
            if (phase === 'PHASE_2') {
                setActiveTab('phase2');
            } else {
                setActiveTab('phase1');
            }
        }
    }, [isOpen, phase]); // Removed initialData/initialProgress from deps to prevent re-render clobbering

    // Auto-save debounce effect for text
    useEffect(() => {
        if (readOnly) return;
        const timer = setTimeout(() => {
            if (onSave) {
                handleSave(completedSteps, checklistData);
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [checklistData]);

    const stepsToRender = activeTab === 'phase2' ? PHASE2_STEPS : PHASE1_STEPS;
    // Calculate total progress across ALL steps? Or just current phase?
    // User progress array contains IDs from both phases. So showing phase-specific progress might be cleaner visually,
    // but overall progress is also useful. Let's show visible steps progress.

    const visibleStepIds = stepsToRender.map(s => s.id);
    const visibleCompleted = completedSteps.filter(id => visibleStepIds.includes(id)).length;
    const progress = Math.round((visibleCompleted / stepsToRender.length) * 100);

    const toggleStep = async (id: number) => {
        const step = stepsToRender.find(s => s.id === id);
        const hasSubItems = step && step.subItems && step.subItems.length > 0;

        // In read-only mode, only allow expanding/collapsing sub-items
        if (readOnly && !hasSubItems) return;

        // Se tem sub-itens, toggle apenas expande/colapsa
        if (hasSubItems) {
            setExpandedSteps(prev =>
                prev.includes(id) ? prev.filter(stepId => stepId !== id) : [...prev, id]
            );
            return;
        }

        // Se não tem sub-itens e NÃO é readOnly, funciona como check normal
        if (readOnly) return;

        const newProgress = completedSteps.includes(id)
            ? completedSteps.filter(s => s !== id)
            : [...completedSteps, id];

        setCompletedSteps(newProgress);
        handleSave(newProgress, checklistData);
    };

    const toggleSubItem = (stepId: number, subItemId: number) => {
        if (readOnly) return;

        const currentData = { ...checklistData };
        const stepData = currentData[stepId] || { subItems: {} };
        const subItems = stepData.subItems || {};
        const isChecked = subItems[subItemId]?.checked || false;

        // Update local state deep copy
        currentData[stepId] = {
            ...stepData,
            subItems: {
                ...subItems,
                [subItemId]: {
                    ...subItems[subItemId],
                    checked: !isChecked
                }
            }
        };

        setChecklistData(currentData);

        // Check if all sub-items are checked to complete the main step
        const stepConfig = stepsToRender.find(s => s.id === stepId);
        if (stepConfig && stepConfig.subItems) {
            const allChecked = stepConfig.subItems.every(sub => {
                // If this is the one we just toggled, use new value
                if (sub.id === subItemId) return !isChecked;
                // Otherwise check existing data
                return currentData[stepId]?.subItems?.[sub.id]?.checked;
            });

            let newProgress = completedSteps;
            if (allChecked && !completedSteps.includes(stepId)) {
                newProgress = [...completedSteps, stepId];
            } else if (!allChecked && completedSteps.includes(stepId)) {
                newProgress = completedSteps.filter(id => id !== stepId);
            }

            if (newProgress !== completedSteps) {
                setCompletedSteps(newProgress);
            }

            // Pass the updated progress to save along with data
            handleSave(newProgress, currentData);
        } else {
            handleSave(completedSteps, currentData);
        }
    };

    const handleInputChange = (stepId: number, subItemId: number, value: string) => {
        if (readOnly) return;

        const currentData = { ...checklistData };
        const stepData = currentData[stepId] || { subItems: {} };
        const subItems = stepData.subItems || {};

        currentData[stepId] = {
            ...stepData,
            subItems: {
                ...subItems,
                [subItemId]: {
                    ...subItems[subItemId],
                    value: value
                }
            }
        };

        setChecklistData(currentData);
        // Debounce handled by useEffect
    };

    const getStepStatus = (stepId: number): 'pending' | 'in_progress' | 'completed' => {
        if (completedSteps.includes(stepId)) return 'completed';

        const stepData = checklistData[stepId];
        if (!stepData) return 'pending';

        // Check if there is any data (checked sub-items or text values)
        const subItemsRaw = stepData.subItems ? Object.values(stepData.subItems) : [];
        const hasCheckedItems = subItemsRaw.some((s: any) => s.checked);
        const hasTextValues = subItemsRaw.some((s: any) => s.value && s.value.trim() !== '');

        if (hasCheckedItems || hasTextValues) return 'in_progress';

        return 'pending';
    };

    const handleSave = async (progress: number[], data: ChecklistData) => {
        if (onSave) {
            setIsSaving(true);
            try {
                await onSave(progress, data);
            } catch (error) {
                console.error("Failed to save progress", error);
            } finally {
                setIsSaving(false);
            }
        }
    };

    const handleClose = () => {
        if (!readOnly && onSave) {
            handleSave(completedSteps, checklistData);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#0f172a] border border-slate-700 w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-800 bg-rose-500/10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1">
                            <h2 className="text-xl font-black text-rose-500 uppercase tracking-tight flex items-center gap-2">
                                Checklist Destruidor de Sanhaço
                                {readOnly && <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700 ml-2">Modo Leitura</span>}
                            </h2>
                            <p className="text-xs text-rose-300/80 font-medium">
                                Seu guia de sobrevivência para sair do caos financeiro.
                            </p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 bg-slate-800/50 hover:bg-slate-800 text-rose-400 rounded-xl transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Tabs - Only show if user has access to PHASE_2 */}
                    {(phase === 'PHASE_2' || (readOnly && phase === 'PHASE_2')) && (
                        <div className="flex p-1 bg-slate-900/50 rounded-xl border border-slate-700/50">
                            <button
                                onClick={() => setActiveTab('phase1')}
                                className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-2 ${activeTab === 'phase1'
                                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    }`}
                            >
                                <ListChecks size={14} />
                                Fase 1: Diagnóstico
                            </button>
                            <button
                                onClick={() => setActiveTab('phase2')}
                                className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-2 ${activeTab === 'phase2'
                                    ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    }`}
                            >
                                <Target size={14} />
                                Fase 2: Retorno
                            </button>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-4 custom-scrollbar">
                    <p className="text-sm text-slate-400 mb-6 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                        <strong className={`${activeTab === 'phase2' ? 'text-amber-400' : 'text-rose-400'} uppercase text-xs block mb-1`}>
                            {activeTab === 'phase2' ? 'Fase de Retorno' : 'Fase de Diagnóstico'}
                        </strong>
                        {activeTab === 'phase2'
                            ? "Agora é hora de verificar a execução do plano, se negociou dívidas e garantiu que o orçamento fosse cumprido de acordo com a necessidade."
                            : "Este checklist não é um passeio no parque. É um plano de guerra. Marque cada etapa conforme você conquista o território."
                        }
                    </p>

                    <div className="space-y-3">
                        {stepsToRender.map((step) => {
                            const status = getStepStatus(step.id);
                            const isCompleted = status === 'completed';
                            const isInProgress = status === 'in_progress';
                            const hasSubItems = step.subItems && step.subItems.length > 0;
                            const isExpanded = expandedSteps.includes(step.id);

                            return (
                                <div key={step.id} className="flex flex-col gap-2">
                                    <div
                                        onClick={() => toggleStep(step.id)}
                                        className={`
                                                group p-4 rounded-2xl border transition-all duration-300 flex items-start gap-4 select-none
                                                ${!readOnly || hasSubItems ? 'cursor-pointer' : 'cursor-default'}
                                                ${isCompleted
                                                ? 'bg-emerald-500/5 border-emerald-500/20 ' + (readOnly ? '' : 'hover:bg-emerald-500/10')
                                                : isInProgress
                                                    ? 'bg-amber-500/5 border-amber-500/20 ' + (readOnly ? '' : 'hover:bg-amber-500/10')
                                                    : 'bg-slate-800/30 border-slate-700/50 ' + (readOnly ? '' : 'hover:border-rose-500/30 hover:bg-slate-800/60')
                                            }
                                            `}
                                    >
                                        <div className={`mt-1 shrink-0 transition-colors ${isCompleted ? 'text-emerald-500' :
                                            isInProgress ? 'text-amber-500' :
                                                'text-slate-600 ' + (readOnly ? '' : 'group-hover:text-rose-500')
                                            }`}>
                                            {isCompleted ? <CheckCircle2 size={24} className="fill-emerald-500/10" /> :
                                                isInProgress ? <Clock size={24} className="fill-amber-500/10" /> :
                                                    <Circle size={24} />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center">
                                                <h3 className={`text-sm font-bold uppercase tracking-wide mb-1 transition-colors ${isCompleted ? 'text-emerald-400 line-through decoration-emerald-500/50' :
                                                    isInProgress ? 'text-amber-400' :
                                                        'text-slate-200 ' + (readOnly ? '' : 'group-hover:text-white')
                                                    }`}>
                                                    {step.id}. {step.title}
                                                </h3>
                                                {hasSubItems && (
                                                    <div className="text-slate-600">
                                                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                    </div>
                                                )}
                                            </div>
                                            <p className={`text-xs font-medium leading-relaxed transition-colors ${isCompleted ? 'text-emerald-500/60' :
                                                isInProgress ? 'text-amber-500/60' :
                                                    'text-slate-500 ' + (readOnly ? '' : 'group-hover:text-slate-400')
                                                }`}>
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Sub-items Render */}
                                    {hasSubItems && isExpanded && (
                                        <div className="ml-8 pl-4 border-l-2 border-slate-800 space-y-3 animate-in slide-in-from-top-2 duration-200">
                                            {step.subItems?.map(sub => {
                                                const subData = checklistData[step.id]?.subItems?.[sub.id];
                                                const isSubChecked = subData?.checked || false;
                                                const subValue = subData?.value || '';

                                                const showInput = sub.conditionalInput && (
                                                    (sub.conditionalInput.trigger === 'checked' && isSubChecked) ||
                                                    (sub.conditionalInput.trigger === 'unchecked' && !isSubChecked)
                                                );

                                                const showInfo = sub.info && (
                                                    (sub.info.trigger === 'checked' && isSubChecked)
                                                );

                                                return (
                                                    <div key={sub.id} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50 space-y-3">
                                                        <div className="flex items-start gap-3 cursor-pointer" onClick={() => toggleSubItem(step.id, sub.id)}>
                                                            <div className={`mt-0.5 shrink-0 ${isSubChecked ? 'text-emerald-500' : 'text-slate-600'}`}>
                                                                {isSubChecked ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                                                            </div>
                                                            <span className={`text-xs font-medium ${isSubChecked ? 'text-slate-300' : 'text-slate-400'}`}>
                                                                {sub.text}
                                                            </span>
                                                        </div>

                                                        {showInfo && (
                                                            <div className="ml-7 text-[10px] text-amber-400 bg-amber-500/10 p-2 rounded border border-amber-500/20 flex gap-2">
                                                                <AlertCircle size={12} className="shrink-0 mt-0.5" />
                                                                {sub.info?.text}
                                                            </div>
                                                        )}

                                                        {showInput && (
                                                            <div className="ml-7 space-y-1">
                                                                {sub.conditionalInput?.label && (
                                                                    <label className="text-[10px] uppercase font-bold text-slate-500 block">
                                                                        {sub.conditionalInput.label}
                                                                    </label>
                                                                )}
                                                                <textarea
                                                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:border-rose-500 focus:outline-none resize-none"
                                                                    rows={2}
                                                                    placeholder={sub.conditionalInput?.placeholder}
                                                                    value={subValue}
                                                                    onChange={(e) => handleInputChange(step.id, sub.id, e.target.value)}
                                                                    disabled={readOnly}
                                                                />
                                                            </div>
                                                        )}

                                                        {/* Specific Logic for Expense Limits (Phase 1, Step 6, Subitem 3) */}
                                                        {step.id === 6 && sub.id === 3 && isSubChecked && financialData && activeTab === 'phase1' && (
                                                            <div className="ml-7 space-y-3 animate-in slide-in-from-top-2">
                                                                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 space-y-3">
                                                                    <div className="flex items-center gap-2 text-sky-400 pb-2 border-b border-slate-700/50">
                                                                        <Target size={14} />
                                                                        <span className="text-[10px] font-bold uppercase tracking-wide">Definir Limites Mensais</span>
                                                                    </div>
                                                                    <div className="grid grid-cols-1 gap-3">
                                                                        {financialData.estimatedExpenses.filter(e => Number(e.value) > 0).map(expense => {
                                                                            let limits: Record<string, string> = {};
                                                                            try {
                                                                                limits = subValue ? JSON.parse(subValue) : {};
                                                                            } catch (e) {
                                                                                limits = {};
                                                                            }
                                                                            const currentLimit = limits[expense.name] || '';

                                                                            return (
                                                                                <div key={expense.id} className="flex flex-col gap-1.5">
                                                                                    <div className="flex justify-between items-center text-[10px]">
                                                                                        <span className="text-slate-300 font-medium">{expense.name}</span>
                                                                                        <span className="text-slate-500">Atual no diagnóstico: {Number(expense.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                                                                    </div>
                                                                                    <input
                                                                                        type="text"
                                                                                        placeholder="R$ 0,00"
                                                                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:border-sky-500 outline-none transition-colors placeholder:text-slate-600"
                                                                                        value={currentLimit}
                                                                                        onChange={(e) => {
                                                                                            const newLimits = { ...limits, [expense.name]: e.target.value };
                                                                                            handleInputChange(step.id, sub.id, JSON.stringify(newLimits));
                                                                                        }}
                                                                                        disabled={readOnly}
                                                                                    />
                                                                                </div>
                                                                            );
                                                                        })}
                                                                        {financialData.estimatedExpenses.filter(e => Number(e.value) > 0).length === 0 && (
                                                                            <p className="text-[10px] text-slate-500 italic text-center py-2">Nenhum gasto variável encontrado no diagnóstico.</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-between items-center">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            {visibleCompleted} / {stepsToRender.length} Etapas Concluídas
                        </span>
                        {!readOnly && (
                            <span className="text-[10px] text-slate-600 mt-1">
                                {isSaving ? "Salvando..." : "Salvo Automaticamente"}
                            </span>
                        )}
                    </div>
                    <div className="h-2 w-32 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full bg-gradient-to-r transition-all duration-500 ${activeTab === 'phase2' ? 'from-amber-500 to-amber-300' : 'from-rose-500 to-emerald-500'}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

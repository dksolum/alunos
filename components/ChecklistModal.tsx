import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Circle, ChevronDown, ChevronUp, AlertCircle, Clock, AlertTriangle } from 'lucide-react';
import { ChecklistData } from '../types';

interface ChecklistModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialProgress?: number[];
    initialData?: ChecklistData;
    onSave?: (progress: number[], data: ChecklistData) => Promise<void>;
    readOnly?: boolean;
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

export const ChecklistModal: React.FC<ChecklistModalProps> = ({
    isOpen,
    onClose,
    initialProgress = [],
    initialData = {},
    onSave,
    readOnly = true
}) => {
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
            // Only update data if we are opening the modal, to avoid overwriting work in progress
            // with potentially stale data from parent re-renders caused by other updates
            setChecklistData(initialData || {});
        }
    }, [isOpen]); // Removed initialData/initialProgress from deps to prevent re-render clobbering

    // Update progress state if initialProgress changes and we just opened? 
    // Actually, keeping strict sync on Open is safer.

    // Auto-save debounce effect for text
    useEffect(() => {
        if (readOnly) return;
        const timer = setTimeout(() => {
            if (onSave) {
                // Optimization: match current state to avoid saving if no changes, 
                // but for now ensure we capture the latest state closure
                handleSave(completedSteps, checklistData);
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [checklistData]);

    const steps: StepConfig[] = [
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

    const toggleStep = async (id: number) => {
        const step = steps.find(s => s.id === id);
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
        const stepConfig = steps.find(s => s.id === stepId);
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

            handleSave(newProgress, currentData); // Save logic extracts here
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
        // Debounce save for text inputs could be added, but for now strict save on blur might be better?
        // Let's just update local state and have a manual save or save on separate event?
        // For simplicity, let's auto-save after short delay or on blur. 
        // passing to handleSave immediately might be too much DB writes.
    };

    // Auto-save debounce effect for text
    useEffect(() => {
        if (readOnly) return;
        const timer = setTimeout(() => {
            if (onSave) {
                // Optimization: only save if changed - simplifying for now by just checking saving state
                // Ideally we compare with initialData but objects are complex.
                handleSave(completedSteps, checklistData);
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [checklistData]);

    const getStepStatus = (stepId: number): 'pending' | 'in_progress' | 'completed' => {
        if (completedSteps.includes(stepId)) return 'completed';

        const stepData = checklistData[stepId];
        if (!stepData) return 'pending';

        // Check if there is any data (checked sub-items or text values)
        const subItemsRaw = stepData.subItems ? Object.values(stepData.subItems) : [];
        // Need to cast or check if object structure matches
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

    const progress = Math.round((completedSteps.length / steps.length) * 100);

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#0f172a] border border-slate-700 w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-rose-500/10">
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

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-4 custom-scrollbar">
                    <p className="text-sm text-slate-400 mb-6 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                        <strong className="text-rose-400 uppercase text-xs block mb-1">Atenção!</strong>
                        Este checklist não é um passeio no parque. É um plano de guerra. {readOnly ? "Acompanhe seu progresso conforme a consultoria avança." : "Marque cada etapa conforme você conquista o território."}
                    </p>

                    <div className="space-y-3">
                        {steps.map((step) => {
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
                            {completedSteps.length} / {steps.length} Etapas Concluídas
                        </span>
                        {!readOnly && (
                            <span className="text-[10px] text-slate-600 mt-1">
                                {isSaving ? "Salvando..." : "Salvo Automaticamente"}
                            </span>
                        )}
                    </div>
                    <div className="h-2 w-32 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-rose-500 to-emerald-500 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

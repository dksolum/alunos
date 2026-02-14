import React from 'react';
import { X, CheckCircle2, Circle, ListChecks, Check } from 'lucide-react';

interface ChecklistModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialProgress?: number[];
    onSave?: (progress: number[]) => Promise<void>;
    readOnly?: boolean;
}

export const ChecklistModal: React.FC<ChecklistModalProps> = ({
    isOpen,
    onClose,
    initialProgress = [],
    onSave,
    readOnly = true
}) => {
    const [completedSteps, setCompletedSteps] = React.useState<number[]>(initialProgress);
    const [isSaving, setIsSaving] = React.useState(false);

    // Update local state if initialProgress changes
    React.useEffect(() => {
        setCompletedSteps(initialProgress);
    }, [initialProgress]);

    const toggleStep = async (id: number) => {
        if (readOnly) return;

        const newProgress = completedSteps.includes(id)
            ? completedSteps.filter(s => s !== id)
            : [...completedSteps, id];

        setCompletedSteps(newProgress);

        if (onSave) {
            setIsSaving(true);
            try {
                await onSave(newProgress);
            } catch (error) {
                console.error("Failed to save progress", error);
                // Revert on error could be added here
            } finally {
                setIsSaving(false);
            }
        }
    };

    if (!isOpen) return null;

    const steps = [
        { id: 1, title: "Grupo no WhatsApp", description: "Acompanhamento individual, tirar dúvidas e envio de informações relevantes para o seu financeiro." },
        { id: 2, title: "Envio do acesso ao sistema Solum", description: "Gerenciamento de todas as informações financeiras registradas." },
        { id: 3, title: "Preenchimento do diagnóstico inicial", description: "Base para estruturação do plano de ataque." },
        { id: 4, title: "Sangria de Dívidas", description: "Estancar o sangramento para retornar o combate." },
        { id: 5, title: "Plano de Ataque", description: "Definir gastos necessários e prioridades." },
        { id: 6, title: "Ação no Objetivo", description: "Seguir o planejamento sem baixas e sem desistências." },
        { id: 7, title: "Blindagem", description: "Estrutura simples para manter a ordem e o progresso." },
        { id: 8, title: "Suprimentos", description: "Construção das reservas para eventualidades." },
        { id: 9, title: "Dúvidas", description: "Tirar dúvidas e esclarecer o caminho." }
    ];

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
                        onClick={onClose}
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
                            const isCompleted = completedSteps.includes(step.id);
                            return (
                                <div
                                    key={step.id}
                                    onClick={() => toggleStep(step.id)}
                                    className={`
                                        group p-4 rounded-2xl border transition-all duration-300 flex gap-4
                                        ${readOnly ? 'cursor-default' : 'cursor-pointer'}
                                        ${isCompleted
                                            ? 'bg-emerald-500/5 border-emerald-500/20 ' + (readOnly ? '' : 'hover:bg-emerald-500/10')
                                            : 'bg-slate-800/30 border-slate-700/50 ' + (readOnly ? '' : 'hover:border-rose-500/30 hover:bg-slate-800/60')
                                        }
                                    `}
                                >
                                    <div className={`mt-1 shrink-0 transition-colors ${isCompleted ? 'text-emerald-500' : 'text-slate-600 ' + (readOnly ? '' : 'group-hover:text-rose-500')}`}>
                                        {isCompleted ? <CheckCircle2 size={24} className="fill-emerald-500/10" /> : <Circle size={24} />}
                                    </div>
                                    <div>
                                        <h3 className={`text-sm font-bold uppercase tracking-wide mb-1 transition-colors ${isCompleted ? 'text-emerald-400 line-through decoration-emerald-500/50' : 'text-slate-200 ' + (readOnly ? '' : 'group-hover:text-white')}`}>
                                            {step.id}. {step.title}
                                        </h3>
                                        <p className={`text-xs font-medium leading-relaxed transition-colors ${isCompleted ? 'text-emerald-500/60' : 'text-slate-500 ' + (readOnly ? '' : 'group-hover:text-slate-400')}`}>
                                            {step.description}
                                        </p>
                                    </div>
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
                            style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

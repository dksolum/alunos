import React, { useState } from 'react';
import { Save, CheckCircle2, Target, Plus, Trash2, Calendar, DollarSign, Flag, ArrowRightLeft, Trophy, ArrowRight } from 'lucide-react';

interface DreamGoal {
    id: string;
    description: string;
    targetValue: number;
    targetDate: string;
    status: 'Em Planejamento' | 'Em Andamento' | 'Concluído';
    origin?: 'M4' | 'M5' | 'M6'; // Changed: Added origin tracking
}

interface DreamsGoalsStageProps {
    meetingData: any;
    onUpdateMeetingData: (data: any) => void;
    readOnly?: boolean;
}

export const DreamsGoalsStage: React.FC<DreamsGoalsStageProps> = ({
    meetingData,
    onUpdateMeetingData,
    readOnly = false
}) => {
    const [goals, setGoals] = useState<DreamGoal[]>(meetingData?.dreamsGoals || []);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showPrioritySuggestion, setShowPrioritySuggestion] = useState(false);

    // Sorting State
    const [isSorting, setIsSorting] = useState(false);
    const [sortedList, setSortedList] = useState<DreamGoal[]>([]);
    const [unsortedList, setUnsortedList] = useState<DreamGoal[]>([]);
    const [currentGoal, setCurrentGoal] = useState<DreamGoal | null>(null);
    const [compareTarget, setCompareTarget] = useState<DreamGoal | null>(null);
    const [searchRange, setSearchRange] = useState<{ min: number; max: number }>({ min: 0, max: 0 });

    const handleAddGoal = () => {
        if (readOnly) return;
        const newGoal: DreamGoal = {
            id: crypto.randomUUID(),
            description: '',
            targetValue: 0,
            targetDate: new Date().toISOString().split('T')[0],
            status: 'Em Planejamento',
            origin: 'M4' // Changed: Set origin M4 for new goals
        };
        // Add to END (Bottom) as requested
        setGoals([...goals, newGoal]);

        // Suggest prioritization if there are enough items
        if (goals.length >= 1) {
            // We can use a small toast or just highlight the button. 
            // For now, let's show a temporary message or just rely on the user seeing the button.
            // Or explicitly ask:
            // setTimeout(() => {
            //    if(confirm("Deseja repriorizar seus sonhos agora que adicionou um novo?")) startPrioritization();
            // }, 500);
            // User requested "suggest", so a less intrusive way is better, maybe a state?
            setShowPrioritySuggestion(true);
            setTimeout(() => setShowPrioritySuggestion(false), 5000);
        }
    };

    const handleUpdateGoal = (id: string, field: keyof DreamGoal, value: any) => {
        if (readOnly) return;
        const newGoals = goals.map(g => g.id === id ? { ...g, [field]: value } : g);
        setGoals(newGoals);
    };

    const handleRemoveGoal = (id: string) => {
        if (readOnly) return;
        setGoals(goals.filter(g => g.id !== id));
    };

    const handleSave = () => {
        onUpdateMeetingData((prev: any) => ({ ...prev, dreamsGoals: goals }));
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    };

    // --- SORTING LOGIC (Binary Insertion Interactive) ---

    const startPrioritization = () => {
        if (goals.length < 2) {
            alert("Adicione pelo menos 2 objetivos para priorizar.");
            return;
        }
        setIsSorting(true);
        // Initialize: element 0 is 'sorted', rest are 'unsorted'
        const initialSorted = [goals[0]];
        const initialUnsorted = goals.slice(1);
        setSortedList(initialSorted);
        setUnsortedList(initialUnsorted);

        // Setup first comparison
        setupNextInsertion(initialSorted, initialUnsorted);
    };

    const setupNextInsertion = (currentSorted: DreamGoal[], currentUnsorted: DreamGoal[]) => {
        if (currentUnsorted.length === 0) {
            // All done!
            setGoals(currentSorted);
            setIsSorting(false);
            handleSave(); // Auto-save new order
            return;
        }

        const nextGoal = currentUnsorted[0];
        setCurrentGoal(nextGoal);

        // Initialize binary search range
        const min = 0;
        const max = currentSorted.length;
        setSearchRange({ min, max });

        // Start first comparison for this item
        processBinaryStep(min, max, currentSorted);
    };

    const processBinaryStep = (min: number, max: number, currentSorted: DreamGoal[]) => {
        if (min === max) {
            // Found position! Insert at 'min'
            const newSorted = [...currentSorted];
            newSorted.splice(min, 0, currentGoal!);

            const newUnsorted = unsortedList.slice(1);
            setSortedList(newSorted);
            setUnsortedList(newUnsorted);

            // Trigger next item
            setupNextInsertion(newSorted, newUnsorted);
        } else {
            // Check middle
            const mid = Math.floor((min + max) / 2);
            setCompareTarget(currentSorted[mid]);
            setSearchRange({ min, max });
        }
    };

    const handleChoice = (winnerId: string) => {
        if (!currentGoal || !compareTarget) return;

        // Visual feedback
        // If currentGoal wins, it is MORE important than compareTarget.
        // In our list, index 0 is HIGHEST priority.
        // So if Current > Target, Current should come BEFORE Target (lower index).
        // Standard Binary Search: 
        // If Current < Target (Less important), it goes to the RIGHT (higher index). Range: [mid+1, max]
        // If Current > Target (More important), it goes to the LEFT (lower index). Range: [min, mid]

        const isCurrentWinner = winnerId === currentGoal.id;

        let newMin = searchRange.min;
        let newMax = searchRange.max;
        const mid = Math.floor((newMin + newMax) / 2);

        if (isCurrentWinner) {
            // Current is MORE important -> Needs to be earlier in the list (index < mid)
            newMax = mid;
        } else {
            // Current is LESS important -> Needs to be later in the list (index > mid)
            newMin = mid + 1;
        }

        processBinaryStep(newMin, newMax, sortedList);
    };

    // --- RENDER ---

    if (isSorting && currentGoal && compareTarget) {
        return (
            <div className="animate-fade-in space-y-8 text-center py-12">
                <div>
                    <h3 className="text-2xl font-black text-white flex items-center justify-center gap-3">
                        <Trophy className="text-yellow-400" size={32} />
                        O que é mais prioritário agora?
                    </h3>
                    <p className="text-slate-400 mt-2 font-medium">
                        Compare as opções e clique na mais importante para você neste momento.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Option A (Current) */}
                    <button
                        onClick={() => handleChoice(currentGoal.id)}
                        className="bg-slate-900 border-2 border-slate-800 hover:border-pink-500 hover:bg-pink-500/10 rounded-3xl p-8 transition-all group relative flex flex-col items-center gap-4 group"
                    >
                        <div className="absolute top-4 left-4 bg-slate-800 text-xs font-bold px-2 py-1 rounded text-slate-400">Opção A</div>
                        <Target className="text-pink-400 group-hover:scale-110 transition-transform" size={48} />
                        <h4 className="text-xl font-bold text-white max-w-xs">{currentGoal.description || "Sem descrição"}</h4>
                        <div className="flex items-center gap-2 text-slate-400 font-bold bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                            <DollarSign size={14} />
                            {currentGoal.targetValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                    </button>

                    {/* VS Badge */}
                    <div className="hidden md:flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-slate-950 border-4 border-slate-900 text-slate-500 font-black z-10 shadow-xl">
                        VS
                    </div>

                    {/* Option B (Target) */}
                    <button
                        onClick={() => handleChoice(compareTarget.id)}
                        className="bg-slate-900 border-2 border-slate-800 hover:border-sky-500 hover:bg-sky-500/10 rounded-3xl p-8 transition-all group relative flex flex-col items-center gap-4 group"
                    >
                        <div className="absolute top-4 left-4 bg-slate-800 text-xs font-bold px-2 py-1 rounded text-slate-400">Opção B</div>
                        <Target className="text-sky-400 group-hover:scale-110 transition-transform" size={48} />
                        <h4 className="text-xl font-bold text-white max-w-xs">{compareTarget.description || "Sem descrição"}</h4>
                        <div className="flex items-center gap-2 text-slate-400 font-bold bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                            <DollarSign size={14} />
                            {compareTarget.targetValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                    </button>
                </div>

                <div className="pt-8">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                        {unsortedList.length > 0 ? `${unsortedList.length} sonhos restantes para organizar` : "Finalizando..."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in relative pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black text-white flex items-center gap-3">
                        <Target className="text-pink-400" size={24} />
                        Planejamento de Sonhos e Objetivos
                    </h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">
                        Defina seus próximos passos e objetivos financeiros de médio e longo prazo
                    </p>
                </div>
                {!readOnly && (
                    <div className="flex gap-2 items-center">
                        {showPrioritySuggestion && (
                            <div className="animate-pulse text-[10px] text-pink-400 font-bold mr-2 hidden md:block">
                                Nova meta adicionada! Que tal priorizar? →
                            </div>
                        )}
                        {goals.length >= 2 && (
                            <button
                                onClick={startPrioritization}
                                className={`bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${showPrioritySuggestion ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-slate-900' : ''}`}
                                title="Ordenar por prioridade (comparação par-a-par)"
                            >
                                <ArrowRightLeft size={16} />
                                Priorizar Sonhos
                            </button>
                        )}
                        <button
                            onClick={handleAddGoal}
                            className="bg-pink-500/10 border border-pink-500/20 text-pink-400 hover:bg-pink-500 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                        >
                            <Plus size={16} />
                            Adicionar
                        </button>
                    </div>
                )}
            </div>

            {goals.length === 0 ? (
                <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-16 text-center">
                    <div className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-700">
                        <Flag size={32} />
                    </div>
                    <p className="text-slate-400 font-medium">Você ainda não definiu nenhum sonho ou objetivo.</p>
                    {!readOnly && (
                        <button
                            onClick={handleAddGoal}
                            className="mt-6 text-pink-400 font-bold hover:text-pink-300 transition-colors uppercase text-[10px] tracking-widest"
                        >
                            Começar a planejar agora →
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid gap-6">
                    {goals.map((goal, index) => (
                        <div key={goal.id} className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-8 hover:border-slate-700 transition-all group relative items-start pl-18 md:pl-20">
                            {/* Fixed badge position: Inside the card */}
                            <div className="absolute top-8 left-6 flex flex-col items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 shadow-xl">
                                    #{index + 1}
                                </div>
                                {goal.origin && (
                                    <span className={`text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full border ${goal.origin === 'M4' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                        goal.origin === 'M5' ? 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20' :
                                            'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                        }`}>
                                        {goal.origin}
                                    </span>
                                )}
                            </div>

                            {!readOnly && (
                                <button
                                    onClick={() => handleRemoveGoal(goal.id)}
                                    className="absolute top-6 right-6 p-2 text-slate-700 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                <div className="md:col-span-12 space-y-1.5">
                                    <label className="text-[10px] text-slate-500 uppercase font-black px-1">Descrição</label>
                                    <input
                                        type="text"
                                        value={goal.description}
                                        disabled={readOnly}
                                        onChange={(e) => handleUpdateGoal(goal.id, 'description', e.target.value)}
                                        placeholder="Ex: Viagem para Europa, Reserva de Emergência..."
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-sm font-bold text-white outline-none focus:border-pink-500 transition-all"
                                    />
                                </div>

                                <div className="md:col-span-6 space-y-1.5">
                                    <label className="text-[10px] text-slate-500 uppercase font-black px-1">Valor</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                                        <input
                                            type="text"
                                            value={goal.targetValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            disabled={readOnly}
                                            onChange={(e) => {
                                                const val = parseFloat(e.target.value.replace(/[^\d]/g, '')) / 100;
                                                handleUpdateGoal(goal.id, 'targetValue', val || 0);
                                            }}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 pl-10 text-sm font-bold text-white outline-none focus:border-pink-500 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-6 space-y-1.5">
                                    <label className="text-[10px] text-slate-500 uppercase font-black px-1">Data</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                                        <input
                                            type="date"
                                            value={goal.targetDate}
                                            disabled={readOnly}
                                            onChange={(e) => handleUpdateGoal(goal.id, 'targetDate', e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 pl-10 text-sm font-bold text-white outline-none focus:border-pink-500 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {
                !readOnly && goals.length > 0 && (
                    <div className="flex justify-end pt-8 border-t border-slate-800">
                        <button onClick={handleSave} className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-pink-500/20 uppercase text-xs tracking-widest">
                            {showSuccess ? <><CheckCircle2 size={18} /> Salvo!</> : <><Save size={18} /> Salvar Objetivos</>}
                        </button>
                    </div>
                )
            }
        </div >
    );
};

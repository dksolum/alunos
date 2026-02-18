import React, { useState } from 'react';
import { Save, CheckCircle2, Target, Plus, Trash2, Calendar, DollarSign, Flag } from 'lucide-react';

interface DreamGoal {
    id: string;
    description: string;
    targetValue: number;
    targetDate: string;
    status: 'Em Planejamento' | 'Em Andamento' | 'Concluído';
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

    const handleAddGoal = () => {
        if (readOnly) return;
        const newGoal: DreamGoal = {
            id: crypto.randomUUID(),
            description: '',
            targetValue: 0,
            targetDate: new Date().toISOString().split('T')[0],
            status: 'Em Planejamento'
        };
        setGoals([...goals, newGoal]);
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
        onUpdateMeetingData({ ...meetingData, dreamsGoals: goals });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    };

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
                    <button
                        onClick={handleAddGoal}
                        className="bg-pink-500/10 border border-pink-500/20 text-pink-400 hover:bg-pink-500 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Adicionar Objetivo
                    </button>
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
                    {goals.map((goal) => (
                        <div key={goal.id} className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-8 hover:border-slate-700 transition-all group relative">
                            {!readOnly && (
                                <button
                                    onClick={() => handleRemoveGoal(goal.id)}
                                    className="absolute top-6 right-6 p-2 text-slate-700 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] text-slate-500 uppercase font-black px-1">Descrição do Sonho / Objetivo</label>
                                        <input
                                            type="text"
                                            value={goal.description}
                                            disabled={readOnly}
                                            onChange={(e) => handleUpdateGoal(goal.id, 'description', e.target.value)}
                                            placeholder="Ex: Viagem para Europa, Reserva de Emergência, Casa Própria..."
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-sm font-bold text-white outline-none focus:border-pink-500 transition-all"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] text-slate-500 uppercase font-black px-1">Valor Estimado</label>
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

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] text-slate-500 uppercase font-black px-1">Data Alvo</label>
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

                                <div className="flex flex-col justify-end gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] text-slate-500 uppercase font-black px-1">Status do Sonho</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {(['Em Planejamento', 'Em Andamento', 'Concluído'] as const).map((status) => (
                                                <button
                                                    key={status}
                                                    disabled={readOnly}
                                                    onClick={() => handleUpdateGoal(goal.id, 'status', status)}
                                                    className={`px-3 py-3 rounded-xl border text-[9px] font-black uppercase tracking-tight transition-all
                                                        ${goal.status === status
                                                            ? (status === 'Concluído' ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                                                : status === 'Em Andamento' ? 'bg-sky-500 border-sky-500 text-white shadow-lg shadow-sky-500/20'
                                                                    : 'bg-pink-500 border-pink-500 text-white shadow-lg shadow-pink-500/20')
                                                            : 'bg-slate-950 border-slate-800 text-slate-600 hover:border-slate-700'
                                                        }`}
                                                >
                                                    {status}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-slate-950/50 rounded-2xl p-4 border border-slate-900 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-400">
                                                <Target size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-500 uppercase font-black">Progresso Estimado</p>
                                                <p className="text-white font-bold">{goal.status === 'Concluído' ? '100%' : goal.status === 'Em Andamento' ? '25%' : '0%'}</p>
                                            </div>
                                        </div>
                                        <div className="flex-1 max-w-[120px] h-2 bg-slate-900 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-1000 ${goal.status === 'Concluído' ? 'bg-emerald-500 w-full' : goal.status === 'Em Andamento' ? 'bg-sky-500 w-1/4' : 'bg-pink-500 w-0'}`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!readOnly && goals.length > 0 && (
                <div className="flex justify-end pt-8 border-t border-slate-800">
                    <button onClick={handleSave} className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-pink-500/20 uppercase text-xs tracking-widest">
                        {showSuccess ? <><CheckCircle2 size={18} /> Salvo!</> : <><Save size={18} /> Salvar Objetivos</>}
                    </button>
                </div>
            )}
        </div>
    );
};

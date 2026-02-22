import React, { useState } from 'react';
import { CheckSquare, Square } from 'lucide-react';

interface Task {
    id: string;
    label: string;
    checked: boolean;
}

interface TasksStageProps {
    meetingData: any;
    meetingStatus?: 'locked' | 'unlocked' | 'completed';
    onUpdateMeetingData: (data: any) => void;
    onComplete: () => void;
    onUnlock?: () => void;
    customTasks?: { id: string; label: string }[];
}

export const TasksStage: React.FC<TasksStageProps> = ({
    meetingData,
    meetingStatus,
    onUpdateMeetingData,
    onComplete,
    onUnlock,
    customTasks
}) => {
    const defaultTasks = [
        { id: 'task1', label: 'Continuar registrando entradas, saídas e transferências, tentando não ultrapassar os valores definidos por categoria' },
        { id: 'task2', label: 'Preencher lista de gastos não recorrentes' },
        { id: 'task3', label: 'Definir novo limite de gastos ou manter para o próximo mês - Enviar no grupo do WhatsApp' }
    ];

    const tasksToUse = customTasks || defaultTasks;

    const [tasks, setTasks] = useState<Task[]>(
        tasksToUse.map(t => ({
            ...t,
            checked: meetingData?.tasks?.[t.id] || false
        }))
    );

    const handleToggle = (id: string) => {
        const newTasks = tasks.map(t =>
            t.id === id ? { ...t, checked: !t.checked } : t
        );
        setTasks(newTasks);

        // Update data
        const tasksObj = newTasks.reduce((acc, t) => ({ ...acc, [t.id]: t.checked }), {});
        onUpdateMeetingData((prev: any) => ({ ...prev, tasks: tasksObj }));

        // Logic to revert completion if unchecking a task
        const isUnchecking = tasks.find(t => t.id === id)?.checked && !newTasks.find(t => t.id === id)?.checked;
        if (isUnchecking && meetingStatus === 'completed' && onUnlock) {
            onUnlock();
        }
    };

    const allChecked = tasks.every(t => t.checked);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                <h3 className="text-lg font-bold text-white mb-6">Tarefas da Semana</h3>
                <div className="space-y-4">
                    {tasks.map(task => (
                        <label key={task.id} className="flex items-start gap-4 cursor-pointer group p-4 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all">
                            <div className={`mt-0.5 transition-colors ${task.checked ? 'text-emerald-500' : 'text-slate-600 group-hover:text-emerald-500'}`}>
                                {task.checked ? <CheckSquare className="w-6 h-6" /> : <Square className="w-6 h-6" />}
                            </div>
                            <span className={`text-lg font-medium transition-colors ${task.checked ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                                {task.label}
                            </span>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={task.checked}
                                onChange={() => handleToggle(task.id)}
                            />
                        </label>
                    ))}
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    disabled={!allChecked}
                    onClick={onComplete}
                    className={`
              px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 transition-all
              ${allChecked
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transform hover:-translate-y-1'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'}
            `}
                >
                    Concluir Reunião
                </button>
            </div>
        </div>
    );
};

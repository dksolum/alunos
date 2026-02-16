import React from 'react';
import { Lock, Layout, CheckCircle } from 'lucide-react';

interface MentorshipCardProps {
    meetingId: number;
    title: string;
    status: 'locked' | 'unlocked' | 'completed';
    onClick: () => void;
    onUnlock?: () => void;
    onLock?: () => void;
}

export const MentorshipCard: React.FC<MentorshipCardProps> = ({ meetingId, title, status, onClick, onUnlock, onLock }) => {
    const isLocked = status === 'locked';
    const isCompleted = status === 'completed';

    return (
        <div
            onClick={!isLocked ? onClick : undefined}
            className={`
        relative p-6 rounded-2xl border transition-all duration-300
        ${isLocked
                    ? 'bg-slate-900/20 border-slate-800 opacity-60 cursor-not-allowed'
                    : 'bg-slate-900/40 border-slate-700 hover:border-emerald-500/50 cursor-pointer hover:shadow-lg hover:shadow-emerald-500/10'
                }
      `}
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${isLocked ? 'bg-slate-800' : 'bg-emerald-500/10'}`}>
                    <Layout className={`w-6 h-6 ${isLocked ? 'text-slate-600' : 'text-emerald-400'}`} />
                </div>
                {isCompleted ? (
                    <div className="flex items-center gap-2">
                        {onLock && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onLock();
                                }}
                                className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors mr-2"
                                title="Bloquear Reunião"
                            >
                                <Lock className="w-4 h-4" />
                            </button>
                        )}
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            <span className="text-xs font-medium text-emerald-400">Concluído</span>
                        </div>
                    </div>
                ) : isLocked ? (
                    <div className="flex items-center gap-2">
                        {onUnlock && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onUnlock();
                                }}
                                className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                                title="Liberar Reunião"
                            >
                                <Lock className="w-4 h-4" />
                            </button>
                        )}
                        {!onUnlock && <Lock className="w-5 h-5 text-slate-600" />}
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        {onLock && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onLock();
                                }}
                                className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                                title="Bloquear Reunião"
                            >
                                <Lock className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                )}
            </div>

            <h3 className={`text-lg font-bold mb-2 ${isLocked ? 'text-slate-500' : 'text-slate-200'}`}>
                {title}
            </h3>

            <p className={`text-sm ${isLocked ? 'text-slate-600' : 'text-slate-400'}`}>
                {isLocked ? 'Em breve' : 'Clique para acessar'}
            </p>
        </div>
    );
};

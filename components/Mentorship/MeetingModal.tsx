import React from 'react';
import { X } from 'lucide-react';

interface MeetingModalProps {
    isOpen: boolean;
    onClose: () => void;
    meetingId: number;
    title: string;
    children: React.ReactNode;
}

export const MeetingModal: React.FC<MeetingModalProps> = ({ isOpen, onClose, meetingId, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-black/50 animate-slide-up relative">

                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 backdrop-blur z-10">
                    <div>
                        <span className="text-xs font-bold tracking-wider text-emerald-400 uppercase bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                            Mentoria
                        </span>
                        <h2 className="text-2xl font-black text-white mt-2">
                            {meetingId < 10 ? `0${meetingId}` : meetingId}. {title}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-950/50">
                    {children}
                </div>

            </div>
        </div>
    );
};

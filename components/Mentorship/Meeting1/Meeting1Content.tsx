import React, { useState } from 'react';
import { ReviewStage } from './ReviewStage';
import { NonRecurringExpensesStage } from './NonRecurringExpensesStage';
import { TasksStage } from './TasksStage';
import { FinancialData, ChecklistData } from '../../../types';
import { ChevronRight, Check } from 'lucide-react';

import { User } from '../../../types';

interface Meeting1ContentProps {
    userId: string;
    currentUser: User;
    financialData: FinancialData;
    checklistData: ChecklistData;
    meetingData: any;
    onUpdateMeetingData: (data: any) => void;
    onUpdateFinancialData: (data: FinancialData) => void;
    onComplete: () => void;
}

export const Meeting1Content: React.FC<Meeting1ContentProps> = ({
    userId,
    currentUser,
    financialData,
    checklistData,
    meetingData,
    onUpdateMeetingData,
    onUpdateFinancialData,
    onComplete
}) => {
    const activeStep = meetingData?.activeStep || 0;

    const setActiveStep = async (step: number) => {
        onUpdateMeetingData({ ...meetingData, activeStep: step });
    };

    const steps = [
        { title: 'Revisão', description: 'Extrato e Orçamento' },
        { title: 'Gastos Não Recorrentes', description: 'Mapeamento Anual' },
        { title: 'Tarefas', description: 'Próximos Passos' }
    ];

    const isUser = currentUser.role === 'USER';

    return (
        <div className="h-full flex flex-col">
            {/* Progress Stepper - Clickable */}
            <div className="mb-8 px-2">
                <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 -z-0" />
                    {steps.map((step, index) => {
                        const isActive = index === activeStep;
                        const isCompleted = index < activeStep; // Visual only now

                        return (
                            <div
                                key={index}
                                className="relative z-10 flex flex-col items-center gap-2 px-2 cursor-pointer group"
                                onClick={() => setActiveStep(index)}
                            >
                                <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all bg-slate-900 
                      ${isActive ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' :
                                        'border-slate-700 text-slate-500 group-hover:border-emerald-500/50 group-hover:text-emerald-500/50'}
                    `}>
                                    <span>{index + 1}</span>
                                </div>
                                <div className="text-center">
                                    <p className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-white' : 'text-slate-500'}`}>{step.title}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {activeStep === 0 && (
                    <ReviewStage
                        financialData={financialData}
                        checklistData={checklistData}
                        meetingData={meetingData}
                        onUpdateMeetingData={onUpdateMeetingData}
                        onUpdateFinancialData={onUpdateFinancialData}
                        readOnly={isUser}
                    />
                )}
                {activeStep === 1 && (
                    <NonRecurringExpensesStage userId={userId} />
                )}
                {activeStep === 2 && (
                    <TasksStage
                        meetingData={meetingData}
                        onUpdateMeetingData={onUpdateMeetingData}
                        onComplete={onComplete}
                    />
                )}
            </div>
        </div>
    );
};

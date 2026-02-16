import React, { useState } from 'react';
import { ReviewStage } from './ReviewStage';
import { NonRecurringExpensesStage } from './NonRecurringExpensesStage';
import { TasksStage } from './TasksStage';
import { ReportsStage } from './ReportsStage';
import { PrintHeader } from './PrintHeader';
import { FinancialData, ChecklistData } from '../../../types';
import { ChevronRight, Check } from 'lucide-react';

import { User } from '../../../types';

interface Meeting1ContentProps {
    userId: string;
    currentUser: User;
    financialData: FinancialData;
    checklistData: ChecklistData;
    meetingData: any;
    meetingStatus?: 'locked' | 'unlocked' | 'completed';
    onUpdateMeetingData: (data: any) => void;
    onUpdateFinancialData: (data: FinancialData) => void;
    onComplete: () => void;
    onUnlock?: () => void;
}

export const Meeting1Content: React.FC<Meeting1ContentProps> = ({
    userId,
    currentUser,
    financialData,
    checklistData,
    meetingData,
    meetingStatus,
    onUpdateMeetingData,
    onUpdateFinancialData,
    onComplete,
    onUnlock
}) => {
    const activeStep = meetingData?.activeStep || 0;
    const [printSection, setPrintSection] = useState<'review' | 'expenses' | null>(null);

    const setActiveStep = async (step: number) => {
        onUpdateMeetingData({ ...meetingData, activeStep: step });
    };

    const steps = [
        { title: 'Revisão', description: 'Extrato e Orçamento' },
        { title: 'Gastos Não Recorrentes', description: 'Mapeamento Anual' },
        { title: 'Relatórios', description: 'Impressão' },
        { title: 'Tarefas', description: 'Próximos Passos' }
    ];

    const isUser = currentUser.role === 'USER';

    const handlePrint = (section: 'review' | 'expenses') => {
        setPrintSection(section);
        // Pequeno delay para garantir que o estado atualizou e o componente renderizou antes de imprimir
        setTimeout(() => {
            window.print();
            setPrintSection(null);
        }, 100);
    };

    // Callback para quando terminar a impressão (mas window.print bloqueia a thread, então difícil pegar o "cancelar")
    // Podemos deixar o printSection ativo e adicionar um botão de "Voltar" ou limpar quando mudar de aba.
    // Melhor: Usar CSS print para esconder tudo EXCETO o que queremos.
    // O `printSection` vai controlar qual componente filho ganha a classe `print:block` e quais ganham `print:hidden`.

    return (
        <div className="h-full flex flex-col">
            {/* Progress Stepper - Clickable */}
            <div className="mb-8 px-2 print:hidden">
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
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar print:overflow-visible print:h-auto">
                <div className="max-w-6xl mx-auto w-full">
                    {/* REVIEW STAGE */}
                    <div className={`${activeStep === 0 || printSection === 'review' ? 'block' : 'hidden'} ${printSection === 'expenses' ? 'print:hidden' : ''} ${printSection === 'review' ? 'print-content' : ''}`}>
                        {printSection === 'review' && <PrintHeader user={currentUser} title="Revisão de Orçamento" />}
                        <ReviewStage
                            financialData={financialData}
                            checklistData={checklistData}
                            meetingData={meetingData}
                            onUpdateMeetingData={onUpdateMeetingData}
                            onUpdateFinancialData={onUpdateFinancialData}
                            readOnly={isUser}
                        />
                    </div>

                    {/* EXPENSES STAGE */}
                    <div className={`${activeStep === 1 || printSection === 'expenses' ? 'block' : 'hidden'} ${printSection === 'review' ? 'print:hidden' : ''} ${printSection === 'expenses' ? 'print-content' : ''}`}>
                        {printSection === 'expenses' && <PrintHeader user={currentUser} title="Gastos Não Recorrentes" />}
                        <NonRecurringExpensesStage userId={userId} />
                    </div>

                    {/* REPORTS STAGE */}
                    {activeStep === 2 && (
                        <div className="print:hidden">
                            <ReportsStage
                                onPrintReview={() => handlePrint('review')}
                                onPrintExpenses={() => handlePrint('expenses')}
                            />
                        </div>
                    )}

                    {/* TASKS STAGE */}
                    {activeStep === 3 && (
                        <div className="print:hidden">
                            <TasksStage
                                meetingData={meetingData}
                                meetingStatus={meetingStatus}
                                onUpdateMeetingData={onUpdateMeetingData}
                                onComplete={onComplete}
                                onUnlock={onUnlock}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

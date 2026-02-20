import React, { useState } from 'react';
import { ReviewStage } from '../Meeting1/ReviewStage';
import { NonRecurringExpensesStage } from '../Meeting1/NonRecurringExpensesStage';
import { TasksStage } from '../Meeting1/TasksStage';
import { ReportsStage } from '../Meeting1/ReportsStage';
import { DebtUpdateStage } from './DebtUpdateStage';
import { PrintHeader } from '../Meeting1/PrintHeader';
import { PrintPortal } from '../../PrintPortal';
import { FinancialData, ChecklistData, User, NonRecurringExpenseItem } from '../../../types';
import { useEffect } from 'react';
import { authService } from '../../../services/authService';

interface Meeting2ContentProps {
    userId: string;
    currentUser: User;
    financialData: FinancialData;
    checklistData: ChecklistData;
    meetingData: any;
    previousMeetingData?: any; // Data from Meeting 1
    meetingStatus?: 'locked' | 'unlocked' | 'completed';
    onUpdateMeetingData: (data: any) => void;
    onUpdateFinancialData: (data: FinancialData) => void;
    onComplete: () => void;
    onUnlock?: () => void;
}

export const Meeting2Content: React.FC<Meeting2ContentProps> = ({
    userId,
    currentUser,
    financialData,
    checklistData,
    meetingData,
    previousMeetingData,
    meetingStatus,
    onUpdateMeetingData,
    onUpdateFinancialData,
    onComplete,
    onUnlock
}) => {
    const activeStep = meetingData?.activeStep || 0;
    const [printSection, setPrintSection] = useState<'review' | 'expenses' | 'debts' | null>(null);
    const [printData, setPrintData] = useState<any>(null);

    const setActiveStep = async (step: number) => {
        onUpdateMeetingData({ ...meetingData, activeStep: step });
    };

    // Initialize local Non-Recurring Expenses from global list if empty
    useEffect(() => {
        const initExpenses = async () => {
            if (!meetingData.nonRecurringExpenses) {
                try {
                    const state = await authService.getMentorshipState(userId);
                    onUpdateMeetingData({
                        ...meetingData,
                        nonRecurringExpenses: state.nonRecurringExpenses || []
                    });
                } catch (error) {
                    console.error("Error initializing expenses for Meeting 2:", error);
                }
            }
        };
        initExpenses();
    }, [userId, meetingData, onUpdateMeetingData]);

    const handleUpdateExpenses = (newItems: NonRecurringExpenseItem[]) => {
        onUpdateMeetingData({
            ...meetingData,
            nonRecurringExpenses: newItems
        });
    };

    const handleReloadExpenses = async () => {
        try {
            const state = await authService.getMentorshipState(userId);
            const globalExpenses = state.nonRecurringExpenses || []; // Itens da Reunião 1 (Source of Truth)
            const currentExpenses = meetingData.nonRecurringExpenses || [];

            // 1. Identify items currently in M2 that are NOT in M1 (Local items)
            // We keep items that do not share an ID with any item in globalExpenses
            const localItems = currentExpenses.filter((localItem: NonRecurringExpenseItem) =>
                !globalExpenses.some(globalItem => globalItem.id === localItem.id)
            );

            // 2. Merge: Attributes from M1 (global) + Preserved Local Items
            const mergedExpenses = [...globalExpenses, ...localItems];

            onUpdateMeetingData({
                ...meetingData,
                nonRecurringExpenses: mergedExpenses
            });

            alert("Gastos sincronizados com sucesso! Itens da Reunião 1 foram atualizados e itens locais foram preservados.");
        } catch (error) {
            console.error("Error reloading expenses:", error);
            alert("Erro ao sincronizar gastos. Tente novamente.");
        }
    };

    const steps = [
        { title: 'Revisão', description: 'Orçamento vs Realizado' },
        { title: 'Gastos Não Recorrentes', description: 'Mapeamento Anual' },
        { title: 'Atualização de Dívidas', description: 'Status de Negociações' },
        { title: 'Relatórios', description: 'Impressão' },
        { title: 'Tarefas', description: 'Próximos Passos' }
    ];

    const isUser = currentUser.role === 'USER';

    const handlePrint = (section: 'review' | 'expenses' | 'debts', data?: any) => {
        setPrintSection(section);
        if (data) setPrintData(data);

        const delay = data ? 300 : 1200;
        setTimeout(() => {
            window.print();
            setPrintSection(null);
            setPrintData(null);
        }, delay);
    };

    const meeting2Tasks = [
        { id: 'm2_task1', label: 'Continuar registrando entradas, saídas e transferências, sem negligenciar nenhum e obedecendo o orçamento definido' },
        { id: 'm2_task2', label: 'Criar uma carteira com o nome Quebra Galho em alguma instituição bancária' },
        { id: 'm2_task3', label: 'Atualizar o mapeamento de dívidas (acrescentou algo ou finalizou alguma?)' }
    ];

    return (
        <div className="h-full flex flex-col">
            {/* Progress Stepper */}
            <div className="mb-8 px-2 print:hidden">
                <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 -z-0" />
                    {steps.map((step, index) => {
                        const isActive = index === activeStep;
                        return (
                            <div
                                key={index}
                                className="relative z-10 flex flex-col items-center gap-2 px-2 cursor-pointer group"
                                onClick={() => setActiveStep(index)}
                            >
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all bg-slate-900 
                                    ${isActive ? 'bg-purple-500 border-purple-500 text-white shadow-lg shadow-purple-500/20' :
                                        'border-slate-700 text-slate-500 group-hover:border-purple-500/50 group-hover:text-purple-500/50'}
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
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar print:hidden">
                <div className="max-w-6xl mx-auto w-full">
                    {/* REVIEW STAGE */}
                    <div className={`${activeStep === 0 ? 'block' : 'hidden'}`}>
                        <ReviewStage
                            financialData={financialData}
                            checklistData={checklistData}
                            meetingData={meetingData}
                            previousMeetingData={previousMeetingData}
                            onUpdateMeetingData={onUpdateMeetingData}
                            onUpdateFinancialData={onUpdateFinancialData}
                            readOnly={isUser}
                            onPrint={() => handlePrint('review')}
                            feedbackQuestion="É notável que já fizemos algumas mudanças, então responda o seguinte: Qual a experiência neste último mês? Teve dificuldade em algo ou passou por algum desafio?"
                        />
                    </div>

                    {/* EXPENSES STAGE */}
                    <div className={`${activeStep === 1 ? 'block' : 'hidden'}`}>
                        <NonRecurringExpensesStage
                            userId={userId}
                            onPrint={(data) => handlePrint('expenses', data)}
                            items={meetingData.nonRecurringExpenses || []}
                            onUpdateItems={handleUpdateExpenses}
                            onReload={handleReloadExpenses}
                            currentMeeting="M2"
                            syncLabel="Sincronizar com Reunião 1"
                        />
                    </div>

                    {/* DEBT UPDATE STAGE */}
                    {activeStep === 2 && (
                        <DebtUpdateStage
                            userId={userId}
                            checklistData={checklistData}
                            meetingData={meetingData}
                            onUpdateMeetingData={onUpdateMeetingData}
                            readOnly={false}
                        />
                    )}

                    {/* REPORTS STAGE */}
                    {activeStep === 3 && (
                        <div>
                            <ReportsStage
                                onPrintReview={() => handlePrint('review')}
                                onPrintExpenses={() => handlePrint('expenses')}
                                onPrintDebts={() => handlePrint('debts')}
                            />
                        </div>
                    )}

                    {/* TASKS STAGE */}
                    {activeStep === 4 && (
                        <div>
                            <TasksStage
                                meetingData={meetingData}
                                meetingStatus={meetingStatus}
                                onUpdateMeetingData={onUpdateMeetingData}
                                onComplete={onComplete}
                                onUnlock={onUnlock}
                                customTasks={meeting2Tasks}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* PRINT PORTAL */}
            <PrintPortal>
                {printSection === 'review' && (
                    <div className="p-8">
                        <PrintHeader user={currentUser} title="Revisão de Orçamento - Reunião 2" />
                        <div className="mt-8">
                            <ReviewStage
                                financialData={financialData}
                                checklistData={checklistData}
                                meetingData={meetingData}
                                previousMeetingData={previousMeetingData}
                                onUpdateMeetingData={onUpdateMeetingData}
                                onUpdateFinancialData={onUpdateFinancialData}
                                readOnly={true}
                                feedbackQuestion="É notável que já fizemos algumas mudanças, então responda o seguinte: Qual a experiência neste último mês? Teve dificuldade em algo ou passou por algum desafio?"
                            />
                        </div>
                    </div>
                )}

                {printSection === 'expenses' && (
                    <div className="p-8">
                        <PrintHeader user={currentUser} title="Gastos Não Recorrentes" />
                        <div className="mt-8">
                            <NonRecurringExpensesStage
                                userId={userId}
                                initialItems={printData}
                                items={printData || meetingData.nonRecurringExpenses}
                                showDetails={true}
                            />
                        </div>
                    </div>
                )}
                {printSection === 'debts' && (
                    <div className="p-8">
                        <PrintHeader user={currentUser} title="Atualização de Dívidas - Reunião 2" />
                        <div className="mt-8">
                            <DebtUpdateStage
                                userId={userId}
                                checklistData={checklistData}
                                meetingData={meetingData}
                                onUpdateMeetingData={onUpdateMeetingData}
                                readOnly={true}
                            />
                        </div>
                    </div>
                )}
            </PrintPortal>
        </div>
    );
};

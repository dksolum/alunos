import React, { useState, useEffect } from 'react';
import { ReviewStageM3 } from './ReviewStageM3';
import { NonRecurringExpensesStage } from '../Meeting1/NonRecurringExpensesStage';
import { TasksStage } from '../Meeting1/TasksStage';
import { ReportsStage } from '../Meeting1/ReportsStage';
import { DebtUpdateStageM3 } from './DebtUpdateStageM3';
import { DebtRepaymentPlanStage } from './DebtRepaymentPlanStage';
import { PrintHeader } from '../Meeting1/PrintHeader';
import { PrintPortal } from '../../PrintPortal';
import { FinancialData, ChecklistData, User, NonRecurringExpenseItem } from '../../../types';
import { authService } from '../../../services/authService';

interface Meeting3ContentProps {
    user?: any;
    userId: string;
    currentUser: User;
    financialData: FinancialData;
    checklistData: ChecklistData;
    meetingData: any;
    previousMeetingData?: any; // Data from Meeting 2
    meetingStatus?: 'locked' | 'unlocked' | 'completed';
    onUpdateMeetingData: (data: any) => void;
    onUpdateFinancialData: (data: FinancialData) => void;
    onComplete: () => void;
    onUnlock?: () => void;
}

export const Meeting3Content: React.FC<Meeting3ContentProps> = ({
    user,
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
    const [printSection, setPrintSection] = useState<'review' | 'expenses' | 'debts' | 'plan' | null>(null);
    const [printData, setPrintData] = useState<any>(null);

    const setActiveStep = async (step: number) => {
        onUpdateMeetingData((prev: any) => ({ ...prev, activeStep: step }));
    };

    // Initialize local Non-Recurring Expenses from global list if empty
    useEffect(() => {
        const initExpenses = async () => {
            if (!meetingData.nonRecurringExpenses) {
                try {
                    const state = await authService.getMentorshipState(userId);
                    onUpdateMeetingData((prev: any) => ({ ...prev, nonRecurringExpenses: state.nonRecurringExpenses || [] }));
                } catch (error) {
                    console.error("Error initializing expenses for Meeting 3:", error);
                }
            }
        };
        initExpenses();
    }, [userId, meetingData, onUpdateMeetingData]);

    const handleUpdateExpenses = (newItems: NonRecurringExpenseItem[]) => {
        onUpdateMeetingData((prev: any) => ({ ...prev, nonRecurringExpenses: newItems }));
    };

    const handleReloadExpenses = async () => {
        try {
            // Sincronização em Cascata: Puxa da Reunião 2 (previousMeetingData)
            const sourceExpenses = previousMeetingData?.nonRecurringExpenses || [];
            const currentExpenses = meetingData.nonRecurringExpenses || [];

            // 1. Identify items currently in M3 that are NOT in M2 (Source) - Local items
            const localItems = currentExpenses.filter((localItem: NonRecurringExpenseItem) =>
                !sourceExpenses.some((sourceItem: NonRecurringExpenseItem) => sourceItem.id === localItem.id)
            );

            // 2. Merge: Items from M2 + Preserved Local Items
            const mergedExpenses = [...sourceExpenses, ...localItems];

            onUpdateMeetingData((prev: any) => ({ ...prev, nonRecurringExpenses: mergedExpenses }));

            alert("Gastos sincronizados com a Reunião 2 com sucesso!");
        } catch (error) {
            console.error("Error reloading expenses:", error);
            alert("Erro ao sincronizar gastos. Tente novamente.");
        }
    };

    const steps = [
        { title: 'Revisão', description: 'Orçamento vs Realizado' },
        { title: 'Gastos Não Recorrentes', description: 'Mapeamento Anual' },
        { title: 'Atualização de Dívidas', description: 'Status de Pagamento' },
        { title: 'Plano de Quitação', description: 'Reunião da Virada' },
        { title: 'Relatórios', description: 'Impressão' },
        { title: 'Tarefas', description: 'Próximos Passos' }
    ];

    const isUser = currentUser.role === 'USER';

    const handlePrint = (section: 'review' | 'expenses' | 'debts' | 'plan', data?: any) => {
        setPrintSection(section);
        if (data) setPrintData(data);

        const delay = data ? 300 : 1200;
        setTimeout(() => {
            window.print();
            setPrintSection(null);
            setPrintData(null);
        }, delay);
    };

    const meeting3Tasks = [
        { id: 'm3_task1', label: 'Continuar registrando entradas, saídas e transferências, sem negligenciar nenhum e obedecendo o orçamento definido' },
        { id: 'm3_task2', label: 'Iniciar o plano de quitação de dívida definido hoje' },
        { id: 'm3_task3', label: 'Manter foco na reserva quebra galho para evitar novos imprevistos' },
        { id: 'm3_task4', label: 'Definir novo limite de gastos ou manter para o próximo mês - Enviar no grupo do WhatsApp' },
        { id: 'm3_task5', label: 'Guardar o valor mensal previsto para os Gastos Não Recorrentes dentro da carteira definida' }
    ];

    return (
        <div className="h-full flex flex-col">
            {/* Progress Stepper */}
            <div className="mb-8 px-2 print:hidden overflow-x-auto pb-2">
                <div className="flex items-center justify-between relative min-w-[600px]">
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
                                    ${isActive ? 'bg-sky-500 border-sky-500 text-white shadow-lg shadow-sky-500/20' :
                                        'border-slate-700 text-slate-500 group-hover:border-sky-500/50 group-hover:text-sky-500/50'}
                                `}>
                                    <span>{index + 1}</span>
                                </div>
                                <div className="text-center">
                                    <p className={`text-[10px] font-black uppercase tracking-wider ${isActive ? 'text-white' : 'text-slate-500'}`}>{step.title}</p>
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
                    {activeStep === 0 && (
                        <ReviewStageM3
                            financialData={financialData}
                            checklistData={checklistData}
                            meetingData={meetingData}
                            previousMeetingData={previousMeetingData}
                            onUpdateMeetingData={onUpdateMeetingData}
                            onUpdateFinancialData={onUpdateFinancialData}
                            readOnly={isUser}
                            onPrint={() => handlePrint('review')}
                            feedbackQuestion="Como foi sua experiência neste último mês? Conseguiu manter o planejado ou enfrentou novos desafios?"
                        />
                    )}

                    {/* EXPENSES STAGE */}
                    {activeStep === 1 && (
                        <NonRecurringExpensesStage
                            userId={userId}
                            onPrint={(data) => handlePrint('expenses', data)}
                            items={meetingData.nonRecurringExpenses || []}
                            onUpdateItems={handleUpdateExpenses}
                            onReload={handleReloadExpenses}
                            currentMeeting="M3"
                            syncLabel="Sincronizar com Reunião 2"
                        />
                    )}

                    {/* DEBT UPDATE STAGE */}
                    {activeStep === 2 && (
                        <DebtUpdateStageM3
                            userId={userId}
                            checklistData={checklistData}
                            meetingData={meetingData}
                            previousMeetingData={previousMeetingData}
                            onUpdateMeetingData={onUpdateMeetingData}
                            readOnly={false}
                        />
                    )}

                    {/* DEBT REPAYMENT PLAN STAGE */}
                    {activeStep === 3 && (
                        <DebtRepaymentPlanStage
                            meetingData={meetingData}
                            onUpdateMeetingData={onUpdateMeetingData}
                            readOnly={false}
                        />
                    )}

                    {/* REPORTS STAGE */}
                    {activeStep === 4 && (
                        <div>
                            <ReportsStage
                                onPrintReview={() => handlePrint('review')}
                                onPrintExpenses={() => handlePrint('expenses')}
                                onPrintDebts={() => handlePrint('debts')}
                                onPrintValue={(data) => handlePrint('plan', data)} // Using onPrintValue as a proxy for the custom plan if needed
                            />
                            {/* Adding a custom button for the plan since ReportsStage is generic */}
                            <div className="mt-4 flex justify-center">
                                <button
                                    onClick={() => handlePrint('plan')}
                                    className="px-6 py-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl font-bold uppercase text-xs hover:bg-purple-500 hover:text-white transition-all"
                                >
                                    Imprimir Plano de Quitação
                                </button>
                            </div>
                        </div>
                    )}

                    {/* TASKS STAGE */}
                    {activeStep === 5 && (
                        <div>
                            <TasksStage
                                meetingData={meetingData}
                                meetingStatus={meetingStatus}
                                onUpdateMeetingData={onUpdateMeetingData}
                                onComplete={onComplete}
                                onUnlock={onUnlock}
                                customTasks={meeting3Tasks}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* PRINT PORTAL */}
            <PrintPortal>
                {printSection === 'review' && (
                    <div className="p-8">
                        <PrintHeader user={user} title="Revisão de Orçamento - Reunião 3" />
                        <div className="mt-8">
                            <ReviewStageM3
                                financialData={financialData}
                                checklistData={checklistData}
                                meetingData={meetingData}
                                previousMeetingData={previousMeetingData}
                                onUpdateMeetingData={onUpdateMeetingData}
                                onUpdateFinancialData={onUpdateFinancialData}
                                readOnly={true}
                                feedbackQuestion="Como foi sua experiência neste último mês? Conseguiu manter o planejado ou enfrentou novos desafios?"
                            />
                        </div>
                    </div>
                )}

                {printSection === 'expenses' && (
                    <div className="p-8">
                        <PrintHeader user={user} title="Gastos Não Recorrentes" />
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
                        <PrintHeader user={user} title="Atualização de Dívidas - Reunião 3" />
                        <div className="mt-8">
                            <DebtUpdateStageM3
                                userId={userId}
                                checklistData={checklistData}
                                meetingData={meetingData}
                                previousMeetingData={previousMeetingData}
                                onUpdateMeetingData={onUpdateMeetingData}
                                readOnly={true}
                            />
                        </div>
                    </div>
                )}

                {printSection === 'plan' && (
                    <div className="p-8">
                        <PrintHeader user={user} title="Plano de Quitação de Dívida - Reunião 3" />
                        <div className="mt-8">
                            <DebtRepaymentPlanStage
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

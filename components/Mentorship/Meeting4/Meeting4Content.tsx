import React, { useState, useEffect } from 'react';
import { LayoutDashboard, TrendingDown, Clock, Target, FileText, CheckCircle, ChevronRight, ChevronLeft, Printer } from 'lucide-react';
import { FinancialData, ChecklistData, MentorshipMeeting } from '../../../types';
import { authService } from '../../../services/authService';
import { ReviewStageM4 } from './ReviewStageM4';
import { DebtUpdateStageM4 } from './DebtUpdateStageM4';
import { DebtStatusTrackingStage } from './DebtStatusTrackingStage';
import { DreamsGoalsStage } from './DreamsGoalsStage';
import { NonRecurringExpensesStage } from '../Meeting1/NonRecurringExpensesStage';
import { ReportsStageM4 } from './ReportsStageM4';
import { TasksStage } from '../Meeting1/TasksStage';
import { PrintPortal } from '../../PrintPortal';
import { PrintHeader } from '../Meeting1/PrintHeader';

interface Meeting4ContentProps {
    user?: any;
    userId: string;
    currentUser: { id: string; role: 'ADMIN' | 'USER' };
    financialData: FinancialData;
    checklistData: ChecklistData;
    meetingData: any;
    meetingStatus: 'locked' | 'unlocked' | 'completed';
    onUpdateMeetingData: (data: any) => void;
    onUpdateFinancialData: (data: any) => void;
    onComplete: () => void;
    onUnlock?: () => void;
}

const STEPS = [
    { label: 'Revisão', description: 'Orçamento vs Realizado' },
    { label: 'Gastos Não Recorrentes', description: 'Mapeamento Anual' },
    { label: 'Dívidas', description: 'Status de Pagamento' },
    { label: 'Status Plano', description: 'Rastreamento M3' },
    { label: 'Sonhos/Objetivos', description: 'Planejamento Futuro' },
    { label: 'Relatórios', description: 'Impressão' },
    { label: 'Tarefas', description: 'Próximos Passos' }
];

export const Meeting4Content: React.FC<Meeting4ContentProps> = ({
    user,
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
    const [activeStep, setActiveStep] = useState(0);
    const [previousMeetingData, setPreviousMeetingData] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [printMode, setPrintMode] = useState<'review' | 'plan' | 'dreams' | null>(null);

    const isUser = currentUser.role === 'USER';

    // Fetch Meeting 3 Data
    useEffect(() => {
        const fetchM3Data = async () => {
            try {
                const state = await authService.getMentorshipState(userId);
                const m3 = state.meetings.find(m => m.meetingId === 3);
                if (m3) {
                    setPreviousMeetingData(m3.data);
                }
            } catch (error) {
                console.error('Error fetching M3 data for M4:', error);
            }
        };
        fetchM3Data();
    }, [userId]);

    // Initialize Non-Recurring Expenses from M3 if empty
    useEffect(() => {
        const initExpenses = async () => {
            if (!meetingData.nonRecurringExpenses) {
                if (previousMeetingData?.nonRecurringExpenses) {
                    handleUpdateMeetingData((prev: any) => ({
                        ...prev,
                        nonRecurringExpenses: previousMeetingData.nonRecurringExpenses
                    }));
                } else {
                    try {
                        const state = await authService.getMentorshipState(userId);
                        handleUpdateMeetingData((prev: any) => ({
                            ...prev,
                            nonRecurringExpenses: state.nonRecurringExpenses || []
                        }));
                    } catch (error) {
                        console.error("Error initializing expenses for Meeting 4:", error);
                    }
                }
            }
        };
        if (previousMeetingData) {
            initExpenses();
        }
    }, [userId, previousMeetingData]);

    const handleUpdateMeetingData = async (newData: any) => {
        setIsSaving(true);
        try {
            await onUpdateMeetingData(newData);
        } catch (error) {
            console.error('Error updating meeting 4 data:', error);
        } finally {
            setTimeout(() => setIsSaving(false), 500);
        }
    };

    const handleUpdateExpenses = (newItems: any[]) => {
        handleUpdateMeetingData((prev: any) => ({
            ...prev,
            nonRecurringExpenses: newItems
        }));
    };

    const handleReloadExpenses = async () => {
        try {
            // Sincronização em Cascata: Puxa da Reunião 3 (previousMeetingData)
            const sourceExpenses = previousMeetingData?.nonRecurringExpenses || [];
            const currentExpenses = meetingData.nonRecurringExpenses || [];

            // 1. Identificar itens locais da M4
            const localItems = currentExpenses.filter((localItem: any) =>
                !sourceExpenses.some((sourceItem: any) => sourceItem.id === localItem.id)
            );

            // 2. Merge: Itens da M3 + Itens Locais da M4
            const mergedExpenses = [...sourceExpenses, ...localItems];

            handleUpdateMeetingData({
                ...meetingData,
                nonRecurringExpenses: mergedExpenses
            });

            alert("Gastos sincronizados com a Reunião 3 com sucesso!");
        } catch (error) {
            console.error("Error reloading expenses:", error);
            alert("Erro ao sincronizar gastos. Tente novamente.");
        }
    };

    const handleUpdateFinancialData = async (newData: FinancialData) => {
        if (isUser) return;
        await onUpdateFinancialData(newData);
    };

    const handlePrint = (mode: 'review' | 'expenses' | 'debts' | 'dreams' | 'status', data?: any) => {
        setPrintMode(mode);
        setTimeout(() => {
            window.print();
            setPrintMode(null);
        }, 500);
    };

    return (
        <div className="h-full flex flex-col">
            {/* Progress Stepper - Aligned with Meeting 3 */}
            <div className="mb-8 px-2 print:hidden overflow-x-auto pb-2">
                <div className="flex items-center justify-between relative min-w-[600px]">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 -z-0" />
                    {STEPS.map((step, index) => {
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
                                    <p className={`text-[10px] font-black uppercase tracking-wider ${isActive ? 'text-white' : 'text-slate-500'}`}>{step.label}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar print:hidden">
                <div className="max-w-6xl mx-auto w-full">
                    {/* REVIEW STAGE */}
                    {activeStep === 0 && (
                        <ReviewStageM4
                            financialData={financialData}
                            checklistData={checklistData}
                            meetingData={meetingData}
                            previousMeetingData={previousMeetingData}
                            onUpdateMeetingData={handleUpdateMeetingData}
                            onUpdateFinancialData={handleUpdateFinancialData}
                            readOnly={isUser}
                            onPrint={() => handlePrint('review')}
                            feedbackQuestion="Passados estes meses de mentoria, como você avalia sua evolução financeira e mental em relação ao dinheiro?"
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
                            currentMeeting="M4"
                            syncLabel="Sincronizar com Reunião 3"
                        />
                    )}

                    {/* DEBT UPDATE STAGE */}
                    {activeStep === 2 && (
                        <DebtUpdateStageM4
                            userId={userId}
                            checklistData={checklistData}
                            meetingData={meetingData}
                            previousMeetingData={previousMeetingData}
                            onUpdateMeetingData={handleUpdateMeetingData}
                            readOnly={false}
                        />
                    )}

                    {/* STATUS TRACKING STAGE */}
                    {activeStep === 3 && (
                        <DebtStatusTrackingStage
                            meetingData={meetingData}
                            previousMeetingData={previousMeetingData}
                            onUpdateMeetingData={handleUpdateMeetingData}
                            readOnly={false}
                        />
                    )}

                    {/* DREAMS/GOALS STAGE */}
                    {activeStep === 4 && (
                        <DreamsGoalsStage
                            meetingData={meetingData}
                            onUpdateMeetingData={handleUpdateMeetingData}
                            readOnly={false}
                        />
                    )}

                    {/* REPORTS STAGE */}
                    {activeStep === 5 && (
                        <div>
                            <ReportsStageM4
                                onPrintReview={() => handlePrint('review')}
                                onPrintExpenses={() => handlePrint('expenses')}
                                onPrintDebts={() => handlePrint('debts')}
                                onPrintStatus={() => handlePrint('status')}
                                onPrintDreams={() => handlePrint('dreams')}
                            />
                        </div>
                    )}

                    {/* TASKS STAGE */}
                    {activeStep === 6 && (
                        <TasksStage
                            meetingData={meetingData}
                            meetingStatus={meetingStatus}
                            onUpdateMeetingData={handleUpdateMeetingData}
                            onComplete={onComplete}
                            onUnlock={onUnlock}
                            readOnly={isUser}
                            customTasks={[
                                { id: 'm4_task1', label: 'Continuar registrando entradas, saídas e transferências, sem negligenciar nenhum e obedecendo o orçamento definido' },
                                { id: 'm4_task2', label: 'Dar continuidade ao plano de quitação de dívida definido na reunião 3' },
                                { id: 'm4_task3', label: 'Manter foco na reserva quebra galho para evitar novos imprevistos' },
                                { id: 'm4_task4', label: 'Criar uma carteira com o nome da primeira meta em alguma instituição bancária, guardando o que sobrar no mês nela. (caso a reserva quebra galho não esteja em R$ 500,00 , não guardar todo o valor que sobrar aqui e dividir o saldo com ela)' },
                                { id: 'm4_task5', label: 'Definir novo limite de gastos ou manter para o próximo mês - Enviar no grupo do WhatsApp' },
                                { id: 'm4_task6', label: 'Guardar o valor mensal previsto para os Gastos Não Recorrentes dentro da carteira definida' }
                            ]}
                        />
                    )}
                </div>
            </div>

            {/* Print Portal */}
            <PrintPortal>
                {printMode === 'review' && (
                    <div className="print-report">
                        <PrintHeader
                            title="Consolidação Financeira - Mentoria M4"
                            user={user}
                            date={new Date().toLocaleDateString('pt-BR')}
                        />
                        <ReviewStageM4
                            financialData={financialData}
                            checklistData={checklistData}
                            meetingData={meetingData}
                            previousMeetingData={previousMeetingData}
                            onUpdateMeetingData={() => { }}
                            onUpdateFinancialData={() => { }}
                            readOnly={true}
                            feedbackQuestion="Passados estes meses de mentoria, como você avalia sua evolução financeira e mental em relação ao dinheiro?"
                        />
                    </div>
                )}
                {printMode === 'expenses' && (
                    <div className="print-report">
                        <PrintHeader
                            title="Gastos Não Recorrentes - Mentoria M4"
                            user={user}
                            date={new Date().toLocaleDateString('pt-BR')}
                        />
                        <NonRecurringExpensesStage
                            userId={userId}
                            items={meetingData.nonRecurringExpenses || []}
                            onUpdateItems={() => { }}
                            onReload={() => { }}
                            onPrint={() => { }}
                            currentMeeting="M4"
                            readOnly={true}
                        />
                    </div>
                )}
                {printMode === 'status' && (
                    <div className="print-report">
                        <PrintHeader
                            title="Status do Plano - Mentoria M4"
                            user={user}
                            date={new Date().toLocaleDateString('pt-BR')}
                        />
                        <DebtStatusTrackingStage
                            meetingData={meetingData}
                            previousMeetingData={previousMeetingData}
                            onUpdateMeetingData={() => { }}
                            readOnly={true}
                        />
                    </div>
                )}
                {printMode === 'debts' && (
                    <div className="print-report">
                        <PrintHeader
                            title="Atualização de Dívidas - Mentoria M4"
                            user={user}
                            date={new Date().toLocaleDateString('pt-BR')}
                        />
                        <DebtUpdateStageM4
                            userId={userId}
                            checklistData={checklistData}
                            meetingData={meetingData}
                            previousMeetingData={previousMeetingData}
                            onUpdateMeetingData={() => { }}
                            readOnly={true}
                        />
                    </div>
                )}
                {printMode === 'dreams' && (
                    <div className="print-report">
                        <PrintHeader
                            title="Sonhos e Objetivos - Mentoria M4"
                            user={user}
                            date={new Date().toLocaleDateString('pt-BR')}
                        />
                        <DreamsGoalsStage
                            meetingData={meetingData}
                            onUpdateMeetingData={() => { }}
                            readOnly={true}
                        />
                    </div>
                )}
            </PrintPortal>
        </div>
    );
};

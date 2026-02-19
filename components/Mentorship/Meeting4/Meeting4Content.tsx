import React, { useState, useEffect } from 'react';
import { LayoutDashboard, TrendingDown, Clock, Target, FileText, CheckCircle, ChevronRight, ChevronLeft, Printer } from 'lucide-react';
import { FinancialData, ChecklistData, MentorshipMeeting } from '../../../types';
import { authService } from '../../../services/authService';
import { ReviewStageM4 } from './ReviewStageM4';
import { DebtUpdateStageM4 } from './DebtUpdateStageM4';
import { DebtStatusTrackingStage } from './DebtStatusTrackingStage';
import { DreamsGoalsStage } from './DreamsGoalsStage';
import { NonRecurringExpensesStage } from '../Meeting1/NonRecurringExpensesStage';
import { ReportsStage } from '../Meeting1/ReportsStage';
import { TasksStage } from '../Meeting1/TasksStage';
import { PrintPortal } from '../../PrintPortal';
import { PrintHeader } from '../Meeting1/PrintHeader';

interface Meeting4ContentProps {
    userId: string;
    currentUser: { id: string; role: 'ADMIN' | 'USER' };
    financialData: FinancialData;
    checklistData: ChecklistData;
    meeting: MentorshipMeeting;
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
    userId,
    currentUser,
    financialData,
    checklistData,
    meeting
}) => {
    const [activeStep, setActiveStep] = useState(0);
    const [meetingData, setMeetingData] = useState<any>(meeting.data || {});
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
                    handleUpdateMeetingData({
                        ...meetingData,
                        nonRecurringExpenses: previousMeetingData.nonRecurringExpenses
                    });
                } else {
                    try {
                        const state = await authService.getMentorshipState(userId);
                        handleUpdateMeetingData({
                            ...meetingData,
                            nonRecurringExpenses: state.nonRecurringExpenses || []
                        });
                    } catch (error) {
                        console.error("Error initializing expenses for Meeting 4:", error);
                    }
                }
            }
        };
        if (previousMeetingData || meetingData.nonRecurringExpenses) {
            initExpenses();
        }
    }, [userId, previousMeetingData, meetingData.nonRecurringExpenses]);

    const handleUpdateMeetingData = async (newData: any) => {
        if (isUser) return;
        setMeetingData(newData);
        setIsSaving(true);
        try {
            await authService.saveMeetingData(userId, 4, newData);
        } catch (error) {
            console.error('Error updating meeting 4 data:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateExpenses = (newItems: any[]) => {
        handleUpdateMeetingData({
            ...meetingData,
            nonRecurringExpenses: newItems
        });
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
    };

    const handlePrint = (mode: 'review' | 'plan' | 'dreams' | 'expenses', data?: any) => {
        setPrintMode(mode === 'expenses' ? 'review' : mode);
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
                            readOnly={isUser}
                        />
                    )}

                    {/* STATUS TRACKING STAGE */}
                    {activeStep === 3 && (
                        <DebtStatusTrackingStage
                            meetingData={meetingData}
                            previousMeetingData={previousMeetingData}
                            onUpdateMeetingData={handleUpdateMeetingData}
                            readOnly={isUser}
                        />
                    )}

                    {/* DREAMS/GOALS STAGE */}
                    {activeStep === 4 && (
                        <DreamsGoalsStage
                            meetingData={meetingData}
                            onUpdateMeetingData={handleUpdateMeetingData}
                            readOnly={isUser}
                        />
                    )}

                    {/* REPORTS STAGE */}
                    {activeStep === 5 && (
                        <div>
                            <ReportsStage
                                meetingData={meetingData}
                                onUpdateMeetingData={handleUpdateMeetingData}
                                readOnly={isUser}
                            />
                            <div className="mt-4 flex justify-center">
                                <button
                                    onClick={() => handlePrint('plan')}
                                    className="px-6 py-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl font-bold uppercase text-xs hover:bg-purple-500 hover:text-white transition-all"
                                >
                                    Imprimir Relatório de Progresso
                                </button>
                            </div>
                        </div>
                    )}

                    {/* TASKS STAGE */}
                    {activeStep === 6 && (
                        <TasksStage
                            meetingData={{
                                ...meetingData,
                                tasks: meetingData.tasks || [
                                    { id: '1', description: 'Manter o acompanhamento mensal de gastos', completed: false },
                                    { id: '2', description: 'Executar o plano de quitação de dívidas', completed: false },
                                    { id: '3', description: 'Revisar metas de sonhos trimestralmente', completed: false }
                                ]
                            }}
                            onUpdateMeetingData={handleUpdateMeetingData}
                            readOnly={isUser}
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
                            userName={currentUser.id} // Idealmente pegar nome real
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
                        />
                    </div>
                )}
                {/* Outros modos de impressão podem ser adicionados aqui */}
            </PrintPortal>
        </div>
    );
};

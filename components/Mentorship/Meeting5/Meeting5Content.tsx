import React, { useState, useEffect } from 'react';
import { LayoutDashboard, TrendingDown, Clock, Target, FileText, CheckCircle, ChevronRight, ChevronLeft, Printer, Wallet } from 'lucide-react';
import { FinancialData, ChecklistData, MentorshipMeeting } from '../../../types';
import { authService } from '../../../services/authService';
import { ReviewStageM5 } from './ReviewStageM5';
import { DebtUpdateStageM5 } from './DebtUpdateStageM5';
import { DebtStatusTrackingStageM5 } from './DebtStatusTrackingStageM5';
import { DreamsGoalsStageM5 } from './DreamsGoalsStageM5';
import { AssetMappingStageM5 } from './AssetMappingStageM5';

import { NonRecurringExpensesStage } from '../Meeting1/NonRecurringExpensesStage';
import { ReportsStageM5 } from './ReportsStageM5';
import { TasksStage } from '../Meeting1/TasksStage';
import { PrintPortal } from '../../PrintPortal';
import { PrintHeader } from '../Meeting1/PrintHeader';

interface Meeting5ContentProps {
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
    { label: 'Status Plano', description: 'Observações M4' },
    { label: 'Patrimônio', description: 'Mapeamento de Bens' },
    { label: 'Sonhos/Objetivos', description: 'Evolução de Metas' },
    { label: 'Relatórios', description: 'Impressão' },
    { label: 'Tarefas', description: 'Próximos Passos' }
];

export const Meeting5Content: React.FC<Meeting5ContentProps> = ({
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
    const [m4Data, setM4Data] = useState<any>(null);
    const [m3Data, setM3Data] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [printMode, setPrintMode] = useState<'review' | 'expenses' | 'debts' | 'dreams' | 'status' | 'assets' | null>(null);

    const isUser = currentUser.role === 'USER';

    // Fetch Previous Meetings Data (M3 and M4)
    useEffect(() => {
        const fetchPreviousData = async () => {
            try {
                const state = await authService.getMentorshipState(userId);

                const m4 = state.meetings.find(m => m.meetingId === 4);
                if (m4) setM4Data(m4.data);

                const m3 = state.meetings.find(m => m.meetingId === 3);
                if (m3) setM3Data(m3.data);
            } catch (error) {
                console.error('Error fetching previous data for M5:', error);
            }
        };
        fetchPreviousData();
    }, [userId]);

    // Initialize data from M4 if empty
    useEffect(() => {
        const initData = async () => {
            let updated = false;
            const newData = { ...meetingData };

            // Initialize Non-Recurring Expenses
            if (!meetingData.nonRecurringExpenses) {
                if (m4Data?.nonRecurringExpenses) {
                    newData.nonRecurringExpenses = m4Data.nonRecurringExpenses;
                    updated = true;
                } else {
                    try {
                        const state = await authService.getMentorshipState(userId);
                        newData.nonRecurringExpenses = state.nonRecurringExpenses || [];
                        updated = true;
                    } catch (error) {
                        console.error("Error initializing expenses for Meeting 5:", error);
                    }
                }
            }

            // Initialize Asset Mapping from M4 if available (useful if they return to M5 after filling it)
            if (!meetingData.assetMapping && m4Data?.assetMapping) {
                newData.assetMapping = m4Data.assetMapping;
                updated = true;
            }

            if (updated) {
                handleUpdateMeetingData((prev: any) => ({ ...prev, ...newData }));
            }
        };
        if (m4Data) {
            initData();
        }
    }, [userId, m4Data]);

    const handleUpdateMeetingData = async (newData: any) => {
        setIsSaving(true);
        try {
            await onUpdateMeetingData(newData);
        } catch (error) {
            console.error('Error updating meeting 5 data:', error);
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
            // Sincronização em Cascata: Puxa da Reunião 4 (m4Data)
            const sourceExpenses = m4Data?.nonRecurringExpenses || [];
            const currentExpenses = meetingData.nonRecurringExpenses || [];

            // 1. Identificar itens locais da M5
            const localItems = currentExpenses.filter((localItem: any) =>
                !sourceExpenses.some((sourceItem: any) => sourceItem.id === localItem.id)
            );

            // 2. Merge: Itens da M4 + Itens Locais da M5
            const mergedExpenses = [...sourceExpenses, ...localItems];

            handleUpdateMeetingData((prev: any) => ({
                ...prev,
                nonRecurringExpenses: mergedExpenses
            }));

            alert("Gastos sincronizados com a Reunião 4 com sucesso!");
        } catch (error) {
            console.error("Error reloading expenses:", error);
            alert("Erro ao sincronizar gastos. Tente novamente.");
        }
    };

    const handleUpdateFinancialData = async (newData: FinancialData) => {
        if (isUser) return;
        await onUpdateFinancialData(newData);
    };

    const handlePrint = (mode: 'review' | 'expenses' | 'debts' | 'dreams' | 'status' | 'assets', data?: any) => {
        setPrintMode(mode);
        setTimeout(() => {
            window.print();
            setPrintMode(null);
        }, 500);
    };

    return (
        <div className="h-full flex flex-col">
            {/* Progress Stepper */}
            <div className="mb-8 px-2 print:hidden overflow-x-auto pb-2">
                <div className="flex items-center justify-between relative min-w-[700px]">
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
                        <ReviewStageM5
                            financialData={financialData}
                            checklistData={checklistData}
                            previousMeetingData={m4Data}
                            onUpdateMeetingData={handleUpdateMeetingData}
                            onUpdateFinancialData={handleUpdateFinancialData}
                            readOnly={isUser}
                            onPrint={() => handlePrint('review')}
                            feedbackQuestion="Como tem sido a manutenção do seu novo estilo de vida financeiro este mês?"
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
                            currentMeeting="M5"
                            syncLabel="Sincronizar com Reunião 4"
                        />
                    )}

                    {/* DEBT UPDATE STAGE */}
                    {activeStep === 2 && (
                        <DebtUpdateStageM5
                            userId={userId}
                            checklistData={checklistData}
                            meetingData={meetingData}
                            previousMeetingData={m4Data}
                            onUpdateMeetingData={handleUpdateMeetingData}
                            readOnly={false}
                        />
                    )}

                    {/* STATUS TRACKING STAGE */}
                    {activeStep === 3 && (
                        <DebtStatusTrackingStageM5
                            meetingData={meetingData}
                            m4Data={m4Data}
                            m3Data={m3Data}
                            onUpdateMeetingData={handleUpdateMeetingData}
                            readOnly={false}
                        />
                    )}

                    {/* ASSET MAPPING STAGE */}
                    {activeStep === 4 && (
                        <AssetMappingStageM5
                            meetingData={meetingData}
                            onUpdateMeetingData={handleUpdateMeetingData}
                            readOnly={isUser}
                            onPrint={() => handlePrint('assets')}
                        />
                    )}

                    {/* DREAMS/GOALS STAGE */}
                    {activeStep === 5 && (
                        <DreamsGoalsStageM5
                            meetingData={meetingData}
                            previousMeetingData={m4Data}
                            onUpdateMeetingData={handleUpdateMeetingData}
                            readOnly={false}
                        />
                    )}

                    {/* REPORTS STAGE */}
                    {activeStep === 6 && (
                        <div>
                            <ReportsStageM5
                                onPrintReview={() => handlePrint('review')}
                                onPrintExpenses={() => handlePrint('expenses')}
                                onPrintDebts={() => handlePrint('debts')}
                                onPrintStatus={() => handlePrint('status')}
                                onPrintDreams={() => handlePrint('dreams')}
                                onPrintAssets={() => handlePrint('assets')}
                            />
                        </div>
                    )}

                    {/* TASKS STAGE */}
                    {activeStep === 7 && (
                        <TasksStage
                            meetingData={meetingData}
                            meetingStatus={meetingStatus}
                            onUpdateMeetingData={handleUpdateMeetingData}
                            onComplete={onComplete}
                            onUnlock={onUnlock}
                            readOnly={isUser}
                            customTasks={[
                                { id: 'm5_task1', label: 'Continuar registrando entradas, saídas e transferências, sem negligenciar nenhum e obedecendo o orçamento definido' },
                                { id: 'm5_task2', label: 'Manter foco na quitação de dívidas e na construção/manutenção da reserva quebra galho' },
                                { id: 'm5_task3', label: 'Revisar mapeamento de patrimônio e entender quais podem ajudar na conquista de metas e sonhos' },
                                { id: 'm5_task4', label: 'Definir valor mensal para a meta em 1ª prioridade' },
                                { id: 'm5_task5', label: 'Definir novo limite de gastos ou manter para o próximo mês - Enviar no grupo do WhatsApp' },
                                { id: 'm5_task6', label: 'Guardar o valor mensal previsto para os Gastos Não Recorrentes dentro da carteira definida' }
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
                            title="Consolidação Financeira - Mentoria M5"
                            user={user}
                            date={new Date().toLocaleDateString('pt-BR')}
                        />
                        <ReviewStageM5
                            financialData={financialData}
                            checklistData={checklistData}
                            meetingData={meetingData}
                            previousMeetingData={m4Data}
                            onUpdateMeetingData={() => { }}
                            onUpdateFinancialData={() => { }}
                            readOnly={true}
                            feedbackQuestion="Como tem sido a manutenção do seu novo estilo de vida financeiro este mês?"
                        />
                    </div>
                )}
                {printMode === 'expenses' && (
                    <div className="print-report">
                        <PrintHeader
                            title="Gastos Não Recorrentes - Mentoria M5"
                            user={user}
                            date={new Date().toLocaleDateString('pt-BR')}
                        />
                        <NonRecurringExpensesStage
                            userId={userId}
                            items={meetingData.nonRecurringExpenses || []}
                            onUpdateItems={() => { }}
                            onReload={() => { }}
                            onPrint={() => { }}
                            currentMeeting="M5"
                            readOnly={true}
                        />
                    </div>
                )}
                {printMode === 'status' && (
                    <div className="print-report">
                        <PrintHeader
                            title="Status do Plano - Mentoria M5"
                            user={user}
                            date={new Date().toLocaleDateString('pt-BR')}
                        />
                        <DebtStatusTrackingStageM5
                            meetingData={meetingData}
                            m4Data={m4Data}
                            m3Data={m3Data}
                            onUpdateMeetingData={() => { }}
                            readOnly={true}
                        />
                    </div>
                )}
                {printMode === 'debts' && (
                    <div className="print-report">
                        <PrintHeader
                            title="Atualização de Dívidas - Mentoria M5"
                            user={user}
                            date={new Date().toLocaleDateString('pt-BR')}
                        />
                        <DebtUpdateStageM5
                            userId={userId}
                            checklistData={checklistData}
                            meetingData={meetingData}
                            previousMeetingData={m4Data}
                            onUpdateMeetingData={() => { }}
                            readOnly={true}
                        />
                    </div>
                )}
                {printMode === 'dreams' && (
                    <div className="print-report">
                        <PrintHeader
                            title="Sonhos e Objetivos - Mentoria M5"
                            user={user}
                            date={new Date().toLocaleDateString('pt-BR')}
                        />
                        <DreamsGoalsStageM5
                            meetingData={meetingData}
                            previousMeetingData={m4Data}
                            onUpdateMeetingData={() => { }}
                            readOnly={true}
                        />
                    </div>
                )}
                {printMode === 'assets' && (
                    <div className="print-report">
                        <PrintHeader
                            title="Mapeamento de Patrimônio - Mentoria M5"
                            user={user}
                            date={new Date().toLocaleDateString('pt-BR')}
                        />
                        <AssetMappingStageM5
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

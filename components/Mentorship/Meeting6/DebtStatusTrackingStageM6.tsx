import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, Clock, AlertCircle, ListTodo, Calendar, MessageSquare, ChevronDown, CheckCircle, RefreshCw, History } from 'lucide-react';

interface DebtPriorityStatus {
    id: string;
    name: string;
    creditor: string;
    status: 'Não Iniciado' | 'Em Andamento' | 'Finalizado';
    observation: string;
    date: string;
    previousObservation?: string; // Observação da Reunião 5
}

interface DebtStatusTrackingStageM6Props {
    meetingData: any;
    m5Data: any;
    m4Data: any;
    m3Data: any;
    onUpdateMeetingData: (data: any) => void;
    readOnly?: boolean;
}

export const DebtStatusTrackingStageM6: React.FC<DebtStatusTrackingStageM6Props> = ({
    meetingData,
    m5Data,
    m4Data,
    m3Data,
    onUpdateMeetingData,
    readOnly = false
}) => {
    const [statusItems, setStatusItems] = useState<DebtPriorityStatus[]>(meetingData?.debtPriorityStatus || []);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        // Initialize from Meeting 3 (Source of Truth for priority debt) 
        // and Meeting 5 (Source of observations)
        const hasExistingStatus = meetingData?.debtPriorityStatus && meetingData.debtPriorityStatus.length > 0;

        if (!hasExistingStatus && m3Data) {
            let debtsToTrack: any[] = [];

            // Case A: M3 has 'priorityDebtId'
            if (m3Data.priorityDebtId && m3Data.debtUpdates) {
                const priorityDebt = m3Data.debtUpdates.find((d: any) => d.id === m3Data.priorityDebtId);
                if (priorityDebt) {
                    debtsToTrack = [priorityDebt];
                }
            }
            // Case B: Fallback
            else if (m3Data.selectedDebts) {
                debtsToTrack = m3Data.selectedDebts;
            }

            if (debtsToTrack.length > 0) {
                const initialItems: DebtPriorityStatus[] = debtsToTrack.map((d: any) => {
                    // Try to find previous observation and status from M5 (or M4 as fallback)
                    const m5Status = m5Data?.debtPriorityStatus?.find((ps: any) => ps.id === d.id);
                    const m4Status = m4Data?.debtPriorityStatus?.find((ps: any) => ps.id === d.id);
                    const prevStatus = m5Status || m4Status;

                    // O que foi escrito na R4 foi herdado como previousObservation na R5
                    const m4Obs = m5Status?.previousObservation || m4Status?.observation || '';
                    const m4Previous = m4Obs ? `R4: ${m4Obs}` : '';

                    // O que foi escrito na R5 fica no observation da R5
                    const m5Previous = m5Status?.observation ? `R5: ${m5Status.observation}` : '';

                    const combinedHistory = [m4Previous, m5Previous].filter(Boolean).join('\n\n');

                    return {
                        id: d.id,
                        name: d.name,
                        creditor: d.creditor,
                        status: prevStatus?.status || 'Não Iniciado',
                        observation: '', // New observation for M6
                        previousObservation: combinedHistory, // History M4 + M5
                        date: new Date().toISOString().split('T')[0]
                    };
                });
                setStatusItems(initialItems);
                onUpdateMeetingData((prev: any) => ({ ...prev, debtPriorityStatus: initialItems }));
            }
        }
    }, [m3Data, m4Data, m5Data]);

    const handleRefresh = () => {
        if (!m3Data?.priorityDebtId || !m3Data?.debtUpdates) {
            alert("Não há dados da Reunião 3 (Dívida Alvo) para sincronizar.");
            return;
        }

        const priorityId = m3Data.priorityDebtId;
        const sourceDebt = m3Data.debtUpdates.find((d: any) => d.id === priorityId);

        if (!sourceDebt) {
            alert("Dívida prioritária não encontrada na Reunião 3.");
            return;
        }

        const m5Status = m5Data?.debtPriorityStatus?.find((ps: any) => ps.id === sourceDebt.id);
        const m4Status = m4Data?.debtPriorityStatus?.find((ps: any) => ps.id === sourceDebt.id);
        const prevStatus = m5Status || m4Status;

        const m4Obs = m5Status?.previousObservation || m4Status?.observation || '';
        const m4Previous = m4Obs ? `R4: ${m4Obs}` : '';
        const m5Previous = m5Status?.observation ? `R5: ${m5Status.observation}` : '';
        const combinedHistory = [m4Previous, m5Previous].filter(Boolean).join('\n\n');

        const currentItem = statusItems.find(i => i.id === sourceDebt.id);

        if (currentItem) {
            // Update reference values and inherit from M4/M5 if M6 is still empty
            const updatedItems = statusItems.map(i =>
                i.id === sourceDebt.id
                    ? {
                        ...i,
                        name: sourceDebt.name,
                        creditor: sourceDebt.creditor,
                        previousObservation: combinedHistory || i.previousObservation
                    }
                    : i
            );
            setStatusItems(updatedItems);
            onUpdateMeetingData((prev: any) => ({ ...prev, debtPriorityStatus: updatedItems }));
            alert("Dados da Reunião 3, 4 e 5 sincronizados com sucesso!");
        } else {
            if (confirm("Deseja sincronizar com a dívida prioritária da Reunião 3? O histórico atual desta etapa na M6 será substituído.")) {
                const newItem: DebtPriorityStatus = {
                    id: sourceDebt.id,
                    name: sourceDebt.name,
                    creditor: sourceDebt.creditor,
                    status: prevStatus?.status || 'Não Iniciado',
                    observation: '',
                    previousObservation: combinedHistory || '',
                    date: new Date().toISOString().split('T')[0]
                };
                setStatusItems([newItem]);
                onUpdateMeetingData((prev: any) => ({ ...prev, debtPriorityStatus: [newItem] }));
            }
        }
    };

    const handleUpdateStatus = (id: string, field: keyof DebtPriorityStatus, value: any) => {
        if (readOnly) return;

        let finalValue = value;

        if (field === 'observation' && typeof value === 'string') {
            const today = new Date().toLocaleDateString('pt-BR');
            const datePrefix = `${today} - `;

            if (value.length > 0 && !value.startsWith(datePrefix)) {
                const currentItem = statusItems.find(i => i.id === id);
                if (currentItem && !currentItem.observation.startsWith(datePrefix)) {
                    finalValue = `${datePrefix}${value}`;
                }
            }
        }

        const newItems = statusItems.map(item =>
            item.id === id ? { ...item, [field]: finalValue } : item
        );
        setStatusItems(newItems);
    };

    const handleSave = () => {
        onUpdateMeetingData((prev: any) => ({ ...prev, debtPriorityStatus: statusItems }));
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Finalizado': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'Em Andamento': return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
            default: return 'text-slate-400 bg-slate-800 border-slate-700';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in relative pb-10 print:pb-0">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black text-white flex items-center gap-3 print:text-black">
                        <ListTodo className="text-purple-400 print:text-purple-600" size={24} />
                        Acompanhamento do Plano de Quitação
                    </h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1 print:text-gray-500">
                        Evolução da dívida selecionada na Reunião 3 com histórico da Reunião 4 e 5
                    </p>
                </div>
                {!readOnly && (
                    <button
                        onClick={handleRefresh}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all text-[10px] font-bold uppercase text-slate-300 hover:text-white"
                        title="Sincronizar com Reunião 3, 4 e 5"
                    >
                        <RefreshCw size={14} />
                        Sincronizar Dados
                    </button>
                )}
            </div>

            {statusItems.length === 0 ? (
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
                    <AlertCircle className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">Nenhum dado de quitação herdado.</p>
                    <p className="text-xs text-slate-600 mt-2 uppercase font-bold">Inicie o plano na Reunião 3 e acompanhe na Reunião 5 para visualizar aqui.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {statusItems.map((item) => (
                        <div key={item.id} className="bg-slate-900/40 border border-slate-800 rounded-[1.5rem] p-6 hover:border-slate-700 transition-all group print:bg-white print:border-gray-200 print:break-inside-avoid">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h4 className="font-bold text-white text-lg print:text-black">{item.name}</h4>
                                        <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-tight transition-all ${getStatusColor(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{item.creditor}</p>
                                </div>

                                <div className="flex flex-wrap items-center gap-6">
                                    {/* Status Selector */}
                                    <div className="space-y-1.5 min-w-[160px]">
                                        <label className="text-[10px] text-slate-500 uppercase font-black px-1">Status na R6</label>
                                        <div className="relative">
                                            <select
                                                value={item.status}
                                                disabled={readOnly}
                                                onChange={(e) => handleUpdateStatus(item.id, 'status', e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-300 appearance-none focus:border-purple-500 outline-none transition-all cursor-pointer print:bg-white print:border-slate-300 print:text-slate-900"
                                            >
                                                <option value="Não Iniciado">Não Iniciado</option>
                                                <option value="Em Andamento">Em Andamento</option>
                                                <option value="Finalizado">Finalizado</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none print:text-slate-400" size={14} />
                                        </div>
                                    </div>

                                    {/* Date Selector */}
                                    <div className="space-y-1.5 min-w-[140px]">
                                        <label className="text-[10px] text-slate-500 uppercase font-black px-1">Data / Previsão</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                                            <input
                                                type="date"
                                                value={item.date}
                                                disabled={readOnly}
                                                onChange={(e) => handleUpdateStatus(item.id, 'date', e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 pl-10 text-xs font-bold text-slate-300 focus:border-purple-500 outline-none transition-all print:bg-white print:border-slate-300 print:text-slate-900"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Previous Observation from M4 */}
                            {item.previousObservation && (
                                <div className="mt-6 p-4 rounded-xl bg-slate-950/50 border border-slate-800/50 animate-in fade-in slide-in-from-top-2 duration-500 print:bg-slate-50 print:border-slate-300">
                                    <div className="flex items-center gap-2 mb-2">
                                        <History size={12} className="text-slate-500 print:text-slate-400" />
                                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest print:text-slate-500">Histórico Anteriores (R4 e R5)</span>
                                    </div>
                                    <p className="text-xs text-slate-400 italic leading-relaxed whitespace-pre-wrap print:text-slate-700">
                                        {item.previousObservation}
                                    </p>
                                </div>
                            )}

                            {/* Current Observation for M6 */}
                            <div className="mt-6 pt-6 border-t border-slate-800/50 print:border-slate-200">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center flex-shrink-0 text-slate-600 print:bg-white print:border-slate-300 print:text-slate-400">
                                        <MessageSquare size={16} />
                                    </div>
                                    <textarea
                                        placeholder="Novas observações para esta Reunião 6..."
                                        value={item.observation}
                                        disabled={readOnly}
                                        onChange={(e) => handleUpdateStatus(item.id, 'observation', e.target.value)}
                                        className="w-full bg-transparent text-sm text-slate-400 placeholder:text-slate-700 outline-none resize-none pt-1 print:text-slate-900"
                                        rows={2}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!readOnly && statusItems.length > 0 && (
                <div className="flex justify-end pt-8 border-t border-slate-800 print:hidden">
                    <button onClick={handleSave} className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-purple-500/20 uppercase text-xs tracking-widest">
                        {showSuccess ? <><CheckCircle size={18} /> Salvo!</> : <><Save size={18} /> Salvar Status R6</>}
                    </button>
                </div>
            )}
        </div>
    );
};

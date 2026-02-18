import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, Clock, AlertCircle, ListTodo, Calendar, MessageSquare, ChevronDown, CheckCircle } from 'lucide-react';

interface DebtPriorityStatus {
    id: string;
    name: string;
    creditor: string;
    status: 'Não Iniciado' | 'Em Andamento' | 'Finalizado';
    observation: string;
    date: string;
}

interface DebtStatusTrackingStageProps {
    meetingData: any;
    previousMeetingData: any;
    onUpdateMeetingData: (data: any) => void;
    readOnly?: boolean;
}

export const DebtStatusTrackingStage: React.FC<DebtStatusTrackingStageProps> = ({
    meetingData,
    previousMeetingData,
    onUpdateMeetingData,
    readOnly = false
}) => {
    const [statusItems, setStatusItems] = useState<DebtPriorityStatus[]>(meetingData?.debtPriorityStatus || []);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        // Initialize from Meeting 3 Repayment Plan
        if ((!meetingData?.debtPriorityStatus || meetingData.debtPriorityStatus.length === 0) && previousMeetingData?.selectedDebts) {
            const initialItems: DebtPriorityStatus[] = previousMeetingData.selectedDebts.map((d: any) => ({
                id: d.id,
                name: d.name,
                creditor: d.creditor,
                status: 'Não Iniciado',
                observation: '',
                date: new Date().toISOString().split('T')[0]
            }));
            setStatusItems(initialItems);
            onUpdateMeetingData({ ...meetingData, debtPriorityStatus: initialItems });
        }
    }, [previousMeetingData]);

    const handleUpdateStatus = (id: string, field: keyof DebtPriorityStatus, value: any) => {
        if (readOnly) return;
        const newItems = statusItems.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        );
        setStatusItems(newItems);
    };

    const handleSave = () => {
        onUpdateMeetingData({ ...meetingData, debtPriorityStatus: statusItems });
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
        <div className="space-y-6 animate-fade-in relative pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black text-white flex items-center gap-3">
                        <ListTodo className="text-purple-400" size={24} />
                        Acompanhamento do Plano de Quitação
                    </h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">
                        Acompanhe o status das dívidas selecionadas para prioridade na Reunião 3
                    </p>
                </div>
            </div>

            {statusItems.length === 0 ? (
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
                    <AlertCircle className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">Nenhum plano de quitação herdado da Reunião 3.</p>
                    <p className="text-xs text-slate-600 mt-2 uppercase font-bold">Verifique se as dívidas foram selecionadas na etapa "Plano de Quitação" da reunião anterior.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {statusItems.map((item) => (
                        <div key={item.id} className="bg-slate-900/40 border border-slate-800 rounded-[1.5rem] p-6 hover:border-slate-700 transition-all group">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h4 className="font-bold text-white text-lg">{item.name}</h4>
                                        <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-tight transition-all ${getStatusColor(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{item.creditor}</p>
                                </div>

                                <div className="flex flex-wrap items-center gap-6">
                                    {/* Status Selector */}
                                    <div className="space-y-1.5 min-w-[160px]">
                                        <label className="text-[10px] text-slate-500 uppercase font-black px-1">Status Atual</label>
                                        <div className="relative">
                                            <select
                                                value={item.status}
                                                disabled={readOnly}
                                                onChange={(e) => handleUpdateStatus(item.id, 'status', e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-300 appearance-none focus:border-purple-500 outline-none transition-all cursor-pointer"
                                            >
                                                <option value="Não Iniciado">Não Iniciado</option>
                                                <option value="Em Andamento">Em Andamento</option>
                                                <option value="Finalizado">Finalizado</option>
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" size={14} />
                                        </div>
                                    </div>

                                    {/* Date Selector */}
                                    <div className="space-y-1.5 min-w-[140px]">
                                        <label className="text-[10px] text-slate-500 uppercase font-black px-1">Previsão / Data</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                                            <input
                                                type="date"
                                                value={item.date}
                                                disabled={readOnly}
                                                onChange={(e) => handleUpdateStatus(item.id, 'date', e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 pl-10 text-xs font-bold text-slate-300 focus:border-purple-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-800/50">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center flex-shrink-0 text-slate-600">
                                        <MessageSquare size={16} />
                                    </div>
                                    <textarea
                                        placeholder="Observações sobre o andamento (Ex: Negociação iniciada, aguardando boleto...)"
                                        value={item.observation}
                                        disabled={readOnly}
                                        onChange={(e) => handleUpdateStatus(item.id, 'observation', e.target.value)}
                                        className="w-full bg-transparent text-sm text-slate-400 placeholder:text-slate-700 outline-none resize-none pt-1"
                                        rows={2}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!readOnly && statusItems.length > 0 && (
                <div className="flex justify-end pt-8 border-t border-slate-800">
                    <button onClick={handleSave} className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-purple-500/20 uppercase text-xs tracking-widest">
                        {showSuccess ? <><CheckCircle size={18} /> Salvo!</> : <><Save size={18} /> Salvar Status</>}
                    </button>
                </div>
            )}
        </div>
    );
};

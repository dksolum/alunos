import React, { useState, useEffect } from 'react';
import { DebtMapItem, ChecklistData } from '../../../types';
import { authService } from '../../../services/authService';
import { Save, CheckCircle2, AlertCircle, TrendingDown, Clock, Percent, RefreshCw, Plus, Trash2, CheckSquare, Square } from 'lucide-react';

interface DebtUpdateItem {
    id: string;
    name: string;
    creditor: string;
    originalInstallment: number;
    newInstallment: number;
    originalQuantity: number;
    newQuantity: number;
    originalInterest: string;
    newInterest: string;
    isNegotiated: boolean;
    isManual?: boolean;
    isPaid?: boolean; // NEW: Is this debt being paid?
    amortizationConfirmed?: boolean; // NEW: User confirmed -1 installment
    updatedAt?: string;
    createdAt?: string;
    endDate?: string;
}

interface DebtUpdateStageM3Props {
    userId: string;
    checklistData: ChecklistData;
    meetingData: any;
    previousMeetingData: any;
    onUpdateMeetingData: (data: any) => void;
    readOnly?: boolean;
}

export const DebtUpdateStageM3: React.FC<DebtUpdateStageM3Props> = ({
    userId,
    checklistData,
    meetingData,
    previousMeetingData,
    onUpdateMeetingData,
    readOnly = false
}) => {
    const [debts, setDebts] = useState<DebtUpdateItem[]>(meetingData?.debtUpdates || []);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const calculateEndDate = (months: number) => {
        if (!months || months <= 0) return '---';
        const date = new Date();
        date.setDate(1);
        date.setMonth(date.getMonth() + months);
        return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    };

    const fetchAndMergeDebts = async (isManualRefresh = false) => {
        // If we have data in meeting 3 and it's not a manual refresh, just use it
        if (!isManualRefresh && meetingData?.debtUpdates && meetingData.debtUpdates.length > 0) {
            setDebts(meetingData.debtUpdates);
            return;
        }

        if (isManualRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            // Priority 1: Meeting 2 Data
            let meeting2Debts: any[] = previousMeetingData?.debtUpdates || [];

            // Priority 2: Global Mapping (if M2 is somehow empty)
            if (meeting2Debts.length === 0) {
                const mapping = await authService.getDebtMapping(userId);
                meeting2Debts = mapping.map(d => ({
                    id: d.id,
                    name: d.name,
                    creditor: d.creditor,
                    newInstallment: Number(d.installmentValue) || 0,
                    newQuantity: Number(d.remainingInstallments) || Number(d.totalInstallments) || 0,
                    newInterest: d.interestRate || '0%',
                    isNegotiated: false
                }));
            }

            const now = new Date().toISOString();

            // Merge M2 result as the "Reference/Original" for M3
            const syncedDebts: DebtUpdateItem[] = meeting2Debts.map(d => {
                // If it's a manual refresh, we WANT to overwrite Meeting 3 local values with Meeting 2's latest values
                // If it's the initial load, we try to preserve what was already in Meeting 3
                const existingM3 = debts.find(m => m.id === d.id);
                const useLocalM3 = !isManualRefresh && existingM3;

                return {
                    id: d.id,
                    name: d.name,
                    creditor: d.creditor,
                    originalInstallment: d.newInstallment || d.originalInstallment || 0,
                    newInstallment: useLocalM3 ? (existingM3?.newInstallment ?? (d.newInstallment || d.originalInstallment || 0)) : (d.newInstallment || d.originalInstallment || 0),
                    originalQuantity: d.newQuantity || d.originalQuantity || 0,
                    newQuantity: useLocalM3 ? (existingM3?.newQuantity ?? (d.newQuantity || d.originalQuantity || 0)) : (d.newQuantity || d.originalQuantity || 0),
                    originalInterest: d.newInterest || d.originalInterest || '0%',
                    newInterest: useLocalM3 ? (existingM3?.newInterest ?? (d.newInterest || d.originalInterest || '0%')) : (d.newInterest || d.originalInterest || '0%'),
                    isNegotiated: d.isNegotiated,
                    isManual: false, // Everything from the past is non-manual in M3
                    isPaid: useLocalM3 ? (existingM3?.isPaid !== undefined ? existingM3.isPaid : true) : true, // Reset to paid if refresh
                    amortizationConfirmed: useLocalM3 ? (existingM3?.amortizationConfirmed || false) : false,
                    createdAt: d.createdAt || now,
                    updatedAt: now,
                    endDate: calculateEndDate(useLocalM3 ? (existingM3?.newQuantity || d.newQuantity || d.originalQuantity || 0) : (d.newQuantity || d.originalQuantity || 0))
                };
            });

            // Keep only the manual debts that were added SPECIFICALLY in Meeting 3
            // AND ensure they aren't already represented in syncedDebts (ID check)
            const syncedIds = new Set(syncedDebts.map(d => d.id));
            const meeting3ManualDebts = debts.filter(d => d.isManual && !syncedIds.has(d.id));

            const finalDebts = [...syncedDebts, ...meeting3ManualDebts];

            setDebts(finalDebts);
            onUpdateMeetingData({ ...meetingData, debtUpdates: finalDebts });

            if (isManualRefresh) {
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 2000);
            }
        } catch (error) {
            console.error("Error fetching/merging Debt Update Stage M3:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (userId) fetchAndMergeDebts();
    }, [userId]);

    const handleRefresh = () => {
        fetchAndMergeDebts(true);
    };

    const handleUpdateDebt = (id: string, field: keyof DebtUpdateItem, value: any) => {
        if (readOnly) return;
        const now = new Date().toISOString();
        const newDebts = debts.map(d => {
            if (d.id === id) {
                const updated = { ...d, [field]: value, updatedAt: now };

                // Special Logic for Payment Status and Amortization
                if (field === 'isPaid') {
                    if (value === true) {
                        // SUGGEST auto-reduction if marked as paid
                        updated.amortizationConfirmed = true;
                        updated.newQuantity = Math.max(0, d.originalQuantity - 1);
                    } else {
                        // Reset if marked as NOT paid
                        updated.amortizationConfirmed = false;
                        updated.newQuantity = d.originalQuantity;
                    }
                }

                if (field === 'amortizationConfirmed') {
                    updated.newQuantity = value ? Math.max(0, d.originalQuantity - 1) : d.originalQuantity;
                }

                if (field === 'newQuantity') {
                    updated.endDate = calculateEndDate(value);
                }

                return updated;
            }
            return d;
        });
        setDebts(newDebts);
    };

    const handleAddManualDebt = () => {
        if (readOnly) return;
        const now = new Date().toISOString();
        const newDebt: DebtUpdateItem = {
            id: `manual-${crypto.randomUUID()}`,
            name: 'Nova Dívida Descoberta',
            creditor: 'Credor Desconhecido',
            originalInstallment: 0,
            newInstallment: 0,
            originalQuantity: 0,
            newQuantity: 12,
            originalInterest: '0%',
            newInterest: '0%',
            isNegotiated: false,
            isManual: true,
            isPaid: true,
            createdAt: now,
            updatedAt: now,
            endDate: calculateEndDate(12)
        };
        setDebts([...debts, newDebt]);
    };

    const handleRemoveDebt = (id: string) => {
        if (readOnly) return;
        setDebts(debts.filter(d => d.id !== id));
    };

    const handleSave = () => {
        onUpdateMeetingData({ ...meetingData, debtUpdates: debts });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-8 h-8 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
                <p className="text-slate-400 font-medium">Sincronizando com Reunião 2...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in relative pb-10 print:space-y-8 print:pb-0">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4 print:hidden">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <TrendingDown className="text-emerald-400" size={20} />
                        Atualização das Dívidas
                    </h3>
                    <button
                        onClick={handleRefresh}
                        disabled={loading || refreshing || readOnly}
                        className={`p-1.5 rounded-lg border transition-all flex items-center gap-2 text-[10px] font-bold uppercase
                            ${refreshing ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 font-black' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'}
                            ${(loading || refreshing || readOnly) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                        {refreshing ? 'Sincronizando...' : 'Sincronizar M2'}
                    </button>
                    <button
                        onClick={handleAddManualDebt}
                        className="p-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-all flex items-center gap-2 text-[10px] font-bold uppercase"
                    >
                        <Plus size={14} />
                        Nova Dívida
                    </button>
                </div>
            </div>

            <div className="grid gap-4">
                {debts.map(debt => {
                    const hasReduction = debt.newInstallment < debt.originalInstallment;

                    return (
                        <div key={debt.id} className={`bg-slate-900/50 border rounded-2xl p-5 transition-all group print:bg-white print:border-gray-200 ${debt.isPaid ? 'border-slate-800' : 'border-rose-500/30'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleUpdateDebt(debt.id, 'isPaid', !debt.isPaid)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase transition-all ${debt.isPaid ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}
                                        >
                                            <div className={`w-3 h-3 rounded-full ${debt.isPaid ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                            {debt.isPaid ? 'Está sendo paga' : 'Não está sendo paga'}
                                        </button>

                                        {debt.isPaid && (
                                            <button
                                                onClick={() => handleUpdateDebt(debt.id, 'amortizationConfirmed', !debt.amortizationConfirmed)}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase transition-all ${debt.amortizationConfirmed ? 'bg-sky-500/10 border-sky-500/30 text-sky-400 shadow-lg shadow-sky-500/10' : 'bg-slate-800 border-slate-700 text-slate-500 opacity-50'}`}
                                            >
                                                {debt.amortizationConfirmed ? <CheckSquare size={14} /> : <Square size={14} />}
                                                Marcar como Amortizada (-1 parcela)
                                            </button>
                                        )}
                                    </div>
                                    <div className="mt-3">
                                        {debt.isManual ? (
                                            <input
                                                type="text"
                                                value={debt.name}
                                                onChange={(e) => handleUpdateDebt(debt.id, 'name', e.target.value)}
                                                className="bg-transparent border-none p-0 font-bold text-white text-lg outline-none focus:text-sky-400"
                                            />
                                        ) : (
                                            <h4 className="font-bold text-white text-lg">{debt.name}</h4>
                                        )}
                                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider">{debt.creditor}</p>
                                    </div>
                                </div>

                                {debt.isManual && !readOnly && (
                                    <button onClick={() => handleRemoveDebt(debt.id)} className="p-2 text-slate-600 hover:text-red-400">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Parcela */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <TrendingDown size={14} />
                                        <span className="text-[10px] uppercase font-black tracking-widest">Parcela Mensal</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="p-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                                            <p className="text-[8px] text-slate-500 uppercase font-bold mb-1">Anterior (M2)</p>
                                            <p className="text-xs font-bold text-slate-400">R$ {debt.originalInstallment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                        </div>
                                        <div className={`p-2 rounded-lg border ${hasReduction ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-800 border-slate-700'}`}>
                                            <p className="text-[8px] text-slate-500 uppercase font-bold mb-1">Atual</p>
                                            <input
                                                type="text"
                                                disabled={readOnly}
                                                value={debt.newInstallment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value.replace(/[^\d]/g, '')) / 100;
                                                    handleUpdateDebt(debt.id, 'newInstallment', val || 0);
                                                }}
                                                className={`w-full bg-transparent text-xs font-black outline-none ${hasReduction ? 'text-emerald-400' : 'text-white'}`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Prazo */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Clock size={14} />
                                        <span className="text-[10px] uppercase font-black tracking-widest">Prazo (Meses)</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="p-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                                            <p className="text-[8px] text-slate-500 uppercase font-bold mb-1">Anterior (M2)</p>
                                            <p className="text-xs font-bold text-slate-400">{debt.originalQuantity}x</p>
                                        </div>
                                        <div className={`p-2 rounded-lg border transition-all ${debt.amortizationConfirmed ? 'bg-sky-500/5 border-sky-500/20' : 'bg-slate-800 border-slate-700'}`}>
                                            <p className="text-[8px] text-slate-500 uppercase font-bold mb-1">Atual</p>
                                            <input
                                                type="number"
                                                disabled={readOnly}
                                                value={debt.newQuantity}
                                                onChange={(e) => handleUpdateDebt(debt.id, 'newQuantity', parseInt(e.target.value) || 0)}
                                                className={`w-full bg-transparent text-xs font-black outline-none ${debt.amortizationConfirmed ? 'text-sky-400' : 'text-white'}`}
                                            />
                                            <p className="text-[9px] font-black text-slate-500 uppercase mt-1">Término: <span className="text-sky-400">{debt.endDate}</span></p>
                                        </div>
                                    </div>
                                </div>

                                {/* Juros */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Percent size={14} />
                                        <span className="text-[10px] uppercase font-black tracking-widest">Taxa / Juros</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="p-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                                            <p className="text-[8px] text-slate-500 uppercase font-bold mb-1">Anterior (M2)</p>
                                            <p className="text-xs font-bold text-slate-400">{debt.originalInterest}</p>
                                        </div>
                                        <div className="p-2 bg-slate-800 border border-slate-700 rounded-lg">
                                            <p className="text-[8px] text-slate-500 uppercase font-bold mb-1">Atual</p>
                                            <input
                                                type="text"
                                                disabled={readOnly}
                                                value={debt.newInterest}
                                                onChange={(e) => handleUpdateDebt(debt.id, 'newInterest', e.target.value)}
                                                className="w-full bg-transparent text-xs font-black text-white outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {!readOnly && debts.length > 0 && (
                <div className="flex justify-end pt-8 border-t border-slate-800 print:hidden">
                    <button onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20">
                        {showSuccess ? <><CheckCircle2 size={18} /> Salvo!</> : <><Save size={18} /> Salvar Atualizações</>}
                    </button>
                </div>
            )}
        </div>
    );
};

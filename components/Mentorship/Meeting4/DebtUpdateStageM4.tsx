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
    isPaid?: boolean;
    amortizationConfirmed?: boolean;
    origin?: 'mapping' | 'meeting2' | 'meeting3' | 'meeting4';
    updatedAt?: string;
    createdAt?: string;
    endDate?: string;
}

interface DebtUpdateStageM4Props {
    userId: string;
    checklistData: ChecklistData;
    meetingData: any;
    previousMeetingData: any;
    onUpdateMeetingData: (data: any) => void;
    readOnly?: boolean;
}

export const DebtUpdateStageM4: React.FC<DebtUpdateStageM4Props> = ({
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
    const [isAddingDebt, setIsAddingDebt] = useState(false);
    const [newDebtData, setNewDebtData] = useState({
        name: '',
        creditor: '',
        installment: 0,
        quantity: 12,
        interest: '0%'
    });

    const existingCreditors = Array.from(new Set(debts.map(d => d.creditor))).filter(Boolean);

    const calculateEndDate = (months: number) => {
        if (!months || months <= 0) return '---';
        const date = new Date();
        date.setDate(1);
        date.setMonth(date.getMonth() + months);
        return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    };

    const fetchAndMergeDebts = async (isManualRefresh = false) => {
        if (!isManualRefresh && meetingData?.debtUpdates && meetingData.debtUpdates.length > 0) {
            setDebts(meetingData.debtUpdates);
            return;
        }

        if (isManualRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            let m3Data = previousMeetingData;

            if (isManualRefresh) {
                const state = await authService.getMentorshipState(userId);
                const m3 = state.meetings.find(m => m.meetingId === 3);
                if (m3) m3Data = m3.data;
            }

            // Priority 1: Meeting 3 Data
            let meeting3Debts: any[] = m3Data?.debtUpdates || [];

            // Fallback: This should ideally not happen if M3 was done
            if (meeting3Debts.length === 0) {
                const mapping = await authService.getDebtMapping(userId);
                meeting3Debts = mapping.map(d => ({
                    id: d.id,
                    name: d.name,
                    creditor: d.creditor,
                    newInstallment: Number(d.installmentValue) || 0,
                    newQuantity: Number(d.remainingInstallments) || Number(d.totalInstallments) || 0,
                    newInterest: d.interestRate || '0%',
                    isNegotiated: false,
                    origin: 'mapping',
                    createdAt: d.createdAt
                }));
            }

            const now = new Date().toISOString();

            const syncedDebts: DebtUpdateItem[] = meeting3Debts.map(d => {
                const existingM4 = debts.find(m => m.id === d.id);
                const useLocalM4 = !isManualRefresh && existingM4;

                return {
                    id: d.id,
                    name: d.name,
                    creditor: d.creditor,
                    originalInstallment: d.newInstallment || d.originalInstallment || 0,
                    newInstallment: useLocalM4 ? (existingM4?.newInstallment ?? (d.newInstallment || d.originalInstallment || 0)) : (d.newInstallment || d.originalInstallment || 0),
                    originalQuantity: d.newQuantity || d.originalQuantity || 0,
                    newQuantity: useLocalM4 ? (existingM4?.newQuantity ?? (d.newQuantity || d.originalQuantity || 0)) : (d.newQuantity || d.originalQuantity || 0),
                    originalInterest: d.newInterest || d.originalInterest || '0%',
                    newInterest: useLocalM4 ? (existingM4?.newInterest ?? (d.newInterest || d.originalInterest || '0%')) : (d.newInterest || d.originalInterest || '0%'),
                    isNegotiated: d.isNegotiated, // Inherit from M3
                    isManual: false,
                    isPaid: useLocalM4 ? (existingM4?.isPaid !== undefined ? existingM4.isPaid : (d.isPaid !== undefined ? d.isPaid : true)) : (d.isPaid !== undefined ? d.isPaid : true),
                    amortizationConfirmed: useLocalM4 ? (existingM4?.amortizationConfirmed || false) : false,
                    origin: d.origin || 'mapping',
                    createdAt: d.createdAt || now,
                    updatedAt: now,
                    endDate: calculateEndDate(useLocalM4 ? (existingM4?.newQuantity || d.newQuantity || d.originalQuantity || 0) : (d.newQuantity || d.originalQuantity || 0))
                };
            });

            const syncedIds = new Set(syncedDebts.map(d => d.id));
            const meeting4ManualDebts = debts.filter(d => d.isManual && !syncedIds.has(d.id));

            const finalDebts = [...syncedDebts, ...meeting4ManualDebts];
            setDebts(finalDebts);
            onUpdateMeetingData((prev: any) => ({ ...prev, debtUpdates: finalDebts }));

            if (isManualRefresh) {
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            }
        } catch (error) {
            console.error('Error fetching/merging debts in M4:', error);
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

                if (field === 'isPaid') {
                    if (value === true) {
                        updated.amortizationConfirmed = true;
                        updated.newQuantity = Math.max(0, d.originalQuantity - 1);
                    } else {
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
        setNewDebtData({
            name: '',
            creditor: '',
            installment: 0,
            quantity: 12,
            interest: '0%'
        });
        setIsAddingDebt(true);
    };

    const confirmAddManualDebt = () => {
        if (!newDebtData.name || !newDebtData.creditor) {
            alert("Nome da dívida e credor são obrigatórios");
            return;
        }

        const now = new Date().toISOString();
        const newDebt: DebtUpdateItem = {
            id: `manual-${crypto.randomUUID()}`,
            name: newDebtData.name,
            creditor: newDebtData.creditor,
            originalInstallment: 0,
            newInstallment: newDebtData.installment,
            originalQuantity: 0,
            newQuantity: newDebtData.quantity,
            originalInterest: '0%',
            newInterest: newDebtData.interest.includes('%') ? newDebtData.interest : `${newDebtData.interest}%`,
            isNegotiated: false,
            isManual: true,
            isPaid: true,
            origin: 'meeting4',
            createdAt: now,
            updatedAt: now,
            endDate: calculateEndDate(newDebtData.quantity)
        };
        setDebts([...debts, newDebt]);
        setIsAddingDebt(false);
    };

    const handleRemoveDebt = (id: string) => {
        if (readOnly) return;
        setDebts(debts.filter(d => d.id !== id));
    };

    const handleSave = () => {
        onUpdateMeetingData((prev: any) => ({ ...prev, debtUpdates: debts }));
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-8 h-8 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
                <p className="text-slate-400 font-medium">Sincronizando com Reunião 3...</p>
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
                        {refreshing ? 'Atualizando...' : 'Atualizar'}
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

            {isAddingDebt && (
                <div className="bg-sky-500/5 border border-sky-500/20 rounded-[2rem] p-8 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-sky-500/20 text-sky-400 rounded-xl flex items-center justify-center">
                            <Plus size={24} />
                        </div>
                        <div>
                            <h4 className="text-lg font-black text-white uppercase tracking-tight">Nova Dívida Descoberta</h4>
                            <p className="text-[10px] text-sky-400 font-bold uppercase tracking-widest">Preencha os dados da dívida encontrada no Replanejamento</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] text-slate-500 uppercase font-black">Nome da Dívida</label>
                            <input
                                type="text"
                                value={newDebtData.name}
                                onChange={(e) => setNewDebtData({ ...newDebtData, name: e.target.value })}
                                placeholder="Ex: Cartão Nubank"
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-sky-500 transition-all"
                            />
                        </div>

                        <div className="space-y-2 relative">
                            <label className="text-[10px] text-slate-500 uppercase font-black">Credor</label>
                            <input
                                type="text"
                                list="creditors-list-m4"
                                value={newDebtData.creditor}
                                onChange={(e) => setNewDebtData({ ...newDebtData, creditor: e.target.value })}
                                placeholder="Ex: Banco Itau"
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-sky-500 transition-all"
                            />
                            <datalist id="creditors-list-m4">
                                {existingCreditors.map(c => <option key={c} value={c} />)}
                            </datalist>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] text-slate-500 uppercase font-black">Valor Parcela</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">R$</span>
                                <input
                                    type="text"
                                    value={newDebtData.installment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value.replace(/[^\d]/g, '')) / 100;
                                        setNewDebtData({ ...newDebtData, installment: val || 0 });
                                    }}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 pl-10 text-sm font-bold text-white outline-none focus:border-sky-500 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] text-slate-500 uppercase font-black">Qtd Parcelas Restantes</label>
                            <input
                                type="number"
                                value={newDebtData.quantity}
                                onChange={(e) => setNewDebtData({ ...newDebtData, quantity: parseInt(e.target.value) || 0 })}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-sky-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-sky-500/10">
                        <button
                            onClick={() => setIsAddingDebt(false)}
                            className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={confirmAddManualDebt}
                            className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-sky-500/20"
                        >
                            Confirmar Adição
                        </button>
                    </div>
                </div>
            )}

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

                                        <div className="flex items-center gap-2">
                                            {debt.isNegotiated && (
                                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[9px] font-bold uppercase">
                                                    Negociado (Histórico)
                                                </span>
                                            )}
                                            {debt.origin === 'mapping' && (
                                                <span className="px-2 py-0.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded text-[9px] font-bold uppercase">
                                                    Diagnóstico
                                                </span>
                                            )}
                                            {debt.origin === 'meeting2' && (
                                                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-[9px] font-bold uppercase">
                                                    Reunião 2
                                                </span>
                                            )}
                                            {debt.origin === 'meeting3' && (
                                                <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded text-[9px] font-bold uppercase">
                                                    Reunião 3
                                                </span>
                                            )}
                                            {debt.origin === 'meeting4' && (
                                                <span className="px-2 py-0.5 bg-pink-500/10 text-pink-400 border border-pink-500/20 rounded text-[9px] font-bold uppercase">
                                                    Nova (Reunião 4)
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        {debt.isManual ? (
                                            <div className="space-y-1 max-w-md">
                                                <input
                                                    type="text"
                                                    value={debt.name}
                                                    placeholder="Nome da Dívida"
                                                    onChange={(e) => handleUpdateDebt(debt.id, 'name', e.target.value)}
                                                    className="w-full bg-slate-800/80 border border-slate-700 rounded px-2 py-1 text-xs font-bold text-white outline-none focus:border-sky-500"
                                                />
                                                <input
                                                    type="text"
                                                    value={debt.creditor}
                                                    placeholder="Nome do Credor"
                                                    onChange={(e) => handleUpdateDebt(debt.id, 'creditor', e.target.value)}
                                                    className="w-full bg-transparent border-none px-2 text-[9px] text-slate-500 uppercase font-black tracking-wider outline-none"
                                                />
                                            </div>
                                        ) : (
                                            <>
                                                <h4 className="font-bold text-white text-lg">{debt.name}</h4>
                                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider">{debt.creditor}</p>
                                            </>
                                        )}
                                        <div className="flex flex-col text-[8px] text-slate-500 uppercase font-black gap-0.5 mt-2 print:text-gray-400">
                                            <span>Registrado: {debt.createdAt ? new Date(debt.createdAt).toLocaleDateString('pt-BR') : '---'}</span>
                                            <span>Atualizado: {debt.updatedAt ? new Date(debt.updatedAt).toLocaleDateString('pt-BR') : '---'}</span>
                                        </div>
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
                                            <p className="text-[8px] text-slate-500 uppercase font-bold mb-1">Anterior (M3)</p>
                                            <p className="text-xs font-bold text-slate-400">R$ {debt.originalInstallment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                        </div>
                                        <div className={`p-2 rounded-lg border transition-all ${hasReduction ? 'bg-emerald-500/5 border-emerald-500/20 print:bg-emerald-50 print:border-emerald-200' : 'bg-slate-800 border-slate-700 print:bg-white print:border-gray-200'}`}>
                                            <p className="text-[8px] text-slate-500 uppercase font-bold mb-1">Atual</p>
                                            <div className="relative">
                                                <span className={`absolute left-0 top-1/2 -translate-y-1/2 text-[10px] font-black ${hasReduction ? 'text-emerald-400' : 'text-slate-500'}`}>R$</span>
                                                <input
                                                    type="text"
                                                    disabled={readOnly}
                                                    value={debt.newInstallment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    onChange={(e) => {
                                                        const val = parseFloat(e.target.value.replace(/[^\d]/g, '')) / 100;
                                                        handleUpdateDebt(debt.id, 'newInstallment', val || 0);
                                                    }}
                                                    className={`w-full bg-transparent text-xs font-black outline-none pl-5 ${hasReduction ? 'text-emerald-400' : 'text-white'}`}
                                                />
                                            </div>
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
                                            <p className="text-[8px] text-slate-500 uppercase font-bold mb-1">Anterior (M3)</p>
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
                                            <p className="text-[8px] text-slate-500 uppercase font-bold mb-1">Anterior (M3)</p>
                                            <p className="text-xs font-bold text-slate-400">{debt.originalInterest}</p>
                                        </div>
                                        <div className="p-2 bg-slate-800 border border-slate-700 rounded-lg">
                                            <p className="text-[8px] text-slate-500 uppercase font-bold mb-1">Atual</p>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    disabled={readOnly}
                                                    value={debt.newInterest.includes('%') ? debt.newInterest : `${debt.newInterest}%`}
                                                    onChange={(e) => {
                                                        let val = e.target.value;
                                                        if (val && !val.includes('%')) val = `${val}%`;
                                                        handleUpdateDebt(debt.id, 'newInterest', val);
                                                    }}
                                                    className="w-full bg-transparent text-xs font-black text-white outline-none"
                                                />
                                            </div>
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

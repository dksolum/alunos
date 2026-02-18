import React, { useState, useEffect } from 'react';
import { DebtMapItem, ChecklistData } from '../../../types';
import { authService } from '../../../services/authService';
import { Save, CheckCircle2, AlertCircle, TrendingDown, Clock, Percent, RefreshCw, Plus, Trash2 } from 'lucide-react';

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
    origin?: 'mapping' | 'meeting2' | 'meeting3';
    updatedAt?: string;
    createdAt?: string;
    endDate?: string;
}

interface DebtUpdateStageProps {
    userId: string;
    checklistData: ChecklistData;
    meetingData: any;
    onUpdateMeetingData: (data: any) => void;
    readOnly?: boolean;
}

export const DebtUpdateStage: React.FC<DebtUpdateStageProps> = ({
    userId,
    checklistData,
    meetingData,
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
        // Reset to first day to avoid issues with different month lengths
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
            // 1. Fetch Global Debt Mapping
            const mapping = await authService.getDebtMapping(userId);

            // 2. Parse Checklist Step 11 negotiations
            const negotiationValue = checklistData[11]?.subItems?.[2]?.value;
            let negotiations: any[] = [];
            try {
                negotiations = negotiationValue ? JSON.parse(negotiationValue) : [];
                if (!Array.isArray(negotiations)) negotiations = [];
            } catch (e) {
                negotiations = [];
            }

            // 3. Merge Data
            const syncedDebts: DebtUpdateItem[] = mapping.map(d => {
                const neg = negotiations.find((n: any) => n.debtId === d.id);
                // A negotiation is considered "valid" if it has an installment value or quantity pre-filled
                const hasNegotiatedValue = neg && (neg.installmentValue || neg.quantity);

                const now = new Date().toISOString();

                // Robust Fallback for Original Quantity
                // We check remainingInstallments first, then totalInstallments
                const origQty = Number(d.remainingInstallments) || Number(d.totalInstallments) || 0;

                const newQty = hasNegotiatedValue ?
                    (parseInt(neg.quantity) || origQty) :
                    origQty;

                return {
                    id: d.id,
                    name: d.name,
                    creditor: d.creditor,
                    originalInstallment: Number(d.installmentValue) || 0,
                    newInstallment: hasNegotiatedValue ?
                        parseFloat(neg.installmentValue?.replace(/[^\d.,]/g, '').replace(',', '.')) || Number(d.installmentValue) :
                        Number(d.installmentValue),
                    originalQuantity: origQty,
                    newQuantity: newQty,
                    originalInterest: d.interestRate || '0%',
                    newInterest: hasNegotiatedValue ? (neg.interest || d.interestRate) : d.interestRate,
                    isNegotiated: !!hasNegotiatedValue,
                    origin: 'mapping',
                    createdAt: d.createdAt || neg?.createdAt || now,
                    updatedAt: neg?.updatedAt || now,
                    endDate: calculateEndDate(newQty)
                };
            });

            // 4. Preserve Manual Debts
            const manualDebts = debts.filter(d => d.isManual);
            const finalDebts = [...syncedDebts, ...manualDebts];

            setDebts(finalDebts);
            onUpdateMeetingData({ ...meetingData, debtUpdates: finalDebts });

            if (isManualRefresh) {
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 2000);
            }
        } catch (error) {
            console.error("Error fetching/merging Debt Update Stage:", error);
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
            origin: 'meeting2',
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
        onUpdateMeetingData({ ...meetingData, debtUpdates: debts });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                <p className="text-slate-400 font-medium animate-pulse">Carregando dados das dívidas...</p>
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
                            ${refreshing ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'}
                            ${(loading || refreshing || readOnly) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Sincronizar com Mapeamento e Checklist"
                    >
                        <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                        {refreshing ? 'Sincronizando...' : 'Atualizar'}
                    </button>
                    <button
                        onClick={handleAddManualDebt}
                        disabled={loading || refreshing || readOnly}
                        className={`p-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-all flex items-center gap-2 text-[10px] font-bold uppercase
                            ${(loading || refreshing || readOnly) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Plus size={14} />
                        Adicionar Dívida
                    </button>
                </div>
                {readOnly && <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700 uppercase font-bold print:hidden">Modo Visualização</span>}
            </div>

            {isAddingDebt && (
                <div className="bg-purple-500/5 border border-purple-500/20 rounded-[2rem] p-8 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center">
                            <Plus size={24} />
                        </div>
                        <div>
                            <h4 className="text-lg font-black text-white uppercase tracking-tight">Nova Dívida Descoberta</h4>
                            <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">Preencha os dados básicos para adicionar</p>
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
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-purple-500 transition-all"
                            />
                        </div>

                        <div className="space-y-2 relative">
                            <label className="text-[10px] text-slate-500 uppercase font-black">Credor</label>
                            <input
                                type="text"
                                list="creditors-list"
                                value={newDebtData.creditor}
                                onChange={(e) => setNewDebtData({ ...newDebtData, creditor: e.target.value })}
                                placeholder="Ex: Banco Itau"
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-purple-500 transition-all"
                            />
                            <datalist id="creditors-list">
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
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 pl-10 text-sm font-bold text-white outline-none focus:border-purple-500 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] text-slate-500 uppercase font-black">Qtd Parcelas Restantes</label>
                            <input
                                type="number"
                                value={newDebtData.quantity}
                                onChange={(e) => setNewDebtData({ ...newDebtData, quantity: parseInt(e.target.value) || 0 })}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-purple-500 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] text-slate-500 uppercase font-black">Taxa de Juros (%)</label>
                            <div className="relative">
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">%</span>
                                <input
                                    type="text"
                                    value={newDebtData.interest.replace('%', '')}
                                    onChange={(e) => setNewDebtData({ ...newDebtData, interest: `${e.target.value}%` })}
                                    placeholder="0,00"
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 pr-8 text-sm font-bold text-white outline-none focus:border-purple-500 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-purple-500/10">
                        <button
                            onClick={() => setIsAddingDebt(false)}
                            className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={confirmAddManualDebt}
                            className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-purple-500/20"
                        >
                            Confirmar Adição
                        </button>
                    </div>
                </div>
            )}

            <div className="grid gap-4">
                {debts.length === 0 ? (
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
                        <AlertCircle className="mx-auto text-slate-600 mb-4" size={40} />
                        <p className="text-slate-400">Nenhuma dívida encontrada no mapeamento.</p>
                    </div>
                ) : (
                    debts.map(debt => {
                        const hasReduction = debt.newInstallment < debt.originalInstallment;

                        return (
                            <div key={debt.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all group print:bg-white print:border-gray-200 print:shadow-none print:p-4 print:break-inside-avoid">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        {debt.isManual ? (
                                            <div className="space-y-1 max-w-md">
                                                <input
                                                    type="text"
                                                    value={debt.name}
                                                    placeholder="Nome da Dívida"
                                                    onChange={(e) => handleUpdateDebt(debt.id, 'name', e.target.value)}
                                                    className="w-full bg-slate-800/80 border border-slate-700 rounded px-2 py-1 text-xs font-bold text-white outline-none focus:border-purple-500 print:bg-transparent print:border-none print:text-black print:text-base"
                                                />
                                                <input
                                                    type="text"
                                                    value={debt.creditor}
                                                    placeholder="Nome do Credor"
                                                    onChange={(e) => handleUpdateDebt(debt.id, 'creditor', e.target.value)}
                                                    className="w-full bg-transparent border-none px-2 text-[9px] text-slate-500 uppercase font-black tracking-wider outline-none print:text-gray-600 print:text-[10px]"
                                                />
                                            </div>
                                        ) : (
                                            <>
                                                <h4 className="font-bold text-white group-hover:text-purple-400 transition-colors print:text-black print:text-lg">{debt.name}</h4>
                                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider print:text-gray-600">{debt.creditor}</p>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end gap-1 text-right">
                                        <div className="flex items-center gap-2">
                                            {debt.isNegotiated && (
                                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[9px] font-bold uppercase print:bg-emerald-50 print:text-emerald-700 print:border-emerald-200">
                                                    Negociado no Checklist
                                                </span>
                                            )}
                                            {debt.origin === 'mapping' && (
                                                <span className="px-2 py-0.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded text-[9px] font-bold uppercase print:bg-sky-50 print:text-sky-700 print:border-sky-200">
                                                    Mapeado no Diagnóstico
                                                </span>
                                            )}
                                            {debt.origin === 'meeting2' && (
                                                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-[9px] font-bold uppercase print:bg-amber-50 print:text-amber-700 print:border-amber-200">
                                                    Cadastrado na Reunião 2
                                                </span>
                                            )}
                                            {debt.isManual && !readOnly && (
                                                <button
                                                    onClick={() => handleRemoveDebt(debt.id)}
                                                    className="p-1 text-slate-600 hover:text-red-400 transition-colors print:hidden"
                                                    title="Remover dívida manual"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex flex-col text-[8px] text-slate-500 uppercase font-bold gap-0.5 print:text-gray-400">
                                            <span>Registrado: {debt.createdAt ? new Date(debt.createdAt).toLocaleDateString('pt-BR') : '---'}</span>
                                            <span>Atualizado: {debt.updatedAt ? new Date(debt.updatedAt).toLocaleDateString('pt-BR') : '---'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Parcela */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-slate-500 print:text-gray-600">
                                            <TrendingDown size={14} />
                                            <span className="text-[10px] uppercase font-black tracking-widest">Parcela Mensal</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="p-2 bg-slate-800/50 rounded-lg border border-slate-700/50 print:bg-gray-50 print:border-gray-200">
                                                <p className="text-[8px] text-slate-500 uppercase font-bold mb-1 print:text-gray-500">Anterior</p>
                                                <p className="text-xs font-bold text-slate-400 print:text-gray-600">R$ {debt.originalInstallment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                            </div>
                                            <div className={`p-2 rounded-lg border transition-all ${hasReduction ? 'bg-emerald-500/5 border-emerald-500/20 print:bg-emerald-50 print:border-emerald-200' : 'bg-slate-800/80 border-slate-700 print:bg-white print:border-gray-200'}`}>
                                                <p className="text-[8px] text-slate-500 uppercase font-bold mb-1 print:text-gray-500">Atual</p>
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
                                                        className={`w-full bg-transparent text-xs font-black outline-none focus:text-purple-400 pl-5 print:text-black ${hasReduction ? 'print:text-emerald-700' : ''}`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Prazo */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-slate-500 print:text-gray-600">
                                            <Clock size={14} />
                                            <span className="text-[10px] uppercase font-black tracking-widest">Prazo (Meses)</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="p-2 bg-slate-800/50 rounded-lg border border-slate-700/50 print:bg-gray-50 print:border-gray-200">
                                                <p className="text-[8px] text-slate-500 uppercase font-bold mb-1 print:text-gray-500">Anterior</p>
                                                <p className="text-xs font-bold text-slate-400 print:text-gray-600">{debt.originalQuantity}x</p>
                                            </div>
                                            <div className="p-2 bg-slate-800/80 border border-slate-700 rounded-lg flex flex-col justify-between print:bg-white print:border-gray-200">
                                                <div>
                                                    <p className="text-[8px] text-slate-500 uppercase font-bold mb-1 print:text-gray-500">Atual</p>
                                                    <input
                                                        type="number"
                                                        disabled={readOnly}
                                                        value={debt.newQuantity}
                                                        onChange={(e) => handleUpdateDebt(debt.id, 'newQuantity', parseInt(e.target.value) || 0)}
                                                        className="w-full bg-transparent text-xs font-black text-white outline-none focus:text-purple-400 print:text-black"
                                                    />
                                                </div>
                                                <div className="mt-2 pt-2 border-t border-slate-700/50 print:border-gray-100">
                                                    <p className="text-[7px] text-slate-500 uppercase font-bold">Término em</p>
                                                    <p className="text-[9px] font-black text-sky-400 uppercase print:text-sky-700">{debt.endDate || '---'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Juros */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-slate-500 print:text-gray-600">
                                            <Percent size={14} />
                                            <span className="text-[10px] uppercase font-black tracking-widest">Taxa / Juros</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="p-2 bg-slate-800/50 rounded-lg border border-slate-700/50 print:bg-gray-50 print:border-gray-200">
                                                <p className="text-[8px] text-slate-500 uppercase font-bold mb-1 print:text-gray-500">Anterior</p>
                                                <p className="text-xs font-bold text-slate-400 print:text-gray-600">{debt.originalInterest}</p>
                                            </div>
                                            <div className="p-2 bg-slate-800/80 border border-slate-700 rounded-lg print:bg-white print:border-gray-200">
                                                <p className="text-[8px] text-slate-500 uppercase font-bold mb-1 print:text-gray-500">Atual</p>
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
                                                        className="w-full bg-transparent text-xs font-black text-white outline-none focus:text-purple-400 print:text-black"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {!readOnly && debts.length > 0 && (
                <div className="flex justify-end pt-8 border-t border-slate-800 print:hidden">
                    <button
                        onClick={handleSave}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                    >
                        {showSuccess ? (
                            <>
                                <CheckCircle2 size={18} /> Salvo!
                            </>
                        ) : (
                            <>
                                <Save size={18} /> Salvar Atualizações
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

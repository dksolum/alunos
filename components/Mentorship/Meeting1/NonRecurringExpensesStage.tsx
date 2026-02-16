import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, Edit2, CheckCircle2, X } from 'lucide-react';
import { NonRecurringExpenseItem } from '../../../types';
import { authService } from '../../../services/authService';
import { CATEGORIES } from '../../CostOfLiving';

interface NonRecurringExpensesStageProps {
    userId: string;
}

export const NonRecurringExpensesStage: React.FC<NonRecurringExpensesStageProps> = ({ userId }) => {
    const [items, setItems] = useState<NonRecurringExpenseItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Edit State
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State (Restored)
    const [category, setCategory] = useState(CATEGORIES[13].id);
    const [description, setDescription] = useState('');
    const [value, setValue] = useState('');
    const [frequency, setFrequency] = useState('1');

    const fetchItems = async () => {
        setLoading(true);
        const state = await authService.getMentorshipState(userId);
        setItems(state.nonRecurringExpenses);
        setLoading(false);
    };

    useEffect(() => {
        fetchItems();
    }, [userId]);

    const handleEdit = (item: NonRecurringExpenseItem) => {
        setEditingId(item.id);
        setCategory(item.category);
        setDescription(item.description);
        setValue(item.value.toString().replace('.', ','));
        setFrequency(item.frequency.toString());

        // Scroll to form if needed
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setCategory(CATEGORIES[13].id);
        setDescription('');
        setValue('');
        setFrequency('1');
    };

    const handleAdd = async () => {
        if (!description || !value) {
            alert("Por favor, preencha todos os campos.");
            return;
        }

        const numericValue = parseFloat(value.replace(',', '.'));
        if (isNaN(numericValue) || numericValue <= 0) {
            alert("Valor inválido.");
            return;
        }

        try {
            await authService.saveNonRecurringExpense(userId, {
                id: editingId || undefined,
                category,
                description,
                value: numericValue,
                frequency: parseInt(frequency) || 1
            });

            // Reset and Refresh
            handleCancelEdit();
            await fetchItems();
        } catch (error) {
            console.error("Error saving", error);
            alert("Erro ao salvar. Tente novamente.");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir este item?')) {
            try {
                await authService.deleteNonRecurringExpense(id, userId);
                if (editingId === id) handleCancelEdit();
                await fetchItems();
            } catch (error) {
                console.error("Error deleting", error);
                alert("Erro ao excluir.");
            }
        }
    };

    const totalAnnual = items.reduce((acc, item) => acc + (item.value * item.frequency), 0);
    const monthlyReserve = totalAnnual / 12;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header Actions */}
            <div className="flex justify-end print:hidden">
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    title="Imprimir visualização"
                >
                    <div className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2-2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                    </div>
                    <span className="text-sm font-bold uppercase">Imprimir</span>
                </button>
            </div>

            <div className={`bg-slate-900/50 p-6 rounded-2xl border ${editingId ? 'border-sky-500/50 bg-sky-900/10' : 'border-slate-800'} print:hidden transition-colors`}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    {/* Category */}
                    <div className="space-y-2">
                        <label className={`text-xs font-bold uppercase ${editingId ? 'text-sky-400' : 'text-slate-500'}`}>Categoria</label>
                        <select
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.id}</option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
                    <div className="space-y-2 md:col-span-2">
                        <label className={`text-xs font-bold uppercase ${editingId ? 'text-sky-400' : 'text-slate-500'}`}>Descrição</label>
                        <input
                            type="text"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Ex: IPTU, IPVA, Presente de Natal..."
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                        />
                    </div>

                    {/* Value & Frequency (Split) */}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mt-4">
                    <div className="space-y-2">
                        <label className={`text-xs font-bold uppercase ${editingId ? 'text-sky-400' : 'text-slate-500'}`}>Valor (R$)</label>
                        <input
                            type="text"
                            value={value}
                            onChange={e => setValue(e.target.value)}
                            placeholder="0,00"
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className={`text-xs font-bold uppercase ${editingId ? 'text-sky-400' : 'text-slate-500'}`}>Vezes ao Ano</label>
                        <input
                            type="number"
                            min="1" max="12"
                            value={frequency}
                            onChange={e => setFrequency(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                        />
                    </div>

                    <div className="md:col-span-2 flex gap-2">
                        {editingId && (
                            <button
                                onClick={handleCancelEdit}
                                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                            >
                                <X size={18} /> Cancelar
                            </button>
                        )}
                        <button
                            onClick={handleAdd}
                            className={`flex-1 font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg ${editingId
                                ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-sky-500/20'
                                : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/10'
                                }`}
                        >
                            {editingId ? <CheckCircle2 size={18} /> : <Plus size={18} />}
                            {editingId ? 'Atualizar' : 'Adicionar'}
                        </button>
                    </div>
                </div>
            </div>

            {/* List & Totals */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-1">
                {/* List */}
                <div className="md:col-span-2 space-y-3">
                    {/* Print Header */}
                    <div className="hidden print:block mb-6">
                        <h2 className="text-xl font-bold text-black uppercase border-b pb-2 mb-4">Gastos Não Recorrentes</h2>
                    </div>

                    {items.map(item => (
                        <div key={item.id} className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group transition-colors print:bg-white print:border-gray-200 print:text-black ${editingId === item.id
                            ? 'bg-sky-500/10 border-sky-500/50'
                            : 'bg-slate-900/30 border-slate-800 hover:border-slate-700'
                            }`}>
                            <div className="flex items-center gap-4 min-w-0 overflow-hidden">
                                <div className={`p-2 rounded-lg shrink-0 print:hidden ${editingId === item.id ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-800 text-slate-400'}`}>
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-white print:text-black truncate">{item.description}</p>
                                    <p className="text-xs text-slate-500 print:text-gray-500 truncate">{item.category}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                <div className="text-right shrink-0">
                                    <span className="text-xs text-slate-500 print:text-gray-500">{item.frequency}x de</span>
                                    <p className="font-bold text-slate-200 print:text-black">
                                        R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                {/* New Total Column */}
                                <div className="text-right pl-4 border-l border-slate-800 print:border-gray-300 min-w-[100px] shrink-0">
                                    <span className="text-xs text-slate-500 print:text-gray-500">Total</span>
                                    <p className="font-bold text-emerald-400 print:text-black">
                                        R$ {(item.value * item.frequency).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 print:hidden shrink-0">
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className={`p-2 rounded-lg transition-colors ${editingId === item.id
                                            ? 'text-sky-400 bg-sky-500/20'
                                            : 'text-slate-600 hover:text-sky-400 hover:bg-sky-500/10'
                                            }`}
                                        title="Editar"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Excluir"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {items.length === 0 && (
                        <div className="text-center py-10 text-slate-600 border border-dashed border-slate-800 rounded-xl print:hidden">
                            Nenhum gasto registrado.
                        </div>
                    )}
                </div>

                {/* Summary */}
                <div className="space-y-4 print:break-inside-avoid">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800 relative overflow-hidden print:bg-white print:border-gray-300 print:text-black">
                        <div className="relative z-10">
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 print:text-gray-500">Custo Total Anual</p>
                            <p className="text-3xl font-black text-white print:text-black">
                                R$ {totalAnnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-900/20 to-emerald-950/20 p-6 rounded-2xl border border-emerald-500/30 relative overflow-hidden print:bg-white print:border-gray-300 print:text-black">
                        <div className="relative z-10">
                            <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1 print:text-gray-600">Reserva Mensal</p>
                            <p className="text-3xl font-black text-emerald-400 print:text-black">
                                R$ {monthlyReserve.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-emerald-500/60 mt-2 font-medium print:text-gray-500">
                                Valor a guardar todo mês
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

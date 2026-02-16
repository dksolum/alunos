import React, { useState, useEffect } from 'react';
import { X, Save, FileText, HelpCircle, Target, Printer, Calendar, AlertTriangle, TrendingUp } from 'lucide-react';
import { authService } from '../services/authService';
import { User } from '../types';
import { PrintPortal } from './PrintPortal';
import { UserIntakePrint } from './UserIntakePrint';
import { PrintText } from './PrintText';

interface UserIntakeModalProps {
    user: User;
    isOpen: boolean;
    onClose: () => void;
}

export const UserIntakeModal: React.FC<UserIntakeModalProps> = ({ user, isOpen, onClose }) => {
    // ... existing state ... 
    const [formData, setFormData] = useState({
        main_problem: '',
        resolution_attempts: '',
        details: {
            financial_view: {
                surviving: { selected: false, details: '' },
                spending_more: { selected: false, details: '' },
                saving: { selected: false, details: '' },
                emergency_fund: { selected: false, details: '' },
                others: { selected: false, details: '' }
            },
            problems: {
                impediment_saving: { has: false, details: '' },
                debt_difficulty: { has: false, details: '' },
                others: { has: false, details: '' }
            },
            satisfaction: '',
            goals: {
                has_goals: false,
                importance: ''
            },
            future_outlook: ''
        }
    });

    // ... existing loading/saving logic ...
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && user) {
            loadIntakeData();
        }
    }, [isOpen, user]);

    const loadIntakeData = async () => {
        // ... same implementation ...
        setLoading(true);
        setError('');
        try {
            const data = await authService.getUserIntake(user.id);
            if (data) {
                setFormData(prev => {
                    const dbDetails = data.details || {};
                    const mergedData = {
                        main_problem: data.main_problem || '',
                        resolution_attempts: data.resolution_attempts || '',
                        details: {
                            ...prev.details,
                            ...dbDetails,
                            financial_view: {
                                ...prev.details.financial_view,
                                ...(dbDetails.financial_view || {}),
                                surviving: { ...prev.details.financial_view.surviving, ...(dbDetails.financial_view?.surviving || {}) },
                                spending_more: { ...prev.details.financial_view.spending_more, ...(dbDetails.financial_view?.spending_more || {}) },
                                saving: { ...prev.details.financial_view.saving, ...(dbDetails.financial_view?.saving || {}) },
                                emergency_fund: { ...prev.details.financial_view.emergency_fund, ...(dbDetails.financial_view?.emergency_fund || {}) },
                                others: { ...prev.details.financial_view.others, ...(dbDetails.financial_view?.others || {}) }
                            },
                            problems: {
                                ...prev.details.problems,
                                ...(dbDetails.problems || {}),
                                impediment_saving: { ...prev.details.problems.impediment_saving, ...(dbDetails.problems?.impediment_saving || {}) },
                                debt_difficulty: { ...prev.details.problems.debt_difficulty, ...(dbDetails.problems?.debt_difficulty || {}) },
                                others: { ...prev.details.problems.others, ...(dbDetails.problems?.others || {}) }
                            },
                            goals: { ...prev.details.goals, ...(dbDetails.goals || {}) }
                        }
                    };
                    return mergedData;
                });
            } else {
                setFormData({
                    main_problem: '',
                    resolution_attempts: '',
                    details: {
                        financial_view: {
                            surviving: { selected: false, details: '' },
                            spending_more: { selected: false, details: '' },
                            saving: { selected: false, details: '' },
                            emergency_fund: { selected: false, details: '' },
                            others: { selected: false, details: '' }
                        },
                        problems: {
                            impediment_saving: { has: false, details: '' },
                            debt_difficulty: { has: false, details: '' },
                            others: { has: false, details: '' }
                        },
                        satisfaction: '',
                        goals: { has_goals: false, importance: '' },
                        future_outlook: ''
                    }
                });
            }
        } catch (err) {
            console.error(err);
            setError('Erro ao carregar ficha do usuário.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            const result = await authService.saveUserIntake(user.id, formData);
            if (result.success) {
                onClose();
            } else {
                setError('Erro ao salvar ficha: ' + result.message);
            }
        } catch (err) {
            console.error(err);
            setError('Erro inesperado ao salvar.');
        } finally {
            setSaving(false);
        }
    };

    const handlePrint = () => {
        window.print();
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">

            {/* Always Render Print Version via Portal */}
            <PrintPortal>
                <UserIntakePrint user={user} data={formData} />
            </PrintPortal>

            <div className="absolute inset-0 bg-[#0f172a]/90 backdrop-blur-sm animate-in fade-in" onClick={onClose}></div>

            {/* Main Modal Container */}
            <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">


                {/* Screen Header (Hidden in print) */}
                <div className="flex items-center justify-between p-8 pb-4 print:hidden">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-sky-500/10 rounded-2xl flex items-center justify-center text-sky-400 border border-sky-500/20">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">Ficha Individual</h2>
                            <p className="text-xs text-slate-400 font-medium">Usuário: <span className="text-sky-400">{user.name}</span></p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors rounded-xl hover:bg-slate-800">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 pt-0 custom-scrollbar print:overflow-visible print:p-8 print:pt-0 print:block">

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2 print:hidden">
                            <AlertTriangle size={16} />
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
                        </div>
                    ) : (
                        <div className="space-y-8 print:space-y-4 text-slate-200 print:text-black">

                            {/* 1. Problema Principal */}
                            <section className="print:break-inside-avoid print:mb-8">
                                <label className="flex items-center gap-2 text-sm font-black text-sky-400 uppercase tracking-wide mb-3 print:text-black print:text-base">
                                    <AlertTriangle size={16} className="print:hidden" />
                                    1. Qual o problema principal?
                                </label>
                                <textarea
                                    value={formData.main_problem}
                                    onChange={e => setFormData({ ...formData, main_problem: e.target.value })}
                                    className="w-full h-32 bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-sm outline-none focus:border-sky-500 transition-all resize-none placeholder:text-slate-600 print:hidden"
                                    placeholder="Descreva detalhadamente o principal desafio financeiro..."
                                />
                                <PrintText content={formData.main_problem} />
                            </section>

                            {/* 2. Tentativas Anteriores */}
                            <section className="print:break-inside-avoid print:mb-8">
                                <label className="flex items-center gap-2 text-sm font-black text-emerald-400 uppercase tracking-wide mb-3 print:text-black print:text-base">
                                    <Target size={16} className="print:hidden" />
                                    2. Já tentou alguma coisa para resolver?
                                </label>
                                <textarea
                                    value={formData.resolution_attempts}
                                    onChange={e => setFormData({ ...formData, resolution_attempts: e.target.value })}
                                    className="w-full h-24 bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-sm outline-none focus:border-emerald-500 transition-all resize-none placeholder:text-slate-600 print:hidden"
                                    placeholder="Liste as tentativas anteriores..."
                                />
                                <PrintText content={formData.resolution_attempts} />
                            </section>

                            {/* 3. Visão Financeira (Checklist) */}
                            <section className="print:break-inside-avoid print:mb-8">
                                <label className="flex items-center gap-2 text-sm font-black text-amber-400 uppercase tracking-wide mb-4 print:text-black print:text-base">
                                    <TrendingUp size={16} className="print:hidden" />
                                    3. Como acredita que está a sua vida financeira?
                                </label>
                                <div className="space-y-4">
                                    {[
                                        { key: 'surviving', label: 'Só sobrevivendo?' },
                                        { key: 'spending_more', label: 'Gastando mais do que deveria?' },
                                        { key: 'saving', label: 'Conseguindo guardar?' },
                                        { key: 'emergency_fund', label: 'Tem reserva de emergência?' },
                                        { key: 'others', label: 'Outros' }
                                    ].map((item) => (
                                        <div key={item.key} className="p-4 bg-slate-800/30 rounded-xl border border-slate-800 print:bg-transparent print:border-gray-300 print:p-2">
                                            <div className="flex flex-col gap-3">
                                                <label className="flex items-center gap-3 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.details.financial_view[item.key as keyof typeof formData.details.financial_view]?.selected}
                                                        onChange={e => setFormData({
                                                            ...formData,
                                                            details: {
                                                                ...formData.details,
                                                                financial_view: {
                                                                    ...formData.details.financial_view,
                                                                    [item.key]: {
                                                                        ...formData.details.financial_view[item.key as keyof typeof formData.details.financial_view],
                                                                        selected: e.target.checked
                                                                    }
                                                                }
                                                            }
                                                        })}
                                                        className="w-4 h-4 rounded border-slate-600 text-amber-500 focus:ring-amber-500 bg-slate-700"
                                                    />
                                                    <span className="text-sm font-medium text-white print:text-black">{item.label}</span>
                                                </label>
                                                {formData.details.financial_view[item.key as keyof typeof formData.details.financial_view]?.selected && (
                                                    <>
                                                        <textarea
                                                            value={formData.details.financial_view[item.key as keyof typeof formData.details.financial_view]?.details || ''}
                                                            onChange={e => setFormData({
                                                                ...formData,
                                                                details: {
                                                                    ...formData.details,
                                                                    financial_view: {
                                                                        ...formData.details.financial_view,
                                                                        [item.key]: {
                                                                            ...formData.details.financial_view[item.key as keyof typeof formData.details.financial_view],
                                                                            details: e.target.value
                                                                        }
                                                                    }
                                                                }
                                                            })}
                                                            placeholder={item.key === 'others' ? "Descreva outros..." : "Observação..."}
                                                            rows={2}
                                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:border-amber-500 outline-none animate-in slide-in-from-top-2 resize-none print:hidden"
                                                        />
                                                        <PrintText content={formData.details.financial_view[item.key as keyof typeof formData.details.financial_view]?.details || ''} />
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* 4. Outros Problemas */}
                            <section className="print:break-inside-avoid print:mb-8">
                                <label className="flex items-center gap-2 text-sm font-black text-rose-400 uppercase tracking-wide mb-4 print:text-black print:text-base">
                                    <AlertTriangle size={16} className="print:hidden" />
                                    4. Possui mais algum problema além do principal?
                                </label>
                                <div className="space-y-4">
                                    {/* Impedimento Guardar */}
                                    <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-800 print:bg-transparent print:border-gray-300 print:p-2">
                                        <div className="flex flex-col gap-3">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.details.problems.impediment_saving.has}
                                                    onChange={e => setFormData({
                                                        ...formData,
                                                        details: {
                                                            ...formData.details,
                                                            problems: {
                                                                ...formData.details.problems,
                                                                impediment_saving: { ...formData.details.problems.impediment_saving, has: e.target.checked }
                                                            }
                                                        }
                                                    })}
                                                    className="w-4 h-4 rounded border-slate-600 text-rose-500 focus:ring-rose-500 bg-slate-700"
                                                />
                                                <span className="text-sm font-medium text-white print:text-black">Tem algo que te impede de guardar dinheiro?</span>
                                            </label>
                                            {formData.details.problems.impediment_saving.has && (
                                                <>
                                                    <textarea
                                                        value={formData.details.problems.impediment_saving.details}
                                                        onChange={e => setFormData({
                                                            ...formData,
                                                            details: {
                                                                ...formData.details,
                                                                problems: {
                                                                    ...formData.details.problems,
                                                                    impediment_saving: { ...formData.details.problems.impediment_saving, details: e.target.value }
                                                                }
                                                            }
                                                        })}
                                                        placeholder="O que impede?"
                                                        rows={2}
                                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:border-rose-500 outline-none animate-in slide-in-from-top-2 resize-none print:hidden"
                                                    />
                                                    <PrintText content={formData.details.problems.impediment_saving.details} />
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Dívidas */}
                                    <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-800 print:bg-transparent print:border-gray-300 print:p-2">
                                        <div className="flex flex-col gap-3">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.details.problems.debt_difficulty.has}
                                                    onChange={e => setFormData({
                                                        ...formData,
                                                        details: {
                                                            ...formData.details,
                                                            problems: {
                                                                ...formData.details.problems,
                                                                debt_difficulty: { ...formData.details.problems.debt_difficulty, has: e.target.checked }
                                                            }
                                                        }
                                                    })}
                                                    className="w-4 h-4 rounded border-slate-600 text-rose-500 focus:ring-rose-500 bg-slate-700"
                                                />
                                                <span className="text-sm font-medium text-white print:text-black">Dificuldade para lidar com suas dívidas?</span>
                                            </label>
                                            {formData.details.problems.debt_difficulty.has && (
                                                <>
                                                    <textarea
                                                        value={formData.details.problems.debt_difficulty.details}
                                                        onChange={e => setFormData({
                                                            ...formData,
                                                            details: {
                                                                ...formData.details,
                                                                problems: {
                                                                    ...formData.details.problems,
                                                                    debt_difficulty: { ...formData.details.problems.debt_difficulty, details: e.target.value }
                                                                }
                                                            }
                                                        })}
                                                        placeholder="Qual dificuldade?"
                                                        rows={2}
                                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:border-rose-500 outline-none animate-in slide-in-from-top-2 resize-none print:hidden"
                                                    />
                                                    <PrintText content={formData.details.problems.debt_difficulty.details} />
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Outros Problemas */}
                                    <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-800 print:bg-transparent print:border-gray-300 print:p-2">
                                        <div className="flex flex-col gap-3">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.details.problems.others.has}
                                                    onChange={e => setFormData({
                                                        ...formData,
                                                        details: {
                                                            ...formData.details,
                                                            problems: {
                                                                ...formData.details.problems,
                                                                others: { ...formData.details.problems.others, has: e.target.checked }
                                                            }
                                                        }
                                                    })}
                                                    className="w-4 h-4 rounded border-slate-600 text-rose-500 focus:ring-rose-500 bg-slate-700"
                                                />
                                                <span className="text-sm font-medium text-white print:text-black">Outros</span>
                                            </label>
                                            {formData.details.problems.others.has && (
                                                <>
                                                    <textarea
                                                        value={formData.details.problems.others.details}
                                                        onChange={e => setFormData({
                                                            ...formData,
                                                            details: {
                                                                ...formData.details,
                                                                problems: {
                                                                    ...formData.details.problems,
                                                                    others: { ...formData.details.problems.others, details: e.target.value }
                                                                }
                                                            }
                                                        })}
                                                        placeholder="Descreva outros problemas..."
                                                        rows={2}
                                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:border-rose-500 outline-none animate-in slide-in-from-top-2 resize-none print:hidden"
                                                    />
                                                    <PrintText content={formData.details.problems.others.details} />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 5. Satisfação */}
                            <section className="print:break-inside-avoid print:mb-8">
                                <label className="flex items-center gap-2 text-sm font-black text-purple-400 uppercase tracking-wide mb-3 print:text-black print:text-base">
                                    <HelpCircle size={16} className="print:hidden" />
                                    5. O que te deixaria satisfeito hoje?
                                </label>
                                <p className="text-xs text-slate-400 mb-2 print:hidden">Só resolver esse problema principal ou tem mais alguma coisa?</p>
                                <textarea
                                    value={formData.details.satisfaction}
                                    onChange={e => setFormData({ ...formData, details: { ...formData.details, satisfaction: e.target.value } })}
                                    className="w-full h-24 bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-sm outline-none focus:border-purple-500 transition-all resize-none placeholder:text-slate-600 print:hidden"
                                    placeholder="Descreva o que traria satisfação..."
                                />
                                <PrintText content={formData.details.satisfaction} />
                            </section>

                            {/* 6. Metas */}
                            <section className="print:break-inside-avoid print:mb-8">
                                <div className="flex items-center gap-4 mb-3">
                                    <label className="flex items-center gap-2 text-sm font-black text-blue-400 uppercase tracking-wide print:text-black print:text-base">
                                        <Target size={16} className="print:hidden" />
                                        6. Possui metas?
                                    </label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="has_goals"
                                                checked={formData.details.goals.has_goals}
                                                onChange={() => setFormData({ ...formData, details: { ...formData.details, goals: { ...formData.details.goals, has_goals: true } } })}
                                                className="hidden"
                                            />
                                            <div className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${formData.details.goals.has_goals ? 'bg-blue-500 text-white print:bg-black print:text-white print:border-2 print:border-black' : 'bg-slate-800 text-slate-400 hover:text-white print:bg-white print:text-gray-300 print:border print:border-gray-300'}`}>SIM</div>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="has_goals"
                                                checked={!formData.details.goals.has_goals}
                                                onChange={() => setFormData({ ...formData, details: { ...formData.details, goals: { ...formData.details.goals, has_goals: false } } })}
                                                className="hidden"
                                            />
                                            <div className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${!formData.details.goals.has_goals ? 'bg-slate-500 text-white print:bg-black print:text-white print:border-2 print:border-black' : 'bg-slate-800 text-slate-400 hover:text-white print:bg-white print:text-gray-300 print:border print:border-gray-300'}`}>NÃO</div>
                                        </label>
                                    </div>
                                </div>

                                {formData.details.goals.has_goals && (
                                    <div className="animate-in slide-in-from-top-2">
                                        <p className="text-xs text-slate-400 mb-2 font-medium print:hidden">Por que alcançar essas metas é importante?</p>
                                        <textarea
                                            value={formData.details.goals.importance}
                                            onChange={e => setFormData({ ...formData, details: { ...formData.details, goals: { ...formData.details.goals, importance: e.target.value } } })}
                                            className="w-full h-24 bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 transition-all resize-none placeholder:text-slate-600 print:hidden"
                                            placeholder="Descreva a importância das metas..."
                                        />
                                        <PrintText content={formData.details.goals.importance} />
                                    </div>
                                )}
                            </section>

                            {/* 7. Futuro (6 meses) */}
                            <section className="print:break-inside-avoid print:mb-8">
                                <label className="flex items-center gap-2 text-sm font-black text-teal-400 uppercase tracking-wide mb-3 print:text-black print:text-base">
                                    <Calendar size={16} className="print:hidden" />
                                    7. Visão de Futuro (6 Meses)
                                </label>
                                <p className="text-xs text-slate-400 mb-2 print:hidden">Não fazendo nada agora, como imagina sua vida financeira em 6 meses?</p>
                                <textarea
                                    value={formData.details.future_outlook}
                                    onChange={e => setFormData({ ...formData, details: { ...formData.details, future_outlook: e.target.value } })}
                                    className="w-full h-24 bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-sm outline-none focus:border-teal-500 transition-all resize-none placeholder:text-slate-600 print:hidden"
                                    placeholder="Sua previsão para o futuro..."
                                />
                                <PrintText content={formData.details.future_outlook} />
                            </section>

                        </div>
                    )}
                </div>

                {/* Footer Actions (Hidden in print) */}
                <div className="mt-8 pt-6 border-t border-slate-800/50 flex justify-end gap-3 px-8 pb-8 print:hidden">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                    >
                        Fechar
                    </button>

                    <button
                        onClick={handlePrint}
                        className="px-6 py-3 bg-slate-800 text-slate-200 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-700 transition-all flex items-center gap-2"
                    >
                        <Printer size={16} /> Imprimir / PDF
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="px-8 py-3 bg-sky-500 text-[#0f172a] rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-sky-500/20 hover:bg-sky-400 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <>Salvando...</>
                        ) : (
                            <>
                                <Save size={16} /> Salvar Ficha
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

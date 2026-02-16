import React, { useState } from 'react';
import { X, Save, CheckCircle2, ChevronRight, ChevronLeft, LogOut, Edit2, ArrowLeft, FileText } from 'lucide-react';
import { Anamnesis, User } from '../types';
import { PrintPortal } from './PrintPortal';
import { PrintHeader } from './Mentorship/Meeting1/PrintHeader';

interface AnamnesisFormProps {
    onClose?: () => void;
    onSave: (data: Omit<Anamnesis, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
    initialData?: Partial<Anamnesis>;
    isStandalone?: boolean;
    onLogout?: () => void;
    initialMode?: 'create' | 'edit' | 'view';
    user?: User;
}

export const AnamnesisForm: React.FC<AnamnesisFormProps> = ({ onClose, onSave, initialData, isStandalone = false, onLogout, initialMode = 'create', user }) => {
    const [mode, setMode] = useState<'create' | 'edit' | 'view'>(initialMode);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        reason: initialData?.reason || '',
        objectives: initialData?.objectives || '',
        spendsAll: initialData?.spendsAll || false,
        emergencyFund: initialData?.emergencyFund || false,
        investments: initialData?.investments || false,
        investsMonthly: initialData?.investsMonthly || false,
        retirementPlan: initialData?.retirementPlan || false,
        independentDecisions: initialData?.independentDecisions || false,
        financialScore: initialData?.financialScore || 5, // Default range value
    });
    const [isPrinting, setIsPrinting] = useState(false);

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const handleSubmit = () => {
        onSave(formData);
        if (initialMode === 'view' || mode === 'edit') {
            setMode('view');
        }
    };

    const handlePrint = () => {
        setIsPrinting(true);
        setTimeout(() => {
            window.print();
            setIsPrinting(false);
        }, 300);
    };

    const renderStep1 = () => (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-300 uppercase tracking-wide">
                    1 - O que te fez buscar a Consultoria Financeira Pessoal?
                </label>
                <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full h-32 bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-slate-200 outline-none focus:border-sky-500/50 transition-all resize-none"
                    placeholder="Descreva seu momento atual..."
                />
            </div>
            <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-300 uppercase tracking-wide">
                    2 - Cite três objetivos que você gostaria de alcançar após a Consultoria.
                </label>
                <textarea
                    value={formData.objectives}
                    onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                    className="w-full h-32 bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-slate-200 outline-none focus:border-sky-500/50 transition-all resize-none"
                    placeholder="Ex: Quitar dívidas, viajar, aposentar..."
                />
            </div>
        </div>
    );

    const YesNoQuestion = ({ label, value, onChange }: { label: string, value: boolean, onChange: (v: boolean) => void }) => (
        <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-slate-800/50">
            <span className="text-xs md:text-sm font-medium text-slate-300 max-w-[70%]">{label}</span>
            <div className="flex gap-2">
                <button
                    onClick={() => onChange(true)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${value ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'bg-slate-700/50 text-slate-500 hover:bg-slate-700'}`}
                >
                    Sim
                </button>
                <button
                    onClick={() => onChange(false)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${!value ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-slate-700/50 text-slate-500 hover:bg-slate-700'}`}
                >
                    Não
                </button>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-4 animate-in slide-in-from-right duration-300">
            <h3 className="text-sky-400 font-black uppercase tracking-widest text-xs mb-4">Hábitos Financeiros</h3>
            <YesNoQuestion
                label="3 - Você costuma gastar todo seu dinheiro quando sobra?"
                value={formData.spendsAll}
                onChange={(v) => setFormData({ ...formData, spendsAll: v })}
            />
            <YesNoQuestion
                label="4 - Você possui uma reserva para emergências?"
                value={formData.emergencyFund}
                onChange={(v) => setFormData({ ...formData, emergencyFund: v })}
            />
            <YesNoQuestion
                label="5 - Você tem investimentos?"
                value={formData.investments}
                onChange={(v) => setFormData({ ...formData, investments: v })}
            />
            <YesNoQuestion
                label="6 - Você tem o hábito de investir todos os meses?"
                value={formData.investsMonthly}
                onChange={(v) => setFormData({ ...formData, investsMonthly: v })}
            />
            <YesNoQuestion
                label="7 - Você tem um planejamento para aposentadoria?"
                value={formData.retirementPlan}
                onChange={(v) => setFormData({ ...formData, retirementPlan: v })}
            />
            <YesNoQuestion
                label="8 - Você toma boas decisões financeiras sem precisar de ajuda?"
                value={formData.independentDecisions}
                onChange={(v) => setFormData({ ...formData, independentDecisions: v })}
            />
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-12 animate-in slide-in-from-right duration-300 py-10">
            <div className="space-y-8 text-center">
                <label className="block text-lg font-black text-white uppercase tracking-wide">
                    9 - De 1 a 10, que nota você dá a sua vida financeira hoje?
                </label>
                <div className="text-6xl font-black text-sky-400 neon-text">{formData.financialScore}</div>
                <input
                    type="range"
                    min="0"
                    max="10"
                    value={formData.financialScore}
                    onChange={(e) => setFormData({ ...formData, financialScore: parseInt(e.target.value) })}
                    className="w-full max-w-md accent-sky-500 h-3 bg-slate-700 rounded-full cursor-pointer"
                />
                <div className="flex justify-between max-w-md mx-auto text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">
                    <span>0 - Sanhaço Puro</span>
                    <span>5 - Regular</span>
                    <span>10 - Muito Boa</span>
                </div>
            </div>
        </div>
    );

    const renderViewMode = () => (
        <div className="space-y-8 animate-in slide-in-from-right duration-300 print:space-y-4">
            <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50 space-y-4 print:bg-white print:border-slate-200 print:p-0 print:shadow-none">
                <h3 className="text-sky-400 font-black uppercase tracking-widest text-xs mb-4 border-b border-slate-700/50 pb-2 print:text-black print:border-slate-300">Motivação e Objetivos</h3>
                <div>
                    <span className="text-xs font-bold text-slate-500 uppercase block mb-1 print:text-slate-600">1. Motivação</span>
                    <p className="text-slate-300 italic print:text-black print:not-italic">"{formData.reason}"</p>
                </div>
                <div>
                    <span className="text-xs font-bold text-slate-500 uppercase block mb-1 print:text-slate-600">2. Objetivos</span>
                    <p className="text-slate-300 italic print:text-black print:not-italic">"{formData.objectives}"</p>
                </div>
            </div>

            <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50 space-y-4 print:bg-white print:border-slate-200 print:p-0 print:shadow-none">
                <h3 className="text-green-400 font-black uppercase tracking-widest text-xs mb-4 border-b border-slate-700/50 pb-2 print:text-black print:border-slate-300">Hábitos Financeiros</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2">
                    <div className="flex justify-between items-center py-2 border-b border-slate-700/30 print:border-slate-200">
                        <span className="text-sm text-slate-400 print:text-black">Gasta tudo que ganha?</span>
                        <span className={`text-xs font-black uppercase px-2 py-1 rounded ${formData.spendsAll ? 'bg-emerald-500/20 text-emerald-400 print:bg-emerald-100 print:text-emerald-700' : 'bg-rose-500/20 text-rose-400 print:bg-rose-100 print:text-rose-700'}`}>{formData.spendsAll ? 'Sim' : 'Não'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-700/30 print:border-slate-200">
                        <span className="text-sm text-slate-400 print:text-black">Possui Reserva de Emergência?</span>
                        <span className={`text-xs font-black uppercase px-2 py-1 rounded ${formData.emergencyFund ? 'bg-emerald-500/20 text-emerald-400 print:bg-emerald-100 print:text-emerald-700' : 'bg-rose-500/20 text-rose-400 print:bg-rose-100 print:text-rose-700'}`}>{formData.emergencyFund ? 'Sim' : 'Não'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-700/30 print:border-slate-200">
                        <span className="text-sm text-slate-400 print:text-black">Possui Investimentos?</span>
                        <span className={`text-xs font-black uppercase px-2 py-1 rounded ${formData.investments ? 'bg-emerald-500/20 text-emerald-400 print:bg-emerald-100 print:text-emerald-700' : 'bg-rose-500/20 text-rose-400 print:bg-rose-100 print:text-rose-700'}`}>{formData.investments ? 'Sim' : 'Não'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-700/30 print:border-slate-200">
                        <span className="text-sm text-slate-400 print:text-black">Investe Mensalmente?</span>
                        <span className={`text-xs font-black uppercase px-2 py-1 rounded ${formData.investsMonthly ? 'bg-emerald-500/20 text-emerald-400 print:bg-emerald-100 print:text-emerald-700' : 'bg-rose-500/20 text-rose-400 print:bg-rose-100 print:text-rose-700'}`}>{formData.investsMonthly ? 'Sim' : 'Não'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-700/30 print:border-slate-200">
                        <span className="text-sm text-slate-400 print:text-black">Pensa em Aposentadoria?</span>
                        <span className={`text-xs font-black uppercase px-2 py-1 rounded ${formData.retirementPlan ? 'bg-emerald-500/20 text-emerald-400 print:bg-emerald-100 print:text-emerald-700' : 'bg-rose-500/20 text-rose-400 print:bg-rose-100 print:text-rose-700'}`}>{formData.retirementPlan ? 'Sim' : 'Não'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-700/30 print:border-slate-200">
                        <span className="text-sm text-slate-400 print:text-black">Decide Sozinho(a)?</span>
                        <span className={`text-xs font-black uppercase px-2 py-1 rounded ${formData.independentDecisions ? 'bg-emerald-500/20 text-emerald-400 print:bg-emerald-100 print:text-emerald-700' : 'bg-rose-500/20 text-rose-400 print:bg-rose-100 print:text-rose-700'}`}>{formData.independentDecisions ? 'Sim' : 'Não'}</span>
                    </div>
                </div>
            </div>

            <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50 space-y-4 print:bg-white print:border-slate-200 print:p-0 print:shadow-none print:break-inside-avoid">
                <h3 className="text-amber-400 font-black uppercase tracking-widest text-xs mb-4 border-b border-slate-700/50 pb-2 print:text-black print:border-slate-300">Autoavaliação</h3>
                <div className="flex items-center gap-4">
                    <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden print:bg-slate-200 print:border print:border-slate-300">
                        <div
                            className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-1000"
                            style={{ width: `${(formData.financialScore / 10) * 100}%` }}
                        ></div>
                    </div>
                    <span className="text-2xl font-black text-white print:text-black">{formData.financialScore}/10</span>
                </div>
                <p className="text-xs text-slate-500 text-center uppercase tracking-widest print:text-slate-600">Nota autoatribuída</p>
            </div>

        </div>
    );

    const wrapperClasses = isStandalone
        ? "min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center p-0 md:p-6 print:bg-white print:p-0 print:block"
        : "fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:bg-white print:p-0 print:block print:static";

    const containerClasses = isStandalone
        ? "w-full max-w-3xl mx-auto bg-slate-900 shadow-2xl overflow-hidden flex flex-col h-full md:h-auto md:min-h-[80vh] md:rounded-3xl border border-slate-800 print:shadow-none print:border-none print:bg-white print:h-auto print:w-full print:max-w-none"
        : "bg-slate-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-slate-800 flex flex-col print:shadow-none print:border-none print:bg-white print:h-auto print:w-full print:max-w-none print:overflow-visible";

    return (
        <div className={wrapperClasses}>
            <div className={containerClasses}>
                <div className="p-6 border-b border-slate-800 sticky top-0 bg-slate-900 z-10 print:hidden">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                            {mode === 'view' && onClose && (
                                <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                                    <ArrowLeft size={20} />
                                </button>
                            )}
                            <div>
                                <h2 className="text-xl font-black text-white uppercase tracking-tight">Anamnese Financeira</h2>
                                <span className="text-xs text-slate-400 font-bold uppercase">
                                    {mode === 'view' ? 'Suas Respostas' : `Etapa ${step} de 3`}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {mode === 'view' && (
                                <button
                                    onClick={handlePrint}
                                    className="p-2 bg-slate-800 text-slate-400 hover:bg-sky-500 hover:text-white rounded-lg transition-colors flex items-center gap-2 mr-1"
                                    title="Imprimir / Salvar PDF"
                                >
                                    <FileText size={18} />
                                    <span className="text-[10px] font-black uppercase hidden sm:inline">Baixar PDF</span>
                                </button>
                            )}
                            {mode === 'view' && (
                                <button
                                    onClick={() => setMode('edit')}
                                    className="p-2 bg-sky-500/10 text-sky-400 hover:bg-sky-500 hover:text-white rounded-lg transition-colors flex items-center gap-2"
                                    title="Editar"
                                >
                                    <Edit2 size={18} />
                                    <span className="text-[10px] font-black uppercase hidden sm:inline">Atualizar</span>
                                </button>
                            )}

                            {isStandalone && onLogout && mode !== 'edit' && mode !== 'view' && (
                                <button
                                    onClick={onLogout}
                                    className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg transition-colors flex items-center gap-2"
                                    title="Sair"
                                >
                                    <LogOut size={18} />
                                    <span className="text-[10px] font-black uppercase hidden sm:inline">Sair</span>
                                </button>
                            )}

                            {/* Cancel Button for Edit Mode */}
                            {mode === 'edit' && (
                                <button
                                    onClick={() => setMode('view')}
                                    className="p-2 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white rounded-lg transition-colors flex items-center gap-2"
                                    title="Cancelar Edição"
                                >
                                    <X size={18} />
                                    <span className="text-[10px] font-black uppercase hidden sm:inline">Cancelar</span>
                                </button>
                            )}

                            {!isStandalone && onClose && mode !== 'view' && mode !== 'edit' && (
                                <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                    {/* Progress Bar only in Edit/Create Mode */}
                    {mode !== 'view' && (
                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-sky-500 transition-all duration-300"
                                style={{ width: `${(step / 3) * 100}%` }}
                            ></div>
                        </div>
                    )}
                </div>

                <div className="p-6 flex-1 print:p-0 print:overflow-visible">
                    {/* Inline Print Header Removed - Used in Portal */}

                    {mode === 'view' ? renderViewMode() : (
                        <>
                            {step === 1 && renderStep1()}
                            {step === 2 && renderStep2()}
                            {step === 3 && renderStep3()}
                        </>
                    )}
                </div>

                <div className="p-6 border-t border-slate-800 bg-slate-900 sticky bottom-0 z-10 flex justify-between items-center print:hidden">
                    {mode === 'view' ? (
                        <span className="text-xs text-slate-500 italic w-full text-center">
                            Clique em "Atualizar" para editar suas respostas.
                        </span>
                    ) : (
                        <>
                            {step > 1 ? (
                                <button
                                    onClick={handleBack}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all text-xs font-black uppercase tracking-widest"
                                >
                                    <ChevronLeft size={16} /> Voltar
                                </button>
                            ) : (
                                <div></div>
                            )}

                            {step < 3 ? (
                                <button
                                    onClick={handleNext}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-500 text-white hover:bg-sky-400 transition-all text-xs font-black uppercase tracking-widest shadow-lg shadow-sky-500/20"
                                >
                                    Próximo <ChevronRight size={16} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-emerald-500 text-white hover:bg-emerald-400 transition-all text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20"
                                >
                                    <Save size={16} /> Salvar Anamnese
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {isPrinting && (
                <PrintPortal>
                    <div className="p-8 bg-white text-black">
                        <PrintHeader user={user || { name: 'Cliente', email: '', id: '', role: 'USER' }} title="Anamnese Financeira" />
                        <div className="mt-8">
                            {renderViewMode()}
                        </div>
                    </div>
                </PrintPortal>
            )}
        </div>
    );
};


import React from 'react';
import { User } from '../types';
import { AlertTriangle, Target, TrendingUp, HelpCircle, Calendar, FileText } from 'lucide-react';

interface UserIntakePrintProps {
    user: User;
    data: any; // Using any for simplicity due to complex form structure, but follows UserIntakeModal state
}

export const UserIntakePrint: React.FC<UserIntakePrintProps> = ({ user, data }) => {
    return (
        <div className="p-8 max-w-4xl mx-auto bg-white text-black">
            {/* Header */}
            <div className="border-b-2 border-slate-200 pb-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <img src="/images/logo.png" alt="Solum" className="h-12" />
                    <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">Ficha Individual do Cliente</h1>
                </div>
                <div className="grid grid-cols-2 gap-y-2 text-sm text-slate-700">
                    <p><strong className="font-bold text-slate-900">Nome:</strong> {user.name}</p>
                    <p><strong className="font-bold text-slate-900">Email:</strong> {user.email}</p>
                    <p><strong className="font-bold text-slate-900">Telefone:</strong> {user.whatsapp || user.phone || 'Não informado'}</p>
                    <p><strong className="font-bold text-slate-900">Data de Impressão:</strong> {new Date().toLocaleDateString()}</p>
                </div>
            </div>

            <div className="space-y-8">
                {/* 1. Problema Principal */}
                <section className="break-inside-avoid">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-5 h-5 text-slate-900" />
                        <h3 className="font-bold text-lg uppercase text-slate-900">1. Qual o problema principal?</h3>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-800 text-sm whitespace-pre-wrap min-h-[4rem]">
                        {data.main_problem || 'Não preenchido.'}
                    </div>
                </section>

                {/* 2. Tentativas Anteriores */}
                <section className="break-inside-avoid">
                    <div className="flex items-center gap-2 mb-3">
                        <Target className="w-5 h-5 text-slate-900" />
                        <h3 className="font-bold text-lg uppercase text-slate-900">2. Já tentou resolver?</h3>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-800 text-sm whitespace-pre-wrap min-h-[3rem]">
                        {data.resolution_attempts || 'Não preenchido.'}
                    </div>
                </section>

                {/* 3. Profissão */}
                <section className="break-inside-avoid">
                    <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-5 h-5 text-slate-900" />
                        <h3 className="font-bold text-lg uppercase text-slate-900">3. Qual a sua profissão?</h3>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-800 text-sm whitespace-pre-wrap">
                        {data.personal_info?.profession || 'Não informado.'}
                    </div>
                </section>

                {/* 4. Dependentes */}
                <section className="break-inside-avoid">
                    <div className="flex items-center gap-2 mb-3">
                        <Target className="w-5 h-5 text-slate-900" />
                        <h3 className="font-bold text-lg uppercase text-slate-900">4. Possui dependentes?</h3>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-800 text-sm">
                        <div className="flex items-center gap-4 mb-2">
                            <span className="font-bold">Possui dependentes?</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase border ${data.personal_info?.has_dependents ? 'bg-black text-white' : 'bg-slate-100 text-slate-500'}`}>
                                {data.personal_info?.has_dependents ? 'SIM' : 'NÃO'}
                            </span>
                        </div>
                        {data.personal_info?.has_dependents && (
                            <p className="mt-2"><strong className="font-bold">Quantidade:</strong> {data.personal_info?.dependents_count || 0}</p>
                        )}
                    </div>
                </section>

                {/* 5. Faixa de Renda */}
                <section className="break-inside-avoid">
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-5 h-5 text-slate-900" />
                        <h3 className="font-bold text-lg uppercase text-slate-900">5. Qual sua faixa de renda?</h3>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-800 text-sm">
                        {data.personal_info?.income_range || 'Não informado.'}
                    </div>
                </section>

                {/* 6. Visão Financeira */}
                <section className="break-inside-avoid">
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-5 h-5 text-slate-900" />
                        <h3 className="font-bold text-lg uppercase text-slate-900">6. Visão Financeira</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        {[
                            { key: 'surviving', label: 'Só sobrevivendo?' },
                            { key: 'spending_more', label: 'Gastando mais do que deveria?' },
                            { key: 'saving', label: 'Conseguindo guardar?' },
                            { key: 'emergency_fund', label: 'Tem reserva de emergência?' },
                            { key: 'others', label: 'Outros' }
                        ].map((item) => {
                            const detail = data.details.financial_view[item.key];
                            const isSelected = detail?.selected;
                            return (
                                <div key={item.key} className={`flex items-start gap-3 p-3 rounded border ${isSelected ? 'bg-slate-100 border-slate-400' : 'border-transparent text-slate-400'}`}>
                                    <div className={`w-5 h-5 flex items-center justify-center border rounded ${isSelected ? 'border-black bg-black text-white' : 'border-slate-300'}`}>
                                        {isSelected && '✓'}
                                    </div>
                                    <div className="flex-1">
                                        <span className={`font-medium ${isSelected ? 'text-black' : 'text-slate-500'}`}>{item.label}</span>
                                        {isSelected && detail.details && (
                                            <p className="mt-1 text-sm text-slate-800 italic border-l-2 border-slate-300 pl-2">
                                                {detail.details}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* 7. Outros Problemas */}
                <section className="break-inside-avoid">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-5 h-5 text-slate-900" />
                        <h3 className="font-bold text-lg uppercase text-slate-900">7. Outros Problemas</h3>
                    </div>
                    <div className="space-y-3">
                        {[
                            { key: 'impediment_saving', label: 'Impeditivo para guardar dinheiro' },
                            { key: 'debt_difficulty', label: 'Dificuldade com dívidas' },
                            { key: 'others', label: 'Outros' }
                        ].map(item => {
                            const problem = data.details.problems[item.key];
                            if (problem.has) {
                                return (
                                    <div key={item.key} className="bg-slate-50 p-3 rounded border border-slate-200">
                                        <p className="font-bold text-slate-900 mb-1">{item.label}</p>
                                        <p className="text-sm text-slate-700">{problem.details || 'Sem detalhes.'}</p>
                                    </div>
                                )
                            }
                            return null;
                        })}
                    </div>
                </section>

                {/* 8. Satisfação */}
                <section className="break-inside-avoid">
                    <div className="flex items-center gap-2 mb-3">
                        <HelpCircle className="w-5 h-5 text-slate-900" />
                        <h3 className="font-bold text-lg uppercase text-slate-900">8. O que traria satisfação?</h3>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-800 text-sm whitespace-pre-wrap min-h-[3rem]">
                        {data.details.satisfaction || 'Não preenchido.'}
                    </div>
                </section>

                {/* 9. Metas */}
                <section className="break-inside-avoid">
                    <div className="flex items-center gap-2 mb-3">
                        <Target className="w-5 h-5 text-slate-900" />
                        <h3 className="font-bold text-lg uppercase text-slate-900">9. Metas e Importância</h3>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-800 text-sm">
                        <div className="flex items-center gap-4 mb-2">
                            <span className="font-bold">Possui metas?</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase border ${data.details.goals.has_goals ? 'bg-black text-white' : 'bg-slate-100 text-slate-500'}`}>
                                {data.details.goals.has_goals ? 'SIM' : 'NÃO'}
                            </span>
                        </div>
                        {data.details.goals.has_goals && (
                            <p className="whitespace-pre-wrap mt-2">{data.details.goals.importance || 'Sem detalhes.'}</p>
                        )}
                    </div>
                </section>

                {/* 10. Futuro */}
                <section className="break-inside-avoid">
                    <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-5 h-5 text-slate-900" />
                        <h3 className="font-bold text-lg uppercase text-slate-900">10. Visão de Futuro (6 meses)</h3>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-800 text-sm whitespace-pre-wrap min-h-[3rem]">
                        {data.details.future_outlook || 'Não preenchido.'}
                    </div>
                </section>
            </div>
        </div>
    );
};

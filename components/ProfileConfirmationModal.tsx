import React, { useState, useEffect } from 'react';
import { X, User as UserIcon, Mail, MessageSquare, Lock, Save, Loader2, AlertTriangle } from 'lucide-react';
import { User } from '../types';
import { authService } from '../services/authService';

interface ProfileConfirmationModalProps {
    user: User;
    onConfirm: () => void;
    onCancel: () => void;
    onSave?: (data: any) => Promise<void>;
}

export const ProfileConfirmationModal: React.FC<ProfileConfirmationModalProps> = ({ user, onConfirm, onCancel, onSave }) => {
    const [formData, setFormData] = useState({
        name: user.name || '',
        email: user.email || '',
        whatsapp: user.whatsapp || '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isInitialSetup = user.status === 'NEW';

    const handleSubmit = async () => {
        setError('');

        if (!formData.name || !formData.email || !formData.whatsapp) {
            setError('Nome, E-mail e WhatsApp são obrigatórios.');
            return;
        }

        // Validação de senha: Obrigatória apenas no primeiro acesso (NEW) ou se o usuário preencheu algo
        if (isInitialSetup && !formData.password) {
            setError('Por segurança, você deve definir uma nova senha para acessar seu diagnóstico futuramente.');
            return;
        }

        if (formData.password) {
            if (formData.password.length < 6) {
                setError('A senha deve ter pelo menos 6 caracteres.');
                return;
            }

            if (formData.password !== formData.confirmPassword) {
                setError('As senhas não conferem.');
                return;
            }
        }

        setLoading(true);

        try {
            const updates: any = {
                name: formData.name,
                email: formData.email,
                whatsapp: formData.whatsapp
            };

            if (formData.password) {
                updates.password = formData.password;
            }

            if (onSave) {
                await onSave(updates);
            } else {
                await authService.updateCurrentProfile(updates);
            }

            // Atualiza status para ACTIVE (Consultoria/Confirmado) se for o primeiro acesso
            if (isInitialSetup) {
                await authService.confirmFirstAccess(user.id);
            }

            onConfirm();
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Erro ao atualizar perfil. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-[#0f172a]/95 backdrop-blur-md animate-in fade-in" onClick={loading ? undefined : onCancel}></div>
            <div className="relative w-full max-w-lg bg-slate-900 border border-emerald-500/30 rounded-[2.5rem] p-8 shadow-2xl shadow-emerald-500/10 animate-in zoom-in-95 duration-200">
                {!loading && (
                    <button onClick={onCancel} className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                )}

                <div className="mb-8 flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20 mb-4 animate-pulse">
                        <Save size={28} />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                        {isInitialSetup ? 'Confirmar & Salvar' : 'Editar Perfil'}
                    </h2>
                    <p className="text-sm text-slate-400 mt-2 font-medium max-w-sm">
                        {isInitialSetup
                            ? 'Confira seus dados e defina sua senha definitiva para garantir acesso seguro ao seu diagnóstico.'
                            : 'Atualize seus dados pessoais e de acesso.'}
                    </p>
                </div>

                <div className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Nome Completo</label>
                        <div className="relative">
                            <UserIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-slate-800/40 border border-slate-700 rounded-2xl py-3.5 pl-11 pr-4 text-sm outline-none focus:border-emerald-500 transition-all text-white placeholder:text-slate-600"
                                placeholder="Seu nome"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">E-mail</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-slate-800/40 border border-slate-700 rounded-2xl py-3.5 pl-11 pr-4 text-sm outline-none focus:border-emerald-500 transition-all text-white placeholder:text-slate-600"
                                    placeholder="seu@email.com"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">WhatsApp</label>
                            <div className="relative">
                                <MessageSquare size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="tel"
                                    value={formData.whatsapp}
                                    onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                                    className="w-full bg-slate-800/40 border border-slate-700 rounded-2xl py-3.5 pl-11 pr-4 text-sm outline-none focus:border-emerald-500 transition-all text-white placeholder:text-slate-600"
                                    placeholder="(00) 00000-0000"
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-800/30 rounded-2xl border border-slate-800 space-y-4">
                        <div className="flex items-center gap-2 text-amber-400">
                            <AlertTriangle size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wide">
                                {isInitialSetup ? 'Segurança Obrigatória' : 'Alterar Senha (Opcional)'}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Nova Senha</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3.5 pl-11 pr-4 text-sm outline-none focus:border-emerald-500 transition-all text-white placeholder:text-slate-600"
                                        placeholder={isInitialSetup ? "Mínimo 6 dígitos" : "Deixe em branco para manter"}
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Confirmar Senha</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3.5 pl-11 pr-4 text-sm outline-none focus:border-emerald-500 transition-all text-white placeholder:text-slate-600"
                                        placeholder="Repita a senha"
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 font-bold text-center animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full py-4 bg-emerald-500 text-[#0f172a] rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all hover:bg-emerald-400 flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {loading ? 'Atualizando...' : (isInitialSetup ? 'Confirmar e Ver Diagnóstico' : 'Salvar Alterações')}
                    </button>
                </div>
            </div>
        </div>
    );
};


import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, MessageSquare, ArrowRight, LogIn, Sparkles } from 'lucide-react';
import { authService } from '../services/authService';
import { UserRole } from '../types';

interface AuthModalProps {
    onClose: () => void;
    onSuccess: (user: any) => void;
    forceRegister?: boolean;
    forceLogin?: boolean;
    isStartFlow?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess, forceRegister = false, forceLogin = false, isStartFlow = false }) => {
    // Se forceRegister for true, isLogin começa como false.
    // Se forceLogin for true, isLogin começa como true.
    // Se nenhum for true, padrão é true (login).
    const [isLogin, setIsLogin] = useState(forceRegister ? false : true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        setError('');

        if (!formData.email || !formData.password) {
            setError('E-mail e senha são obrigatórios.');
            return;
        }

        if (isLogin) {
            const res = await authService.login(formData.email, formData.password);
            if (res.success && res.user) {
                onSuccess(res.user);
            } else {
                setError(res.message || 'Erro ao entrar.');
            }
        } else {
            if (!formData.name || !formData.whatsapp) {
                setError('Preencha todos os campos para cadastrar.');
                return;
            }
            const res = await authService.register({
                name: formData.name,
                email: formData.email,
                whatsapp: formData.whatsapp,
                password: formData.password,
                role: 'USER' as UserRole
            });
            if (res.success && res.user) {
                onSuccess(res.user);
            } else {
                setError(res.message || 'Erro ao cadastrar.');
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-[#0f172a]/90 backdrop-blur-sm animate-in fade-in" onClick={onClose}></div>
            <div className="relative w-full max-w-md bg-slate-900 border border-sky-500/30 rounded-[2.5rem] p-8 shadow-2xl shadow-sky-500/20 animate-in zoom-in-95 duration-200">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white transition-colors">
                    <X size={20} />
                </button>

                <div className="mb-6 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-sky-500/10 rounded-xl flex items-center justify-center text-sky-400 border border-sky-500/20 mb-3">
                        {isStartFlow ? <Sparkles size={24} /> : (isLogin ? <LogIn size={24} /> : <Sparkles size={24} />)}
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                        {isStartFlow
                            ? 'Seja Bem-vindo!'
                            : (isLogin ? 'Bem-vindo de Volta' : (forceRegister ? 'Salvar Diagnóstico' : 'Criar Conta Grátis'))}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 font-medium">
                        {isStartFlow
                            ? 'Iniciando processo de consultoria financeira personalizado.'
                            : (isLogin
                                ? 'Entre para acessar seu diagnóstico salvo.'
                                : (forceRegister ? 'Cadastre-se para gerar e salvar seu relatório final.' : 'Cadastre-se para salvar e ver seu diagnóstico completo.'))}
                    </p>
                </div>

                {/* Só mostra os botões de alternância se não for forçado nem Login nem Registro */}
                {!forceRegister && !forceLogin && (
                    <div className="flex bg-slate-800/50 p-1 rounded-xl mb-6">
                        <button
                            onClick={() => { setIsLogin(true); setError(''); }}
                            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${isLogin ? 'bg-sky-500 text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => { setIsLogin(false); setError(''); }}
                            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${!isLogin ? 'bg-sky-500 text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Cadastro
                        </button>
                    </div>
                )}

                <div className="space-y-4">
                    {!isLogin && (
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Nome Completo</label>
                            <div className="relative">
                                <UserIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-slate-800/40 border border-slate-700 rounded-2xl py-3 pl-10 pr-4 text-sm outline-none focus:border-sky-500 transition-all text-white placeholder:text-slate-600"
                                    placeholder="Seu nome"
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">E-mail</label>
                        <div className="relative">
                            <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-slate-800/40 border border-slate-700 rounded-2xl py-3 pl-10 pr-4 text-sm outline-none focus:border-sky-500 transition-all text-white placeholder:text-slate-600"
                                placeholder="seu@email.com"
                            />
                        </div>
                    </div>

                    {!isLogin && (
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">WhatsApp</label>
                            <div className="relative">
                                <MessageSquare size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="tel"
                                    value={formData.whatsapp}
                                    onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                                    className="w-full bg-slate-800/40 border border-slate-700 rounded-2xl py-3 pl-10 pr-4 text-sm outline-none focus:border-sky-500 transition-all text-white placeholder:text-slate-600"
                                    placeholder="(00) 00000-0000"
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Senha</label>
                        <div className="relative">
                            <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="password"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                className="w-full bg-slate-800/40 border border-slate-700 rounded-2xl py-3 pl-10 pr-4 text-sm outline-none focus:border-sky-500 transition-all text-white placeholder:text-slate-600"
                                placeholder="******"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 font-bold text-center">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        className="w-full py-4 bg-sky-500 text-[#0f172a] rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-sky-500/20 active:scale-95 transition-all hover:bg-sky-400 flex items-center justify-center gap-2 mt-2"
                    >
                        {isLogin ? 'Entrar' : 'Cadastrar e Ver Diagnóstico'}
                        <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

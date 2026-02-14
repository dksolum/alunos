import React from 'react';
import { User } from '../types';
import {
    ArrowRight,
    LogIn,
    Heart,
    FileText,
    CreditCard,
    Receipt,
    Briefcase,
    Users,
    Building2,
    TrendingUp,
    Target,
    Activity,
    LayoutDashboard
} from 'lucide-react';

interface LandingProps {
    onStart: () => void;
    onLogin: () => void;
    currentUser: User | null;
}

export const Landing: React.FC<LandingProps> = ({ onStart, onLogin, currentUser }) => {
    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200">
            {/* Header Simples */}
            <header className="absolute top-0 w-full z-50 px-6 py-4 flex justify-between items-center max-w-6xl left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-3">
                    <img src="/images/logo.png" alt="SOLUM Logo" className="h-10 w-auto object-contain" />
                    <div className="flex flex-col">
                        <h1 className="text-xs font-black text-sky-400 uppercase tracking-tighter leading-none">SOLUM</h1>
                        <span className="text-[8px] font-bold text-slate-500 uppercase">Diagnóstico Financeiro</span>
                    </div>
                </div>
                <button
                    onClick={onLogin}
                    className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-wide"
                >
                    {currentUser ? (
                        <>
                            <LayoutDashboard size={14} /> Olá, {currentUser.name?.split(' ')[0] || 'Visitante'}
                        </>
                    ) : (
                        <>
                            <LogIn size={14} /> Área do Cliente
                        </>
                    )}
                </button>
            </header>

            <main className="max-w-6xl mx-auto px-4 pt-24 pb-10 flex flex-col gap-16">

                {/* Hero Section */}

                {/* Banner INSANO (Moved to Top) */}
                <div className="relative group w-full max-w-6xl mx-auto -mb-6 animate-in slide-in-from-top-8 duration-1000">
                    {/* halo externo */}
                    <div className="pointer-events-none absolute -inset-6 rounded-[3.2rem] blur-3xl opacity-25 group-hover:opacity-45 transition-opacity duration-700
                                bg-gradient-to-r from-sky-500/30 via-emerald-500/20 to-sky-500/30" />

                    {/* borda “viva” */}
                    <div className="relative rounded-[3rem] p-[1px] bg-gradient-to-r from-sky-500/40 via-emerald-500/30 to-sky-500/40">
                        <div className="relative overflow-hidden rounded-[2.95rem] border border-slate-800/80 bg-slate-950/40 shadow-2xl">
                            {/* brilho interno + vinheta */}
                            <div className="pointer-events-none absolute inset-0 opacity-60 mix-blend-screen
                                    bg-[radial-gradient(ellipse_at_top_left,rgba(56,189,248,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(52,211,153,0.25),transparent_55%)]" />
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b1022]/80 via-transparent to-[#0b1022]/30" />
                            <div className="pointer-events-none absolute inset-0 [box-shadow:inset_0_0_120px_rgba(0,0,0,0.65)]" />

                            {/* grain (textura) */}
                            <div className="pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-overlay
                                    bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

                            {/* IMAGEM */}
                            <img
                                src="/images/diagnostico.png"
                                alt="Tudo o que você precisa para começar"
                                className="
                        w-full
                        h-[220px] sm:h-[260px] md:h-[320px] lg:h-[360px]   /* MAIS COMPRIDO */
                        object-cover
                        object-center
                        transition-transform duration-700 ease-out
                        group-hover:scale-[1.06]
                        "
                                loading="eager"
                            />

                            {/* “chips” flutuantes */}
                            <div className="pointer-events-none absolute top-5 left-5 flex gap-2">
                                <div className="px-3 py-1 rounded-full bg-slate-900/60 border border-slate-700/50 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-sky-300">
                                    Estrutura prática
                                </div>
                                <div className="px-3 py-1 rounded-full bg-slate-900/60 border border-slate-700/50 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-emerald-300">
                                    Organização em minutos
                                </div>
                            </div>

                            {/* “brilho de linha” embaixo */}
                            <div className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 w-[70%] h-24 blur-3xl opacity-35
                                    bg-gradient-to-r from-sky-500/40 via-emerald-500/30 to-sky-500/40" />
                        </div>
                    </div>
                </div>

                {/* Hero Section */}
                <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
                    <div className="flex-1 space-y-6 animate-in slide-in-from-bottom-4 duration-700">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-black uppercase tracking-widest">
                            <Activity size={12} /> Diagnóstico Inteligente
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
                            Descubra a <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400 neon-text">verdade</span> sobre o seu dinheiro.
                        </h1>
                        <p className="text-sm text-slate-400 leading-relaxed font-medium max-w-lg">
                            Sem planilhas complexas. Um processo guiado por etapas onde você informa sua realidade e, no final, recebe uma análise personalizada e os próximos passos para sua liberdade.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button
                                onClick={onStart}
                                className="px-8 py-4 bg-sky-500 text-[#0f172a] rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-sky-500/20 hover:bg-sky-400 hover:shadow-sky-400/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                            >
                                Começar Diagnóstico <ArrowRight size={16} />
                            </button>
                            <button
                                onClick={onLogin}
                                className="px-8 py-4 bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-700 hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                            >
                                {currentUser ? 'Ir para meu Painel' : 'Já tenho conta'}
                            </button>
                        </div>
                    </div>

                    {/* Abstract Visual / Banner */}
                    <div className="flex-1 w-full relative group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/20 to-emerald-500/20 rounded-[3rem] blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-1000"></div>
                        <div className="relative bg-slate-900 border border-slate-800 rounded-[3rem] p-8 md:p-12 shadow-2xl flex flex-col gap-6 overflow-hidden">
                            <div className="absolute top-0 right-0 p-10 opacity-10">
                                <TrendingUp size={200} className="text-slate-500" />
                            </div>

                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400">
                                        <Target size={24} />
                                    </div>
                                    <div className="h-px bg-slate-800 flex-1"></div>
                                    <div className="w-12 h-12 bg-sky-500/20 rounded-2xl flex items-center justify-center text-sky-400">
                                        <Activity size={24} />
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-black uppercase text-slate-500">Resultado Previsto</span>
                                        <span className="text-[10px] font-bold text-sky-400">Em processamento...</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-sky-500 w-3/4 animate-pulse"></div>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400 italic">
                                    "A SOLUM traduz seus números frios em tempo de vida, mostrando exatamente o esforço necessário para manter seu padrão atual."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pré-requisitos */}
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">



                    <div className="flex items-center gap-4">
                        <div className="h-px bg-slate-800 flex-1"></div>
                        <h2 className="text-xs font-black text-rose-400 uppercase tracking-[0.2em] text-center">O que é necessário</h2>
                        <div className="h-px bg-slate-800 flex-1"></div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <PrerequisiteCard
                            icon={<Heart className="text-rose-500" />}
                            title="Coragem"
                            desc="Para encarar a realidade sem filtros."
                            delay="0"
                        />
                        <PrerequisiteCard
                            icon={<CreditCard className="text-amber-500" />}
                            title="Fatura Atual"
                            desc="Tenha o app do banco aberto."
                            delay="100"
                        />
                        <PrerequisiteCard
                            icon={<Receipt className="text-sky-500" />}
                            title="Parcelas"
                            desc="Saber o que já está comprometido."
                            delay="200"
                        />
                        <PrerequisiteCard
                            icon={<FileText className="text-emerald-500" />}
                            title="Boletos"
                            desc="Suas contas fixas mensais."
                            delay="300"
                        />
                    </div>
                </div>

                {/* Público Alvo */}
                <div className="bg-slate-800/20 border border-slate-800 rounded-[3rem] p-8 md:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                    <div className="text-center space-y-2">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">Para quem é a Solum?</h2>
                        <p className="text-xs text-slate-400 font-medium">Não importa de onde vem o dinheiro, importa como você lida com ele.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <TargetCard
                            icon={<Briefcase />}
                            title="CLT & Servidores"
                            desc="Para quem tem salário fixo mas sente que o dinheiro acaba antes do mês."
                        />
                        <TargetCard
                            icon={<Users />}
                            title="Autônomos"
                            desc="Para quem tem renda variável e precisa de previsibilidade para viver."
                        />
                        <TargetCard
                            icon={<Building2 />}
                            title="Empresários"
                            desc="Que misturam contas PJ com PF e precisam organizar o pró-labore."
                        />
                        <TargetCard
                            icon={<TrendingUp className="text-rose-400" />}
                            title="No Sanhaço"
                            desc="Quem está endividado e precisa de um plano de guerra urgente."
                            highlight
                        />
                        <TargetCard
                            icon={<Target className="text-emerald-400" />}
                            title="Focados em Metas"
                            desc="Quem já guarda dinheiro mas quer otimizar para acelerar sonhos."
                            highlight
                        />
                    </div>
                </div>

                <footer className="text-center py-8 border-t border-slate-800/50">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">SOLUM © 2026 - Diagnóstico Financeiro Inteligente</p>
                </footer>

            </main >
        </div >
    );
};

const PrerequisiteCard: React.FC<{ icon: React.ReactNode, title: string, desc: string, delay: string }> = ({ icon, title, desc, delay }) => (
    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col items-center text-center gap-3 hover:border-slate-700 transition-all group" style={{ animationDelay: `${delay}ms` }}>
        <div className="p-3 bg-slate-800 rounded-xl group-hover:scale-110 transition-transform duration-300">
            {icon}
        </div>
        <div className="space-y-1">
            <h3 className="text-xs font-black text-slate-200 uppercase tracking-wide">{title}</h3>
            <p className="text-[10px] text-slate-500 font-medium leading-tight">{desc}</p>
        </div>
    </div>
);

const TargetCard: React.FC<{ icon: React.ReactNode, title: string, desc: string, highlight?: boolean }> = ({ icon, title, desc, highlight }) => (
    <div className={`p-5 rounded-2xl border flex items-start gap-4 transition-all hover:-translate-y-1 ${highlight
        ? 'bg-slate-800/40 border-slate-700 hover:border-sky-500/30'
        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
        }`}>
        <div className={`p-2.5 rounded-xl shrink-0 ${highlight ? 'bg-slate-800 text-slate-200' : 'bg-slate-800 text-slate-400'}`}>
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 18 }) : icon}
        </div>
        <div className="space-y-1">
            <h3 className={`text-xs font-black uppercase tracking-wide ${highlight ? 'text-white' : 'text-slate-300'}`}>{title}</h3>
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{desc}</p>
        </div>
    </div>
);

import React from 'react';
import { User as UserType, Anamnesis } from '../types';
import { UserIntakeModal } from './UserIntakeModal';
import { ChecklistModal } from './ChecklistModal';
import {
    User,
    LayoutDashboard,
    Brain,
    TrendingUp,
    Activity,
    Home,
    LogOut,
    CheckCircle2,
    Lock,
    PlayCircle,
    FileText,
    Calendar,
    Target,
    BarChart3,
    RefreshCw,
    Shield,
    ChevronRight,
    ListChecks
} from 'lucide-react';

interface DashboardProps {
    user: UserType;
    anamnesisData: Anamnesis | null;
    hasDiagnosticData: boolean;
    onStartAnamnesis: () => void;
    onStartDiagnosis: () => void;
    onViewReport: () => void;
    onStartDebtMapping: () => void;
    onStartCostOfLiving: () => void;
    isCostOfLivingDone: boolean;
    onLogout: () => void;
    onEditProfile: () => void;
    currentUser: UserType; // The logged-in user (admin or self)
}

export const Dashboard: React.FC<DashboardProps> = ({
    user,
    anamnesisData,
    hasDiagnosticData,
    onStartAnamnesis,
    onStartDiagnosis,
    onViewReport,
    onStartDebtMapping,
    onStartCostOfLiving,
    isDebtMappingDone,
    isCostOfLivingDone,
    onLogout,
    onEditProfile,
    currentUser
}) => {
    const isAnamnesisDone = !!anamnesisData;
    const [showIntakeModal, setShowIntakeModal] = React.useState(false);
    const [showChecklistModal, setShowChecklistModal] = React.useState(false);

    // Lógica de Controle de Acesso Baseada no Status do Usuário
    const getAccessLevel = (status: string) => {
        switch (status) {
            case 'NEW': return 0; // Pré-Cadastro: Tudo Bloqueado
            case 'ACTIVE': return 1; // Consultoria: Módulos 1-4 Liberados
            case 'CONVERTED': return 2; // Mentoria: Módulos 1-10 Liberados
            case 'CONTACTED': return 3; // Acompanhamento: Tudo Liberado
            default: return 0; // Fallback
        }
    };

    const accessLevel = getAccessLevel(user.status);

    // Helpers de Bloqueio por Nível
    const isConsultoriaUnlocked = accessLevel >= 1;
    const isMentoriaUnlocked = accessLevel >= 2;
    const isAcompanhamentoUnlocked = accessLevel >= 3;

    // Helper para renderizar status e botão de ação dos módulos
    const renderModuleStatus = (
        isDone: boolean,
        isLockedByFlow: boolean, // Bloqueio por fluxo (ex: Diagnóstico precisa de Custo de Vida)
        onStart: () => void,
        onView: () => void,
        labelStart: string,
        labelView: string,
        minAccessLevel: number = 1 // Nível mínimo de acesso requerido
    ) => {
        // Se o nível de acesso do usuário for menor que o necessário, bloqueia hard
        if (accessLevel < minAccessLevel) {
            return (
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg text-slate-500 text-xs font-bold uppercase cursor-not-allowed border border-slate-700/50">
                    <Lock size={14} /> Aguardando Liberação
                </div>
            );
        }

        // Se estiver bloqueado pelo fluxo (ex: anterior não feito), mantém bloqueio normal
        if (isLockedByFlow) {
            return (
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg text-slate-500 text-xs font-bold uppercase cursor-not-allowed">
                    <Lock size={14} /> Bloqueado
                </div>
            );
        }

        if (isDone) {
            return (
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-black uppercase">
                        <CheckCircle2 size={16} /> Concluído
                    </div>
                    <button
                        onClick={onView}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold uppercase transition-colors flex items-center gap-2"
                    >
                        <FileText size={14} /> {labelView}
                    </button>
                </div>
            );
        }

        return (
            <button
                onClick={onStart}
                className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-black uppercase transition-all shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 flex items-center gap-2"
            >
                <PlayCircle size={16} /> {labelStart}
            </button>
        );
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 pb-20">
            <div className={showIntakeModal ? 'print:hidden' : ''}>
                {/* Header */}
                <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 px-6 py-4 sticky top-0 z-50">
                    <div className="max-w-5xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src="/images/logo.png" alt="SOLUM Logo" className="h-12 w-auto object-contain" />
                            <div className="flex flex-col">
                                <h1 className="text-sm font-black text-white uppercase tracking-tight">Painel Principal</h1>
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Bem-vindo, {user?.name?.split(' ')[0] || 'Visitante'}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {(currentUser.role === 'ADMIN' || currentUser.role === 'SECRETARY') && (
                                <button
                                    onClick={() => setShowIntakeModal(true)}
                                    className="p-2.5 bg-sky-500/10 text-sky-400 hover:bg-sky-500 hover:text-white rounded-xl transition-colors flex items-center gap-2 border border-sky-500/20"
                                    title="Ficha Individual"
                                >
                                    <FileText size={18} />
                                    <span className="text-xs font-black uppercase hidden sm:inline">Ficha</span>
                                </button>
                            )}
                            <button
                                onClick={onEditProfile}
                                className="p-2.5 bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-colors flex items-center gap-2"
                                title="Editar Dados"
                            >
                                <User size={18} />
                                <span className="text-xs font-black uppercase hidden sm:inline">Meus Dados</span>
                            </button>
                            <button
                                onClick={onLogout}
                                className="p-2.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-colors flex items-center gap-2"
                                title="Sair"
                            >
                                <LogOut size={18} />
                                <span className="text-xs font-black uppercase hidden sm:inline">Sair</span>
                            </button>
                        </div>
                    </div>
                </header>

                <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">

                    {/* Welcome Section */}
                    <div className="space-y-2">
                        <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
                            Sua Jornada Financeira
                        </h2>
                        <p className="text-slate-400 font-medium max-w-2xl">
                            Complete os módulos abaixo para desbloquear uma visão completa do seu financeiro.
                        </p>
                    </div>

                    {/* Members Area Banner (Vertical Showcase - Small) */}
                    <div className="max-w-[260px] mx-auto">
                        <a
                            href="https://hotmart.com/pt-br/club/thesolum"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block relative group overflow-hidden rounded-2xl border border-slate-800 shadow-xl transition-all hover:border-amber-500/50 hover:shadow-amber-500/10"
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity duration-500"></div>
                            <img
                                src="/images/vitrine.png"
                                alt="Acesse a Área de Membros Exclusiva"
                                className="w-full h-auto object-contain transform group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute bottom-0 inset-x-0 z-20 flex flex-col items-center justify-end p-4 text-center">
                                <div className="px-3 py-1.5 bg-slate-900/90 backdrop-blur-md rounded-lg border border-slate-700/50 group-hover:border-amber-500/50 transition-colors shadow-lg shadow-black/50">
                                    <div className="flex items-center gap-1.5 text-amber-400 font-black uppercase tracking-widest text-[9px] md:text-[10px]">
                                        <span className="group-hover:translate-x-0.5 transition-transform">Acessar Área de Membros</span>
                                        <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform delay-75" />
                                    </div>
                                </div>
                            </div>
                        </a>
                    </div>

                    {/* Modules Grid */}
                    {/* Seção 1: Consultoria */}
                    <section className={`space-y-6 transition-opacity duration-500 ${isConsultoriaUnlocked ? 'opacity-100' : 'opacity-50 grayscale'}`}>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2 border-b border-slate-800 pb-4">
                            <span className="text-sky-500">01.</span> Consultoria
                            {!isConsultoriaUnlocked && <Lock size={16} className="text-slate-500" />}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* 1. Anamnese */}
                            <div className={`group relative overflow-hidden rounded-[2rem] border p-8 transition-all duration-300 ${isAnamnesisDone ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-900 border-sky-500/30 shadow-2xl shadow-sky-500/5'}`}>
                                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Brain size={120} />
                                </div>

                                <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                                    <div className="space-y-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isAnamnesisDone ? 'bg-emerald-500/10 text-emerald-400' : 'bg-sky-500/10 text-sky-400'}`}>
                                            <Brain size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">1. Anamnese</h3>
                                            <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                                Entendimento profundo do seu perfil comportamental, objetivos e relação com o dinheiro.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-800/50">
                                        {renderModuleStatus(
                                            isAnamnesisDone,
                                            false,
                                            onStartAnamnesis,
                                            onStartAnamnesis, // Visualizar é abrir o form preenchido
                                            "Começar Agora",
                                            "Ver Respostas",
                                            1 // Requer Consultoria (Nível 1)
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* 2. Mapeamento de Dívidas */}
                            <div className={`group relative overflow-hidden rounded-[2rem] border p-8 transition-all duration-300 ${isAnamnesisDone ? 'bg-slate-900 border-slate-800 hover:border-sky-500/50' : 'bg-slate-900/50 border-slate-800 opacity-50'}`}>
                                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Activity size={120} />
                                </div>
                                <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                                    <div className="space-y-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isAnamnesisDone ? 'bg-sky-500/10 text-sky-400' : 'bg-slate-800 text-slate-500'}`}>
                                            <Activity size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">2. Mapeamento de Dívidas</h3>
                                            <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                                Cadastre detalhadamente todas as suas dívidas para que seja possível montar uma estratégia de quitação.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-slate-800/50">
                                        {renderModuleStatus(
                                            isDebtMappingDone,
                                            !isAnamnesisDone,
                                            onStartDebtMapping,
                                            onStartDebtMapping,
                                            "Mapear Dívidas",
                                            "Ver Mapeamento",
                                            1 // Requer Consultoria
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* 3. Custo de Vida */}
                            <div className={`group relative overflow-hidden rounded-[2rem] border p-8 transition-all duration-300 ${isDebtMappingDone ? 'bg-slate-900 border-indigo-500/30 shadow-2xl shadow-indigo-500/5 hover:border-indigo-500/50' : 'bg-slate-900/50 border-slate-800 opacity-50'}`}>
                                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <Home size={120} />
                                </div>
                                <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                                    <div className="space-y-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDebtMappingDone ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-800 text-slate-500'}`}>
                                            <Home size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">3. Custo de Vida</h3>
                                            <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                                Definição do padrão de vida sustentável baseado na sua realidade real.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-slate-800/50">
                                        {renderModuleStatus(
                                            isCostOfLivingDone,
                                            !isDebtMappingDone,
                                            onStartCostOfLiving,
                                            onStartCostOfLiving,
                                            "Definir Custo de Vida",
                                            "Ver Custo de Vida",
                                            1 // Requer Consultoria
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* 4. Diagnóstico Financeiro Personalizado */}
                            <div className={`group relative overflow-hidden rounded-[2rem] border p-8 transition-all duration-300 ${isCostOfLivingDone ? 'bg-slate-900 border-emerald-500/30 shadow-2xl shadow-emerald-500/5 hover:border-emerald-500/50' : 'bg-slate-900/50 border-slate-800 opacity-50'}`}>
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <TrendingUp size={120} />
                                </div>

                                <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                                    <div className="space-y-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${hasDiagnosticData ? 'bg-emerald-500/10 text-emerald-400' : (isCostOfLivingDone ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500')}`}>
                                            <TrendingUp size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">4. Diagnóstico Financeiro Personalizado</h3>
                                            <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                                Mapeamento detalhado de rendas, despesas e dívidas para cálculo de indicadores vitais.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-800/50">
                                        {renderModuleStatus(
                                            hasDiagnosticData, // TODO: Consider a stricter check for "Completed" if needed, e.g. (hasDiagnosticData && isWizardFinished)
                                            !isCostOfLivingDone, // Locked if Cost of Living is NOT done
                                            onStartDiagnosis,
                                            onViewReport,
                                            hasDiagnosticData ? "Continuar Mapeamento" : "Iniciar Mapeamento", // If started but not done, show "Continue"
                                            "Ver Relatório Completo",
                                            1 // Requer Consultoria
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Checklist Destruidor de Sanhaço (Condicional) */}
                        {user.checklistAvailable && (
                            <div className="mt-6 group relative overflow-hidden rounded-[2rem] border p-8 transition-all duration-300 bg-slate-900 border-rose-500/30 shadow-2xl shadow-rose-500/5 hover:border-rose-500/50">
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <ListChecks size={120} />
                                </div>

                                <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                                    <div className="space-y-4">
                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-rose-500/10 text-rose-400">
                                            <ListChecks size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Checklist Destruidor de Sanhaço</h3>
                                            <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                                Guia de sobrevivência passo-a-passo para sair do caos financeiro. Siga à risca.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-800/50">
                                        <button
                                            onClick={() => setShowChecklistModal(true)}
                                            className="w-full py-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase tracking-wide text-xs transition-all shadow-lg shadow-rose-900/20 hover:shadow-rose-500/20 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                        >
                                            Acessar Guia de Guerra <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    <ChecklistModal
                        isOpen={showChecklistModal}
                        onClose={() => setShowChecklistModal(false)}
                        initialProgress={user.checklistProgress || []}
                        readOnly={true}
                    />

                    {/* Seção 2: Mentoria */}
                    <section className={`space-y-6 transition-opacity duration-500 ${isMentoriaUnlocked ? 'opacity-100' : 'opacity-50 grayscale'}`}>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2 border-b border-slate-800 pb-4">
                            <span className="text-purple-500">02.</span> Mentoria
                            {!isMentoriaUnlocked && <Lock size={16} className="text-slate-500" />}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* 5. Gastos Não Recorrentes */}
                            <div className="bg-slate-900/20 border border-slate-800 rounded-[2rem] p-6 opacity-60">
                                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 mb-4">
                                    <Calendar size={20} />
                                </div>
                                <h3 className="text-sm font-black text-slate-400 uppercase mb-2">5. Gastos Não Recorrentes</h3>
                                <div className="flex items-center gap-2 mt-4 px-3 py-1.5 bg-slate-800/50 rounded-lg w-fit">
                                    {isMentoriaUnlocked ? (
                                        <>
                                            <Lock size={12} className="text-slate-600" />
                                            <span className="text-[10px] font-bold text-slate-600 uppercase">Em Breve</span>
                                        </>
                                    ) : (
                                        <>
                                            <Lock size={12} className="text-rose-500" />
                                            <span className="text-[10px] font-bold text-rose-500 uppercase">Bloqueado</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* 6. Mapeamento de Dívidas Atualizado */}
                            <div className="bg-slate-900/20 border border-slate-800 rounded-[2rem] p-6 opacity-60">
                                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 mb-4">
                                    <RefreshCw size={20} />
                                </div>
                                <h3 className="text-sm font-black text-slate-400 uppercase mb-2">6. Mapeamento de Dívidas Atualizado</h3>
                                <div className="flex items-center gap-2 mt-4 px-3 py-1.5 bg-slate-800/50 rounded-lg w-fit">
                                    {isMentoriaUnlocked ? (
                                        <>
                                            <Lock size={12} className="text-slate-600" />
                                            <span className="text-[10px] font-bold text-slate-600 uppercase">Em Breve</span>
                                        </>
                                    ) : (
                                        <>
                                            <Lock size={12} className="text-rose-500" />
                                            <span className="text-[10px] font-bold text-rose-500 uppercase">Bloqueado</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* 7. Estratégias para eliminação de dívidas */}
                            <div className="bg-slate-900/20 border border-slate-800 rounded-[2rem] p-6 opacity-60">
                                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 mb-4">
                                    <Target size={20} />
                                </div>
                                <h3 className="text-sm font-black text-slate-400 uppercase mb-2">7. Estratégias para eliminação de dívidas</h3>
                                <div className="flex items-center gap-2 mt-4 px-3 py-1.5 bg-slate-800/50 rounded-lg w-fit">
                                    {isMentoriaUnlocked ? (
                                        <>
                                            <Lock size={12} className="text-slate-600" />
                                            <span className="text-[10px] font-bold text-slate-600 uppercase">Em Breve</span>
                                        </>
                                    ) : (
                                        <>
                                            <Lock size={12} className="text-rose-500" />
                                            <span className="text-[10px] font-bold text-rose-500 uppercase">Bloqueado</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* 8. Planejamento de Sonhos e Metas */}
                            <div className="bg-slate-900/20 border border-slate-800 rounded-[2rem] p-6 opacity-60">
                                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 mb-4">
                                    <Target size={20} />
                                </div>
                                <h3 className="text-sm font-black text-slate-400 uppercase mb-2">8. Planejamento de Sonhos e Metas</h3>
                                <div className="flex items-center gap-2 mt-4 px-3 py-1.5 bg-slate-800/50 rounded-lg w-fit">
                                    {isMentoriaUnlocked ? (
                                        <>
                                            <Lock size={12} className="text-slate-600" />
                                            <span className="text-[10px] font-bold text-slate-600 uppercase">Em Breve</span>
                                        </>
                                    ) : (
                                        <>
                                            <Lock size={12} className="text-rose-500" />
                                            <span className="text-[10px] font-bold text-rose-500 uppercase">Bloqueado</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* 9. Mapeamento de Patrimônio */}
                            <div className="bg-slate-900/20 border border-slate-800 rounded-[2rem] p-6 opacity-60">
                                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 mb-4">
                                    <Shield size={20} />
                                </div>
                                <h3 className="text-sm font-black text-slate-400 uppercase mb-2">9. Mapeamento de Patrimônio</h3>
                                <div className="flex items-center gap-2 mt-4 px-3 py-1.5 bg-slate-800/50 rounded-lg w-fit">
                                    {isMentoriaUnlocked ? (
                                        <>
                                            <Lock size={12} className="text-slate-600" />
                                            <span className="text-[10px] font-bold text-slate-600 uppercase">Em Breve</span>
                                        </>
                                    ) : (
                                        <>
                                            <Lock size={12} className="text-rose-500" />
                                            <span className="text-[10px] font-bold text-rose-500 uppercase">Bloqueado</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* 10. Antes e Depois */}
                            <div className="bg-slate-900/20 border border-slate-800 rounded-[2rem] p-6 opacity-60">
                                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 mb-4">
                                    <BarChart3 size={20} />
                                </div>
                                <h3 className="text-sm font-black text-slate-400 uppercase mb-2">10. Antes e Depois</h3>
                                <div className="flex items-center gap-2 mt-4 px-3 py-1.5 bg-slate-800/50 rounded-lg w-fit">
                                    {isMentoriaUnlocked ? (
                                        <>
                                            <Lock size={12} className="text-slate-600" />
                                            <span className="text-[10px] font-bold text-slate-600 uppercase">Em Breve</span>
                                        </>
                                    ) : (
                                        <>
                                            <Lock size={12} className="text-rose-500" />
                                            <span className="text-[10px] font-bold text-rose-500 uppercase">Bloqueado</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Seção 3: Acompanhamento */}
                    <section className={`space-y-6 transition-opacity duration-500 ${isAcompanhamentoUnlocked ? 'opacity-100' : 'opacity-50 grayscale'}`}>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2 border-b border-slate-800 pb-4">
                            <span className="text-emerald-500">03.</span> Acompanhamento
                            {!isAcompanhamentoUnlocked && <Lock size={16} className="text-slate-500" />}
                        </h3>

                        <div className="bg-slate-900/20 border border-slate-800 rounded-[2rem] p-8 text-center">
                            <p className="text-slate-500 font-medium">Módulos de acompanhamento em desenvolvimento.</p>
                            {!isAcompanhamentoUnlocked && (
                                <div className="flex justify-center mt-4">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg text-slate-500 text-xs font-bold uppercase cursor-not-allowed border border-slate-700/50">
                                        <Lock size={14} /> Aguardando Fase Acompanhamento
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </main >
            </div >

            {/* User Intake Modal (Ficha Individual) moved outside main layout for print isolation */}
            {
                showIntakeModal && (
                    <UserIntakeModal
                        user={user}
                        isOpen={showIntakeModal}
                        onClose={() => setShowIntakeModal(false)}
                    />
                )
            }
        </div >
    );
};

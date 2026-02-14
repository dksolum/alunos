import React, { useEffect, useState } from 'react';
import { FinancialData, FinancialItem, Anamnesis } from '../types';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import {
  TrendingDown, TrendingUp, Clock, Wallet, Sparkles, ArrowLeft, Target, Info, ExternalLink, Calendar, Gauge, Activity, CheckCircle2, Circle, ShoppingCart, Home, CreditCard, Edit, RefreshCw, LogOut, LayoutDashboard, List, Printer, FileText, CalendarDays, Briefcase, Brain, UserCog
} from 'lucide-react';

import { generateLocalAnalysis } from '../geminiService';
import { AnamnesisForm } from './AnamnesisForm';
import { authService } from '../services/authService';

interface ReportProps {
  data: FinancialData;
  user?: {
    name: string;
    email: string;
    whatsapp: string;
  };
  onBack: () => void;
  onEdit: () => void;

  onSaveAnalysis: (analysis: string, hash: string) => void;
  onLogout: () => void;
  anamnesisData?: Anamnesis | null;
  onSaveAnamnesis?: (data: any) => Promise<void>;
}

const COLORS = ['#38bdf8', '#818cf8', '#2dd4bf', '#fb7185', '#fbbf24', '#a78bfa', '#f472b6', '#4ade80'];

export const Report: React.FC<ReportProps> = ({ data, user, onBack, onEdit, onSaveAnalysis, onLogout, anamnesisData: propAnamnesis, onSaveAnamnesis: propOnSaveAnamnesis }) => {
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [dataChanged, setDataChanged] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{ name: string, items: FinancialItem[] } | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'anamnesis'>('overview');
  const [showAnamnesisForm, setShowAnamnesisForm] = useState(false);
  const [anamnesisData, setAnamnesisData] = useState<Anamnesis | null>(propAnamnesis || null);

  useEffect(() => {
    if (propAnamnesis !== undefined) {
      setAnamnesisData(propAnamnesis);
    } else {
      const loadAnamnesis = async () => {
        const user = await authService.getCurrentUser();
        if (user) {
          const anamnesis = await authService.getAnamnesis(user.id);
          if (anamnesis) {
            setAnamnesisData(anamnesis);
          }
        }
      };
      loadAnamnesis();
    }
  }, [propAnamnesis]);

  const handleSaveAnamnesis = async (formData: Omit<Anamnesis, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (propOnSaveAnamnesis) {
        await propOnSaveAnamnesis(formData);
        // The parent is responsible for updating the data, but we can optimistically update local state if needed
        // Ideally parent passes new propAnamnesis which triggers useEffect
      } else {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          await authService.saveAnamnesis(currentUser.id, formData);
          // Reload data
          const updated = await authService.getAnamnesis(currentUser.id);
          setAnamnesisData(updated);
        }
      }
      setShowAnamnesisForm(false);
      setViewMode('anamnesis'); // Go to tab
    } catch (error) {
      console.error("Erro ao salvar anamnese:", error);
      alert("Erro ao salvar. Tente novamente.");
    }
  };

  const sum = (arr: FinancialItem[]) => arr.reduce((a, b) => a + b.value, 0);

  const totalIncome = sum(data.income);
  const totalEstimated = sum(data.estimatedExpenses);
  const totalFixed = sum(data.fixedExpenses);

  const totalDebts = sum(data.debts);

  const totalExpenses = totalEstimated + totalFixed + totalDebts;
  const balance = totalIncome - totalExpenses;
  const commitmentPercent = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

  const monthlyWorkHours = data.work.daysPerWeek * 4.33 * data.work.hoursPerDay;
  const hourlyWage = totalIncome > 0 ? totalIncome / monthlyWorkHours : 0;

  const calculateTime = (cost: number) => {
    if (hourlyWage <= 0) return "0h 0m";
    const totalMinutes = (cost / hourlyWage) * 60;
    const hours = Math.floor(totalMinutes / 60);
    const mins = Math.round(totalMinutes % 60);
    return `${hours}h ${mins}m`;
  };

  const getEndDate = (remaining: number) => {
    if (remaining <= 0) return "Finalizado";
    const date = new Date();
    date.setMonth(date.getMonth() + remaining);
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return `${monthNames[date.getMonth()]}/${date.getFullYear()}`;
  };

  const categories = [
    { name: 'Fixas', value: totalFixed, items: data.fixedExpenses, icon: <Home size={10} /> },
    { name: 'Variáveis', value: totalEstimated, items: data.estimatedExpenses, icon: <ShoppingCart size={10} /> },

    { name: 'Dívidas', value: totalDebts, items: data.debts, icon: <Activity size={10} /> },
  ].filter(d => d.value > 0);

  const gaugeData = [
    { name: 'Comprometido', value: Math.min(commitmentPercent, 100) },
    { name: 'Livre', value: Math.max(0, 100 - commitmentPercent) }
  ];

  // Helper para gerar assinatura dos dados
  const generateDataHash = (d: FinancialData): string => {
    // Stringificamos apenas os campos que afetam a análise financeira
    const relevantData = {
      work: d.work,
      income: d.income.map(i => ({ n: i.name, v: i.value })),
      estimated: d.estimatedExpenses.map(i => ({ n: i.name, v: i.value })),
      fixed: d.fixedExpenses.map(i => ({ n: i.name, v: i.value })),

      debts: d.debts.map(i => ({ n: i.name, v: i.value }))
    };
    return JSON.stringify(relevantData);
  };

  useEffect(() => {
    const processAnalysis = async () => {
      const currentHash = generateDataHash(data);

      // Se já existe análise salva e o hash é idêntico, usa a salva (NÃO GERA NOVA MENSAGEM)
      if (data.aiAnalysis && data.aiAnalysisHash === currentHash) {
        setAiInsight(data.aiAnalysis);
        setLoadingAi(false);
        return;
      }

      // Se não existe ou hash mudou, gera nova com DELAY de 7 segundos
      setLoadingAi(true);
      if (data.aiAnalysis) {
        setDataChanged(true); // Flag para mostrar aviso de alteração
      }

      // Simula tempo de processamento da IA
      setTimeout(() => {
        const res = generateLocalAnalysis(data, {
          totalIncome, totalExpenses, totalDebts, hourlyWage, commitmentPercent, balance
        });

        setAiInsight(res);
        setLoadingAi(false);

        // Salva no componente pai para persistir
        onSaveAnalysis(res, currentHash);
      }, 7000);
    };

    processAnalysis();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {showAnamnesisForm && (
        <AnamnesisForm
          onClose={() => setShowAnamnesisForm(false)}
          onSave={handleSaveAnamnesis}
          initialData={anamnesisData || undefined}
          user={user}
        />
      )}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #report-content, #report-content * {
            visibility: visible;
          }
          #report-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background-color: white !important;
            color: black !important;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
          .print-black-text {
            color: black !important;
          }
          .print-border {
            border-color: #ddd !important;
          }
          /* Remove dark backgrounds for print */
          [class*="bg-"] {
             background-color: transparent !important;
             color: black !important;
          }
          /* Ensure text visibility */
          p, h1, h2, h3, h4, span, div {
             color: black !important;
             text-shadow: none !important;
          }
        }
      `}</style>

      {/* Header e Navegação */}
      <div className="mb-8 flex flex-col gap-6">
        <header className="flex items-center justify-between no-print">
          <button onClick={onBack} className="px-5 py-2 bg-slate-800/50 border border-slate-700 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-slate-700 transition-all text-slate-400 hover:text-white">
            <ArrowLeft size={14} /> Voltar ao Início
          </button>
          <div className="flex items-center gap-2">
            <button onClick={onEdit} className="px-5 py-2 bg-sky-500/10 border border-sky-500/30 text-sky-400 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-sky-500/20 transition-all">
              <Edit size={14} /> Editar Entradas
            </button>

            <button onClick={onLogout} className="px-5 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-rose-500/20 transition-all">
              <LogOut size={14} /> Sair
            </button>
          </div >
        </header >

        {/* Tab Switcher */}
        < div className="flex justify-center no-print" >
          <div className="bg-slate-900 p-1 rounded-2xl border border-slate-800 flex gap-1">
            <button
              onClick={() => setViewMode('overview')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all ${viewMode === 'overview'
                ? 'bg-sky-500 text-slate-900 shadow-lg shadow-sky-500/20'
                : 'text-slate-500 hover:text-slate-300'
                }`}
            >
              <LayoutDashboard size={14} /> Visão Geral
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all ${viewMode === 'detailed'
                ? 'bg-sky-500 text-slate-900 shadow-lg shadow-sky-500/20'
                : 'text-slate-500 hover:text-slate-300'
                }`}
            >
              <List size={14} /> Detalhamento
            </button>
            <button
              onClick={() => setViewMode('anamnesis')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all ${viewMode === 'anamnesis'
                ? 'bg-sky-500 text-slate-900 shadow-lg shadow-sky-500/20'
                : 'text-slate-500 hover:text-slate-300'
                }`}
            >
              <Brain size={14} /> Anamnese
            </button>
          </div>
        </div >
      </div >

      <div id="report-content">
        {/* VIEW: OVERVIEW (Existing Dashboard) */}
        {viewMode === 'overview' && (
          <div className="animate-in fade-in duration-500">
            <div className="relative mb-10 overflow-hidden rounded-[2.5rem] bg-slate-900 border border-sky-500/30 p-10 shadow-2xl shadow-sky-500/10 group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent animate-pulse" />
              <div className="absolute -right-20 -top-20 w-80 h-80 bg-sky-500/5 blur-[120px] rounded-full" />

              <div className="relative z-10 space-y-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-sky-500 blur-md opacity-20 animate-pulse" />
                      <div className="relative p-5 bg-sky-500/10 rounded-3xl border border-sky-500/20 text-sky-400">
                        <Activity size={44} className="animate-pulse" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-white uppercase tracking-tighter neon-text">Diagnóstico Concluído</h2>
                      <div className="flex flex-col">
                        <p className="text-sky-400/70 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Sua jornada financeira traduzida em tempo</p>
                        {data.lastUpdated && (
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2 flex items-center gap-1">
                            <Calendar size={10} /> Realizado em: {new Date(data.lastUpdated).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 no-print">
                    <div className="px-5 py-2.5 bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-2xl flex flex-col items-center">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Status</span>
                      <span className="text-xs font-black text-emerald-400 uppercase flex items-center gap-1"><CheckCircle2 size={12} /> Processado</span>
                    </div>
                    <div className="px-5 py-2.5 bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-2xl flex flex-col items-center">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Esforço</span>
                      <span className="text-xs font-black text-sky-400 uppercase">R$ {hourlyWage.toFixed(2)}/h</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-10 border-t border-slate-800">
                  {categories.map((cat, idx) => (
                    <div key={idx} className="flex flex-col gap-2 p-5 bg-slate-900/50 border border-slate-800 hover:border-sky-500/30 rounded-3xl transition-all group/cat">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover/cat:text-sky-400 transition-colors">{cat.name}</span>
                      <div className="flex flex-col">
                        <span className="text-xl font-black text-white">R$ {cat.value.toLocaleString('pt-BR')}</span>
                        <div className="flex items-center gap-1.5 text-sky-400 font-bold text-xs mt-1">
                          <Clock size={12} />
                          {calculateTime(cat.value)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
              <StatCard icon={<Wallet className="text-sky-400" />} label="Receitas" value={`R$ ${totalIncome.toLocaleString('pt-BR')}`} />
              <StatCard icon={<TrendingDown className="text-rose-400" />} label="Saídas" value={`R$ ${totalExpenses.toLocaleString('pt-BR')}`} />
              <div className={`p-5 rounded-2xl border transition-all ${balance >= 0 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                <div className="flex items-center gap-2 mb-2"><Target size={14} className={balance >= 0 ? 'text-emerald-400' : 'text-rose-400'} /><span className={`text-[9px] font-black uppercase tracking-widest ${balance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{balance >= 0 ? 'Sobra' : 'Déficit'}</span></div>
                <div className={`text-xl font-black ${balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>R$ {Math.abs(balance).toLocaleString('pt-BR')}</div>
              </div>
              <StatCard icon={<Clock className="text-amber-400" />} label="Carga Mensal" value={`${(data.work.daysPerWeek * 4.33 * data.work.hoursPerDay).toFixed(0)}h`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10 no-print">
              <div className="bg-slate-800/20 border border-slate-800 p-8 rounded-3xl backdrop-blur-sm">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><Info size={14} className="text-sky-400" /> Proporção de Gastos</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categories} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" onClick={(d) => setSelectedCategory({ name: d.name, items: d.items })} style={{ cursor: 'pointer' }}>
                        {categories.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                        itemStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                      />
                      <Legend iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[9px] text-center text-slate-600 font-bold uppercase mt-4 italic">Interaja com o gráfico para detalhar abaixo</p>
              </div>

              <div className="bg-slate-800/20 border border-slate-800 p-8 rounded-3xl backdrop-blur-sm">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><Gauge size={14} className="text-sky-400" /> Utilização da Renda Mensal</h3>
                <div className="h-64 flex flex-col items-center justify-center relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={gaugeData}
                        cx="50%"
                        cy="100%"
                        startAngle={180}
                        endAngle={0}
                        innerRadius={110}
                        outerRadius={150}
                        paddingAngle={0}
                        dataKey="value"
                        stroke="none"
                      >
                        <Cell key="cell-used" fill={commitmentPercent > 100 ? '#f43f5e' : (commitmentPercent > 70 ? '#fbbf24' : '#38bdf8')} />
                        <Cell key="cell-free" fill="#1e293b" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute bottom-6 flex flex-col items-center translate-y-2">
                    <span className={`text-4xl font-black ${commitmentPercent > 100 ? 'text-rose-400' : (commitmentPercent > 70 ? 'text-amber-400' : 'text-sky-400')}`}>
                      {commitmentPercent.toFixed(1)}%
                    </span>
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] mt-2">Comprometido</span>
                  </div>
                </div>
                <div className="flex justify-between items-center max-w-sm mx-auto text-[9px] font-black uppercase text-slate-600 mt-2">
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-sky-500" /> Ideal</div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500" /> Atenção</div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500" /> Crítico</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/20 border border-slate-800 p-8 rounded-3xl flex flex-col mb-10 backdrop-blur-sm min-h-[300px] no-print">
              <h3 className="text-xs font-black text-white uppercase tracking-widest mb-6 border-b border-slate-800 pb-4 flex items-center justify-between">
                <span>{selectedCategory ? `Detalhamento: ${selectedCategory.name}` : 'Escolha uma Categoria no gráfico de pizza'}</span>
                {selectedCategory && <span className="text-sky-400 font-black">Total: R$ {selectedCategory.items.reduce((a, b) => a + b.value, 0).toLocaleString('pt-BR')}</span>}
              </h3>

              <div className="flex-1">
                {!selectedCategory ? (
                  <div className="h-full flex flex-col items-center justify-center py-20 opacity-20">
                    <Target size={48} className="animate-bounce" />
                    <p className="text-[10px] font-black mt-4 uppercase tracking-widest">Selecione uma fatia do gráfico acima para ver os itens</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-500">
                    {selectedCategory.items.filter(i => i.value > 0).map((item, idx) => (
                      <div key={idx} className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-[1.5rem] flex flex-col gap-2 hover:border-sky-500/40 transition-all group hover:bg-slate-900">
                        <div className="flex justify-between items-start">
                          <span className="text-[12px] font-black text-slate-100 uppercase tracking-tight group-hover:text-sky-400 transition-colors">{item.name || '(Sem nome)'}</span>
                          <span className="text-lg font-black text-white">R$ {item.value.toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="h-px bg-slate-800/50 w-full my-1"></div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-sky-400/70 font-bold uppercase flex items-center gap-2">
                            <Clock size={12} /> {calculateTime(item.value)} de trabalho
                          </span>
                          <div className="px-2 py-0.5 bg-slate-800 rounded text-[8px] font-black text-slate-500 uppercase tracking-widest">Item {idx + 1}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-[#0f172a] border border-sky-500/20 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group no-print">
              <Sparkles className="absolute top-6 right-6 text-sky-400/5 group-hover:text-sky-400/10 transition-all duration-700" size={100} />
              <h3 className="text-xl font-black mb-8 text-sky-400 flex items-center gap-3 uppercase tracking-tighter neon-text">
                Próximos Passos
              </h3>

              {/* Notificação de Alteração */}
              {dataChanged && !loadingAi && (
                <div className="absolute top-6 right-6 z-20 animate-in slide-in-from-top-4 fade-in duration-700">
                  <div className="px-4 py-2 bg-sky-500/20 border border-sky-500/30 rounded-full flex items-center gap-2 backdrop-blur-md shadow-lg shadow-sky-500/10">
                    <RefreshCw size={12} className="text-sky-400" />
                    <span className="text-[9px] font-black uppercase text-sky-200 tracking-wide">
                      Dados atualizados detectados. Nova análise gerada.
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 relative z-10">
                <div className="lg:col-span-2 space-y-6">
                  {loadingAi ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-6 text-sky-400 animate-in fade-in duration-500">
                      <div className="relative">
                        <div className="absolute inset-0 bg-sky-500 blur-xl opacity-20 animate-pulse"></div>
                        <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin shadow-lg"></div>
                      </div>
                      <div className="flex flex-col items-center gap-2 text-center">
                        <span className="text-lg font-black uppercase tracking-[0.2em] neon-text">
                          {dataChanged ? 'Atualizando Estratégia' : 'Criando seu guia personalizado'}
                        </span>
                        <span className="text-xs text-slate-500 font-bold uppercase max-w-xs leading-tight">Por favor, aguarde enquanto analisamos seus números para gerar a melhor estratégia.</span>
                      </div>
                    </div>
                  ) : (
                    <div className="animate-in slide-in-from-bottom-4 duration-700">
                      <div className="text-slate-300 text-base leading-relaxed whitespace-pre-wrap font-medium">
                        {aiInsight}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-8 pt-8">
                        {/* Button Removed: Preencher Anamnese */}

                      </div>
                    </div>
                  )}
                </div>

                <div className="relative h-full">
                  {loadingAi ? (
                    <div className="h-full min-h-[300px] flex flex-col items-center justify-center bg-slate-950/20 border border-slate-800/30 border-dashed rounded-[2.5rem] opacity-30 animate-pulse">
                      <Target size={40} className="text-slate-700 mb-4" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-700">Sugestões em breve...</span>
                    </div>
                  ) : (
                    <div className="bg-slate-950/40 border border-slate-800 p-8 rounded-[2.5rem] space-y-8 animate-in slide-in-from-right-6 duration-1000">
                      <div className="space-y-6">
                        <h4 className="text-[10px] font-black text-sky-400 uppercase tracking-widest border-b border-slate-800 pb-3">Sugestões Estratégicas</h4>
                        <CheckItem label="Reserva quebra galho" desc="Sanar imprevistos pequenos do dia a dia." />
                        <CheckItem label="Reserva de Emergência" desc="Garantir 6 meses de segurança." />
                        <CheckItem label="Fundo de Gastos Anuais" desc="Provisionar IPVA, IPTU e Festas." />
                        <CheckItem label="Mapeamento de Metas" desc="Definir objetivos para 1, 2 e 5 anos." />
                      </div>
                      <div className="p-4 bg-sky-500/5 border border-sky-500/10 rounded-2xl text-center">
                        <p className="text-[10px] text-slate-500 font-bold uppercase italic leading-tight">
                          O controle diário simples é a base para qualquer evolução real.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: DETAILED (New Feature) */}
        {viewMode === 'detailed' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">

            {/* Print-only User Info */}
            {user && (
              <div className="hidden print:block mb-6 p-6 border-b border-slate-200">
                <h1 className="text-2xl font-black mb-4">Relatório Detalhado</h1>
                <div className="text-sm text-slate-600">
                  <p><span className="font-bold">Cliente:</span> {user.name}</p>
                  <p><span className="font-bold">Email:</span> {user.email}</p>
                  {user.whatsapp && <p><span className="font-bold">WhatsApp:</span> {user.whatsapp}</p>}
                </div>
              </div>
            )}

            {/* Print Button */}
            <div className="flex justify-end no-print">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sky-400 text-xs font-black uppercase hover:bg-sky-500 hover:text-white transition-all"
              >
                <FileText size={16} /> Baixar Relatório PDF
              </button>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 print-border">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-sky-500/10 rounded-xl text-sky-400 no-print"><Briefcase size={20} /></div>
                <h3 className="text-xl font-black text-sky-400 uppercase tracking-tight">Trabalho e Renda</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DetailItem label="Dias/Semana" value={data.work.daysPerWeek.toString()} sub="Dias trabalhados" />
                <DetailItem label="Horas/Dia" value={`${data.work.hoursPerDay}h`} sub="Carga horária diária" />
                <DetailItem label="Tipo de Renda" value={data.work.incomeType} sub="Modelo de recebimento" />
              </div>
            </div>

            <DetailSection
              title="Entradas Mensais"
              icon={<Wallet size={20} />}
              items={data.income}
              total={totalIncome}
              color="emerald"
              hourlyWage={hourlyWage}
            />

            <DetailSection
              title="Despesas Fixas"
              icon={<Home size={20} />}
              items={data.fixedExpenses}
              total={totalFixed}
              color="rose"
              hourlyWage={hourlyWage}
            />

            <DetailSection
              title="Despesas Variáveis"
              icon={<ShoppingCart size={20} />}
              items={data.estimatedExpenses}
              total={totalEstimated}
              color="rose"
              hourlyWage={hourlyWage}
            />



            {/* Dívidas Detalhadas */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 print-border break-inside-avoid">
              <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500 no-print"><Activity size={20} /></div>
                  <h3 className="text-xl font-black text-rose-500 uppercase tracking-tight">Dívidas e Empréstimos</h3>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-lg font-black text-white">Total: R$ {totalDebts.toLocaleString('pt-BR')}</span>
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <Clock size={12} /> {calculateTime(totalDebts)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {data.debts.filter(d => d.value > 0).length > 0 ? (
                  data.debts.filter(d => d.value > 0).map((debt, idx) => (
                    <div key={idx} className="p-4 bg-slate-950/30 rounded-2xl border border-slate-800/50 flex flex-col gap-2 print-border">
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-bold text-slate-200">{debt.name || 'Dívida sem nome'}</span>
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-black text-white">R$ {debt.value.toLocaleString('pt-BR')}/mês</span>
                          <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                            <Clock size={10} /> {calculateTime(debt.value)}
                          </span>
                        </div>
                      </div>
                      <div className="h-px bg-slate-800/50 w-full"></div>
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                        <span>Parcela {debt.totalInstallments - debt.remainingInstallments + 1} de {debt.totalInstallments}</span>
                        <span className="flex items-center gap-1 text-rose-500"><CalendarDays size={10} /> Até {getEndDate(debt.remainingInstallments)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 italic">Nenhuma dívida registrada.</p>
                )}
              </div>
            </div>

            <div className="p-6 text-center opacity-50">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Documento gerado pelo sistema SOLUM</p>
            </div>
          </div>
        )}

        {/* VIEW: ANAMNESIS */}
        {viewMode === 'anamnesis' && (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 space-y-8">
            <div className="flex justify-between items-start mb-6 no-print">
              <div className="flex flex-col">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                  <div className="p-3 bg-sky-500/10 rounded-2xl text-sky-400">
                    <Brain size={24} />
                  </div>
                  Anamnese Financeira
                </h2>
                {anamnesisData && (
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2 ml-14 flex items-center gap-1">
                    <Calendar size={10} /> Preenchido em: {new Date(anamnesisData.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl font-bold text-xs uppercase hover:bg-sky-500 hover:text-white transition-all flex items-center gap-2"
                >
                  <FileText size={14} /> Imprimir / PDF
                </button>
                <button
                  onClick={() => setShowAnamnesisForm(true)}
                  className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl font-bold text-xs uppercase hover:bg-sky-500 hover:text-white transition-all flex items-center gap-2"
                >
                  <Edit size={14} /> Editar Respostas
                </button>
              </div>
            </div>

            {/* Header de Impressão (Igual ao Detalhado) */}
            {user && (
              <div className="hidden print:block mb-6 p-6 border-b border-slate-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-black mb-4">Anamnese Financeira</h1>
                    <div className="text-sm text-slate-600 space-y-1">
                      <p><span className="font-bold">Cliente:</span> {user.name}</p>
                      <p><span className="font-bold">Email:</span> {user.email}</p>
                      {user.whatsapp && <p><span className="font-bold">WhatsApp:</span> {user.whatsapp}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-400 uppercase">SOLUM Diagnóstico</span>
                    <p className="text-[10px] text-slate-400 mt-1">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )}

            {!anamnesisData ? (
              <div className="p-10 border border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center gap-4 text-center">
                <Brain size={48} className="text-slate-700 mb-2" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Nenhuma anamnese preenchida ainda.</p>
                <button
                  onClick={() => setShowAnamnesisForm(true)}
                  className="mt-2 px-6 py-3 bg-sky-500 text-white rounded-xl font-black text-xs uppercase"
                >
                  Preencher Agora
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* BLOCO 1: Reflexão */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
                  <h3 className="text-sky-400 font-black uppercase tracking-widest text-xs mb-6 border-b border-slate-800 pb-4">Reflexão Inicial</h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Motivação</span>
                      <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/30 p-4 rounded-xl border border-slate-800/50">
                        {anamnesisData.reason}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Objetivos</span>
                      <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/30 p-4 rounded-xl border border-slate-800/50">
                        {anamnesisData.objectives}
                      </p>
                    </div>
                  </div>
                </div>

                {/* BLOCO 2: Hábitos e Comportamento */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
                  <h3 className="text-sky-400 font-black uppercase tracking-widest text-xs mb-6 border-b border-slate-800 pb-4">Hábitos e Comportamento</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <BooleanItem label="Gasta tudo que sobra?" value={anamnesisData.spendsAll} />
                    <BooleanItem label="Possui Reserva de Emergência?" value={anamnesisData.emergencyFund} />
                    <BooleanItem label="Possui Investimentos?" value={anamnesisData.investments} />
                    <BooleanItem label="Investe Todos os Meses?" value={anamnesisData.investsMonthly} />
                    <BooleanItem label="Planejamento Aposentadoria?" value={anamnesisData.retirementPlan} />
                    <BooleanItem label="Decisões Independentes?" value={anamnesisData.independentDecisions} />
                  </div>
                </div>

                {/* BLOCO 3: Autoavaliação */}
                <div className="bg-gradient-to-br from-slate-900 to-[#0f172a] border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 blur-[50px] rounded-full"></div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest z-10">Autoavaliação Financeira (0-10)</span>
                  <div className="text-8xl font-black text-sky-400 neon-text z-10">{anamnesisData.financialScore}</div>
                  <div className="w-full max-w-xs h-2 bg-slate-800 rounded-full overflow-hidden mt-2 z-10">
                    <div className="h-full bg-sky-500" style={{ width: `${anamnesisData.financialScore * 10}%` }}></div>
                  </div>
                </div>

                <div className="text-center opacity-40 text-[9px] font-bold uppercase mt-8">
                  Preenchido em: {new Date(anamnesisData.createdAt).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div >
  );
};

// Componentes Auxiliares para o Detalhamento
const DetailItem: React.FC<{ label: string, value: string, sub: string }> = ({ label, value, sub }) => (
  <div className="flex flex-col p-4 bg-slate-950/30 rounded-xl border border-slate-800/50 print-border">
    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</span>
    <span className="text-lg font-black text-white mb-0.5">{value}</span>
    <span className="text-[9px] text-slate-600 font-bold uppercase">{sub}</span>
  </div>
);

const DetailSection: React.FC<{ title: string, icon: React.ReactNode, items: FinancialItem[], total: number, color: 'emerald' | 'rose' | 'sky' | 'amber', hourlyWage: number }> = ({ title, icon, items, total, color, hourlyWage }) => {
  const colorClasses = {
    emerald: 'text-emerald-500 bg-emerald-500/10',
    rose: 'text-rose-500 bg-rose-500/10',
    sky: 'text-sky-500 bg-sky-500/10',
    amber: 'text-amber-500 bg-amber-500/10'
  };

  const calculateTime = (cost: number) => {
    if (hourlyWage <= 0) return "0h 0m";
    const totalMinutes = (cost / hourlyWage) * 60;
    const hours = Math.floor(totalMinutes / 60);
    const mins = Math.round(totalMinutes % 60);
    return `${hours}h ${mins}m`;
  };

  const filteredItems = items.filter(item => item.value > 0);

  if (filteredItems.length === 0) return null;

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 print-border break-inside-avoid">
      <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl no-print ${colorClasses[color]}`}>{icon}</div>
          <h3 className={`text-xl font-black uppercase tracking-tight ${colorClasses[color].split(' ')[0]}`}>{title}</h3>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-lg font-black text-white">R$ {total.toLocaleString('pt-BR')}</span>
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <Clock size={12} /> {calculateTime(total)}
          </span>
        </div>
      </div>
      <div className="space-y-2">
        {filteredItems.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center p-3 bg-slate-950/30 rounded-xl border border-slate-800/50 hover:bg-slate-900 transition-colors print-border">
            <span className="text-sm font-bold text-slate-300">{item.name || 'Item sem descrição'}</span>
            <div className="flex flex-col items-end">
              <span className="text-sm font-black text-white">R$ {item.value.toLocaleString('pt-BR')}</span>
              <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                <Clock size={10} /> {calculateTime(item.value)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CheckItem: React.FC<{ label: string, desc: string }> = ({ label, desc }) => (
  <div className="flex gap-4 group/check">
    <div className="mt-1 text-slate-700 group-hover/check:text-sky-400 transition-colors"><Circle size={18} /></div>
    <div className="flex flex-col">
      <span className="text-[12px] font-black text-slate-200 uppercase">{label}</span>
      <span className="text-[10px] text-slate-500 font-medium leading-tight">{desc}</span>
    </div>
  </div>
);

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string }> = ({ icon, label, value }) => (
  <div className="bg-slate-800/40 border border-slate-800 p-5 rounded-2xl flex flex-col gap-2 hover:border-sky-500/30 transition-all duration-300 backdrop-blur-sm">
    <div className="flex items-center gap-2"><div className="p-1.5 bg-slate-900/50 rounded-lg">{icon}</div><span className="text-slate-500 text-[9px] font-black uppercase tracking-widest">{label}</span></div>
    <div className="text-xl font-black text-slate-100">{value}</div>
  </div>
);

const BooleanItem: React.FC<{ label: string, value: boolean }> = ({ label, value }) => (
  <div className={`p-4 rounded-xl border flex items-center justify-between ${value ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
    <span className="text-xs font-bold text-slate-300 uppercase">{label}</span>
    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${value ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
      {value ? 'SIM' : 'NÃO'}
    </span>
  </div>
);
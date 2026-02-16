
import React, { useState, useMemo, useEffect } from 'react';
import {
  FinancialData,
  INITIAL_DATA,
  IncomeType,
  Installment,
  FinancialItem,
  CreditCard as CreditCardType,
  User,
  DebtItem,
  DebtMapItem,
  CostOfLivingItem
} from './types';
import { Anamnesis } from './types';
import { Report } from './components/Report';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/AdminDashboard';
import { Landing } from './components/Landing';
import { Dashboard } from './components/Dashboard';
import { AnamnesisForm } from './components/AnamnesisForm';
import { DebtMapping } from './components/DebtMapping';
import { CostOfLiving } from './components/CostOfLiving';
import { ProfileConfirmationModal } from './components/ProfileConfirmationModal';
import { DataChangesModal } from './components/DataChangesModal';
import { authService } from './services/authService';
import {
  Briefcase, TrendingUp, CheckCircle2, AlertTriangle, AlertCircle, Banknote, CalendarDays,
  Wallet, ShoppingCart, Activity, CreditCard, CreditCard as CardIcon, Home, Zap, Heart, Pill,
  Car, Gift, Baby, Users, Dog, Globe, Smartphone, Coffee, Settings, LogOut, PlusCircle,
  PiggyBank, ArrowRight, Save, User as UserIcon, ShieldCheck, ZapOff, History,
  Info, Info as InfoIcon, Target, Clock, AlertOctagon, Trash2, Eye
} from 'lucide-react';

const STEP_INFO = {
  work: "Definimos sua rotina de trabalho.\nIsso mostra quanto do seu tempo de vida é trocado por dinheiro.",
  income: "Aqui você informa todo o dinheiro que entra no mês.\nEsse valor define o limite real do seu orçamento.\nInserir o valor previsto para receber no próximo mês.",
  credit: "Aqui você informa tudo que será pago no cartão no próximo mês — compras à vista recentes e parcelas em curso.",
  fixed: "Despesas fixas são gastos que se repetem todos os meses, normalmente com o mesmo valor, e que precisam ser pagos independentemente do consumo.\nAqui deve ser inserido despesas que não informadas nos cartões (boletos, crediários, etc).",
  debts: "Dívidas e Empréstimos: São compromissos de longo prazo como financiamentos de carro, casa ou empréstimos pessoais.",
  estimated: "Despesas Variáveis são gastos que mudam de valor todo mês. Exemplos: mercado, lazer, combustível e farmácia."
};

const STEPS = [
  { id: 'debts', title: 'Dívidas', icon: <Activity size={16} /> },
  { id: 'estimated', title: 'Variáveis', icon: <ShoppingCart size={16} /> },
  { id: 'income', title: 'Receitas', icon: <Banknote size={16} /> },
  { id: 'work', title: 'Trabalho', icon: <Briefcase size={16} /> }
];

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<FinancialData>(INITIAL_DATA);
  const [originalData, setOriginalData] = useState<FinancialData>(INITIAL_DATA); // Para comparar mudanças
  const [showReport, setShowReport] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [forceRegisterMode, setForceRegisterMode] = useState(false);
  const [forceLoginMode, setForceLoginMode] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null); // State to store the user being viewed by Admin
  const [anamnesisData, setAnamnesisData] = useState<Anamnesis | null>(null);
  const [debtMappingData, setDebtMappingData] = useState<DebtMapItem[]>([]);
  const [costOfLivingData, setCostOfLivingData] = useState<CostOfLivingItem[]>([]);

  // Novo estado para controlar a exibição da Landing Page
  // 'landing' | 'auth' | 'anamnesis' | 'dashboard' | 'wizard' | 'report' | 'admin' | 'debtMapping' | 'costOfLiving'
  const [viewMode, setViewMode] = useState<'landing' | 'auth' | 'anamnesis' | 'dashboard' | 'wizard' | 'report' | 'admin' | 'debtMapping' | 'costOfLiving'>('landing');

  // Controle de fluxo: se true, usuário clicou em "Começar" na landing e deve ir para o flow de diagnóstico
  const [startFromLanding, setStartFromLanding] = useState(false);
  const [showProfileConfirmation, setShowProfileConfirmation] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showDataChanges, setShowDataChanges] = useState(false);
  const [diffs, setDiffs] = useState<string[]>([]);

  // Inicialização
  useEffect(() => {
    const init = async () => {
      const user = await authService.initialize();

      if (user) {
        setCurrentUser(user);

        // Se for Admin ou Secretário, vai direto para o Dashboard Admin
        if (user.role === 'ADMIN' || user.role === 'SECRETARY') {
          setShowAdminDashboard(true);
          setViewMode('admin');
        } else {
          // Se for usuário comum, carrega dados e MANTÉM na Landing (para ele clicar em Começar)
          await loadUserDiagnostic(user.id);
          const anamnesis = await authService.getAnamnesis(user.id);
          setAnamnesisData(anamnesis);
          // REMOVIDO: Redirecionamento automático. O usuário deve ver a Landing e clicar para entrar.
        }
      } else {
        setViewMode('landing');
      }
    };
    init();
  }, []);

  const loadUserDiagnostic = async (userId: string) => {
    const savedData = await authService.getDiagnosticByUser(userId);
    const debtMap = await authService.getDebtMapping(userId);
    const costLiving = await authService.getCostOfLiving(userId);
    setDebtMappingData(debtMap);
    setCostOfLivingData(costLiving);

    if (savedData) {
      // Merge com INITIAL_DATA para garantir que campos novos (como debts) existam em registros antigos
      const mergedData = {
        ...INITIAL_DATA, ...savedData,
        // Garantir que objetos aninhados também sejam preservados/mesclados corretamente se necessário
        // Mas creditCard e work são objetos, arrays são substituídos.
        // Se debts não existir em savedData, ele pegará do INITIAL_DATA?
        // Spread raso: { ...init, ...saved }
        // Se saved não tem key 'debts', sobra o do init.
        // Se saved tem key 'debts', sobrescreve.
        // Isso funciona para adicionar chaves faltantes na raiz.
        // Para creditCard (objeto), se saved tiver creditCard, ele substitui todo o objeto creditCard do init.
        // Então precisamos garantir que creditCard também tenha seus campos.
        creditCard: { ...INITIAL_DATA.creditCard, ...(savedData.creditCard || {}) },
        work: { ...INITIAL_DATA.work, ...(savedData.work || {}) }
      };

      // Especificamente para arrays, se tiver undefined no saved, usa o do initial
      if (!savedData.debts) mergedData.debts = INITIAL_DATA.debts;
      if (!savedData.income) mergedData.income = INITIAL_DATA.income;
      if (!savedData.fixedExpenses) mergedData.fixedExpenses = INITIAL_DATA.fixedExpenses;
      if (!savedData.estimatedExpenses) mergedData.estimatedExpenses = INITIAL_DATA.estimatedExpenses;

      setData(mergedData);
      setOriginalData(mergedData);
    } else {
      setData(INITIAL_DATA);
      setOriginalData(INITIAL_DATA);
    }
    setEditingUserId(userId);
  };

  // TODO: Add loadDebtMappingData when we have the service method
  // For now we will use local state or simulate persistence if needed
  // In a real scenario, we would add loadDebtMapping here.

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
    setEditingUserId(null);
    setViewingUser(null); // Clear viewing user
    setData(INITIAL_DATA);
    setCurrentStep(0);
    setShowReport(false);
    setShowAdminDashboard(false);
    setViewMode('landing');
  };

  const handleSaveProfile = async (updates: any) => {
    const targetUser = viewingUser || currentUser;
    if (!targetUser) return;

    if (viewingUser) {
      // Admin mode: use updateUserData (RPC)
      const result = await authService.updateUserData(targetUser.id, updates);
      if (!result.success) throw new Error(result.message);

      // Update local state for viewingUser
      setViewingUser(prev => prev ? ({ ...prev, ...updates }) : null);
    } else {
      // Self mode: use updateCurrentProfile
      await authService.updateCurrentProfile(updates);
      // Update local state for currentUser
      const updated = await authService.getCurrentUser();
      if (updated) setCurrentUser(updated);
    }
    setShowEditProfile(false);
  };

  const handleAuthSuccess = async (user: User) => {
    setCurrentUser(user);
    setShowAuthModal(false);

    if (user.role === 'ADMIN' || user.role === 'SECRETARY') {
      setShowAdminDashboard(true);
      setViewMode('admin');
      return;
    }

    // Lógica para USER comum
    const savedData = await authService.getDiagnosticByUser(user.id);
    const anamnesis = await authService.getAnamnesis(user.id);
    const debtMap = await authService.getDebtMapping(user.id);
    const costLiving = await authService.getCostOfLiving(user.id);
    setAnamnesisData(anamnesis);
    setDebtMappingData(debtMap);
    setCostOfLivingData(costLiving);

    // Carrega dados se existirem
    if (savedData) {
      setData(savedData);
      setOriginalData(savedData);
    } else {
      setData(INITIAL_DATA);
      setOriginalData(INITIAL_DATA);
    }
    setEditingUserId(user.id);

    // Fluxo Principal:
    // 1. Se não tem Anamnese -> Vai para Anamnese
    // 2. Se tem Anamnese -> Vai para Dashboard (ou Wizard se veio da Landing explicitamente?)

    if (!anamnesis) {
      setViewMode('anamnesis');
      return;
    }

    // Se usuário clicou em "Começar Diagnóstico" na landing, podemos ir direto para o Wizard
    // Mas a nova regra diz: Login -> Dashboard. Então vamos respeitar o Dashboard.
    // Dashboard terá o botão "Iniciar Diagnóstico" que leva ao Wizard.

    setViewMode('dashboard');
  };

  const handleAdminSelectUser = async (userId: string) => {
    // 1. Fetch user details to impersonate/view
    const targetUser = await authService.getUserById(userId);
    if (targetUser) {
      setViewingUser(targetUser);
      setEditingUserId(targetUser.id);
    }

    // 2. Load diagnostic data (ADMIN BYPASS)
    const savedData = await authService.getDiagnosticByAdmin(userId);
    if (savedData) {
      setData(savedData);
      setOriginalData(savedData);
    } else {
      setData(INITIAL_DATA);
      setOriginalData(INITIAL_DATA);
    }

    // 3. Load other modules data (ADMIN BYPASS)
    const anamnesis = await authService.getAnamnesisByAdmin(userId);
    const debtMap = await authService.getDebtMappingByAdmin(userId);
    const costLiving = await authService.getCostOfLivingByAdmin(userId);
    setAnamnesisData(anamnesis);
    setDebtMappingData(debtMap);
    setCostOfLivingData(costLiving);

    // 4. Redirect to Dashboard
    setShowAdminDashboard(false);
    setShowReport(false);
    setViewMode('dashboard');
  };

  const handleReportBack = () => {
    setShowReport(false);
    // Se estiver visualizando um usuário como admin, volta para o dashboard desse usuário
    if (viewingUser) {
      setViewMode('dashboard');
      return;
    }

    if (currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'SECRETARY')) {
      setShowAdminDashboard(true);
      setViewMode('admin');
      setEditingUserId(null);
      setData(INITIAL_DATA);
    } else {
      setViewMode('dashboard');
    }
  };

  const handleEditDiagnostic = () => {
    // RECALCULAR DADOS: Garante que edições no Mapeamento/Custo de Vida reflitam aqui
    setData(prevData => {
      // 1. Mapeamento de Dívidas -> Dívidas
      const mappedDebts: DebtItem[] = debtMappingData.length > 0
        ? debtMappingData.map(d => ({
          id: d.id,
          name: `${d.name} (${d.creditor})`,
          value: d.installmentValue,
          totalInstallments: d.remainingInstallments,
          remainingInstallments: d.remainingInstallments
        }))
        : prevData.debts;

      // 2. Custo de Vida -> Gastos Variáveis
      const allCategories = [
        'Moradia', 'Educação', 'Assinaturas', 'Taxas', 'Saúde',
        'Alimentação', 'Transporte', 'Cuidados Pessoais', 'Roupas',
        'Lazer e Hobbies', 'Presentes e datas comemorativas',
        'Ajuda ao próximo', 'Trabalho', 'Animal de Estimação', 'Outros'
      ];

      const mapCategoriesToFinancialItems = (targetCategories: string[], costItems: CostOfLivingItem[]): FinancialItem[] => {
        const filtered = costItems.filter(item => targetCategories.includes(item.category));
        const totals: Record<string, number> = {};

        filtered.forEach(item => {
          if (!totals[item.category]) totals[item.category] = 0;
          totals[item.category] += Number(item.value) || 0;
        });

        return Object.entries(totals).map(([cat, val]) => ({
          id: `prefill-${cat}`,
          name: cat,
          value: val
        }));
      };

      const mappedVariable = mapCategoriesToFinancialItems(allCategories, costOfLivingData);
      const hasNewVariable = mappedVariable.length > 0;

      return {
        ...prevData,
        debts: debtMappingData.length > 0 ? mappedDebts : prevData.debts,
        // Mantemos despesas fixas zeradas conforme regra de negócio
        fixedExpenses: [],
        estimatedExpenses: hasNewVariable ? mappedVariable : prevData.estimatedExpenses
      };
    });

    setShowReport(false);
    setViewMode('wizard');
  };

  const handleSaveAnalysis = (analysis: string, hash: string) => {
    const newData = { ...data, aiAnalysis: analysis, aiAnalysisHash: hash };
    setData(newData);
    if (editingUserId) {
      // Async call, but we don't need to await in this handler
      authService.saveDiagnostic(editingUserId, newData);
    }
  };

  const totals = useMemo(() => {
    const sum = (arr: FinancialItem[]) => arr.reduce((a, b) => a + b.value, 0);
    const income = sum(data.income);
    const estimated = sum(data.estimatedExpenses);
    const fixed = sum(data.fixedExpenses);
    const ccOneTime = data.creditCard.cards.reduce((a, b) => a + b.oneTime, 0);
    const ccInst = data.creditCard.installments.reduce((a, b) => a + b.value, 0);
    const debts = sum(data.debts);

    return {
      income,
      estimated,
      fixed,
      cc: ccOneTime + ccInst,
      debts,
      totalExpenses: estimated + fixed + (ccOneTime + ccInst) + debts,
      balance: income - (estimated + fixed + (ccOneTime + ccInst) + debts)
    };
  }, [data]);

  const isPositiveOrNeutral = totals.balance >= 0;

  const infoCardStyles = isPositiveOrNeutral
    ? 'bg-sky-500/5 border-sky-500/20'
    : 'bg-rose-500/5 border-rose-500/20';

  const stepStatus = useMemo(() => {
    const isFilled = (items: FinancialItem[]) => items.some(i => i.name.trim() !== '' && i.value > 0);

    const stepStatus = {
      debts: isFilled(data.debts) ? 'completed' : 'pending',
      estimated: isFilled(data.estimatedExpenses) ? 'completed' : 'pending',
      income: isFilled(data.income) ? 'completed' : 'pending',
      work: 'completed', // Work is always considered filled or manually finalized
      fixed: 'completed' // Legacy/Ignored
    };
    return stepStatus;
  }, [data]);

  const addItem = (category: 'income' | 'estimatedExpenses' | 'fixedExpenses') => {
    const newItem: FinancialItem = { id: Math.random().toString(36).substr(2, 9), name: '', value: 0 };
    setData(prev => ({ ...prev, [category]: [...prev[category], newItem] }));
  };

  const removeItem = (category: 'income' | 'estimatedExpenses' | 'fixedExpenses' | 'debts', id: string) => {
    setData(prev => ({ ...prev, [category]: prev[category].filter(i => i.id !== id) }));
  };

  const updateItem = (category: 'income' | 'estimatedExpenses' | 'fixedExpenses' | 'debts', id: string, key: keyof FinancialItem, val: any) => {
    setData(prev => ({
      ...prev,
      [category]: prev[category].map(i => i.id === id ? { ...i, [key]: val } : i)
    }));
  };

  // Correção CRÍTICA: Impedir salvamento se os dados forem resetados para INITIAL_DATA
  useEffect(() => {
    const save = async () => {
      // Se data for exatamente a referência de INITIAL_DATA, significa que estamos 
      // resetando o formulário (logout ou voltar), então NÃO devemos salvar isso no banco.
      if (data === INITIAL_DATA) return;

      if (currentUser && editingUserId) {
        // Usar debounce aqui seria ideal, mas por enquanto vamos deixar direto
        await authService.saveDiagnostic(editingUserId, data);
      }
    };
    save();
  }, [data, currentUser, editingUserId]);

  const getChanges = (oldData: FinancialData, newData: FinancialData): string[] => {
    const changes: string[] = [];

    // Work
    if (oldData.work.daysPerWeek !== newData.work.daysPerWeek) changes.push(`Dias de trabalho: de ${oldData.work.daysPerWeek} para ${newData.work.daysPerWeek}`);
    if (oldData.work.hoursPerDay !== newData.work.hoursPerDay) changes.push(`Horas por dia: de ${oldData.work.hoursPerDay} para ${newData.work.hoursPerDay}`);
    if (oldData.work.incomeType !== newData.work.incomeType) changes.push(`Tipo de renda alterada`);

    // Arrays Compare
    // Arrays Compare
    const checkArray = (catName: string, arrOld: FinancialItem[], arrNew: FinancialItem[]) => {
      // Filter out zero-value items for comparison
      const filterZero = (arr: FinancialItem[]) => arr.filter(i => Math.abs(i.value) > 0.01);

      const cleanOld = filterZero(arrOld);
      const cleanNew = filterZero(arrNew);

      // Special case for Fixed Expenses migration: If new is empty, ignore changes in Old
      // unless Old had significant data. But better just trust the Sum comparison.

      const sumOld = cleanOld.reduce((a, b) => a + b.value, 0);
      const sumNew = cleanNew.reduce((a, b) => a + b.value, 0);

      // Use Epsilon for float comparison
      if (Math.abs(sumOld - sumNew) > 0.01) {
        changes.push(`${catName}: valor total alterado (R$ ${sumNew.toFixed(2)})`);
        return; // If sum changed, no need to check length details
      }

      if (cleanOld.length !== cleanNew.length) {
        changes.push(`${catName}: quantidade de itens alterada`);
      }
    }

    checkArray('Receitas', oldData.income, newData.income);
    // Fixed Expenses: Only check if we are NOT clearing them (i.e. if newData has items) 
    // OR if we want to ignore the migration. 
    // If newData.fixedExpenses is empty, and oldData had items, that is a change.
    // But the user says "no change". This implies they consider the "clearing" as "no change"
    // or they didn't have fixed expenses. 
    // Let's rely on value comparison. If I had 0 fixed expenses, sum is 0. New sum is 0. No change.

    checkArray('Despesas Fixas', oldData.fixedExpenses, newData.fixedExpenses);
    checkArray('Variáveis', oldData.estimatedExpenses, newData.estimatedExpenses);
    checkArray('Dívidas', oldData.debts, newData.debts);

    // Cards
    if (oldData.creditCard.cards.length !== newData.creditCard.cards.length) changes.push(`Cartões: quantidade alterada`);

    const sumInstOld = oldData.creditCard.installments.reduce((a, b) => a + b.value, 0);
    const sumInstNew = newData.creditCard.installments.reduce((a, b) => a + b.value, 0);

    if (Math.abs(sumInstOld - sumInstNew) > 0.01) {
      changes.push(`Parcelamentos: valor total das parcelas alterado`);
    }

    return changes;
  };

  const handleFinalSubmit = () => {
    if (currentUser) {
      if (currentUser.status === 'NEW') {
        // Primeiro acesso / Pré-cadastro: Exige confirmação completa de perfil
        setShowProfileConfirmation(true);
      } else {
        // Usuário já ativo: Mostra apenas mudanças
        const changes = getChanges(originalData, data);
        setDiffs(changes);
        setShowDataChanges(true); // Sempre mostra para confirmação final, mesmo se vazio (confirma que está tudo ok)
      }
    } else {
      // Se por acaso chegar aqui sem login (sessão expirou?), pedimos login novamente
      // Como é exclusivo para clientes pré-cadastrados, não fazemos mais cadastro aberto
      setForceRegisterMode(false);
      setForceLoginMode(true);
      setShowAuthModal(true);
    }
  };

  const stepId = STEPS[currentStep].id;
  const isIncomeStep = stepId === 'income';
  const isWorkStep = stepId === 'work';
  const isFixedStep = stepId === 'fixed';
  const isDebtsStep = stepId === 'debts';
  const isEstimatedStep = stepId === 'estimated';
  const isSummaryStep = isIncomeStep || isDebtsStep || isEstimatedStep; // Removed isFixedStep
  const isExpenseStep = isDebtsStep || isEstimatedStep; // Removed isFixedStep

  const getEndDate = (remaining: number) => {
    if (remaining <= 0) return "";
    const date = new Date();
    date.setMonth(date.getMonth() + remaining);
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    return `${monthNames[date.getMonth()]}/${date.getFullYear()}`;
  };

  const renderTimeline = (remaining: number) => {
    const date = new Date();
    const monthNamesShort = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    return (
      <div className="flex gap-1 overflow-x-auto no-scrollbar py-2">
        {Array.from({ length: remaining }).map((_, i) => {
          const mDate = new Date();
          mDate.setMonth(date.getMonth() + i + 1);
          const colorClass = remaining <= 3 ? 'bg-sky-500/40' : (remaining <= 6 ? 'bg-amber-500/40' : 'bg-rose-500/40');
          return (
            <div key={i} className="flex flex-col items-center gap-1 shrink-0">
              <div className={`w-4 h-4 rounded-sm ${colorClass} animate-in fade-in zoom-in`} />
              <span className="text-[7px] font-black text-slate-600 uppercase">{monthNamesShort[mDate.getMonth()]}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderCategorySummary = () => {
    let currentTotal = 0;

    if (stepId === 'income') currentTotal = totals.income;
    else if (stepId === 'estimated') currentTotal = totals.estimated;
    else if (stepId === 'debts') currentTotal = totals.debts;

    if (stepId === 'work') return null;

    const balanceColor = totals.balance >= 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400';

    return (
      <div className="mb-8 flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4">
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${isIncomeStep ? 'bg-sky-500/10 border-sky-500/20' : 'bg-rose-500/10 border-rose-500/20'} md:col-span-2`}>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Total desta Categoria
              </span>
              {isIncomeStep && <span className="text-[8px] font-bold text-sky-400/60 uppercase -mt-0.5 mb-1">Total de entradas informadas.</span>}
              {isDebtsStep && <span className="text-[8px] font-bold text-rose-400/60 uppercase -mt-0.5 mb-1">Total de dívidas informadas.</span>}
              {isEstimatedStep && <span className="text-[8px] font-bold text-rose-400/60 uppercase -mt-0.5 mb-1">Total de gastos variáveis informados.</span>}
              <span className={`text-2xl font-black ${isIncomeStep ? 'text-sky-400' : 'text-rose-400'}`}>R$ {currentTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className={`p-2 rounded-xl ${isIncomeStep ? 'bg-sky-500 text-white' : 'bg-rose-500 text-white'}`}>
              {isIncomeStep ? <Banknote size={24} /> : (isDebtsStep ? <Activity size={24} /> : <ShoppingCart size={24} />)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGenericListStable = (category: 'income' | 'estimatedExpenses' | 'fixedExpenses') => {
    const isIncome = category === 'income';
    const isFixed = category === 'fixedExpenses';

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data[category].map((item) => (
          <div key={item.id} className={`p-4 bg-slate-900/40 border rounded-2xl flex flex-col gap-3 transition-all ${item.name === '' || item.value === 0 ? 'border-amber-500/20' : 'border-slate-800'}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 space-y-1">
                <label className="text-[9px] uppercase font-black text-slate-500 tracking-widest flex items-center gap-1">
                  Nome {item.name === '' && <AlertTriangle size={10} className="text-amber-500" />}
                </label>
                <input
                  value={item.name}
                  onChange={(e) => updateItem(category, item.id, 'name', e.target.value)}
                  placeholder={isIncome ? "Ex: Salário CLT, Comissão, Freela" : isFixed ? "Ex: Aluguel, Internet..." : "O que é?"}
                  className="w-full bg-slate-800/40 border border-slate-700/50 rounded-lg py-2 px-3 text-sm text-slate-200 focus:border-sky-500 outline-none"
                />
              </div>
              <div className="w-24 space-y-1">
                <label className="text-[9px] uppercase font-black text-slate-500 tracking-widest">Valor</label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-600">R$</span>
                  <input
                    type="number"
                    value={item.value || ''}
                    onChange={(e) => updateItem(category, item.id, 'value', parseFloat(e.target.value) || 0)}
                    placeholder={isIncome ? "2500" : "0"}
                    className="w-full bg-slate-800/40 border border-slate-700/50 rounded-lg py-2 px-3 pl-6 text-sm text-slate-200 outline-none"
                  />
                </div>
              </div>
              <button onClick={() => removeItem(category, item.id)} className="mt-5 p-2 text-rose-500/50 hover:text-rose-500"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
        <div className="flex flex-col gap-2">
          <button onClick={() => addItem(category)} className="p-4 border border-dashed border-slate-700 rounded-2xl flex items-center justify-center gap-2 text-slate-500 hover:text-sky-400 hover:border-sky-500/50 transition-all text-sm font-bold group">
            <PlusCircle size={18} className="group-hover:scale-110 transition-transform" /> {isFixed ? 'Adicionar outra despesa fixa mensal' : 'Adicionar mais itens'}
          </button>
          {isIncome && <span className="text-[8px] text-center font-black text-slate-600 uppercase tracking-widest">Exemplo: comissão, renda extra, bicos, aluguel</span>}
          {isFixed && (
            <div className="p-3 bg-slate-900/20 border border-slate-800/40 rounded-xl">
              <span className="text-[8px] block font-black text-slate-500 uppercase tracking-widest mb-2">Exemplos comuns:</span>
              <div className="flex flex-wrap gap-2">
                {['Aluguel', 'Condomínio', 'Internet', 'Escola', 'Plano de Saúde'].map(ex => (
                  <span key={ex} className="px-2 py-0.5 bg-slate-800/50 rounded-md text-[7px] font-bold text-slate-400 uppercase">{ex}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Helper para verificar se o diagnóstico foi realmente iniciado/preenchido de forma significativa
  // Helper para verificar se o diagnóstico foi realmente iniciado/preenchido de forma significativa
  const isDiagnosticComplete = useMemo(() => {
    // Critério: Ter preenchido Renda, Despesas Variáveis e Trabalho (que são essenciais)
    const hasIncome = data.income.length > 0 && data.income.some(i => i.value > 0);
    // Substituído fixedExpenses (que foi removido do fluxo) por estimatedExpenses (Variáveis)
    const hasVariable = data.estimatedExpenses.length > 0 && data.estimatedExpenses.some(i => i.value > 0);
    // Adicionado verificação de trabalho para garantir que chegou ao final
    const hasWork = data.work && data.work.daysPerWeek > 0;

    return hasIncome && hasVariable && hasWork;
  }, [data]);

  // Renderização baseada em viewMode
  if (viewMode === 'anamnesis' && currentUser) {
    return (
      <>
        {viewingUser && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 p-2 text-center">
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
              Modo de Visualização: {viewingUser.name}
            </span>
          </div>
        )}
        <AnamnesisForm
          isStandalone={true}
          initialData={anamnesisData || undefined}
          initialMode={anamnesisData ? 'view' : 'create'}
          user={viewingUser || currentUser}
          onClose={anamnesisData ? () => setViewMode('dashboard') : undefined}
          onSave={async (data) => {
            const targetUser = viewingUser || currentUser;
            if (targetUser) {
              if (viewingUser) {
                await authService.saveAnamnesisByAdmin(targetUser.id, data);
              } else {
                await authService.saveAnamnesis(targetUser.id, data);
              }

              const updatedAnamnesis = viewingUser
                ? await authService.getAnamnesisByAdmin(targetUser.id)
                : await authService.getAnamnesis(targetUser.id);
              setAnamnesisData(updatedAnamnesis);

              // Se já existia (edição), não redireciona (ou mantém no view mode), 
              // mas se era create (!anamnesisData), vai para dashboard
              if (!anamnesisData) {
                setViewMode('dashboard');
              }
            }
          }}
          onLogout={handleLogout}
        />
      </>
    );
  }

  if (viewMode === 'dashboard' && currentUser) {
    return (
      <>
        {viewingUser && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 p-2 text-center animate-in slide-in-from-top">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center justify-center gap-2">
              <Eye size={14} /> Modo de Visualização: {viewingUser.name} ({viewingUser.role})
              <button
                onClick={() => {
                  setViewingUser(null);
                  if (currentUser) setEditingUserId(currentUser.id);
                  setShowAdminDashboard(true);
                  setViewMode('admin');
                }}
                className="ml-4 text-[10px] underline hover:text-white flex items-center gap-1"
              >
                <LogOut size={10} /> Sair
              </button>
            </span>
          </div>
        )}
        <Dashboard
          currentUser={currentUser}
          user={viewingUser || currentUser}
          anamnesisData={anamnesisData}
          hasDiagnosticData={isDiagnosticComplete}
          onEditProfile={() => setShowEditProfile(true)}
          onChecklistUpdate={(newProgress, newData) => {
            if (viewingUser) {
              setViewingUser({ ...viewingUser, checklistProgress: newProgress, checklistData: newData });
            } else if (currentUser) {
              setCurrentUser({ ...currentUser, checklistProgress: newProgress, checklistData: newData });
            }
          }}

          onStartAnamnesis={() => setViewMode('anamnesis')}
          onStartDiagnosis={() => {
            // Lógica de Pré-preenchimento (Pre-fill)

            setData(prevData => {
              // 1. Mapeamento de Dívidas -> Dívidas
              const mappedDebts: DebtItem[] = debtMappingData.length > 0
                ? debtMappingData.map(d => ({
                  id: d.id,
                  name: `${d.name} (${d.creditor})`,
                  value: d.installmentValue,
                  // AJUSTE SOLICITADO: A quantidade total deve ser pré-preenchida com a mesma quantidade do que estiver em "restam"
                  // Isso cria um snapshot de "Dívida Atual" para o diagnóstico
                  totalInstallments: d.remainingInstallments,
                  remainingInstallments: d.remainingInstallments
                }))
                : prevData.debts;

              // 2. Custo de Vida -> Gastos Variáveis (TODAS as categorias)
              // O usuário solicitou que TODAS as 15 categorias sejam mapeadas para a aba VARIÁVEIS.
              // A aba FIXAS foi removida do fluxo.

              const allCategories = [
                'Moradia', 'Educação', 'Assinaturas', 'Taxas', 'Saúde',
                'Alimentação', 'Transporte', 'Cuidados Pessoais', 'Roupas',
                'Lazer e Hobbies', 'Presentes e datas comemorativas',
                'Ajuda ao próximo', 'Trabalho', 'Animal de Estimação', 'Outros'
              ];

              // Função helper para agrupar e somar
              const mapCategoriesToFinancialItems = (targetCategories: string[], costItems: CostOfLivingItem[]): FinancialItem[] => {
                const filtered = costItems.filter(item => targetCategories.includes(item.category));
                const totals: Record<string, number> = {};

                filtered.forEach(item => {
                  if (!totals[item.category]) totals[item.category] = 0;
                  // FIX: Garantir que o valor seja tratado como número
                  totals[item.category] += Number(item.value) || 0;
                });

                return Object.entries(totals).map(([cat, val]) => ({
                  id: `prefill-${cat}`,
                  name: cat,
                  value: val
                }));
              };

              const mappedVariable = mapCategoriesToFinancialItems(allCategories, costOfLivingData);
              const hasNewVariable = mappedVariable.length > 0;

              return {
                ...prevData,
                debts: debtMappingData.length > 0 ? mappedDebts : prevData.debts,
                fixedExpenses: [], // Zeramos as fixas pois agora tudo é variável
                estimatedExpenses: hasNewVariable ? mappedVariable : prevData.estimatedExpenses
              };
            });

            setCurrentStep(0);
            setViewMode('wizard');
          }}
          onViewReport={() => {
            setShowReport(true);
            setViewMode('report');
          }}
          onStartDebtMapping={() => setViewMode('debtMapping')}
          isDebtMappingDone={debtMappingData.length > 0}
          onStartCostOfLiving={() => setViewMode('costOfLiving')}
          isCostOfLivingDone={costOfLivingData.length > 0}
          onLogout={handleLogout}
          financialData={data}
          onUpdateFinancialData={setData}
        />
        {showEditProfile && (viewingUser || currentUser) && (
          <ProfileConfirmationModal
            user={viewingUser || currentUser!}
            onSave={handleSaveProfile}
            onConfirm={() => setShowEditProfile(false)}
            onCancel={() => setShowEditProfile(false)}
          />
        )}
      </>
    );
  }

  if (viewMode === 'debtMapping' && currentUser) {
    return (
      <DebtMapping
        initialData={debtMappingData}
        isStandalone={true}
        onClose={async () => {
          const targetUser = viewingUser || currentUser;
          if (targetUser) {
            const updatedDebts = viewingUser
              ? await authService.getDebtMappingByAdmin(targetUser.id)
              : await authService.getDebtMapping(targetUser.id);
            setDebtMappingData(updatedDebts);
          }
          setViewMode('dashboard');
        }}
        onSave={async (data) => {
          const targetUser = viewingUser || currentUser;
          if (targetUser) {
            if (viewingUser) {
              await authService.saveDebtMappingByAdmin(targetUser.id, data);
            } else {
              await authService.saveDebtMapping(targetUser.id, data);
            }
            setDebtMappingData(data);
          }
          setViewMode('dashboard');
        }}
        user={viewingUser || currentUser ? {
          name: (viewingUser || currentUser)?.name || '',
          email: (viewingUser || currentUser)?.email || '',
          whatsapp: (viewingUser || currentUser)?.whatsapp || ''
        } : undefined}
      />
    );
  }

  if (viewMode === 'costOfLiving' && currentUser) {
    return (
      <CostOfLiving
        userId={viewingUser?.id || currentUser.id}
        isStandalone={true}
        onClose={async () => {
          // Refresh data when closing
          const targetUser = viewingUser || currentUser;
          if (targetUser) {
            const updatedCost = viewingUser
              ? await authService.getCostOfLivingByAdmin(targetUser.id)
              : await authService.getCostOfLiving(targetUser.id);
            setCostOfLivingData(updatedCost);
          }
          setViewMode('dashboard');
        }}
        onComplete={async () => {
          // Refresh data when completing
          const targetUser = viewingUser || currentUser;
          if (targetUser) {
            const updatedCost = viewingUser
              ? await authService.getCostOfLivingByAdmin(targetUser.id)
              : await authService.getCostOfLiving(targetUser.id);
            setCostOfLivingData(updatedCost);
          }
          setViewMode('dashboard');
        }}
        onFetch={viewingUser ? authService.getCostOfLivingByAdmin : undefined}
        onSave={viewingUser ? authService.saveCostOfLivingByAdmin : undefined}
        onDelete={viewingUser ? authService.deleteCostOfLivingByAdmin : undefined}
        user={{
          name: currentUser.name,
          email: currentUser.email,
          whatsapp: currentUser.whatsapp || ''
        }}
        initialView={costOfLivingData.length > 0 ? 'summary' : 'wizard'}
      />
    );
  }

  if (viewMode === 'report' || (showReport && data)) {
    return (
      <>

        {viewingUser && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 p-2 text-center">
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
              Modo de Visualização: {viewingUser.name}
            </span>
          </div>
        )}
        <Report
          data={data}
          user={viewingUser || currentUser ? {
            name: (viewingUser || currentUser)?.name || '',
            email: (viewingUser || currentUser)?.email || '',
            whatsapp: (viewingUser || currentUser)?.whatsapp || ''
          } : undefined}
          onBack={handleReportBack}
          onEdit={handleEditDiagnostic}
          onSaveAnalysis={handleSaveAnalysis}
          onLogout={handleLogout}
          anamnesisData={anamnesisData}
          onSaveAnamnesis={async (formData) => {
            const targetUser = viewingUser || currentUser;
            if (targetUser) {
              if (viewingUser) {
                await authService.saveAnamnesisByAdmin(targetUser.id, formData);
              } else {
                await authService.saveAnamnesis(targetUser.id, formData);
              }
              // Refresh props
              const updated = viewingUser
                ? await authService.getAnamnesisByAdmin(targetUser.id)
                : await authService.getAnamnesis(targetUser.id);
              setAnamnesisData(updated);
            }
          }}
        />

      </>
    );
  }

  if (viewMode === 'landing' || viewMode === 'auth') {
    return (
      <>
        <Landing
          currentUser={currentUser}
          onStart={() => {
            if (currentUser) {
              // Se já está logado, vai para Anamnese (se não tiver) ou Wizard/Dashboard
              if (!anamnesisData) {
                setViewMode('anamnesis');
              } else {
                // Se já tem anamnese, vai para o Dashboard (regra atual) ou Wizard? 
                // Usuário pediu "só apareça... após clicar".
                // Vamos para o Wizard direto? Não, Dashboard é mais seguro.
                setViewMode('dashboard');
              }
            } else {
              setStartFromLanding(true);
              setForceLoginMode(true);
              setForceRegisterMode(false);
              setShowAuthModal(true);
              setViewMode('auth');
            }
          }}
          onLogin={() => {
            if (currentUser) {
              setViewMode('dashboard');
            } else {
              setStartFromLanding(false);
              setForceLoginMode(true);
              setForceRegisterMode(false);
              setShowAuthModal(true);
              setViewMode('auth');
            }
          }}
        />
        {(viewMode === 'auth' || showAuthModal) && (
          <AuthModal
            onClose={() => {
              setShowAuthModal(false);
              setViewMode('landing');
            }}
            onSuccess={handleAuthSuccess}
            forceRegister={forceRegisterMode}
            forceLogin={forceLoginMode}
            isStartFlow={startFromLanding}
          />
        )}
      </>
    );
  }

  // Wizard Mode (Default return)
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 pb-10">
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setViewMode('dashboard')} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
              <ArrowRight className="rotate-180" size={20} />
            </button>
            <img src="/images/logo.png" alt="SOLUM Logo" className="h-10 w-auto object-contain" />
            <div className="hidden sm:flex flex-col">
              <h1 className="text-xs font-black text-sky-400 uppercase tracking-tighter leading-none">SOLUM</h1>
              <span className="text-[8px] font-bold text-slate-500 uppercase">Diagnóstico Inteligente</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-1 overflow-x-auto no-scrollbar py-1 px-2">
              {STEPS.map((step, idx) => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(idx)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-2 border transition-all whitespace-nowrap ${idx === currentStep ? 'bg-sky-500/10 border-sky-500 text-sky-400 shadow-lg shadow-sky-500/5' :
                    stepStatus[step.id as keyof typeof stepStatus] === 'completed' ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/5' :
                      'border-amber-500/30 text-amber-500 bg-amber-500/5'
                    }`}
                >
                  {step.icon} <span>{step.title}</span>
                  {stepStatus[step.id as keyof typeof stepStatus] === 'completed' ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2 pl-4 border-l border-slate-800">
              {currentUser ? (
                <div className="flex items-center gap-3">
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] font-black text-white uppercase">{currentUser.name}</span>
                    <span className="text-[8px] text-sky-400 uppercase font-bold">{currentUser.role}</span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setForceRegisterMode(false);
                    setForceLoginMode(true); // Força modo apenas Login
                    setShowAuthModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl text-[10px] font-black uppercase hover:bg-slate-700 transition-colors"
                >
                  <UserIcon size={14} /> Entrar
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navegação Mobile */}
      <div className="md:hidden px-4 py-2 bg-slate-900 border-b border-slate-800 overflow-x-auto no-scrollbar flex gap-2">
        {STEPS.map((step, idx) => (
          <button
            key={step.id}
            onClick={() => setCurrentStep(idx)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-2 border shrink-0 ${idx === currentStep ? 'bg-sky-500/10 border-sky-500 text-sky-400' : 'border-slate-800 text-slate-500'
              }`}
          >
            {step.icon} {step.title}
          </button>
        ))}
      </div>

      <main className="max-w-4xl mx-auto px-4 mt-8">
        {editingUserId && currentUser && editingUserId !== currentUser.id && (
          <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center gap-2 text-amber-400 animate-pulse">
            <Info size={16} />
            <span className="text-xs font-bold uppercase">Modo de Edição: Você está alterando os dados de outro usuário.</span>
          </div>
        )}

        <div className="bg-slate-800/20 border border-slate-800 rounded-[2rem] p-6 md:p-10 shadow-2xl backdrop-blur-sm">
          <div className={`mb-8 p-5 border rounded-2xl flex gap-4 items-start transition-colors duration-500 ${infoCardStyles}`}>
            <div className={`p-2 rounded-xl shrink-0 ${isPositiveOrNeutral ? 'bg-sky-500/10 text-sky-400' : 'bg-rose-500/10 text-rose-400'}`}>
              <InfoIcon size={20} />
            </div>
            <div className="space-y-1">
              <h3 className={`text-sm font-black uppercase tracking-widest ${isPositiveOrNeutral ? 'text-sky-400' : 'text-rose-400'}`}>{STEPS[currentStep].title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium whitespace-pre-line">
                {currentStep === 0 ? (
                  <>
                    Definimos sua rotina de trabalho.<br />
                    Isso mostra quanto do seu <span className="text-sky-300 font-black shadow-sky-400/20">tempo de vida</span> é trocado por dinheiro.
                  </>
                ) : STEP_INFO[stepId as keyof typeof STEP_INFO]}
              </p>
            </div>
          </div>

          {renderCategorySummary()}

          <div className="min-h-[350px]">
            {stepId === 'work' && (
              <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-12">
                    <div className="space-y-5">
                      <div className="flex justify-between items-end font-black text-[10px] uppercase text-slate-500 tracking-widest">
                        <span>Dias que trabalha por semana</span>
                        <span className="text-sky-400 text-3xl font-black neon-text drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]">{data.work.daysPerWeek}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="7"
                        value={data.work.daysPerWeek}
                        onChange={(e) => setData({ ...data, work: { ...data.work, daysPerWeek: parseInt(e.target.value) } })}
                        className="w-full accent-sky-500 h-2 bg-slate-800 rounded-full cursor-pointer focus:ring-4 focus:ring-sky-500/20"
                      />
                      <p className="text-[9px] text-slate-600 font-bold uppercase tracking-tight">
                        Isso representa aproximadamente {(data.work.daysPerWeek * 4.33 * data.work.hoursPerDay).toFixed(0)} horas de trabalho por mês.
                      </p>
                    </div>
                    <div className="space-y-5">
                      <div className="flex justify-between items-end font-black text-[10px] uppercase text-slate-500 tracking-widest">
                        <span>Horas que trabalha por dia</span>
                        <span className="text-sky-400 text-3xl font-black neon-text drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]">{data.work.hoursPerDay}H</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="24"
                        value={data.work.hoursPerDay}
                        onChange={(e) => setData({ ...data, work: { ...data.work, hoursPerDay: parseInt(e.target.value) } })}
                        className="w-full accent-sky-500 h-2 bg-slate-800 rounded-full cursor-pointer focus:ring-4 focus:ring-sky-500/20"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-1">Tipo de Renda</label>
                    <div className="space-y-3">
                      {Object.values(IncomeType).map(t => (
                        <div key={t} className="flex flex-col gap-1 group/item">
                          <button
                            onClick={() => setData({ ...data, work: { ...data.work, incomeType: t } })}
                            className={`w-full p-4 rounded-2xl border text-xs font-black uppercase text-left transition-all duration-300 relative overflow-hidden ${data.work.incomeType === t
                              ? 'border-sky-500 bg-sky-500/10 text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                              : 'border-slate-800 text-slate-500 hover:border-slate-700 hover:bg-slate-800/40'
                              }`}
                          >
                            {t}
                            {data.work.incomeType === t && (
                              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <CheckCircle2 size={16} />
                              </div>
                            )}
                          </button>
                          {(data.work.incomeType === t || true) && (
                            <p className={`text-[9px] px-2 font-bold uppercase transition-all duration-300 ${data.work.incomeType === t ? 'text-sky-500/60 opacity-100' : 'text-slate-700 opacity-0 group-hover/item:opacity-100'
                              }`}>
                              {t === IncomeType.FIXED && 'Recebe praticamente o mesmo valor todo mês'}
                              {t === IncomeType.VARIABLE && 'Valor muda conforme vendas, comissões ou serviços'}
                              {t === IncomeType.MIXED && 'Parte fixa + parte variável'}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/30 border border-slate-800/40 p-8 rounded-[2.5rem] mt-4 opacity-60">
                  <div className="flex items-center gap-6">
                    <div className="p-3 bg-slate-800/50 rounded-2xl text-slate-600">
                      <Clock size={24} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-slate-400 font-medium leading-relaxed">
                        Essas informações não são financeiras ainda.
                      </p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                        Elas servem apenas para transformar dinheiro em tempo de vida nos relatórios.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {stepId === 'income' && (
              <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4">
                {renderGenericListStable('income')}

                <div className="bg-slate-900/30 border border-slate-800/40 p-8 rounded-[2.5rem] opacity-60">
                  <div className="flex items-center gap-6">
                    <div className="p-3 bg-slate-800/50 rounded-2xl text-slate-600">
                      <Target size={24} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-slate-400 font-medium leading-relaxed">
                        Informe apenas valores que realmente entram no mês.
                      </p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                        Dinheiro incerto distorce o diagnóstico, mas o valor pode ser aproximado caso não tenha renda fixa.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}



            {/* Lógica Específica para Aba de Dívidas (Com parcelamento e timeline) */}
            {stepId === 'debts' && (
              <div className="space-y-12 animate-in fade-in duration-500">
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-rose-500/10 pb-4">
                    <div className="space-y-1">
                      <h3 className="text-xs font-black text-rose-400 uppercase tracking-widest flex items-center gap-2">
                        <Activity size={14} /> Dívidas e Empréstimos
                      </h3>
                      <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-tight mt-1 flex items-center gap-1">
                        <CheckCircle2 size={10} /> Dados importados do Mapeamento de Dívidas. Apenas confira.
                      </p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">Compromissos de longo prazo que impactam meses futuros</p>
                    </div>
                    <button
                      onClick={() => {
                        const newDebt: DebtItem = { id: Math.random().toString(36).substr(2, 9), name: '', value: 0, totalInstallments: 1, remainingInstallments: 1 };
                        setData(prev => ({ ...prev, debts: [...prev.debts, newDebt] }));
                      }}
                      className="px-3 py-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl text-[10px] font-black uppercase hover:bg-rose-500/20 transition-all flex items-center gap-2"
                    >
                      <PlusCircle size={14} /> Nova Dívida
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.debts.map(debt => (
                      <div key={debt.id} className={`p-5 bg-slate-900/60 border rounded-2xl space-y-4 transition-all group hover:border-rose-500/30 ${debt.name === '' || debt.value === 0 ? 'border-amber-500/20' : 'border-slate-800'}`}>
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 space-y-4">
                            <div className="space-y-1">
                              <label className="text-[8px] font-black text-slate-500 uppercase">Descrição da Dívida</label>
                              <input
                                value={debt.name}
                                onChange={(e) => setData(prev => ({ ...prev, debts: prev.debts.map(d => d.id === debt.id ? { ...d, name: e.target.value } : d) }))}
                                placeholder="Ex: Financiamento Carro, Empréstimo Pessoal"
                                className="w-full bg-slate-800 border border-slate-700/50 rounded-lg py-1.5 px-3 text-xs outline-none focus:border-rose-500/50"
                              />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <label className="text-[8px] font-black text-slate-500 uppercase">Valor Mês</label>
                                <div className="relative">
                                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-600">R$</span>
                                  <input
                                    type="number"
                                    value={debt.value || ''}
                                    onChange={(e) => setData(prev => ({ ...prev, debts: prev.debts.map(d => d.id === debt.id ? { ...d, value: parseFloat(e.target.value) || 0 } : d) }))}
                                    className="w-full bg-slate-800 border border-slate-700/50 rounded-lg py-1.5 pl-6 pr-2 text-xs outline-none"
                                  />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[8px] font-black text-slate-500 uppercase">Restam</label>
                                <input
                                  type="number"
                                  value={debt.remainingInstallments}
                                  onChange={(e) => {
                                    const newVal = Math.max(1, parseInt(e.target.value) || 1);
                                    setData(prev => ({ ...prev, debts: prev.debts.map(d => d.id === debt.id ? { ...d, remainingInstallments: newVal, totalInstallments: newVal > d.totalInstallments ? newVal : d.totalInstallments } : d) }));
                                  }}
                                  className="w-full bg-slate-800 border border-slate-700/50 rounded-lg py-1.5 text-center text-xs outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[8px] font-black text-slate-500 uppercase">Total</label>
                                <input
                                  type="number"
                                  value={debt.totalInstallments}
                                  onChange={(e) => {
                                    const newVal = Math.max(1, parseInt(e.target.value) || 1);
                                    setData(prev => ({ ...prev, debts: prev.debts.map(d => d.id === debt.id ? { ...d, totalInstallments: newVal, remainingInstallments: newVal < d.remainingInstallments ? newVal : d.remainingInstallments } : d) }));
                                  }}
                                  className="w-full bg-slate-800 border border-slate-700/50 rounded-lg py-1.5 text-center text-xs outline-none"
                                />
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setData({ ...data, debts: data.debts.filter(d => d.id !== debt.id) })}
                            className="text-rose-500/20 hover:text-rose-500 transition-colors p-2"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="space-y-3 pt-3 border-t border-slate-800">
                          <div className="flex items-center justify-between">
                            <span className={`text-[9px] font-black uppercase tracking-widest ${debt.remainingInstallments <= 12 ? 'text-amber-400/80' : 'text-rose-400/80'}`}>
                              {debt.remainingInstallments <= 12 ? "Curto Prazo (< 1 ano)" : "Longo Prazo (> 1 ano)"}
                            </span>
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                              Parcela {debt.totalInstallments - debt.remainingInstallments + 1} de {debt.totalInstallments}
                            </span>
                          </div>

                          {/* Renderizamos timeline apenas para os próximos 12 meses visualmente, para não quebrar o layout se for financiamento de 30 anos */}
                          {renderTimeline(Math.min(12, debt.remainingInstallments))}
                          {debt.remainingInstallments > 12 && (
                            <p className="text-[8px] text-center text-slate-600 font-bold uppercase tracking-widest">+ {debt.remainingInstallments - 12} meses seguintes...</p>
                          )}

                          <div className="flex items-center justify-between gap-4">
                            <p className="text-[8px] text-slate-600 font-bold uppercase italic leading-tight">
                              {debt.remainingInstallments > 12 ? "Dívidas longas exigem estratégia de amortização." : "Foco em quitar para liberar fluxo de caixa."}
                            </p>
                            <div className="flex items-center gap-2 text-emerald-400/80 shrink-0">
                              <CalendarDays size={10} />
                              <span className="text-[8px] font-black uppercase tracking-tight">Até: {getEndDate(debt.remainingInstallments)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-3xl animate-in fade-in duration-700">
                  <div className="flex gap-4 items-center">
                    <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
                      <PiggyBank size={20} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-amber-500 uppercase tracking-widest">Estratégia SOLUM</h4>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Dívidas não são necessariamente ruins, mas o <span className="text-white font-bold">prazo</span> delas é o que aprisiona seu futuro.
                        Visualizar quando elas acabam é o primeiro passo para acelerar esse processo.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {stepId === 'estimated' && (
              <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="p-4 bg-sky-500/5 border border-sky-500/10 rounded-2xl flex gap-3 items-start">
                  <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg shrink-0">
                    <Info size={18} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-sky-400 uppercase tracking-widest">Atenção aos dados</h4>
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                      Todas as informações desta tela foram importadas do seu <strong>Custo de Vida</strong>.
                      Filtramos apenas o necessário para o diagnóstico. Confirme se está tudo correto antes de avançar.
                    </p>
                  </div>
                </div>
                {renderGenericListStable('estimatedExpenses')}
              </div>
            )}
          </div>

          <div className="mt-12 flex flex-col items-end border-t border-slate-800 pt-8 gap-4">
            <div className="w-full flex justify-between items-center">
              <button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} className={`px-6 py-3 font-black text-xs uppercase text-slate-500 hover:text-white transition-all ${currentStep === 0 ? 'opacity-0 pointer-events-none' : ''}`}>Voltar Etapa</button>
              <div className="flex flex-col items-end gap-3">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest animate-pulse">
                  {currentStep === 0 ? "Leva menos de 2 minutos" : isSummaryStep ? "Você poderá ajustar essas informações depois." : ""}
                </span>
                <button
                  onClick={() => {
                    if (currentStep === 3) {
                      // Validate ALL mandatory fields before submitting
                      const totalIncome = data.income.reduce((a, b) => a + b.value, 0);
                      if (totalIncome <= 0) {
                        alert("Não é possível finalizar sem informar suas receitas. Por favor, volte a etapa de Receitas.");
                        setCurrentStep(STEPS.findIndex(s => s.id === 'income'));
                        return;
                      }

                      if (data.work.daysPerWeek <= 0 || data.work.hoursPerDay <= 0) {
                        alert("Por favor, informe sua rotina de trabalho (dias e horas).");
                        return;
                      }

                      handleFinalSubmit();
                    } else {
                      // Step-specific validation for "Next"
                      if (stepId === 'income') {
                        const totalIncome = data.income.reduce((a, b) => a + b.value, 0);
                        if (totalIncome <= 0) {
                          alert("Por favor, informe suas receitas mensais para continuar. Isso é essencial para o diagnóstico.");
                          return;
                        }
                      }

                      if (stepId === 'work') {
                        if (data.work.daysPerWeek <= 0 || data.work.hoursPerDay <= 0) {
                          alert("Por favor, informe sua rotina de trabalho (dias e horas).");
                          return;
                        }
                      }

                      setCurrentStep(currentStep + 1);
                    }
                  }}
                  className="px-12 py-4 bg-sky-500 text-[#0f172a] rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-sky-500/30 active:scale-95 transition-all hover:bg-sky-400 hover:shadow-sky-400/50 hover:-translate-y-1"
                >
                  {currentStep === 3 ? 'Ver Diagnóstico Final' : 'Próxima Etapa'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-10 text-center opacity-30 flex items-center justify-center gap-4">
          <div className="h-px bg-slate-800 flex-1"></div>
          <span className="text-[10px] font-black uppercase tracking-widest">SOLUM 2026</span>
          <div className="h-px bg-slate-800 flex-1"></div>
        </footer>
      </main>

      {/* Modal de Autenticação */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
          forceRegister={forceRegisterMode}
          forceLogin={forceLoginMode}
        />
      )}

      {showProfileConfirmation && currentUser && (
        <ProfileConfirmationModal
          user={currentUser}
          onConfirm={async () => {
            // Atualiza dados locais se necessário e prossegue
            const updatedUser = await authService.getCurrentUser();
            if (updatedUser) setCurrentUser(updatedUser);

            if (editingUserId) {
              // Se estamos visualizando outro usuário (Admin), usamos RPC de admin
              if (viewingUser) {
                await authService.saveDiagnosticByAdmin(editingUserId, data);
              } else {
                await authService.saveDiagnostic(editingUserId, data);
              }
              setShowProfileConfirmation(false);
              setShowReport(true);
            }
          }}
          onCancel={() => setShowProfileConfirmation(false)}
        />
      )}

      {showEditProfile && (viewingUser || currentUser) && (
        <ProfileConfirmationModal
          user={viewingUser || currentUser!}
          onSave={handleSaveProfile}
          onConfirm={() => setShowEditProfile(false)}
          onCancel={() => setShowEditProfile(false)}
        />
      )}

      {showDataChanges && (
        <DataChangesModal
          changes={diffs}
          onConfirm={async () => {
            if (editingUserId) {
              if (viewingUser) {
                await authService.saveDiagnosticByAdmin(editingUserId, data);
              } else {
                await authService.saveDiagnostic(editingUserId, data);
              }
              setOriginalData(data); // Atualiza original
              setShowDataChanges(false);
              setShowReport(true);
            }
          }}
          onCancel={() => setShowDataChanges(false)}
        />
      )}

      {/* Admin Dashboard */}
      {showAdminDashboard && currentUser && (
        <AdminDashboard
          currentUser={currentUser}
          onClose={() => setShowAdminDashboard(false)}
          onSelectUser={handleAdminSelectUser}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
};

export default App;

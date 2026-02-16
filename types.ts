
export enum IncomeType {
  FIXED = 'Fixa',
  VARIABLE = 'Variável',
  MIXED = 'Mista'
}

export interface FinancialItem {
  id: string;
  name: string;
  value: number;
}

export interface CreditCard {
  id: string;
  name: string;
  oneTime: number;
}

export interface Installment extends FinancialItem {
  cardId: string;
  totalInstallments: number;
  remainingInstallments: number;
}

// Nova interface para Dívidas com suporte a parcelas (usado no Diagnóstico)
export interface DebtItem extends FinancialItem {
  totalInstallments: number;
  remainingInstallments: number;
}

// Interface para o Módulo de Mapeamento de Dívidas (Detalhado)
export interface DebtMapItem {
  id: string;
  name: string; // Dívida
  creditor: string; // Credor
  originalValue: number; // Valor do empréstimo
  installmentValue: number; // Valor da parcela
  totalInstallments: number; // Total de parcelas (para registro)
  remainingInstallments: number; // Parcelas restantes
  currentValue: number; // Valor atual (calculado)
  interestRate: string; // Juros / CET
  endDate: string; // Data final (calculada)
  createdAt: string;
}

export interface DebtMappingData {
  userId: string;
  items: DebtMapItem[];
  updatedAt: string;
}

export interface CostOfLivingItem {
  id: string;
  category: string;
  description: string;
  value: number;
  createdAt?: string;
}

export interface Anamnesis {
  id: string;
  userId: string;
  reason: string;
  objectives: string;
  spendsAll: boolean;
  emergencyFund: boolean;
  investments: boolean;
  investsMonthly: boolean;
  retirementPlan: boolean;
  independentDecisions: boolean;
  financialScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialData {
  work: {
    daysPerWeek: number;
    hoursPerDay: number;
    incomeType: IncomeType;
  };
  income: FinancialItem[];
  estimatedExpenses: FinancialItem[];
  fixedExpenses: FinancialItem[];
  creditCard: {
    cards: CreditCard[];
    installments: Installment[];
  };
  debts: DebtItem[]; // Atualizado para usar a nova interface
  // Novos campos para cache da IA
  aiAnalysis?: string;
  aiAnalysisHash?: string;
  lastUpdated?: string;
}

export const INITIAL_DATA: FinancialData = {
  work: {
    daysPerWeek: 5,
    hoursPerDay: 8,
    incomeType: IncomeType.FIXED
  },
  income: [
    { id: 'fixed', name: 'Salário Fixo', value: 0 }
  ],
  estimatedExpenses: [
    { id: 'market', name: "Mercado", value: 0 },
    { id: 'leisure', name: "Lazer", value: 0 },
    { id: 'pharmacy', name: "Farmácia", value: 0 },
    { id: 'water', name: "Água", value: 0 },
    { id: 'energy', name: "Energia", value: 0 },
    { id: 'personal', name: "Cuidado Pessoal", value: 0 },
    { id: 'supplements', name: "Suplementação", value: 0 },
    { id: 'transport', name: "Locomoção", value: 0 },
    { id: 'donation', name: "Doação", value: 0 },
    { id: 'kids', name: "Filhos", value: 0 },
    { id: 'partner', name: "Cônjuge", value: 0 },
    { id: 'pet', name: "Pet", value: 0 },
    { id: 'online', name: "Compras Online", value: 0 },
    { id: 'utilities', name: "Utilidades", value: 0 },
    { id: 'misc', name: "Diversos", value: 0 }
  ],
  fixedExpenses: [
    { id: 'internet', name: "Internet", value: 0 },
    { id: 'rent', name: "Aluguel", value: 0 },
    { id: 'streaming', name: "Streaming", value: 0 },
    { id: 'condo', name: "Condomínio", value: 0 },
    { id: 'school', name: "Escola", value: 0 },
    { id: 'health', name: "Plano de Saúde", value: 0 }
  ],
  creditCard: {
    cards: [
      { id: 'card-1', name: 'Cartão 1', oneTime: 0 }
    ],
    installments: [
      { id: 'inst-default', name: '', value: 0, cardId: 'card-1', totalInstallments: 1, remainingInstallments: 1 }
    ]
  },
  debts: [
    { id: 'financing', name: "Financiamentos", value: 0, totalInstallments: 1, remainingInstallments: 1 },
    { id: 'consortium', name: "Consórcios", value: 0, totalInstallments: 1, remainingInstallments: 1 },
    { id: 'overdraft', name: "Cheque Especial", value: 0, totalInstallments: 1, remainingInstallments: 1 },
    { id: 'loans', name: "Empréstimos", value: 0, totalInstallments: 1, remainingInstallments: 1 }
  ]
};

// --- NOVOS TIPOS DE AUTENTICAÇÃO E CRM ---

export type UserRole = 'ADMIN' | 'SECRETARY' | 'USER';

export type UserStatus = 'NEW' | 'ACTIVE' | 'CONTACTED' | 'CONVERTED' | 'LOST';

export interface User {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  password?: string; // Opcional apenas na listagem segura
  role: UserRole;
  status: UserStatus;
  lastContactedBy?: string; // Nome do Admin/Secretário que alterou o status pela última vez
  createdAt: string;
  checklistPhase?: 'LOCKED' | 'PHASE_1' | 'PHASE_2';
  checklistProgress?: number[];
  checklistData?: ChecklistData;
}

export interface ChecklistData {
  [stepId: number]: {
    subItems?: {
      [subItemId: number]: {
        checked: boolean;
        value?: string; // Para respostas de texto
      };
    };
  };
}

export interface DiagnosticRecord {
  userId: string;
  data: FinancialData;
  updatedAt: string;
}

// --- MENTORSHIP ---

export interface MentorshipMeeting {
  userId: string;
  meetingId: number;
  status: 'locked' | 'unlocked' | 'completed';
  data: any;
  startedAt?: string;
  completedAt?: string;
}

export interface NonRecurringExpenseItem {
  id: string;
  userId: string;
  category: string;
  description: string;
  value: number;
  frequency: number;
  createdAt: string;
}

export interface MentorshipState {
  meetings: MentorshipMeeting[];
  nonRecurringExpenses: NonRecurringExpenseItem[];
}

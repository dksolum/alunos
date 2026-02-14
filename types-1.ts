
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
    debts: FinancialItem[];
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
        { id: 'financing', name: "Financiamentos", value: 0 },
        { id: 'consortium', name: "Consórcios", value: 0 },
        { id: 'overdraft', name: "Cheque Especial", value: 0 },
        { id: 'loans', name: "Empréstimos", value: 0 }
    ]
};

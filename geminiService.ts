import { FinancialData } from "./types";

// Base de mensagens
const MESSAGES = {
  POSITIVE_LOW: [
    "Você fechou o mês no positivo com {valor}. Ainda é uma margem pequena, mas já é um passo na direção certa.",
    "Há uma leve sobra de {valor}. O desafio agora é transformar consistência em crescimento.",
  ],

  POSITIVE_MEDIUM: [
    "Boa gestão! Sobram {valor} no mês, o que permite começar reservas ou investimentos.",
    "Com {valor} positivos, você já começa a construir estabilidade.",
  ],

  POSITIVE_HIGH: [
    "Excelente cenário. {valor} de superávit indicam controle sólido e potencial de aceleração financeira.",
    "Você está operando com folga financeira. {valor} permitem estratégia, não apenas sobrevivência.",
  ],

  NEGATIVE_LOW: [
    "O mês fechou com {valor} negativo. Ainda é reversível com pequenos ajustes.",
    "Há um leve desequilíbrio de {valor}. Revisões pontuais já podem corrigir.",
  ],

  NEGATIVE_MEDIUM: [
    "O déficit de {valor} mostra que o padrão atual não está sustentável.",
    "A diferença de {valor} exige corte estratégico ou aumento de renda.",
  ],

  NEGATIVE_HIGH: [
    "O resultado de {valor} negativos aponta risco financeiro relevante.",
    "Esse nível de déficit exige ação imediata e mudança estrutural.",
  ],

  NEUTRAL: [
    "Você fechou no zero a zero. Não há déficit, mas também não há proteção.",
    "Sem sobra e sem falta. O próximo passo é gerar margem.",
  ],
} as const;

type MessageType = keyof typeof MESSAGES;

const FIXED_TEXT =
  "\n\nOlhando seus números, o segredo agora é manter os pés no chão e enxergar o dinheiro com clareza. Quando você acompanha cada saída, as decisões ficam mais fáceis e o resultado aparece. Agora você já tem um jeito simples de organizar isso no dia a dia, com a SOLUM FINANCEIRO. Aguarde o envio da ferramenta pelo seu email cadastrado ou pelo grupo da consultoria.";

const DECK_KEY = "solum_msg_rotation";

// Estado de rotação: uma fila (deck) de índices por tipo de mensagem
type RotationState = Record<MessageType, number[]>;

// Função para embaralhar array (Fisher-Yates)
const shuffle = (array: number[]) => {
  let currentIndex = array.length;

  while (currentIndex !== 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
};

const buildInitialState = (): RotationState => {
  const state = {} as RotationState;

  (Object.keys(MESSAGES) as MessageType[]).forEach((key) => {
    state[key] = shuffle(
      Array.from({ length: MESSAGES[key].length }, (_, i) => i)
    );
  });

  return state;
};

// Gerencia a rotação das mensagens sem repetição
const getNextMessage = (type: MessageType): string => {
  const stored = localStorage.getItem(DECK_KEY);
  let state: RotationState;

  // Inicializa ou recupera estado
  if (stored) {
    state = JSON.parse(stored) as RotationState;
  } else {
    state = buildInitialState();
  }

  // Se não existir (mudança de categorias) ou se acabou, reabastece com o tamanho correto
  if (!state[type] || state[type].length === 0) {
    state[type] = shuffle(
      Array.from({ length: MESSAGES[type].length }, (_, i) => i)
    );
  }

  const nextIndex = state[type].pop();

  // Salva o novo estado
  localStorage.setItem(DECK_KEY, JSON.stringify(state));

  // Fallback defensivo
  if (nextIndex === undefined) return MESSAGES[type][0];

  return MESSAGES[type][nextIndex];
};

export const generateLocalAnalysis = (data: FinancialData, summary: any) => {
  const balance = Number(summary?.balance ?? 0);
  const absValue = Math.abs(balance);

  // Margem de segurança para arredondamento
  const margin = 10;

  let type: MessageType;

  if (Math.abs(balance) <= margin) {
    type = "NEUTRAL";
  } else if (balance > 0) {
    if (balance <= 200) type = "POSITIVE_LOW";
    else if (balance <= 1000) type = "POSITIVE_MEDIUM";
    else type = "POSITIVE_HIGH";
  } else {
    // balance < 0
    if (balance >= -200) type = "NEGATIVE_LOW";
    else if (balance >= -1000) type = "NEGATIVE_MEDIUM";
    else type = "NEGATIVE_HIGH";
  }

  // Obtém mensagem do deck
  const rawMessage = getNextMessage(type);

  // Formata valor
  const formattedValue = absValue.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  // Monta texto final
  const finalMessage = rawMessage.replace("{valor}", formattedValue) + FIXED_TEXT;

  return finalMessage;
};

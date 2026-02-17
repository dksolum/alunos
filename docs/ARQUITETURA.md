# Arquitetura do Módulo de Mentoria

## Visão Geral
O módulo de mentoria foi projetado para gerenciar o ciclo de vida de reuniões financeiras entre um Administrador (Mentor) e um Usuário (Cliente). Ele utiliza o Supabase como backend (PostgreSQL + Auth + RLS) e React/Tailwind no frontend.

## Banco de Dados (Supabase)

### Tabelas Principais

1.  **`mentorship_meetings`**
    *   Gerencia o estado de cada uma das 6 reuniões.
    *   **PK**: `(user_id, meeting_id)`
    *   **Colunas**:
        *   `status`: 'locked' | 'unlocked' | 'completed'
        *   `data`: JSONB (armazena checklists, respostas e estados internos da reunião)
        *   `active_step`: Inteiro (persiste a aba ativa)

2.  **`non_recurring_expenses`**
    *   Armazena itens de gastos anuais/esporádicos.
    *   **Colunas**: `category`, `description`, `value`, `frequency`.

### Segurança (RLS & RPCs)

Devido à necessidade de o Admin ler e escrever dados *em nome do usuário*, utilizamos uma estratégia híbrida:

*   **RLS (Row Level Security)**:
    *   Usuários podem ler/escrever *apenas* seus próprios dados (`auth.uid() = user_id`).
    *   Admins têm políticas de `select` e `update` amplas, mas para operações complexas, usamos RPCs.

*   **RPCs (Stored Procedures)**:
    *   `upsert_mentorship_meeting_by_admin`: Permite que o Admin salve dados na tabela `mentorship_meetings` de qualquer usuário, contornando limitações de RLS no client-side. Usa `ON CONFLICT` e merge de JSONB (`data || EXCLUDED.data`) para evitar perda de dados entre abas.
    *   `get_mentorship_state_by_admin`: Agrega dados de múltiplas tabelas para o painel do Admin.

## Frontend

### Componentes Chave

*   **`MentorshipCard`**: Exibe o status (Cadeado/Check) e controla abertura do modal.
*   **`MeetingModal`**: Gerenciador de contexto da reunião.
*   **`Meeting1Content` / `Meeting2Content`**: Orquestradores das reuniões. Gerenciam os passos:
    1.  `ReviewStage`: Tabela de Orçamento com suporte a herança de dados.
    2.  `NonRecurringExpensesStage`: CRUD de gastos anuais.
    3.  `ReportsStage`: Central de Impressão.
    4.  `TasksStage`: Checklist de finalização com suporte a tarefas customizadas.

### Sincronização de Dados entre Reuniões
Para garantir a continuidade do planejamento financeiro, implementamos um padrão de **Herança de Metas**:
1.  O componente `ReviewStage` recebe `previousMeetingData`.
2.  Um `useEffect` monitora mudanças nos dados da reunião anterior.
3.  O valor "Definido" (Meta) da Reunião N torna-se o valor "Referência" (Base) da Reunião N+1.
4.  Isso permite que o mentor e o aluno vejam a evolução e comparem o planejado vs realizado de forma contínua.

### Controle Administrativo de Acesso
Adicionamos a funcionalidade de **Lock/Unlock Manual**:
*   No `Dashboard.tsx`, admins podem disparar o `update_meeting_status_by_admin` RPC para alterar o status de qualquer reunião.
*   Isso permite liberar reuniões antecipadamente ou bloquear revisões após a conclusão.

### Sistema de Impressão ("Print Portal")

Para resolver problemas de layout ao imprimir de dentro de um Modal, implementamos uma estratégia de **Portal CSS**:

1.  **Ocultação Global**: `@media print { body * { visibility: hidden; } }` esconde toda a aplicação.
2.  **Hoisting de Conteúdo**: O container a ser impresso recebe a classe `.print-content`.
    *   `visibility: visible`
    *   `position: absolute` (remove do fluxo do modal)
    *   `left: 0, top: 0, width: 100%` (ocupa a página inteira)
    *   `html, body { overflow: visible }` (permite que o conteúdo cresça e crie múltiplas páginas)

Isso garante que o navegador "veja" apenas o relatório limpo, sem barras de rolagem, fundos escuros ou cortes de página.

## Módulo de Checklist & Negociação (Fase 2)

### Integração de Dados
A Fase 2 do checklist introduz uma integração profunda com o Mapeamento de Dívidas:

1.  **Fluxo de Dados**:
    *   **Mapeamento Global**: Fonte da verdade para dívidas originais (`debt_mapping` table).
    *   **Passo 11 (Negociação)**: Consome `debtMapItems` via props. Armazena um array JSON no `checklistData` do usuário.
    *   **Estrutura do JSON**: `[{ debtId, name, creditor, installmentValue, quantity, interestRate }]`.

2.  **Lógica de Cálculo (Proposta de Valor)**:
    *   **Cenário "Antes"**: Soma das parcelas originais (`installmentValue`) de todos os itens no `debtMapItems`.
    *   **Cenário "Depois"**: 
        *   Itera sobre o mapeamento global.
        *   Para cada dívida, busca se há uma negociação registrada no Passo 11.
        *   **Regra de Fallback**: Se o valor negociado estiver vazio/não informado, o sistema assume que não houve mudança e utiliza o valor da parcela original para compor o total.
    *   **Impacto Estimado**: Somatório da redução de custo de vida (Meeting 1/2) + redução total nas parcelas de dívidas.

### Estética de Sucesso e Realização
Para maximizar a percepção de valor do cliente, implementamos indicadores visuais de progresso:
- **Pulsed Achievement Glow**: Elementos que representam o cenário "Depois" (economia) recebem um brilho verde esmeralda (`bg-emerald-500/10 blur-xl animate-pulse`) quando o valor é inferior ao original.
- **Visual Strikethrough**: No cenário "Antes", os valores impactados são exibidos com um traço `line-through` sutil, simbolizando a eliminação ou redução do gasto/dívida.
- **Quantificação de Impacto**: Cálculo dinâmico da porcentagem de redução nas parcelas de dívidas para tangibilizar o benefício da negociação.

### Auditoria de Dados e Segurança
Em Fevereiro de 2026, foi realizada uma auditoria técnica completa na infraestrutura Supabase:
- **Tabelas e Schema**: Validado o alinhamento 1:1 entre os tipos do TypeScript e as colunas do PostgreSQL (incluindo campos `JSONB` para flexibilidade).
- **Isolamento via RLS**: Verificada a eficácia das políticas de segurança baseadas em `auth.uid()`, garantindo que dados de diagnóstico e mentoria sejam estritamente privados ou acessíveis apenas por Admins autorizados.
- **Integridade JSONB**: Confirmada a robustez das operações de merge em planos complexos, evitando sobrescrita acidental de dados entre diferentes sessões de preenchimento.
*   Os dados são salvos automaticamente ao:
    *   Mudar de aba (passo do stepper).
    *   Clicar em "Salvar" explicitamente (ReviewStage).
    *   Adicionar/Remover itens (Gastos Não Recorrentes).
    *   Alterar qualquer input no Checklist (ChecklistModal).

### Regras de Negócio e Segurança
*   **Acesso Administrativo**: Apenas Admins podem alterar a Fase do Checklist de um aluno através do Dashboard.
*   **Somente Leitura**: Quando o progresso é visualizado pelo próprio `USER`, o checklist entra em modo `readOnly`, permitindo apenas a visualização das estratégias definidas pelo mentor.

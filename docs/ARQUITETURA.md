# Arquitetura do Módulo de Mentoria

## Visão Geral
O módulo de mentoria foi projetado para gerenciar o ciclo de vida de reuniões financeiras entre um Administrador (Mentor) e um Usuário (Cliente). Ele utiliza o Supabase como backend (PostgreSQL + Auth + RLS) e React/Tailwind no frontend.

## Banco de Dados (Supabase)

### Tabelas Principais

1.  **`mentorship_meetings`**
    *   Gerencia o estado de cada uma das 6 reuniões (M1 ao M6).
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
    *   `save_user_intake`: Permite salvar a Ficha Individual. O parâmetro `p_details` (JSONB) inclui o objeto `personal_info` com a seguinte estrutura:
        ```json
        {
          "profession": "string",
          "has_dependents": "boolean",
          "dependents_count": "number",
          "income_range": "string"
        }
        ```
    *   `upsert_mentorship_meeting_by_admin`: Permite que o Admin salve dados na tabela `mentorship_meetings` de qualquer usuário, contornando limitações de RLS no client-side. Usa `ON CONFLICT` e merge de JSONB (`data || EXCLUDED.data`) para evitar perda de dados entre abas.
    *   `get_mentorship_state_by_admin`: Agrega dados de múltiplas tabelas para o painel do Admin.

## Frontend

### Componentes Chave

*   **`MentorshipCard`**: Exibe o status (Cadeado/Check) e controla abertura do modal.
*   **`MeetingModal`**: Gerenciador de contexto da reunião.
*   **`Meeting1Content` a `Meeting6Content`**: Orquestradores das reuniões. Gerenciam as etapas:
    1.  `ReviewStage`: Tabela de Orçamento com suporte a herança de dados.
    2.  `NonRecurringExpensesStage`: CRUD de gastos anuais com sincronização em cascata.
    3.  `DebtUpdateStage` (Reunião 2, 3, 4, 5 e 6): Etapa para revisão de dívidas negociadas e rastreamento de amortizações inter-reuniões.
    4.  `DebtRepaymentPlanStage` (Reunião 3): Definição da estratégia "Turning Point".
    5.  `DebtStatusTrackingStage` (Reuniões 4, 5 e 6): Rastreamento contínuo de dívidas prioritárias com registro de histórico.
    6.  `DreamsGoalsStage` (Reuniões 4, 5 e 6): Planejamento de sonhos. Na Reunião 4 inclui um Torneio de Prioridades; em M5 e M6 rastreia a evolução da reserva x sonhos.
    7.  `AssetMappingStage` (Reuniões 5 e 6): Onde o usuário categoriza seu patrimônio.
    8.  `ReportsStage`: Central de Impressão exclusiva por reunião.
    9.  `TasksStage`: Checklist de finalização com suporte a tarefas customizadas.

### Sincronização de Dados entre Reuniões
Para garantir a continuidade do planejamento financeiro, implementamos um padrão de **Herança de Metas**:
1.  O componente principal consome `previousMeetingData`.
2.  Valorizações e planejamentos são importados do mês anterior.
3.  **Sincronização em Cascata (v2.5)**: Gastos não recorrentes e Metas de Dívidas seguem a cronologia estrita (M1 → M2 → M3 → M4 → M5 → M6).

### Padronização de Arquitetura (Functional State Updaters)
A fim de prevenir sobrescritas de estado por Condições de Corrida ("Stale Closures") durante carregamentos paralelos de dados no `Dashboard`, alteramos a via de callback do component state.
*   A gestão de estado local (useState) foi isolada no contêiner-pai (`Dashboard.tsx`).
*   Componentes complexos de reunião (`DebtUpdateStage`, `MeetingContent`) utilizam _State Updater Functions_: `onUpdateMeetingData((prev) => ({ ...prev, newState }))` no lugar de injetar props defasadas.
*   Dados atualizados são renderizados com maior confiabilidade, salvando via cascata sem perda de propriedades de outras abas ou reuniões ocorrendo assincronamente.

### Módulo de Priorização de Sonhos (Torneio)
A Reunião 4 introduz uma interface de comparação par-a-par para priorizar sonhos:
1.  **Algoritmo**: Implementação de *Binary Insertion Sort* interativo.
2.  **Otimização**: Reduz o número de interações necessárias ao realizar comparações lógicas em vez de ordenação manual.
3.  **Persistência**: O array resultante é salvo no JSONB da reunião, mantendo a ordem definida pelo "torneio".

### Controle Administrativo de Acesso
Adicionamos a funcionalidade de **Lock/Unlock Manual**:
*   No `Dashboard.tsx`, admins podem disparar o `update_meeting_status_by_admin` RPC para alterar o status de qualquer reunião.
*   Isso permite liberar reuniões antecipadamente ou bloquear revisões após a conclusão.

### Sistema de Impressão ("Print Portal")

Para resolver problemas de layout ao imprimir de dentro de um Modal, implementamos uma estratégia de **Portal CSS**:

1.  **Ocultação Global**: `@media print { body * { visibility: hidden; } }` esconde toda a aplicação.
2.  **Hoisting de Conteúdo**: O container a ser impresso recebe a classe `.print-content` através de um Portal React que o renderiza na raiz do DOM.
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

### Módulo de Atualização de Dívidas (Mentoria)
A `DebtUpdateStage` na Reunião 2 é responsável por consolidar o status das negociações:
1.  **Sincronização**: Consome dados do `debt_mapping` global e do `checklistData` (Passo 11).
2.  **Inclusão Manual**: Permite que o mentor adicione "Dívidas Descobertas" que não estavam no mapeamento original, garantindo que o plano financeiro seja completo.
3.  **Persistência**: Salva um snapshot das dívidas dentro do objeto `data` da reunião para histórico e impressão.
4.  **Rastreamento de Origem (v2.3)**:
    *   **Propriedade `origin`**: Introduzida no `DebtUpdateItem` para controlar a proveniência (`mapping` | `meeting2` | `meeting3`).
    *   **Persistência**: O campo é salvo no JSONB da reunião e utilizado para renderizar badges coloridos (**Sky** para mapping, **Amber** para M2, **Purple** para M3).

### Módulo de Ficha Individual (User Intake)
O preenchimento da ficha é uma etapa crítica para o diagnóstico:
1.  **Persistência Híbrida**: Combina colunas relacionais (`main_problem`, `resolution_attempts`) com um bucket semi-estruturado (`details` JSONB).
2.  **Lógica de Carregamento**: O `UserIntakeModal` realiza um merge profundo entre o estado inicial do frontend e os dados salvos no banco, garantindo que novos campos (como `personal_info`) não causem erros de `undefined`.
3.  **Impacto no Dashboard**: A completitude da ficha (`main_problem` preenchido) altera o status do usuário de "Pendente" para "Aguardando Mentoria".

### Módulo de Plano de Quitação (Reunião 3)
A etapa `DebtRepaymentPlanStage` introduz a visão estratégica de longo prazo e foi refinada para maior precisão:
1.  **Estratégia "Turning Point"**: Diferente das etapas anteriores, esta foca apenas em dívidas que **ainda não foram pagas** (amortizadas).
2.  **Filtragem Automática**: O sistema identifica dívidas com `isPaid: false` em reuniões anteriores e as traz para o primeiro plano.
3.  **Visualização de Futuro**: Calcula e exibe quando cada dívida terminará, permitindo que o mentor e o aluno visualize a liberação de fluxo de caixa para investimentos.

### Padronização e Estabilização de Sincronização
Para evitar inconsistências e redundâncias, implementamos:
1.  **Deduplicação por ID**: No processo de `fetchAndMergeDebts`, o sistema usa um `Set` de IDs já existentes para garantir que dívidas manuais ou sincronizadas não sejam duplicadas na interface.
2.  **Herança de Referência Prioritária**: A Reunião 3 prioriza dados da Reunião 2 (`previousMeetingData`) para sincronização de Gastos Não Recorrentes, garantindo que o planejamento evolua linearmente.
3.  **Feedback de Estado Transitório**: Botões de sincronização agora disparam estados de `loading`/`refreshing` com indicadores visuais (spinners e rótulos dinâmicos), melhorando a percepção de interatividade da aplicação.

### Regras de Negócio e Segurança
*   **Acesso Administrativo**: Apenas Admins podem alterar a Fase do Checklist de um aluno através do Dashboard.
*   **Somente Leitura**: Quando o progresso é visualizado pelo próprio `USER`, o checklist e as etapas de mentoria entram em modo `readOnly`, permitindo apenas a visualização das estratégias definidas pelo mentor.

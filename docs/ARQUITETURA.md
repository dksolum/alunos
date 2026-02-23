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
    *   `upsert_mentorship_meeting_by_admin`: Permite que o Admin ou Secretário(a) salve dados na tabela `mentorship_meetings` de qualquer usuário, contornando limitações de RLS no client-side. Usa `ON CONFLICT` e merge de JSONB para evitar perda de dados entre abas, além de gravar timestamps.
    *   `get_mentorship_state_by_admin`: Agrega dados de múltiplas tabelas para o painel do Admin, listando dados agregados de M1 a M6 e gastos esporádicos.

## Frontend

### Componentes Chave

*   **`MentorshipCard`**: Exibe o status (Cadeado/Check) e controla abertura do modal da Mentoria.
*   **`MeetingModal`**: Gerenciador de contexto da reunião.
*   **`Meeting1Content` a `Meeting6Content`**: Orquestradores das reuniões. Gerenciam as etapas:
    1.  `ReviewStage`: Tabela de Orçamento com suporte a herança de dados.
    2.  `NonRecurringExpensesStage`: CRUD de gastos anuais com sincronização em cascata.
    3.  `DebtUpdateStage` (Reunião 2, 3, 4, 5 e 6): Etapa para revisão de dívidas negociadas e rastreamento de amortizações inter-reuniões.
    4.  `DebtRepaymentPlanStage` (Reunião 3): Definição da estratégia "Turning Point".
    5.  `DebtStatusTrackingStage` (Reuniões 4, 5 e 6): Rastreamento contínuo de dívidas prioritárias com registro de histórico em cascata e deduplicação inteligente.
    6.  `DreamsGoalsStage` (Reuniões 4, 5 e 6): Planejamento de sonhos. Na Reunião 4 inclui um Torneio de Prioridades; em M5 e M6 rastreia a evolução da reserva x sonhos com Origin Tags exclusivas de herança temporal.
    7.  `AssetMappingStage` (Reuniões 5 e 6): Onde o usuário categoriza seu patrimônio.
    8.  `ValueProposalM6` (Exclusivo Reunião 6): Componente sintético, acessível direto do Dashboard (condicionado ao desbloqueio administrativo). Traz histórico concatenado de evolução financeira e metas de dívida da M3 a M6.
    9.  `ReportsStage`: Central de Impressão exclusiva por reunião.
    10. `TasksStage`: Checklist de finalização com suporte a tarefas customizadas.

### Novo Módulo: Acompanhamento (Pós-Mentoria)
Acoplado ao **Dashboard**, o painel de Acompanhamento expande o funil do usuário ao "Nível 3" (Status: `CONTACTED`).
Ele consolida a retenção oferecendo **11 Cards de Especialização** (Milhas, Planejamento Sucessório, Transição de Carreira, Finanças PJ, Consórcio, etc.).
O módulo é rigidamente protegido por camadas de segurança visuais:
- Regra de Visibilidade: Só desenha atalhos ou grids coloridos se o Perfil Local atesta autoridade "Acompanhamento" explicitamente.
- `Admin Bypass Removal`: Administradores visualmente testam a plataforma como um Cliente daquele Cargo, forçando a barreira UI "Conteúdo Oculto" quando simulando leads de Fases Primitivas (Diagnóstico ou Consultoria), garantindo QA de Experiência.

### Sincronização de Dados entre Reuniões
Para garantir a continuidade do planejamento financeiro, implementamos um padrão de **Herança de Metas**:
1.  O componente principal consome `previousMeetingData` e injeta `Origin Tags`.
2.  Valorizações e planejamentos são importados do mês anterior.
3.  **Sincronização em Cascata (v2.6)**: Gastos não recorrentes, Dívidas e Objetivos de Torneio (Sonhos) seguem a cronologia estrita (M1 → M6).

### Padronização de Arquitetura (Functional State Updaters & Ref Sync)
A fim de prevenir sobrescritas de estado por Condições de Corrida ("Stale Closures") durante carregamentos paralelos de dados e cliques rápidos no `Dashboard`, alteramos a via de callback e o rastreamento do component state.
*   A gestão de estado local (useState) foi isolada no contêiner-pai (`Dashboard.tsx`).
*   **Referências Síncronas (useRef)**: O `Dashboard.tsx` utiliza uma ref local (`latestMeetingsRef`) para rastrear mutações instantaneamente sem aguardar ciclos de re-render do React. Todas as requisições de save (banco de dados) buscam dados da `ref`, garantindo que uploads em sucessão muito rápida (ex: checkbox + botão de save seguidos) jamais capturem uma "state shell" velha ("Stale Closure").
*   Componentes complexos de reunião (`DebtUpdateStage`, `MeetingContent`) utilizam _State Updater Functions_: `onUpdateMeetingData((prev) => ({ ...prev, newState }))` no lugar de injetar props defasadas.
*   **Sincronização Ativa de Props em Componentes Aninhados**: Componentes "folha" (ex: `ReviewStageM5.tsx`) escutam ativamente a prop raiz (`meetingData`) através de `useEffects` contínuos, garantindo que mesmo que o dado carregue minutos depois de montado (ou mude externamente), o Client-Side form update preencha instantaneamente a UI, banindo campos brancos persistentes.
*   **Fix Crítico (Reunião 1)**: Componentes com abas de navegação (como `Meeting1Content.tsx`) podiam enviar funções de callback defasadas via RPC do Admin, resultando em salvamento nulo (`new_data: undefined`). A interceptação funcional foi embutida no `Dashboard.tsx` garantindo extração de JSON válido antes da mutação na base de dados.
*   Configuramos proteções para **locks padrão** em Atas: a Reunião 1 nasce rígida com `locked` em vez de presumir o `unlocked` em escalada base.

### Módulo de Ficha Individual (User Intake)
O preenchimento da ficha é uma etapa crítica para o diagnóstico:
1.  **Persistência Híbrida**: Combina colunas relacionais (`main_problem`, `resolution_attempts`) com um bucket semi-estruturado (`details` JSONB).
2.  **Lógica de Carregamento**: O `UserIntakeModal` realiza um merge profundo entre o estado inicial do frontend e os dados salvos no banco. Múltiplos Textareas flexibilizam impressão.
3.  **Impacto no Dashboard**: A completitude da ficha altera o status do usuário de "Pendente" para "Aguardando Mentoria".

### Padronização e Estabilização de Sincronização
Para evitar inconsistências e redundâncias, implementamos:
1.  **Deduplicação por ID**: No processo de `fetchAndMergeDebts` e `fetchAndMergeGoals`, o sistema usa um `Set` de IDs já existentes para garantir que tarefas manuais não sejam duplicadas.
2.  **Herança de Referência Prioritária**: A Reunião 3, 4, 5 e 6 prioriza dados do Módulo Base (`previousMeetingData`) para sincronização temporal, inserindo botões nativos `Sincronizar` diretamente no bloco de edição do componente.
3.  **Feedback de Estado Transitório**: Botões de sincronização agora disparam estados de `loading`/`refreshing` com indicadores visuais.

### Regras de Negócio e Segurança
*   **Acesso Administrativo**: Apenas Admins podem alterar a Fase do Checklist de um aluno através do Dashboard ou forçar o Status final.
*   **Somente Leitura Padrão**: Quando o progresso da mentoria é visualizado pelo próprio `USER`, o checklist e as funcionalidades técnicas (Dívidas, Orçamento) entram no modo `readOnly` por segurança. A "Value Proposal M6" segue as mesmas travas.
*   **Permissão Dinâmica de Engajamento**: Como exceção arquitetural, a etapa **Sonhos e Metas** (`DreamsGoalsStage`) anula o bloqueio `readOnly` isoladamente. Isso permite que usuários logados com perfil `USER` continuem refinando e editando seus sonhos (em M4, M5 e M6) sem depender de intervenção administrativa, promovendo engajamento no Pós-Mentoria.

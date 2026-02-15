
# Arquitetura do Sistema

## 1. Stack Tecnológica
*   **Frontend**: React 19 (Vite) + TypeScript.
*   **Estilização**: Tailwind CSS + Shadcn UI concepts.
*   **Visualização**: Recharts (Gráficos) + Lucide React (Ícones).
*   **Backend**: Superbase (BaaS) - PostgreSQL, Auth, Realtime, Edge Functions.
*   **Relatórios e PDF**: Utilização nativa do browser via CSS Media Queries (`@media print`) para isolamento de conteúdo.
*   **Gerenciamento de Estado**: React Hooks (`useState`, `useEffect`, `useContext`).

## 2. Estrutura de Autenticação e Dados (`authService.ts`)
O sistema utiliza o cliente oficial do Supabase para todas as operações de dados e autenticação:

*   **Autenticação**: Supabase Auth (Email/Senha).
*   **Banco de Dados (PostgreSQL)**:
    *   `profiles`: Dados do usuário, role, status e controle de checklist (`checklist_data` JSONB para persistência de sub-itens e textos).
    *   `diagnostics`: Dados do diagnóstico financeiro (JSONB).
    *   `user_intakes`: Ficha de Anamnese e dados iniciais (acesso restrito Admin/Secretary).
    *   `debt_mappings`: Dívidas detalhadas.
    *   `cost_of_living`: Itens de custo de vida por categoria.

### Controle de Acesso (RBAC) e Visibilidade
O sistema implementa três níveis de permissão com regras de RLS (Row Level Security) e lógica de frontend:

1.  **ADMIN**:
    *   Acesso total ao Dashboard Administrativo.
    *   **Hierarquia de Visualização**: Admins no topo, seguidos por Secretários e Usuários.
    *   **Gestão de Checklist**: Pode visualizar e *editar* o checklist de qualquer usuário (incluindo observações de texto).
    *   **Impersonation**: Pode visualizar o Dashboard de qualquer usuário como se fosse ele.
2.  **SECRETARY**:
    *   Acesso restrito ao Dashboard (Listagem de Usuários e Intake).
    *   Pode preencher a Ficha Individual (`user_intakes`).
    *   Pode editar Checklists.
3.  **USER**:
    *   Acesso exclusivo ao próprio Dashboard e Diagnóstico.
    *   **Checklist Modo Leitura**: Pode visualizar o checklist e expandir itens para ver detalhes, mas *não pode alterar o status*.
4.  **Checklist Destruidor de Sanhaço (v2.0)**:
    *   **Estrutura de Dados (`checklist_data` JSONB)**:
        *   Armazena o estado de sub-checklists e observações de texto.
        *   Formato: `{ [stepId]: { subItems: { [subId]: { checked: boolean, value?: string } } } }`.
    *   **Fases do Checklist (`checklist_phase`)**:
        *   **LOCKED**: Usuário sem acesso ao checklist.
        *   **PHASE_1 (Diagnóstico)**: Foco em organização e "estancar o sangramento".
        *   **PHASE_2 (Retorno)**: Foco em negociação, reconciliação e limites de gastos.
    *   **Lógica de Negócio**:
        *   Transição de fase é controlada exclusivamente por Admins via Modal na Dashboard.
        *   Inputs condicionais aparecem com base na resposta (ex: "Quais dívidas não estão em dia?").
        *   Na Fase 2, o usuário define "Tetos de Gastos" para categorias críticas identificadas no diagnóstico.

### Prevenção de Poluição de Estado
*   **Modo de Visualização (Admin)**: Ao selecionar um usuário, o sistema injeta o ID do cliente nos componentes. As funções de salvamento alternam dinamicamente entre `saveMyData` (User) e `saveClientData` (Admin RPC) dependendo do contexto.
*   **RLS (Row Level Security)**:
    *   `profiles`: Users veem apenas o seu. Admins veem todos.
    *   `user_intakes`: Apenas Admins/Secretaries podem ler/escrever.

### Geração de Relatórios (PDF)
A funcionalidade de PDF utiliza isolamento CSS:
*   **CSS Isolation**: Classes `print:hidden` e `print:block` controlam a visibilidade.
*   **Print Mode**: Oculta menus, botões e fundos escuros.
*   **Header Dinâmico**: O componente `UserIntakeModal` e outros relatórios injetam um cabeçalho oficial (Logo, Nome, Contato) apenas na primeira página de impressão.

## 4. Segurança
*   **Row Level Security (RLS)**: Toda tabela possui políticas estritas garantindo que usuários só acessem seus próprios dados.
*   **RPCs Seguras**: Funções de banco de dados (`SECURITY DEFINER`) são usadas para permitir que Admins gerenciem dados de usuários sem violar as regras padrão de RLS.
    *   `save_diagnostic_by_admin`: Permite que Admins/Secretários salvem diagnósticos em nome de outros usuários.
    *   `save_checklist_data`: Atualiza o JSONB de checklist.

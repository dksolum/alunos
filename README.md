# SOLUM - Diagnóstico Financeiro Inteligente

Sistema de diagnóstico financeiro automatizado com análise de IA, gerenciamento de usuários e relatórios detalhados.

## 🚀 Funcionalidades Principais

### 1. Novo Fluxo Centrado no Dashboard
- **Painel Central**: Hub principal que gerencia o acesso aos módulos com base no progresso do usuário.
- **Módulos**:
  - **1. Anamnese**: Formulário comportamental detalhado (Prioridade #1).
  - **2. Mapeamento de Dívidas**: Cadastro detalhado de dívidas com cálculo automático de juros e prazos.
  - **3. Custo de Vida**: Mapeamento de despesas em 15 categorias com interface de Grid e Wizard.
  - **4. Diagnóstico Financeiro**: Assistente (Wizard) que consolida todos os dados para gerar o relatório final.

### 2. Módulo de Mentoria (Novo)
- **Estrutura de Reuniões**: 6 encontros progressivos para acompanhamento do cliente.
- **Reunião 1 (Fundação)**:
  - **Revisão Financeira**: Comparativo entre Orçado x Realizado.
  - **Gastos Não Recorrentes**: Cadastro de despesas anuais/semestrais.
- **Reunião 2 e 3 (Plano de Ação)**:
  - **Status do Plano**: Sincronização e auditoria de checklist.
  - **Plano "Turning Point"**: Foco em dívidas ainda não pagas.
- **Reunião 4 (Consolidação)**:
  - **Rastreamento de Dívida Prioritária**.
  - **Sonhos e Objetivos**: Algoritmo de Torneio para priorização comparativa.
- **Reunião 5 e 6 (Avançado)**:
  - **Mapeamento de Patrimônio (Asset Mapping)**: Cadastro de ativos (Liquidez, Fixos, etc.).
  - **Evolução Contínua**: Acompanhamento profundo da dedicação a sonhos vs reservas.
- **Sincronização em Cascata Plena**:
  - Fluxo estrito (M1 → M6) para Gastos Não Recorrentes e Dívidas, sem perda de edição local (Functional State Updaters).
- **Controle Administrativo**:
  - **Bloqueio/Desbloqueio**: Fechamento modular de atas.
- **Persistência e Segurança**: Dados salvos via Supabase com trava de segurança (RLS) e acesso administrativo via RPCs.

### 2. Relatórios Avançados e Impressão
- **Visão Geral**: Dashboard com gráficos de comprometimento de renda e saldo disponível.
- **Relatório Detalhado**: Lista filtrada de entradas e saídas.
- **Impressão Profissional / PDF**:
  - Layout otimizado para impressão (`@media print`) em todos os módulos.
  - Cabeçalhos personalizados com nome e contato do usuário.
  - Isolamento de conteúdo (remove menus e fundos escuros).
  - **Print Portal**: Estratégia de hoisting de conteúdo para garantir fidelidade visual e suporte a múltiplas páginas.

### 3. Sistema de Usuários e Perfis (Supabase Auth)
- **Autenticação Segura**: Integração completa com Supabase Auth e RLS (Row Level Security).
- **Perfis de Usuário**:
  - **USER**: Acesso apenas aos próprios dados.
  - **ADMIN**: Acesso total, gerenciamento de usuários e "Modo de Visualização" (Impersonation) para ver o dashboard como o cliente.
  - **SECRETARY**: Acesso administrativo restrito para criar usuários e preencher fichas.

### 4. Painel Administrativo & CRM
- **Ficha Individual (User Intake)**: Modal exclusivo para Admins/Secretários registrarem "Problema Principal", histórico do cliente e informações pessoais.
- **Persistência de Ficha**: Lógica robusta de salvamento e recuperação de dados (Profissão, Dependentes, Faixa de Renda) via Supabase RPC.
- **Gestão de Status Inteligente**: Dashboard reflete automaticamente o progresso do usuário e cargo (Admin vs standard).

### 5. Checklist Destruidor de Sanhaço (v2.1 - Multi-Fase)
- **Sistema de Fases**:
  - **Fase 1 (Diagnóstico)**: Organização inicial e levantamento de dívidas.
  - **Fase 2 (Retorno)**: Execução do plano, negociação estruturada de dívidas e definição de tetos de gastos.
- **Logica Avançada**:
  - **Sub-itens e Inputs**: Etapas com sub-tarefas e campos de texto condicionais.
  - **Negociação de Dívidas (Passo 11)**: Interface dedicada para listar dívidas do mapeamento, com campos para nova parcela, quantidade e juros.
  - **Comparação em Tempo Real**: Exibição da parcela original ("Parc. Atual") vs negociada, com indicadores coloridos de economia.

### 6. Painel Administrativo Otimizado
- **Hierarquia Visual**: Lista de usuários ordenada por cargo (Admin > Secretário > Usuário) e data de criação.
- **Busca e Filtros**: Localização rápida de alunos.
- **CRM Integrado**: Mudança de status (Novo, Consultoria, Mentoria) reflete visualmente no funil.

## Deploy

Para instruções de como subir este projeto para produção na Vercel, consulte o guia [DEPLOY.md](./DEPLOY.md).

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 19 (Vite) + TypeScript.
- **Estilização**: Tailwind CSS + Shadcn concepts.
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions, RLS).
- **Visualização**: Recharts (Gráficos) + Lucide React (Ícones).
- **Build Tool**: Vite.

## 🔧 Configuração e Instalação

### Pré-requisitos
- Node.js instalado.
- Conta no Supabase.

### Instalação

1. Clone o repositório:
   ```bash
   git clone <repositorio>
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   Crie um arquivo `.env.local` na raiz do projeto com:

   ```env
   VITE_SUPABASE_URL=sua_url_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima_supabase
   ```

4. Execute o projeto:
   ```bash
   npm run dev
   ```

## 📝 Histórico de Atualizações Recentes

- **Feat**: Implementação completa das **Reuniões 5 e 6** com Mapeamento Patrimonial e relatórios refinados (Ativos, Sonhos, e Rastreador de Dívidas).
- **Feat**: Módulo Dinâmico de **Acompanhamento (Pós-Mentoria)**: Criação do grid com 11 cards exclusivos (Milhas, Separação PJ e PF, Seguros, Planejamento de Carreira, etc.), desbloqueados estritamente na fase final (CONTACTED).
- **Feat**: Componente **Proposta de Valor da Mentoria** na Reunião 6, herdando automaticamente o histórico de dívidas acompanhadas (M3, M4, M5, M6) e listando dívidas restantes. Integrado ao dashboard exibido sob condicional de desbloqueio administrativo da Ata 6.
- **Fix (Critical)**: Refatoração da arquitetura de estados do Dashboard via _Functional State Updaters_ para curar condições de corrida (Stale Closures) e evitar sobrescrita fantasma de dados.
- **Fix (Critical)**: Inclusão do RPC `upsert_mentorship_meeting_by_admin` no Supabase para garantir salvamento consistente de reuniões quando um Admin/Secretária insere dados a favor de um aluno sem esbarrar no bloqueio RLS.
- **Feat**: Sincronização em cascata (M1 a M6) implementada 100% com dedicação à preservação do progresso local do usuário e _origin tags_ para Metas.
- **Feat**: Lógica avançada no Módulo de Dívidas Prioritárias em M5 e M6, registrando amortizações histórico-mês com cálculos de datas estendidas.
- **Fix**: Padronização da arquitetura de reuniões (M1-M4) para consistência de estado e persistência e reforço das travas de acesso automáticas.
- **Fix (Critical)**: Correção do erro de salvamento `new_data` nulo do Módulo Administrativo na **Reunião 1**, aplicando suporte completo a *Functional State Updaters* para viabilizar navegação segura entre abas.
- **UI**: Rastreamento visual de origem de dívidas e metas com etiquetas coloridas (Mapeamento/M2/M3/M4/M5/M6).

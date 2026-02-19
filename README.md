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
  - **Revisão Financeira**: Comparativo entre Orçado x Realizado do diagnóstico.
  - **Gastos Não Recorrentes**: Cadastro de despesas anuais/semestrais (IPVA, IPTU, etc.) com cálculo automático de reserva mensal.
  - **Sistema de Relatórios**: Impressão seletiva de etapas com cabeçalho personalizado.
- **Reunião 4 (Consolidação e Futuro)**:
  - **Status do Plano**: Rastreamento específico da dívida prioritária definida na Reunião 3.
  - **Sonhos e Objetivos**: Sistema de priorização comparativa (Torneio) para organizar metas de vida.
  - **Relatórios Customizados**: 4 modalidades de impressão (Revisão, Gastos, Dívidas, Sonhos).
  - **Padronização de Tarefas**: Gestão de tarefas mandatórias para conclusão da mentoria.
- **Sincronização em Cascata**:
  - Fluxo contínuo de dados (M1 → M2 → M3 → M4) para Gastos Não Recorrentes e Itens de Revisão.
  - Inteligência de Merge: Preserva itens locais enquanto herda a evolução das reuniões anteriores.
- **Controle Administrativo**:
  - **Bloqueio/Desbloqueio (Lock/Unlock)**: Admins e Secretários podem liberar reuniões futuras ou bloquear reuniões em andamento.
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

- **Feat**: Implementação completa da **Reunião 4** com Torneio de Priorização de Sonhos e Relatórios Customizados.
- **Fix**: Padronização da arquitetura de reuniões (M1-M4) para consistência de estado e persistência.
- **Fix**: Correção crítica no sistema de tarefas da Reunião 4 e sincronização de status de dívidas (`isPaid`).
- **Feat**: Sincronização em cascata de Gastos Não Recorrentes entre todas as reuniões.
- **Feat**: Implementação completa da **Reunião 3** (Plano de Quitação) com estratégia "Turning Point".
- **Fix**: Persistência robusta da Ficha Individual (User Intake) e refinamento de status no Dashboard Admin.
- **UI**: Rastreamento visual de origem de dívidas com etiquetas coloridas (Mapeamento/M2/M3).

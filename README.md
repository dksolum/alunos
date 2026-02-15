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

### 2. Relatórios Avançados e Impressão
- **Visão Geral**: Dashboard com gráficos de comprometimento de renda e saldo disponível.
- **Relatório Detalhado**: Lista filtrada de entradas e saídas.
- **Impressão Profissional / PDF**:
  - Layout otimizado para impressão (`@media print`) em todos os módulos.
  - Cabeçalhos personalizados com nome e contato do usuário.
  - Isolamento de conteúdo (remove menus e fundos escuros).

### 3. Sistema de Usuários e Perfis (Supabase Auth)
- **Autenticação Segura**: Integração completa com Supabase Auth e RLS (Row Level Security).
- **Perfis de Usuário**:
  - **USER**: Acesso apenas aos próprios dados.
  - **ADMIN**: Acesso total, gerenciamento de usuários e "Modo de Visualização" (Impersonation) para ver o dashboard como o cliente.
  - **SECRETARY**: Acesso administrativo restrito para criar usuários e preencher fichas.

### 4. Painel Administrativo & CRM
- **Ficha Individual (User Intake)**: Modal exclusivo para Admins/Secretários registrarem "Problema Principal" e histórico do cliente.
- **Gestão de Status**: Controle visual de funil (Novo > Consultoria > Mentoria > Acompanhamento).
- **Ações Rápidas**: Editar perfil, alterar status, visualizar dashboard do cliente.

### 5. Checklist Destruidor de Sanhaço (v2.1 - Multi-Fase)
- **Sistema de Fases**:
  - **Fase 1 (Diagnóstico)**: Organização inicial e levantamento de dívidas.
  - **Fase 2 (Retorno)**: Execução do plano, negociação e definição de tetos de gastos.
- **Logica Avançada**:
  - **Sub-itens e Inputs**: Etapas com sub-tarefas e campos de texto condicionais.
  - **Tetos de Gastos**: Usuário define metas para categorias ofensoras (ex: "Mercado", "Lazer").
- **Estados Visuais**:
  - **Pendente (Cinza)**: Não iniciado.
  - **Em Progresso (Amarelo/Azul)**: Sub-itens marcados ou texto preenchido.
  - **Concluído (Verde)**: Etapa finalizada.
- **Controle de Acesso Hierárquico**:
  - **Admins** selecionam a fase do aluno via Dashboard.
  - **Admins/Secretários**: Podem editar qualquer checklist.
  - **Usuários**: Modo "Somente Leitura" (podem expandir para ver detalhes).

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

- **Fix**: Persistência de dados do checklist corrigida (Admin agora vê e salva dados de texto corretamente).
- **Feat**: Hierarquia de usuários no Dashboard Admin (Admin > Secretário > Usuário).
- **Feat**: Checklist 2.0 com sub-itens, inputs condicionais e estados visuais (Pendente/Em Progresso/Concluído).
- **Feat**: Modo "Somente Leitura" no checklist para usuários comuns.
- **Fix**: Correção de impressão (páginas em branco e vazamento de conteúdo admin).
- **Fix**: Contexto de salvamento de diagnóstico por Admins (RPC `save_diagnostic_by_admin`).
- **Feat**: Remoção simplificada de Cartões de Crédito dos relatórios.
- **Feat**: Implementação completa do módulo **Ficha Individual** (User Intake) com persistência no banco.
- **Refactor**: Nova estrutura de Dashboard com bloqueio progressivo de módulos.
- **Infra**: Migração completa de LocalStorage para Supabase com RLS.


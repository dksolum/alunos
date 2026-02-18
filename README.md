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
- **Reunião 2 (Ajuste de Rota)**:
  - **Sincronização de Dados**: Herança automática do "Definido" da reunião anterior como "Referência" na atual.
  - **Etapa "Atualização de Dívidas"**: Acompanhamento de negociações e inserção de novas dívidas.
- **Reunião 3 (Plano de Quitação)**:
  - **Estratégia "Turning Point"**: Foco em dívidas não pagas para liberação definitiva de fluxo de caixa.
  - **Plano de Quitação**: Visualização estratégica da ordem de pagamento e impacto financeiro futuro.
  - **Refinamento de Margens**: Comparativo individual de propostas (SERASA vs Canal Oficial) e feedback de amortização com indicação de sobra/falta de fluxo.
  - **Data de Previsão**: Rastreamento da data prevista para retirada do nome dos órgãos de proteção ao crédito.
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
  - **Fase 2 (Retorno)**: Execução do plano, negociação estruturada de dívidas e definição de tetos de gastos.
- **Logica Avançada**:
  - **Sub-itens e Inputs**: Etapas com sub-tarefas e campos de texto condicionais.
  - **Negociação de Dívidas (Passo 11)**: Interface dedicada para listar dívidas do mapeamento, com campos para nova parcela, quantidade e juros.
  - **Comparação em Tempo Real**: Exibição da parcela original ("Parc. Atual") vs negociada, com indicadores coloridos de economia.
  - **Tetos de Gastos**: Usuário define metas para categorias ofensoras (ex: "Mercado", "Lazer").
- **Card Proposta de Valor da Consultoria (Premium)**:
  - **Estética Positiva**: Substituição de tons de alerta (vermelho) por **Índigo e Azul** para promover calma e foco em resultados.
  - **Destaques de Realização**: Brilho verde pulsante (glow) e texto riscado (strikethrough) em valores reduzidos nos cards de **Dívidas** e **Custo de Vida**.
  - **Impacto na Vida**: Exibição da porcentagem exata de redução nas parcelas mensais de dívidas.
  - **Persistência Inteligente**: Se uma dívida não for negociada, o sistema mantém e soma o valor original no cenário "Depois".
  - **Gestão de Dívidas Avançada (Reunião 3)**:
  - **Sincronização Inteligente**: Deduplicação por ID e feedback visual (loading state) na sincronização com reuniões anteriores.
  - **Estratégia de Quitação**: Filtro automático de dívidas pendentes para priorização de pagamento.
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

- **Feat**: Implementação completa da **Reunião 3** (Plano de Quitação).
- **Fix**: Prevenção de loop de duplicação infinita na sincronização de dívidas (Deduplicação por ID).
- **UI**: Feedback visual (loading/spin) no botão de sincronização "Sincronizar M2".
- **Refactor**: Sincronização de Gastos Não Recorrentes agora prioriza dados da reunião anterior para consistência.
- **Feat**: Nova etapa "Atualização de Dívidas" na Reunião 2 da Mentoria com preenchimento via Checklist.


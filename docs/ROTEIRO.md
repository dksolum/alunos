
# Roteiro do Produto (Roadmap)

## ✅ Fase 1: MVP & Experiência do Usuário (Concluído)
- [x] **Wizard de Coleta**: Etapas de Trabalho, Renda, Cartões, Fixas, Dívidas e Variáveis.
- [x] **Cálculos Core**: Conversão de dinheiro em tempo de vida.
- [x] **Motor de Análise**: Implementação de lógica heurística local (Mensagens pré-definidas com rotação).
- [x] **UI/UX**: Design System Dark/Neon e Responsividade.

## ✅ Fase 2: Gestão, CRM e Persistência (Concluído)
- [x] **Autenticação**: Sistema de Login e Cadastro funcional (via localStorage).
- [x] **Segurança (Refatoração)**: Remoção completa de dependências externas.
- [x] **Persistência Inteligente**: Usuário não perde dados ao recarregar.
- [x] **Painel Administrativo**: Listagem, filtros e redefinição de senhas.
- [x] **CRM Integrado**: Gestão de status e responsável.
- [x] **Isolamento de Dados**: Reset de estado ao trocar de usuário.
- [x] **Edição de Diagnóstico**: Admin/Secretário podem ajustar valores.

## ✅ Fase 2.5: Refinamento do Relatório (Concluído)
- [x] **Aba de Detalhamento**: Visualização em lista de todos os itens lançados (Extrato).
- [x] **Detalhamento de Parcelas**: Visualização explícita de parcelas restantes, valor mensal e data final para Cartões e Dívidas.
- [x] **Exportação PDF**: Geração de arquivo PDF do relatório final via isolamento de CSS (`@media print`).

## ✅ Fase 3: Infraestrutura & Escala (Concluído)
A migração para um backend real foi realizada para permitir sincronização e segurança.

- [x] **Migração para Supabase (Backend as a Service)**:
    - [x] Projeto Configurado.
    - [x] Modelagem de Banco de Dados (PostgreSQL): `profiles`, `diagnostics`, `debt_mappings`, `cost_of_living`, `user_intakes`.
    - [x] Cliente Oficial Supabase implementado (`authService.ts`).
- [x] **Segurança de Dados**:
    - [x] Row Level Security (RLS) implementado em todas as tabelas.
    - [x] RPCs Seguras para administração.

## ✅ Fase 4: Módulos Avançados & Dashboard (Concluído)
- [x] **Novo Fluxo de Dashboard**: Anamnese -> Dívidas -> Custo de Vida -> Diagnóstico.
- [x] **Mapeamento de Dívidas**: Cadastro detalhado com cálculo de juros.
- [x] **Custo de Vida Ideal**: Wizard/Grid para 15 categorias de despesas.
- [x] **Ficha Individual (User Intake)**: Modal exclusivo para Admins.
- [x] **Relatórios Profissionais**: Layout de impressão limpo e cabeçalhos personalizados.
- [x] **Checklist Destruidor de Sanhaço**: Guia de guerra passo-a-passo com barra de progresso.

## ✅ Fase 5: Expansão (Em Andamento)
- [x] **Módulos de Mentoria**: Reunião 1, 2 e 3 100% integradas.
    - [x] Gestão de Gastos Não Recorrentes (Mapeamento Linear).
    - [x] **Etapa "Plano de Quitação" (Novo)**: Estratégia Turning Point na Reunião 3.
    - [x] Sincronização automática de metas e deduplicação de dívidas.
    - [x] Sistema de Bloqueio/Desbloqueio (Lock/Unlock) para Admins.
- [x] **Checklist v2.2 (Refinamento de Negociação & Estética)**:
    - [x] Integração bidirecional com Mapeamento de Dívidas.
    - [x] Lógica de fallback para parcelas não negociadas.
    - [x] **Card de Proposta de Valor Premium**: Overhaul estético e brilho de conquista.
    - [x] **Estabilização de Dados**: Prevenção de loops de duplicação e feedback de UI.
- [x] **Otimização de Impressão**: Relatórios de Revisão, Gastos e Dívidas (Alto contraste).
- [ ] **Integrações Futuras**:
    - [ ] WhatsApp API para lembretes.
- [ ] **Próximas Reuniões**: Desenvolver Reuniões 4 a 6.
- [ ] **Dashboard de Métricas**: Gráficos para o Admin.

## 📥 Idea Inbox
- **Histórico**: Permitir que o usuário salve "versões" do diagnóstico (ex: Janeiro, Fevereiro).

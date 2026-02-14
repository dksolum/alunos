
# Erros Conhecidos e Limitações Técnicas

Este documento visa transparência sobre a fragilidade do software em seu estágio atual (MVP Local).

## 1. Limitações de Arquitetura (Crítico)
*   **Sincronização de Dados (Browser-Bound)**:
    *   O sistema usa `localStorage`. Portanto, **não há sincronização em tempo real** entre dispositivos.
    *   Se um Administrador editar o diagnóstico de um Usuário, essa alteração fica salva apenas no computador do Administrador. O Usuário não verá essa mudança no celular dele.
    *   *Solução*: Migração para Supabase (Fase 3 - Prioridade Máxima).
*   **Segurança de Credenciais**: As senhas estão salvas no navegador em texto simples (JSON). Isso serve apenas para prototipação do fluxo.

## 2. UX / Usabilidade
*   **Inputs Numéricos**: O comportamento de inputs numéricos em iOS/Android pode variar (teclado decimal vs numérico).
*   **Reset de Estado**: Ao fazer logout, o formulário é limpo visualmente. Se o usuário recarregar a página (F5) na tela de login, os dados podem persistir visualmente até um novo login ocorrer (comportamento de cache do React state), embora não afete o banco de dados.

## 3. Lógica de Negócios
*   **Concorrência**: Inexistente. O modelo atual é "single-player" por dispositivo.

## 4. IA (Mock Engine)
*   **Feedback Genérico**: Como removemos a dependência do Google Gemini para evitar custos e complexidade no MVP, as análises são baseadas em templates pré-definidos (Positivo/Negativo/Neutro). Embora funcionais, elas são menos específicas do que uma análise de LLM real.

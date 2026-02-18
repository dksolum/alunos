
# Erros Conhecidos e Limitações Técnicas

Este documento visa transparência sobre o estado atual do software e limitações identificadas.

## 1. Módulos em Desenvolvimento
*   **Mentoria (Reuniões 4-6)**: O conteúdo das reuniões 4 a 6 ainda está em fase de planejamento. Atualmente, as reuniões 1, 2 e 3 possuem fluxos completos de dados, estratégias de quitação e relatórios.
*   **Dashboard de Métricas**: O painel administrativo de conversão de leads e retenção de alunos ainda não foi implementado.

## 2. Interface e UX
*   **Mobile Experience**: Embora responsivo, a visualização de tabelas densas (como o ReviewStage ou Mapeamento de Dívidas) é otimizada para Desktop. Em dispositivos móveis, pode ser necessário o scroll horizontal.
*   **Modo de Impressão (iOS)**: O "Print Portal" funciona perfeitamente em navegadores Desktop (Chrome/Safari/Edge). Em roteadores mobile, a formatação de "Páginas" pode variar dependendo do suporte do sistema operacional ao `@media print`.

## 3. Sincronização e Cache
*   **Refresh de Estado**: Após o Admin salvar alterações no diagnóstico ou mentoria de um aluno, o aluno pode precisar recarregar a página (F5) para ver as mudanças refletidas imediatamente se ele estiver com a sessão ativa no momento da edição.
*   **Concorrência**: O sistema não possui lock de edição simultânea. Se mentor e aluno editarem o mesmo campo ao mesmo tempo, o último save irá prevalecer.

## 4. IA e Análises
*   **Motor Estático**: As análises automáticas atuais são baseadas em heurísticas e templates. A integração com o Google Gemini (IA Generativa) está mapeada para fases futuras para fornecer feedbacks personalizados por texto.

## 5. Limitações de Exportação
*   **PDF Nativo**: A exportação para PDF depende da função `window.print()` do navegador. Não há um gerador de PDF server-side (ex: Puppeteer) no momento.

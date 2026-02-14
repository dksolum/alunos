# Guia de Deploy na Vercel

Este projeto está pronto para ser implantado na [Vercel](https://vercel.com/). Siga os passos abaixo para colocar o site no ar.

## Pré-requisitos

1. Uma conta na [Vercel](https://vercel.com/signup).
2. O código do projeto estar no seu [GitHub](https://github.com/dksolum/alunos).

## Passo a Passo

1. Acesse o [Dashboard da Vercel](https://vercel.com/dashboard).
2. Clique em **"Add New..."** e selecione **"Project"**.
3. Em **"Import Git Repository"**, encontre o repositório `dksolum/alunos` e clique em **"Import"**.

## Configuração do Projeto

Na tela de configuração do deploy:

1. **Framework Preset**: A Vercel deve detectar automaticamente como `Vite`. Se não, selecione `Vite`.
2. **Root Directory**: Mantenha `./` (padrão).

### Variáveis de Ambiente

Este é o passo mais importante. Abra a seção **"Environment Variables"** e adicione as seguintes chaves (copie os valores do seu arquivo local `.env.local` ou do projeto Supabase):

| Key | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | `https://qpswpkwwbtaahtsexeiy.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `Sua chave ANON pública do Supabase` |

> **Nota:** Certifique-se de copiar a chave `ANON` e não a `SERVICE_ROLE` (secreta).

3. Clique em **"Deploy"**.

## Pós-Deploy

- Aguarde a construção do projeto.
- Quando finalizado, você receberá uma URL (ex: `alunos.vercel.app`).
- Teste o login e o fluxo de diagnóstico para garantir que a conexão com o Supabase está funcionando.

## Atualizações Futuras

Qualquer *commit* e *push* que você fizer na branch `main` do GitHub disparará automaticamente um novo deploy na Vercel com as alterações.

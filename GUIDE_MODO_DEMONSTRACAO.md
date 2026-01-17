# Guia do Modo de Demonstração (Demo Mode)

Este projeto está atualmente configurado para rodar em **Modo de Demonstração**. Isso permite que você desenvolva, teste e navegue por todo o aplicativo sem precisar de uma conexão ativa com o Supabase ou chaves de API reais.

## Como Funciona
O sistema detecta automaticamente se as chaves em `.env.local` são inválidas ou estão ausentes. Se forem, ele substitui o cliente real do Supabase por um **Mock Client** (`src/lib/mockSupabase.ts`).

### Funcionalidades Simuladas
Simulamos as seguintes operações para que a UI funcione perfeitamente:
- **Autenticação**: Qualquer email/senha é aceito. O login persiste apenas na sessão do navegador.
- **Banco de Dados**: Consultas de leitura (SELECT) retornam dados fictícios de exemplo. Operações de escrita (INSERT/UPDATE) são "sucesso" (logadas no console) mas não persistem após recarregar a página (exceto sessão).
- **Storage**: Uploads de arquivos retornam URLs fictícias instantaneamente.

## Como Ativar o Modo Real (Produção)
Para sair do modo de demonstração e conectar com um banco de dados real:

1. Crie um projeto no [Supabase](https://supabase.com).
2. Obtenha a `Project URL` e a `anon public key` nas configurações do projeto.
3. Edite o arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-publica
```

4. Reinicie o servidor de desenvolvimento (`npm run dev`).
5. Execute os scripts SQL contidos em `supabase_schema.sql` no painel SQL do Supabase para criar as tabelas.

## Solução de Problemas
- **Tela Branca/Carregamento Infinito**: Se o app tentar conectar ao Supabase real com chaves erradas, ele pode travar. O Modo Demo evita isso, mas verifique o console do navegador (F12) se notar problemas.
- **Login não funciona**: No modo demo, clique em "Receber Link" e aguarde. Se não redirecionar, verifique se a rota `/dashboard` existe.

---
*Este arquivo documenta o estado atual do projeto em 15/01/2026.*

# Agente de Verificação IA

Um sistema completo de verificação de e-mail em duas etapas para integração com agentes ChatGPT, desenvolvido com Next.js, Supabase e Vercel.

## 🚀 Funcionalidades

- ✅ Verificação de e-mail em duas etapas
- 🔒 Sistema de segurança robusto com rate limiting
- 📧 Envio automático de códigos de verificação
- 🎨 Interface responsiva e intuitiva
- ⚡ Arquitetura serverless escalável
- 🛡️ Conformidade com GDPR e melhores práticas de segurança

## 🏗️ Arquitetura

- **Frontend:** Next.js 14 com App Router e TypeScript
- **Backend:** API Routes serverless do Next.js
- **Base de Dados:** Supabase (PostgreSQL)
- **Deployment:** Vercel
- **Styling:** Tailwind CSS

## 📋 Pré-requisitos

- Node.js 18+ 
- Conta no Supabase
- Conta no Vercel
- Conta no GitHub

## 🛠️ Instalação

1. **Clone o repositório:**
```bash
git clone https://github.com/Giovannipff/agente-verificacao-ia.git
cd agente-verificacao-ia
```

2. **Instale as dependências:**
```bash
pnpm install
# ou
npm install
```

3. **Configure as variáveis de ambiente:**
Crie um ficheiro `.env.local` na raiz do projeto:
```env
# Configurações do Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-chave-de-service-role
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima

# Configurações de E-mail (opcional para desenvolvimento)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app
SMTP_FROM=seu-email@gmail.com

# Configurações de Segurança
ALLOWED_ORIGINS=http://localhost:3000
NODE_ENV=development
```

4. **Configure a base de dados no Supabase:**
Execute o SQL fornecido em `supabase/migrations/` para criar as tabelas necessárias.

5. **Execute o projeto localmente:**
```bash
pnpm dev
# ou
npm run dev
```

## 🔧 Configuração do Supabase

1. Crie um novo projeto no [Supabase](https://supabase.com)
2. Execute a migração SQL para criar a tabela `verification_codes`
3. Configure as políticas de Row Level Security (RLS)
4. Obtenha as chaves de API nas configurações do projeto

## 🚀 Deployment

O projeto está configurado para deployment automático no Vercel:

1. Conecte o repositório GitHub ao Vercel
2. Configure as variáveis de ambiente no painel do Vercel
3. O deployment acontece automaticamente a cada push para `main`

## 📖 Como Usar

### Para Utilizadores Finais

1. Aceda à aplicação através do URL fornecido
2. Insira o seu e-mail de compra
3. Verifique o seu e-mail para receber o código de verificação
4. Insira o código de 6 dígitos
5. Prossiga com a conversa no agente ChatGPT após verificação bem-sucedida

### Para Integração com ChatGPT

Configure o seu agente ChatGPT para redirecionar utilizadores para o sistema de verificação quando necessário:

```
Quando um utilizador solicitar acesso a funcionalidades premium, 
redirecione-o para: [URL_DA_SUA_APLICACAO]

Instrua o utilizador a:
1. Inserir o e-mail de compra
2. Verificar o e-mail para o código
3. Inserir o código de verificação
4. Retornar à conversa após verificação
```

## 🔌 APIs

### Verificar E-mail
```http
POST /api/verify-email
Content-Type: application/json

{
  "email": "utilizador@exemplo.com"
}
```

### Verificar Código
```http
POST /api/verify-code
Content-Type: application/json

{
  "email": "utilizador@exemplo.com",
  "code": "123456"
}
```

## 🛡️ Segurança

- Rate limiting: 5 tentativas de e-mail por 15 minutos
- Códigos expiram em 5 minutos
- Validação rigorosa de entrada
- Logging de eventos de segurança
- Conformidade com GDPR

## 📊 Monitorização

O sistema inclui logging abrangente e métricas de performance:
- Logs estruturados em JSON
- Métricas de taxa de sucesso
- Monitorização de performance
- Alertas automáticos para problemas críticos

## 🤝 Contribuição

1. Faça fork do projeto
2. Crie uma branch para a sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit as suas alterações (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o ficheiro [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

Para suporte e questões:
- Abra uma issue no GitHub
- Consulte a [documentação completa](DOCUMENTACAO.md)
- Verifique os logs de erro no painel do Vercel

## 🔗 Links Úteis

- [Documentação Completa](DOCUMENTACAO.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

---

**Desenvolvido por:** Manus AI  
**Versão:** 1.0  
**Data:** Junho 2025


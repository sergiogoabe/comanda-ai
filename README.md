# ComandaAI - Plataforma SaaS de Comandas Inteligentes

Plataforma completa para gestão de pedidos em restaurantes e bares com IA conversacional.

## 🚀 Como Iniciar

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar ambiente

Copie `.env.example` para `.env.local` e preencha:

```bash
cp .env.example .env.local
```

**Variáveis obrigatórias:**
- `DATABASE_URL` - Conexão PostgreSQL
- `NEXTAUTH_SECRET` - Segredo para autenticação
- `NEXTAUTH_URL` - URL do sistema

**Variáveis opcionais:**
- `OPENAI_API_KEY` - Para Chat AI com OpenAI
- `MERCADO_PAGO_ACCESS_TOKEN` - Para PIX real

### 3. Banco de dados

```bash
# Gerar client Prisma
npx prisma generate

# Criar tabelas (desenvolvimento)
npx prisma db push

# Ou usar migrations (produção)
npx prisma migrate dev
```

### 4. Popular dados iniciais (opcional)

```bash
npm run db:seed
```

### 5. Iniciar desenvolvimento

```bash
npm run dev
```

Acesse: `http://localhost:3000`

## 📱 Funcionalidades

### Para o Cliente
- ✅ Chat com IA para pedidos
- ✅ Cardápio digital interativo
- ✅ Pagamento via PIX
- ✅ Divisão de conta
- ✅ Histórico de pedidos

### Para o Restaurante
- ✅ Painel da cozinha em tempo real
- ✅ Gestão de mesas e comandas
- ✅ CRM de clientes
- ✅ Relatórios e métricas
- ✅ Dashboard administrativo

### Para o Admin SaaS
- ✅ Gestão de estabelecimentos
- ✅ Planos e assinaturas
- ✅ Métricas gerais

## 🛠️ Tecnologias

- **Framework:** Next.js 14 (App Router)
- **Banco:** PostgreSQL + Prisma
- **Auth:** NextAuth.js
- **IA:** OpenAI GPT-4o-mini (opcional)
- **Pagamentos:** Mercado Pago (PIX)
- **Deploy:** Vercel

## 📦 Scripts

```bash
npm run dev          # Desenvolvimento
npm run build        # Produção
npm run start        # Iniciar produção
npm run lint         # ESLint
npm run db:generate  # Gerar Prisma Client
npm run db:push      # Atualizar banco
npm run db:seed      # Popular dados
npm run db:studio    # Prisma Studio
```

## 🔐 Segurança

- `.env.local` NÃO é versionado
- Segredos devem ficar no servidor
- HTTPS obrigatório em produção
- Rate limiting nas APIs

## 📝 Estrutura

```
├── src/
│   ├── app/           # Rotas Next.js
│   ├── components/    # Componentes React
│   ├── lib/           # Utilitários
│   └── store/         # Zustand store
├── prisma/
│   ├── schema.prisma  # Modelo de dados
│   └── seed.ts        # Dados iniciais
└── .env.local         # Variáveis de ambiente
```

## 🚨 Produção

1. Configure variáveis de ambiente no Vercel/Cloud
2. Execute `prisma migrate deploy`
3. Faça build: `npm run build`
4. Inicie: `npm run start`

## 🆘 Suporte

- Documentação: `/docs`
- Issues: GitHub Issues
- Email: suporte@comanda.ai

## 📄 Licença

MIT

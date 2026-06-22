# Infinity Comanda AI

Plataforma SaaS de comandas inteligentes para bares e restaurantes.

## Setup para Produção

### 1. Banco de Dados (Neon - gratuito)

1. Acesse https://neon.tech e crie uma conta
2. Crie um projeto e um banco de dados chamado `comanda_saas`
3. Copie a connection string (ex: `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/comanda_saas?sslmode=require`)

### 2. Configure as Variáveis de Ambiente

```bash
cp .env.example .env
```

Edite `.env` com:
- `DATABASE_URL` — sua connection string do Neon
- `NEXTAUTH_SECRET` — gere com: `openssl rand -base64 32`
- `NEXTAUTH_URL` — `https://infinity-comanda-ai.vercel.app`

### 3. Rode as Migrations e Seed

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

Isso cria:
- Usuário demo: `admin@demo.com` / `demo123`
- Estabelecimento "Bar & Restaurante Demo" (slug: `demo`)
- 10 mesas
- 5 categorias de cardápio

### 4. Deploy na Vercel

1. Acesse https://vercel.com/dashboard
2. Importe o repositório
3. Adicione as env vars nas configurações do projeto:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
4. Deploy

### 5. Use a Plataforma

- **Landing**: `https://infinity-comanda-ai.vercel.app`
- **Chat (cliente)**: `https://infinity-comanda-ai.vercel.app/chat/mesa-1?estabelecimento=demo`
- **Cozinha**: `https://infinity-comanda-ai.vercel.app/cozinha`
- **Dashboard**: `https://infinity-comanda-ai.vercel.app/login`

## QR Codes

Cada mesa tem seu QR Code apontando para:
```
https://infinity-comanda-ai.vercel.app/chat/mesa-{numero}?estabelecimento={slug-do-restaurante}
```

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- NextAuth (Credentials)
- Zustand (state management)

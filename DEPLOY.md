# 🚀 Guia de Implantação - ComandaAI

## ✅ Checklist Pré-Implantação

### 1. Ambiente
- [ ] `.env.local` configurado com todas as variáveis
- [ ] Banco de dados PostgreSQL acessível
- [ ] Chaves de API configuradas (OpenAI, Mercado Pago)

### 2. Banco de Dados
```bash
# Desenvolvimento
npx prisma generate
npx prisma db push

# Produção (com migrations)
npx prisma generate
npx prisma migrate deploy
```

### 3. Build Local (verificação)
```bash
npm run build
```

## 🌐 Implantação na Vercel

### Passo 1: Preparar Repositório

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <seu-repositorio>
git push -u origin main
```

### Passo 2: Conectar na Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Importe o repositório
3. Configure as variáveis de ambiente:

**Obrigatórias:**
```
DATABASE_URL=postgresql://user:pass@host:5432/db
NEXTAUTH_SECRET=sua-chave-secreta-aleatoria
NEXTAUTH_URL=https://seu-app.vercel.app
```

**Opcionais:**
```
OPENAI_API_KEY=sk-...
MERCADO_PAGO_ACCESS_TOKEN=APP-...
```

### Passo 3: Deploy

```bash
# Instalar Vercel CLI (opcional)
npm i -g vercel

# Fazer deploy
vercel --prod
```

## 🐳 Docker (Opcional)

### Dockerfile
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/comanda
      - NEXTAUTH_SECRET=segredo
      - NEXTAUTH_URL=http://localhost:3000
    depends_on:
      - db
  
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: comanda
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## 🔧 Resolução de Problemas

### Erro: "Failed to load SWC binary"
- **Causa:** Ambiente Android/Termux sem suporte completo
- **Solução:** Build funciona na Vercel/produção normalmente

### Erro: "DATABASE_URL não encontrada"
- Verifique `.env.local`
- No Vercel: Settings → Environment Variables

### Erro: "Prisma Client not generated"
```bash
npx prisma generate
```

### Erro: "NextAuth configuration invalid"
- Verifique `NEXTAUTH_SECRET` (mínimo 32 caracteres)
- Use: `openssl rand -base64 32`

## 📊 Monitoramento

### Logs na Vercel
```bash
vercel logs <deployment-url>
```

### Health Check
Acesse: `https://seu-app.vercel.app/api/health` (criar endpoint)

## 🔐 Segurança Produção

1. **HTTPS:** Automático na Vercel
2. **Rate Limiting:** Já implementado
3. **CORS:** Configurar origins permitidos
4. **Secrets:** Nunca commitar `.env`
5. **Database:** Usar connection pool

## 📈 Otimização

### Performance
- [ ] Habilitar caching no Next.js
- [ ] Usar ISR para páginas estáticas
- [ ] Otimizar imagens (next/image)
- [ ] Lazy loading em componentes

### Banco de Dados
- [ ] Índices criados (já no schema)
- [ ] Connection pooling
- [ ] Query optimization

## 🆘 Suporte

- Docs: https://nextjs.org/docs
- Vercel: https://vercel.com/docs
- Prisma: https://pris.ly/d/prisma-schema

# 🎯 Setup Inicial Rápido - ComandaAI

## ⚡ Primeiros Passos (5 minutos)

### 1. Configurar Ambiente

```bash
# 1. Copiar arquivo de ambiente
cp .env.example .env.local

# 2. Gerar segredo para autenticação
# No Linux/Mac:
openssl rand -base64 32
# No Windows: powershell -Command "ConvertTo-SecureString -AsPlainText (New-Object System.Guid).ToString() -Force -PassThru | ConvertFrom-SecureString | Select-Object -ExpandProperty SecretText"

# 3. Preencher .env.local com suas chaves
```

### 2. Instalar e Configurar Banco

```bash
# Instalar dependências
npm install

# Gerar Prisma Client
npx prisma generate

# Criar tabelas no banco
npx prisma db push
```

### 3. Popular Dados de Exemplo

```bash
# Rodar seed (opcional, mas recomendado para testes)
npm run db:seed
```

### 4. Iniciar Sistema

```bash
npm run dev
```

Acesse: **http://localhost:3000**

---

## 📱 Configurando Primeiro Estabelecimento

### Passo 1: Criar Conta Admin

1. Acesse `/register`
2. Preencha email e senha
3. Crie seu estabelecimento

### Passo 2: Configurar Cardápio

1. Acesse `/estabelecimento/[id]/menu`
2. Adicione categorias (Ex: Bebidas, Pratos Principais, Sobremesas)
3. Cadastre produtos com preços e fotos

### Passo 3: Cadastrar Mesas

1. Acesse `/estabelecimento/[id]/tables`
2. Adicione mesas (Ex: 1, 2, 3, VIP1, VIP2)
3. Baixe QR Codes para imprimir

### Passo 4: Testar Pedido

1. Abra link do QR Code de uma mesa
2. Faça um pedido via Chat AI
3. Acompanhe na Cozinha

---

## 🏗️ Implantação Produção

### Vercel (Recomendado)

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Fazer deploy
vercel --prod

# 3. Configurar variáveis no site da Vercel
# DATABASE_URL, NEXTAUTH_SECRET, etc.
```

### Variáveis Produção

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="sua-chave-secreta"
NEXTAUTH_URL="https://seu-app.vercel.app"
OPENAI_API_KEY="sk-..."  # Opcional
MERCADO_PAGO_ACCESS_TOKEN="APP-..."  # Opcional
```

---

## 🧪 Testes Rápidos

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Testar Chat AI
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Olá"}]}'
```

### Testar Banco
```bash
npx prisma studio
```

---

## 🆘 Problemas Comuns

### Erro: "DATABASE_URL not found"
```bash
# Verifique se .env.local existe
cat .env.local
```

### Erro: "Prisma schema validation"
```bash
# Rode novamente
npx prisma generate
npx prisma db push
```

### Erro: "NEXTAUTH_SECRET inválido"
```bash
# Gere nova chave
openssl rand -base64 32
# Atualize .env.local
```

### Erro: "Port 3000 already in use"
```bash
# Mude a porta
PORT=3001 npm run dev
```

---

## 📊 URLs Importantes

| Função | URL |
|--------|-----|
| Home | http://localhost:3000 |
| Login | http://localhost:3000/login |
| Dashboard | http://localhost:3000/dashboard |
| Cozinha | http://localhost:3000/cozinha |
| Cardápio | http://localhost:3000/estabelecimento/[id]/menu |
| Mesas | http://localhost:3000/estabelecimento/[id]/tables |
| CRM | http://localhost:3000/estabelecimento/[id]/crm |

---

## 🎯 Próximos Passos

1. ✅ Configurar ambiente
2. ✅ Popular banco com dados iniciais
3. ✅ Criar primeiro estabelecimento
4. ✅ Cadastrar produtos
5. ✅ Cadastrar mesas
6. ✅ Testar pedido via Chat
7. ✅ Testar cozinha
8. ✅ Configurar pagamentos

---

## 📞 Suporte

- Docs: `/README.md`
- Deploy: `/DEPLOY.md`
- Especificação: `/SPEC.md`

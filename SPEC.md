# ComandaAI - Plataforma de Comandas Inteligentes para Bares e Restaurantes

## 1. Conceito & Visão

ComandaAI é uma plataforma SaaS revolucionária que transforma a experiência de pedidos em restaurantes usando IA conversacional. Cada mesa possui um QR Code único que, ao ser escaneado, abre um chat inteligente capaz de entender linguagem natural, anotar pedidos, sugerir pratos, dividir contas e processar pagamentos via PIX. A experiência deve ser fluida como conversar com um garçom virtual altamente atencioso.

**Pilares do Produto:**
- 🤖 IA Conversacional Natural - Pedidos como numa conversa com um garçom experiente
- 📱 Zero Fricção - Scan, pedale, pague sem downloads ou cadastros
- 🔄 Tempo Real - Cozinha recebe pedidos instantaneamente
- 💳 Pagamento Digital - PIX integrado com QR Code automático

## 2. Design Language

### Aesthetic Direction
Inspirado em aplicativos premium de delivery (Rappi, iFood) com um toque de sofisticação para bares. Interface escura com acentos vibrantes que evocam apetite e conforto.

### Color Palette
```
Primary:        #FF6B35 (Laranja Restaurant)
Secondary:      #1A1A2E (Dark Navy)
Accent:         #00D9A5 (Mint Success)
Background:     #0F0F1A (Deep Dark)
Surface:        #1E1E2F (Card Dark)
Text Primary:   #FFFFFF
Text Secondary: #A0A0B0
Error:          #FF4757
Warning:        #FFD93D
```

### Typography
- **Headings:** Inter (700, 600) - Moderno e legível
- **Body:** Inter (400, 500) - Clareza em todas as telas
- **Monospace:** JetBrains Mono - Códigos de pedido, valores
- **Fallback:** system-ui, sans-serif

### Spatial System
- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96
- Border radius: 8px (small), 12px (medium), 16px (large), 24px (xl)
- Max content width: 480px (mobile-first para chat)

### Motion Philosophy
- Micro-interações: 150ms ease-out para hover/focus
- Transições de estado: 200ms ease-in-out
- Entradas de lista: 300ms ease-out com stagger de 50ms
- Chat messages: slide-in de baixo com fade, 250ms
- Skeleton loading: pulse animation suave

### Visual Assets
- Icons: Lucide React (consistente, open-source)
- QR Code: Gerado dinamicamente com logo central
- Avatars: UI Avatars API para usuários sem foto
- Imagens de pratos: Placeholder com gradiente temático

## 3. Layout & Structure

### Arquitetura de Páginas

```
/                           → Landing page + login
/dashboard                  → Super Admin Dashboard
/dashboard/establishments   → Gestão de restaurantes
/dashboard/plans            → Planos e preços
/dashboard/crm              → CRM completo
/dashboard/analytics        → Analytics geral

/estabelecimento/[id]      → Painel do cliente
/estabelecimento/[id]/menu → Gerenciar cardápio
/estabelecimento/[id]/tables → Gerenciar mesas
/estabelecimento/[id]/orders → Pedidos em tempo real
/estabelecimento/[id]/crm  → CRM do estabelecimento
/estabelecimento/[id]/kitchen → Tela da cozinha

/chat/[tableId]            → AI Chat do cliente
/chat/[tableId]/menu       → Cardápio visual
/chat/[tableId]/checkout   → Fechamento de conta
/chat/[tableId]/payment    → Pagamento PIX

/order online               → Sistema delivery
/order online/[id]         → Tracking do pedido
```

### Responsive Strategy
- Mobile-first (320px-480px): Chat principal
- Tablet (481px-1024px): Dashboard administrativo
- Desktop (1025px+): Layout em múltiplas colunas

## 4. Features & Interactions

### 4.1 AI Chat (Cliente)

#### Menu Browsing
- Exibe categorias em carrossel horizontal
- Cards de produtos com imagem, nome, preço, descrição curta
- Toque no card abre modal com detalhes completos
- Botão "Adicionar" com quantidade selecionável

#### Pedidos por Conversa
- Input de texto com placeholder contextual
- IA interpreta intenções:
  - "Quero um hambúrguer" → Mostra hambúrgueres + confirma
  - "2 pizzas grandes, uma margherita e uma pepperoni" → Confirma direto
  - "Tira o pepperoni, troca por quatro queijos" → Modifica pedido
  - "Mesa 5 tá pedindo coca" → Encaminha para atendente
- Conversação mantém contexto durante toda a sessão

#### Detalhes de Pedido
- Observações: "sem cebola", "bem passado", "extra bacon"
- Personalização de quantidade
- Aditivos/remoções específicos
- Tempo estimado de preparo

#### Divisão de Conta
- Comando: "Divide a conta"
- Escolha: igual, por pessoa, por item
- Cada pessoa vê seu resumo
- Pagamento individual ou grupo

#### Sugestões Inteligentes
- Baseado em itens no pedido: "Combina bem com nossa IPA artesanal"
- Complementos: "Adiciona batatas por +R$12"
- Promoções ativas: "Hoje: Pizza grande + refil por R$45"

#### Fechamento
- Revisão completa do pedido
- Subtotal, taxas, desconto, total
- Escolha de método de pagamento
- PIX: Gera QR Code dinâmico
- Confirmação com comprovante

### 4.2 Sistema de Pedidos para Cozinha

#### Tela da Cozinha
- Kanban: Novos | Preparando | Pronto | Entregue
- Cards com tempo desde entrada
- Timer visual (verde → amarelo → vermelho)
- Som de notificação para novos pedidos
- Um toque para avançar status

#### Integração Tempo Real
- WebSockets para atualização instantânea
- Impressora opcional (POS)
- Badge no celular para cozinha mobile

### 4.3 Dashboard Super Admin (SaaS)

#### Visão Geral
- MRR, ARR, Growth Rate
- Novos estabelecimentos (dia/semana/mês)
- Pedidos processados
- Ticket médio

#### Gestão de Estabelecimentos
- Lista com filtros: plano, status, região
- Criar, editar, suspender conta
- Ver métricas individuais
- White-label settings

#### Planos e Preços
- CRUD de planos (Free, Pro, Enterprise)
- Configurar features por plano
- Histórico de mudanças de plano

#### CRM Completo
- Contatos de todos os establishments
- Timeline de interações
- Tags e segmentos
- Campanhas de email
- NPS e satisfaction scores

### 4.4 Painel do Estabelecimento Cliente

#### Configurações
- Dados do restaurante (nome, endereço, logo)
- Horários de funcionamento
- Configurações de pedido (tempo máximo, regras)
- Integrações (impressora, entregadores)

#### Cardápio
- CRUD de categorias
- CRUD de produtos (nome, descrição, preço, imagem)
- Variantes (tamanhos, sabores)
- Adicionais (Ingredientes extras com preço)
- promoções
- Disponibilidade (ativo/inativo)

#### Mesas
- QR Code gerado automaticamente por mesa
- Download individual ou em lote (PDF)
- Histórico de uso por mesa
- Renomear, bloquear mesa

#### Pedidos
- Filtros: status, data, valor
- Detalhes de cada pedido
- Cancelar, reembolsar
- Comunicar com cliente (chat)

#### CRM
- Base de clientes (quem fez pedido)
- Histórico de pedidos por cliente
- Preferências observadas
- Aniversários, observações
- Segmentação (VIP, novo, inativo)

### 4.5 Sistema de Delivery

#### Para Cliente
- Cardápio completo via web
- Checkout com endereço
- Escolha de entregador (integração iFood/ Rappi ou próprio)
- Tracking em tempo real
- Avaliação do pedido

#### Para Estabelecimento
- Gerenciamento de entregadores
- Raio de entrega configurável
- Taxas por região
-调度 de entregas

## 5. Component Inventory

### Core Components

#### Button
- Variants: primary, secondary, ghost, danger
- Sizes: sm (32px), md (40px), lg (48px)
- States: default, hover (+brightness), active (scale 0.98), disabled (opacity 0.5), loading (spinner)

#### Input
- Types: text, email, password, search, number
- States: default, focus (ring), error (red border + message), disabled
- Adornments: left icon, right icon, clear button

#### Card
- Base: bg-surface, rounded-xl, p-4, shadow-sm
- Hover: shadow-md, translateY(-2px)
- Variants: default, interactive, selected

#### Badge
- Colors: primary, success, warning, error, neutral
- Sizes: sm, md
- With icon ou text only

#### Modal
- Overlay: bg-black/60, blur(4px)
- Animation: scale 0.95 → 1, opacity 0 → 1
- Close: X button, click outside, ESC key

#### Toast
- Types: success, error, warning, info
- Position: bottom-center
- Auto-dismiss: 4s
- Swipe to dismiss

#### Chat Bubble
- User: right-aligned, primary color
- AI: left-aligned, surface color
- Typing indicator: three bouncing dots
- Timestamp opcional

#### QRCode Component
- Tamanho: 200x200px padrão, configurável
- Logo central opcional
- Formato: PNG para download
- Escaneável por qualquer app

#### Product Card (Menu)
- Image: 16:9, lazy load
- Title: truncated em 2 linhas
- Price: destaque com cor
- Add button: sticky no card

### Layout Components

#### Sidebar (Dashboard)
- Width: 260px
- Logo no topo
- Navigation items com icons
- User menu no bottom
- Collapsible em mobile

#### Header
- Height: 64px
- Search global (Super Admin)
- Notifications bell
- User avatar dropdown

#### DataTable
- Sortable columns
- Pagination ou infinite scroll
- Row selection
- Bulk actions
- Export to CSV

## 6. Technical Approach

### Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + custom design tokens
- **Database:** PostgreSQL (Prisma ORM)
- **Auth:** NextAuth.js v5
- **Real-time:** Socket.io (para cozinha) ou Pusher
- **AI:** OpenAI GPT-4 Turbo (simulated for demo)
- **Payments:** PIX simulation (production: asaas/pagarme)
- **QR Generation:** qrcode library
- **Deployment:** Vercel

### API Design

#### Auth Endpoints
```
POST /api/auth/register     - Criar conta estabelecimento
POST /api/auth/login       - Login
POST /api/auth/logout      - Logout
GET  /api/auth/me          - Dados do usuário atual
```

#### Establishment Endpoints
```
GET    /api/establishments              - Listar (Super Admin)
POST   /api/establishments              - Criar
GET    /api/establishments/[id]         - Detalhes
PUT    /api/establishments/[id]         - Atualizar
DELETE /api/establishments/[id]         - Deletar
```

#### Menu Endpoints
```
GET    /api/menu/[establishmentId]           - Cardápio completo
POST   /api/menu/[establishmentId]/category  - Criar categoria
POST   /api/menu/[establishmentId]/product    - Criar produto
PUT    /api/menu/[establishmentId]/product/[id] - Atualizar
DELETE /api/menu/[establishmentId]/product/[id] - Deletar
```

#### Table Endpoints
```
GET    /api/tables/[establishmentId]         - Listar mesas
POST   /api/tables/[establishmentId]          - Criar mesa
GET    /api/tables/[establishmentId]/[tableId] - Dados da mesa
PUT    /api/tables/[establishmentId]/[tableId] - Atualizar mesa
DELETE /api/tables/[establishmentId]/[tableId] - Remover mesa
GET    /api/tables/qr/[tableId]              - QR Code da mesa
```

#### Order Endpoints
```
GET    /api/orders/[establishmentId]          - Listar pedidos
POST   /api/orders                           - Criar pedido
GET    /api/orders/[id]                      - Detalhes do pedido
PUT    /api/orders/[id]                      - Atualizar status
GET    /api/orders/table/[tableId]           - Pedidos da mesa atual
```

#### AI Chat Endpoints
```
POST   /api/chat/[tableId]/message           - Enviar mensagem
GET    /api/chat/[tableId]/context           - Contexto da conversa
POST   /api/chat/[tableId]/order             - Confirmar pedido
GET    /api/chat/[tableId]/cart              - Carrinho atual
POST   /api/chat/[tableId]/checkout          - Fechar conta
```

#### Payment Endpoints
```
POST   /api/payment/pix                      - Gerar QR Code PIX
POST   /api/payment/confirm                  - Confirmar pagamento
```

#### CRM Endpoints
```
GET    /api/crm/[establishmentId]/contacts   - Lista de contatos
POST   /api/crm/[establishmentId]/contacts   - Criar contato
PUT    /api/crm/[establishmentId]/contacts/[id] - Atualizar
GET    /api/crm/[establishmentId]/segments  - Segmentos
POST   /api/crm/[establishmentId]/campaigns - Criar campanha
```

### Data Model

```prisma
model User {
  id             String   @id @default(cuid())
  email          String   @unique
  password       String
  name           String
  role           Role     @default(USER)
  establishment  Establishment?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

enum Role {
  SUPER_ADMIN
  ADMIN
  USER
}

model Establishment {
  id            String   @id @default(cuid())
  name          String
  slug          String   @unique
  logo          String?
  address       String
  phone         String
  description   String?
  plan          Plan     @default(FREE)
  isActive      Boolean  @default(true)
  settings      Json?
  owner         User     @relation(fields: [ownerId], references: [id])
  ownerId       String   @unique
  categories    Category[]
  products      Product[]
  tables        Table[]
  orders        Order[]
  contacts      Contact[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

enum Plan {
  FREE
  PRO
  ENTERPRISE
}

model Category {
  id             String     @id @default(cuid())
  name           String
  description    String?
  order          Int        @default(0)
  isActive       Boolean    @default(true)
  establishment  Establishment @relation(fields: [establishmentId], references: [id])
  establishmentId String
  products       Product[]
}

model Product {
  id             String   @id @default(cuid())
  name           String
  description    String?
  price          Decimal
  image          String?
  isActive       Boolean  @default(true)
  preparationTime Int?   @default(15)
  category       Category @relation(fields: [categoryId], references: [id])
  categoryId     String
  variants       Variant[]
  additions      Addition[]
  orderItems     OrderItem[]
  establishment  Establishment @relation(fields: [establishmentId], references: [id])
  establishmentId String
  extras         ProductExtra[]
}

model Variant {
  id        String   @id @default(cuid())
  name      String
  price     Decimal
  product   Product  @relation(fields: [productId], references: [id])
  productId String
}

model Addition {
  id        String   @id @default(cuid())
  name      String
  price     Decimal
  product   Product  @relation(fields: [productId], references: [id])
  productId String
}

model ProductExtra {
  id        String   @id @default(cuid())
  extraId   String
  productId String
  product   Product  @relation(fields: [productId], references: [id])
}

model Table {
  id             String   @id @default(cuid())
  number         String
  isActive       Boolean  @default(true)
  qrCode         String?
  establishment  Establishment @relation(fields: [establishmentId], references: [id])
  establishmentId String
  orders         Order[]
  sessions       Session[]
}

model Session {
  id         String   @id @default(cuid())
  table      Table    @relation(fields: [tableId], references: [id])
  tableId    String
  customerId String?
  createdAt  DateTime @default(now())
  closedAt   DateTime?
  orders     Order[]
}

model Order {
  id             String   @id @default(cuid())
  status         OrderStatus @default(PENDING)
  type           OrderType   @default(ONSITE)
  subtotal       Decimal
  discount       Decimal     @default(0)
  tax            Decimal     @default(0)
  total          Decimal
  notes          String?
  table          Table?   @relation(fields: [tableId], references: [id])
  tableId        String?
  session        Session? @relation(fields: [sessionId], references: [id])
  sessionId      String?
  establishment  Establishment @relation(fields: [establishmentId], references: [id])
  establishmentId String
  items          OrderItem[]
  payments       Payment[]
  customer       Contact? @relation(fields: [customerId], references: [id])
  customerId     String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PREPARING
  READY
  DELIVERED
  CANCELLED
}

enum OrderType {
  ONSITE
  DELIVERY
  TAKEOUT
}

model OrderItem {
  id          String   @id @default(cuid())
  quantity    Int
  unitPrice   Decimal
  totalPrice  Decimal
  notes       String?
  order       Order    @relation(fields: [orderId], references: [id])
  orderId     String
  product     Product  @relation(fields: [productId], references: [id])
  productId   String
  variantId   String?
  additions   String[]
}

model Payment {
  id             String   @id @default(cuid())
  method         PaymentMethod
  amount         Decimal
  status         PaymentStatus @default(PENDING)
  pixCode        String?
  pixQrCode      String?
  paidAt         DateTime?
  order          Order    @relation(fields: [orderId], references: [id])
  orderId        String
  createdAt      DateTime @default(now())
}

enum PaymentMethod {
  PIX
  CARD
  CASH
}

enum PaymentStatus {
  PENDING
  CONFIRMED
  CANCELLED
  REFUNDED
}

model Contact {
  id             String   @id @default(cuid())
  name           String
  email          String?
  phone          String?
  cpf            String?
  birthDate      DateTime?
  notes          String?
  tags           String[]
  segment        String?
  nps            Int?
  totalSpent     Decimal  @default(0)
  orderCount     Int      @default(0)
  lastOrderAt    DateTime?
  establishment  Establishment @relation(fields: [establishmentId], references: [id])
  establishmentId String
  orders         Order[]
  interactions   Interaction[]
  createdAt      DateTime @default(now())
}

model Interaction {
  id         String   @id @default(cuid())
  type       InteractionType
  content    String
  contact    Contact  @relation(fields: [contactId], references: [id])
  contactId  String
  createdAt  DateTime @default(now())
}

enum InteractionType {
  NOTE
  EMAIL
  SMS
  CALL
  ORDER
}
```

### Authentication Strategy
- JWT tokens com refresh rotation
- RBAC: Super Admin, Establishment Admin, Staff
- Session-based para chat do cliente (sem login)

### Real-time Architecture
- Socket.io para cozinha receber pedidos
- Polling fallback para chat (a cada 3s)
- Redis pub/sub para escalar

### Security Considerations
- Rate limiting em todas as APIs
- Input sanitization
- CSRF protection
- HTTPS only em produção
- Environment variables para secrets
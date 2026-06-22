import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const hashedPassword = await bcrypt.hash("demo123", 10);

  const user = await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      email: "admin@demo.com",
      password: hashedPassword,
      name: "Admin Demo",
      role: "ADMIN",
    },
  });

  const establishment = await prisma.establishment.upsert({
    where: { slug: "demo" },
    update: {},
    create: {
      name: "Bar & Restaurante Demo",
      slug: "demo",
      phone: "(11) 99999-9999",
      address: "Rua Demo, 123 - São Paulo, SP",
      description: "Bar e restaurante com ambiente acolhedor",
      plan: "PRO",
      isActive: true,
      ownerId: user.id,
      settings: {
        serviceTax: 10,
        deliveryFee: 5.9,
        theme: "dark",
      },
    },
  });

  for (let i = 1; i <= 10; i++) {
    await prisma.table.create({
      data: {
        number: String(i),
        establishmentId: establishment.id,
        isActive: true,
      },
    }).catch(() => {});
  }

  const categoriesData = [
    { name: "Entradas", icon: "🥗", order: 0, description: "Para abrir o apetite" },
    { name: "Principais", icon: "🍽️", order: 1, description: "O melhor da casa" },
    { name: "Bebidas", icon: "🍺", order: 2, description: "Para matar a sede" },
    { name: "Sobremesas", icon: "🍰", order: 3, description: "Para adoçar o dia" },
    { name: "Combos", icon: "🎯", order: 4, description: "Melhores combinações" },
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: {
        establishmentId_name: {
          establishmentId: establishment.id,
          name: cat.name,
        },
      },
      update: { icon: cat.icon, order: cat.order },
      create: {
        name: cat.name,
        icon: cat.icon,
        order: cat.order,
        description: cat.description,
        establishmentId: establishment.id,
      },
    });
  }

  console.log(`✅ Demo user: admin@demo.com / demo123`);
  console.log(`✅ Establishment: ${establishment.name} (slug: demo)`);
  console.log(`✅ 10 tables created`);
  console.log(`✅ 5 categories created`);

  // Create products for each category
  const entranceCategory = await prisma.category.findUnique({
    where: { establishmentId_name: { establishmentId: establishment.id, name: "Entradas" } },
  });
  const mainCategory = await prisma.category.findUnique({
    where: { establishmentId_name: { establishmentId: establishment.id, name: "Principais" } },
  });
  const drinksCategory = await prisma.category.findUnique({
    where: { establishmentId_name: { establishmentId: establishment.id, name: "Bebidas" } },
  });
  const dessertCategory = await prisma.category.findUnique({
    where: { establishmentId_name: { establishmentId: establishment.id, name: "Sobremesas" } },
  });
  const comboCategory = await prisma.category.findUnique({
    where: { establishmentId_name: { establishmentId: establishment.id, name: "Combos" } },
  });

  const productsData = [
    // Entradas
    { name: "Bruschetta Italiana", description: "Pão italiano com tomate fresco, manjericão e azeite", price: 28, categoryId: entranceCategory?.id, emoji: "🥗", tags: ["vegetariano"] },
    { name: "Carpaccio de Wagyu", description: "Fatias finas de wagyu com rúcula, parmesão e molho mostarda", price: 42, categoryId: entranceCategory?.id, emoji: "🥩", tags: ["premium"] },
    { name: "Bolinho de Bacalhau (6un)", description: "Receita portuguesa tradicional com molho tártaro", price: 35, categoryId: entranceCategory?.id, emoji: "🐟", tags: ["popular"] },
    { name: "Tábua de Frios", description: "Queijos artesanais, embutidos, azeitonas e crackers", price: 68, categoryId: entranceCategory?.id, emoji: "🧀", tags: ["compartilhar"] },

    // Principais
    { name: "Pizza Margherita Grande", description: "Molho de tomate San Marzano, mussarela de búfala, manjericão fresco", price: 52, categoryId: mainCategory?.id, emoji: "🍕", tags: ["popular", "vegetariano"] },
    { name: "Picanha na Brasa", description: "300g de picanha grelhada com arroz, farofa, vinagrete e fritas", price: 78, categoryId: mainCategory?.id, emoji: "🥩", tags: ["premium"] },
    { name: "Risoto de Camarão", description: "Arroz arbóreo cremoso com camarões grelhados e parmesão", price: 65, categoryId: mainCategory?.id, emoji: "🍤", tags: ["frutos do mar"] },
    { name: "Filé de Salmão", description: "Salmão grelhado com legumes salteados e molho de maracujá", price: 58, categoryId: mainCategory?.id, emoji: "🐠", tags: ["saudável"] },
    { name: "Hambúrguer Artesanal", description: "Blend 200g, queijo cheddar, bacon, cebola caramelizada, brioche", price: 38, categoryId: mainCategory?.id, emoji: "🍔", tags: ["popular"] },
    { name: "Batata Frita com Cheddar e Bacon", description: "Porção generosa com cheddar cremoso e bacon crocante", price: 32, categoryId: mainCategory?.id, emoji: "🍟", tags: ["compartilhar"] },

    // Bebidas
    { name: "Caipirinha de Limão", description: "Cachaça artesanal, limão, açúcar e gelo", price: 22, categoryId: drinksCategory?.id, emoji: "🍹", tags: ["popular"] },
    { name: "Chope Artesanal IPA 500ml", description: "Chope IPA com lúpulo intenso e amargor equilibrado", price: 28, categoryId: drinksCategory?.id, emoji: "🍺", tags: ["cerveja"] },
    { name: "Suco Natural 500ml", description: "Laranja, limão, maracujá ou abacaxi", price: 14, categoryId: drinksCategory?.id, emoji: "🧃", tags: ["natural"] },
    { name: "Água Mineral 500ml", description: "Com ou sem gás", price: 6, categoryId: drinksCategory?.id, emoji: "💧", tags: [] },
    { name: "Refrigerante Lata", description: "Coca-Cola, Guaraná, Sprite", price: 8, categoryId: drinksCategory?.id, emoji: "🥤", tags: [] },
    { name: "Vinho Tinto Taça", description: "Malbec argentino, encorpado e frutado", price: 25, categoryId: drinksCategory?.id, emoji: "🍷", tags: ["premium"] },

    // Sobremesas
    { name: "Petit Gâteau", description: "Bolo de chocolate com interior derretido e sorvete de baunilha", price: 32, categoryId: dessertCategory?.id, emoji: "🍫", tags: ["popular"] },
    { name: "Brownie com Sorvete", description: "Brownie de chocolate 70% com sorvete de creme e calda", price: 28, categoryId: dessertCategory?.id, emoji: "🍨", tags: [] },
    { name: "Pudim de Leite", description: "Pudim cremoso de leite condensado com calda de caramelo", price: 22, categoryId: dessertCategory?.id, emoji: "🍮", tags: ["tradicional"] },
    { name: "Cheesecake de Frutas Vermelhas", description: "Base crocante com cream cheese e calda de frutas", price: 26, categoryId: dessertCategory?.id, emoji: "🍰", tags: [] },

    // Combos
    { name: "Combo Casal", description: "2 Hambúrgueres Artesanais + 1 Batata Frita + 2 Refrigerantes", price: 89, categoryId: comboCategory?.id, emoji: "🎯", tags: ["popular", "desconto"] },
    { name: "Combo Família", description: "1 Pizza Grande + 1 Chope 1L + 1 Porção de Batata Frita", price: 110, categoryId: comboCategory?.id, emoji: "👨‍👩‍👧‍👦", tags: ["compartilhar"] },
    { name: "Combo Executivo", description: "Prato do dia + Suco Natural + Sobremesa", price: 45, categoryId: comboCategory?.id, emoji: "💼", tags: ["almoço"] },
  ];

  let createdProducts = 0;
  for (const prod of productsData) {
    if (prod.categoryId) {
      await prisma.product.create({
        data: {
          name: prod.name,
          description: prod.description,
          price: prod.price,
          categoryId: prod.categoryId,
          establishmentId: establishment.id,
          emoji: prod.emoji,
          tags: prod.tags,
          preparationTime: prod.categoryId === drinksCategory?.id ? 5 : 20,
          isActive: true,
        },
      }).catch(() => {});
      createdProducts++;
    }
  }
  console.log(`✅ ${createdProducts} products created`);

  // Create sample orders
  try {
    const tables = await prisma.table.findMany({
      where: { establishmentId: establishment.id },
      orderBy: { number: "asc" },
      take: 5,
    });
    const products = await prisma.product.findMany({
      where: { establishmentId: establishment.id },
      orderBy: { name: "asc" },
    });

    console.log(`📦 Tables found: ${tables.length}, Products found: ${products.length}`);

    if (tables.length > 0 && products.length > 0) {
      const sampleOrders = [
        { tableIndex: 0, itemIndices: [0, 1], status: "PENDING" as const, minutesAgo: 5 },
        { tableIndex: 1, itemIndices: [2, 3, 4], status: "CONFIRMED" as const, minutesAgo: 15 },
        { tableIndex: 2, itemIndices: [5], status: "PREPARING" as const, minutesAgo: 25 },
        { tableIndex: 3, itemIndices: [6, 7], status: "READY" as const, minutesAgo: 40 },
        { tableIndex: 4, itemIndices: [8, 9], status: "DELIVERED" as const, minutesAgo: 60 },
        { tableIndex: 0, itemIndices: [0, 5, 6], status: "DELIVERED" as const, minutesAgo: 120 },
      ];

      let createdOrders = 0;
      for (const sample of sampleOrders) {
        const table = tables[sample.tableIndex];
        if (!table) {
          console.log(`⚠️ Table ${sample.tableIndex} not found`);
          continue;
        }

        const orderItems = sample.itemIndices
          .filter(i => products[i])
          .map(i => {
            const p = products[i];
            const qty = Math.floor(Math.random() * 3) + 1;
            return {
              quantity: qty,
              unitPrice: p.price,
              totalPrice: Number(p.price) * qty,
              productName: p.name,
              productImage: p.image,
              notes: null,
              additions: [],
              variantId: null,
            };
          });

        if (orderItems.length === 0) {
          console.log(`⚠️ No items for order at table ${table.number}`);
          continue;
        }

        const subtotal = orderItems.reduce((s, i) => s + Number(i.totalPrice), 0);

        try {
          await prisma.order.create({
            data: {
              tableId: table.id,
              establishmentId: establishment.id,
              type: "ONSITE",
              status: sample.status,
              subtotal,
              discount: 0,
              tax: 0,
              total: subtotal,
              createdAt: new Date(Date.now() - sample.minutesAgo * 60000),
              items: { create: orderItems },
            },
          });
          createdOrders++;
        } catch (e: any) {
          console.log(`⚠️ Failed to create order for table ${table.number}: ${e.message}`);
        }
      }
      console.log(`✅ ${createdOrders} sample orders created`);
    } else {
      console.log(`⚠️ Not enough tables (${tables.length}) or products (${products.length})`);
    }
  } catch (e: any) {
    console.log(`⚠️ Could not create sample orders: ${e.message}`);
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

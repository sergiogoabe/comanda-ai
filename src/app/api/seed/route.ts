import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
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
        update: { icon: cat.icon, order: cat.order, description: cat.description },
        create: {
          name: cat.name,
          icon: cat.icon,
          order: cat.order,
          description: cat.description,
          establishmentId: establishment.id,
        },
      });
    }

    const categoryMap: Record<string, string> = {};
    for (const cat of categoriesData) {
      const c = await prisma.category.findUnique({
        where: { establishmentId_name: { establishmentId: establishment.id, name: cat.name } },
      });
      if (c) categoryMap[cat.name] = c.id;
    }

    const productsData = [
      { name: "Bruschetta Italiana", description: "Pão italiano com tomate fresco, manjericão e azeite", price: 28, category: "Entradas", emoji: "🥗", tags: ["vegetariano"], prepTime: 15 },
      { name: "Carpaccio de Wagyu", description: "Fatias finas de wagyu com rúcula, parmesão e molho mostarda", price: 42, category: "Entradas", emoji: "🥩", tags: ["premium"], prepTime: 15 },
      { name: "Bolinho de Bacalhau (6un)", description: "Receita portuguesa tradicional com molho tártaro", price: 35, category: "Entradas", emoji: "🐟", tags: ["popular"], prepTime: 20 },
      { name: "Tábua de Frios", description: "Queijos artesanais, embutidos, azeitonas e crackers", price: 68, category: "Entradas", emoji: "🧀", tags: ["compartilhar"], prepTime: 10 },
      { name: "Pizza Margherita Grande", description: "Molho de tomate San Marzano, mussarela de búfala, manjericão fresco", price: 52, category: "Principais", emoji: "🍕", tags: ["popular", "vegetariano"], prepTime: 25 },
      { name: "Picanha na Brasa", description: "300g de picanha grelhada com arroz, farofa, vinagrete e fritas", price: 78, category: "Principais", emoji: "🥩", tags: ["premium"], prepTime: 30 },
      { name: "Risoto de Camarão", description: "Arroz arbóreo cremoso com camarões grelhados e parmesão", price: 65, category: "Principais", emoji: "🍤", tags: ["frutos do mar"], prepTime: 25 },
      { name: "Filé de Salmão", description: "Salmão grelhado com legumes salteados e molho de maracujá", price: 58, category: "Principais", emoji: "🐠", tags: ["saudável"], prepTime: 20 },
      { name: "Hambúrguer Artesanal", description: "Blend 200g, queijo cheddar, bacon, cebola caramelizada, brioche", price: 38, category: "Principais", emoji: "🍔", tags: ["popular"], prepTime: 20 },
      { name: "Batata Frita com Cheddar e Bacon", description: "Porção generosa com cheddar cremoso e bacon crocante", price: 32, category: "Principais", emoji: "🍟", tags: ["compartilhar"], prepTime: 15 },
      { name: "Caipirinha de Limão", description: "Cachaça artesanal, limão, açúcar e gelo", price: 22, category: "Bebidas", emoji: "🍹", tags: ["popular"], prepTime: 5 },
      { name: "Chope Artesanal IPA 500ml", description: "Chope IPA com lúpulo intenso e amargor equilibrado", price: 28, category: "Bebidas", emoji: "🍺", tags: ["cerveja"], prepTime: 3 },
      { name: "Suco Natural 500ml", description: "Laranja, limão, maracujá ou abacaxi", price: 14, category: "Bebidas", emoji: "🧃", tags: ["natural"], prepTime: 5 },
      { name: "Água Mineral 500ml", description: "Com ou sem gás", price: 6, category: "Bebidas", emoji: "💧", tags: [], prepTime: 1 },
      { name: "Refrigerante Lata", description: "Coca-Cola, Guaraná, Sprite", price: 8, category: "Bebidas", emoji: "🥤", tags: [], prepTime: 1 },
      { name: "Vinho Tinto Taça", description: "Malbec argentino, encorpado e frutado", price: 25, category: "Bebidas", emoji: "🍷", tags: ["premium"], prepTime: 3 },
      { name: "Petit Gâteau", description: "Bolo de chocolate com interior derretido e sorvete de baunilha", price: 32, category: "Sobremesas", emoji: "🍫", tags: ["popular"], prepTime: 15 },
      { name: "Brownie com Sorvete", description: "Brownie de chocolate 70% com sorvete de creme e calda", price: 28, category: "Sobremesas", emoji: "🍨", tags: [], prepTime: 10 },
      { name: "Pudim de Leite", description: "Pudim cremoso de leite condensado com calda de caramelo", price: 22, category: "Sobremesas", emoji: "🍮", tags: ["tradicional"], prepTime: 5 },
      { name: "Cheesecake de Frutas Vermelhas", description: "Base crocante com cream cheese e calda de frutas", price: 26, category: "Sobremesas", emoji: "🍰", tags: [], prepTime: 5 },
      { name: "Combo Casal", description: "2 Hambúrgueres Artesanais + 1 Batata Frita + 2 Refrigerantes", price: 89, category: "Combos", emoji: "🎯", tags: ["popular", "desconto"], prepTime: 25 },
      { name: "Combo Família", description: "1 Pizza Grande + 1 Chope 1L + 1 Porção de Batata Frita", price: 110, category: "Combos", emoji: "👨‍👩‍👧‍👦", tags: ["compartilhar"], prepTime: 30 },
      { name: "Combo Executivo", description: "Prato do dia + Suco Natural + Sobremesa", price: 45, category: "Combos", emoji: "💼", tags: ["almoço"], prepTime: 20 },
    ];

    let createdCount = 0;
    for (const prod of productsData) {
      const categoryId = categoryMap[prod.category];
      if (!categoryId) continue;

      const existing = await prisma.product.findFirst({
        where: { establishmentId: establishment.id, name: prod.name },
      });
      if (existing) continue;

      await prisma.product.create({
        data: {
          name: prod.name,
          description: prod.description,
          price: prod.price,
          categoryId,
          establishmentId: establishment.id,
          emoji: prod.emoji,
          tags: prod.tags,
          preparationTime: prod.prepTime,
          isActive: true,
        },
      });
      createdCount++;
    }

    // Create sample orders
    const tables = await prisma.table.findMany({
      where: { establishmentId: establishment.id },
      orderBy: { number: "asc" },
      take: 5,
    });
    const products = await prisma.product.findMany({
      where: { establishmentId: establishment.id },
      orderBy: { name: "asc" },
    });

    if (tables.length > 0 && products.length > 0) {
      const sampleOrders = [
        { tableIdx: 0, itemIdx: [0, 1], status: "PENDING", mins: 5 },
        { tableIdx: 1, itemIdx: [2, 3, 4], status: "CONFIRMED", mins: 15 },
        { tableIdx: 2, itemIdx: [5], status: "PREPARING", mins: 25 },
        { tableIdx: 3, itemIdx: [6, 7], status: "READY", mins: 40 },
        { tableIdx: 4, itemIdx: [8, 9], status: "DELIVERED", mins: 60 },
        { tableIdx: 0, itemIdx: [0, 5, 6], status: "DELIVERED", mins: 120 },
      ];

      for (const s of sampleOrders) {
        const table = tables[s.tableIdx];
        if (!table) continue;
        const items = s.itemIdx.filter(i => products[i]).map(i => {
          const p = products[i];
          const qty = Math.floor(Math.random() * 3) + 1;
          return { quantity: qty, unitPrice: p.price, totalPrice: Number(p.price) * qty, productName: p.name, productImage: p.image, notes: null, additions: [], variantId: null };
        });
        if (items.length === 0) continue;
        const sub = items.reduce((acc, i) => acc + Number(i.totalPrice), 0);
        await prisma.order.create({
          data: { tableId: table.id, establishmentId: establishment.id, type: "ONSITE", status: s.status as any, subtotal: sub, discount: 0, tax: 0, total: sub, createdAt: new Date(Date.now() - s.mins * 60000), items: { create: items } },
        }).catch(() => {});
      }
    }

    return NextResponse.json({
      message: "Dados demo atualizados!",
      login: "admin@demo.com",
      password: "demo123",
      establishment: establishment.name,
      slug: establishment.slug,
      productsCreated: createdCount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

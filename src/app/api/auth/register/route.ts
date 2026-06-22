import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, restaurantName, phone, address } = body;

    if (!name || !email || !password || !restaurantName) {
      return NextResponse.json(
        { error: "Campos obrigatórios: nome, email, senha, nome do restaurante" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const slug = restaurantName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .trim();

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "ADMIN",
        },
      });

      const establishment = await tx.establishment.create({
        data: {
          name: restaurantName,
          slug: `${slug}-${Date.now()}`,
          phone: phone || "",
          address: address || "",
          ownerId: newUser.id,
          settings: {
            serviceTax: 10,
            deliveryFee: 5.9,
            theme: "dark",
          },
        },
      });

      // Create demo tables
      for (let i = 1; i <= 10; i++) {
        await tx.table.create({
          data: {
            number: String(i),
            establishmentId: establishment.id,
            isActive: true,
          },
        });
      }

      // Create demo menu
      const categories = [
        { name: "Entradas", icon: "🥗", order: 0, description: "Para abrir o apetite" },
        { name: "Principais", icon: "🍽️", order: 1, description: "O melhor da casa" },
        { name: "Bebidas", icon: "🍺", order: 2, description: "Para matar a sede" },
        { name: "Sobremesas", icon: "🍰", order: 3, description: "Para adoçar o dia" },
        { name: "Combos", icon: "🎯", order: 4, description: "Melhores combinações" },
      ];

      for (const cat of categories) {
        await tx.category.create({
          data: {
            name: cat.name,
            icon: cat.icon,
            order: cat.order,
            description: cat.description,
            establishmentId: establishment.id,
          },
        });
      }

      return newUser;
    });

    return NextResponse.json(
      { success: true, userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Erro ao criar conta. Tente novamente." },
      { status: 500 }
    );
  }
}

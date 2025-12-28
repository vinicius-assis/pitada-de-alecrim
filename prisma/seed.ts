import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash("Esquila26!", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@restaurante.com" },
    update: {},
    create: {
      email: "admin@restaurante.com",
      name: "Administrador",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  // Create garcom user
  const garcomPassword = await bcrypt.hash("garcom26", 10);
  const garcom = await prisma.user.upsert({
    where: { email: "garcom@restaurante.com" },
    update: {},
    create: {
      email: "garcom@restaurante.com",
      name: "Garçom",
      password: garcomPassword,
      role: "GARCOM",
    },
  });

  // Create sample dishes
  const dishes = [
    {
      name: "Pizza Margherita",
      description: "Molho de tomate, mussarela e manjericão",
      price: 35.0,
      category: "Pizzas",
      available: true,
    },
    {
      name: "Hambúrguer Artesanal",
      description: "Pão, carne, queijo, alface, tomate e molho especial",
      price: 28.0,
      category: "Lanches",
      available: true,
    },
    {
      name: "Salada Caesar",
      description: "Alface, croutons, parmesão e molho caesar",
      price: 22.0,
      category: "Saladas",
      available: true,
    },
    {
      name: "Risotto de Camarão",
      description: "Arroz arbóreo, camarões e queijo parmesão",
      price: 45.0,
      category: "Pratos Principais",
      available: true,
    },
    {
      name: "Suco de Laranja",
      description: "Suco natural de laranja",
      price: 8.0,
      category: "Bebidas",
      available: true,
    },
    {
      name: "Coca-Cola",
      description: "Refrigerante 350ml",
      price: 6.0,
      category: "Bebidas",
      available: true,
    },
  ];

  for (const dish of dishes) {
    const existing = await prisma.dish.findFirst({
      where: { name: dish.name },
    });

    if (!existing) {
      await prisma.dish.create({
        data: dish,
      });
    }
  }

  console.log("Seed completed!");
  console.log("Admin: admin@restaurante.com / admin123");
  console.log("Garçom: garcom@restaurante.com / garcom123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

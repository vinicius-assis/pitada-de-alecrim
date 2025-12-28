import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const dishes = await prisma.dish.findMany({
      orderBy: {
        name: "asc",
      },
    });
    return NextResponse.json(dishes);
  } catch (error) {
    console.error("Error fetching dishes:", error);
    return NextResponse.json(
      { error: "Error fetching dishes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, price, category } = body;

    const dish = await prisma.dish.create({
      data: {
        name,
        price: parseFloat(price),
        category,
      },
    });

    return NextResponse.json(dish);
  } catch (error) {
    console.error("Error creating dish:", error);
    return NextResponse.json(
      { error: "Error creating dish" },
      { status: 500 }
    );
  }
}


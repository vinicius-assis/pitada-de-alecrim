import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            name: true,
          },
        },
        items: {
          include: {
            dish: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Error fetching orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      type,
      items,
      customerName,
      customerPhone,
      tableNumber,
      deliveryAddress,
    } = body;

    // Generate order number
    const orderCount = await prisma.order.count();
    const orderNumber = `ORD-${String(orderCount + 1).padStart(6, "0")}`;

    // Calculate total
    const total = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    const order = await prisma.order.create({
      data: {
        orderNumber,
        type,
        status: type === "DELIVERY" ? "DELIVERY" : "ABERTO",
        customerName,
        customerPhone,
        tableNumber,
        deliveryAddress,
        total,
        userId: (session.user as any).id,
        items: {
          create: items.map((item: any) => ({
            dishId: item.dishId,
            quantity: item.quantity,
            price: item.price,
            notes: item.notes,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Error creating order" },
      { status: 500 }
    );
  }
}


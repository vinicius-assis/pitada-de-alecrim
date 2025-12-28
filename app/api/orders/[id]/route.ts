import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
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
                description: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Error fetching order" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status, customerName, customerPhone, tableNumber, deliveryAddress } = body;

    // Verificar se o pedido existe
    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Se for delivery, não pode mudar o status
    if (existingOrder.type === "DELIVERY" && status && status !== "DELIVERY") {
      return NextResponse.json(
        { error: "Pedidos de delivery não podem ter o status alterado" },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: { id: params.id },
      data: {
        ...(status && existingOrder.type === "MESA" && { status }),
        ...(customerName !== undefined && { customerName }),
        ...(customerPhone !== undefined && { customerPhone }),
        ...(tableNumber !== undefined && { tableNumber }),
        ...(deliveryAddress !== undefined && { deliveryAddress }),
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Error updating order" },
      { status: 500 }
    );
  }
}


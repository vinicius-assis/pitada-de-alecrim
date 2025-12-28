import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
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
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Apenas pedidos de mesa podem ser fechados
    if (order.type !== "MESA") {
      return NextResponse.json(
        { error: "Apenas pedidos de mesa podem ser fechados" },
        { status: 400 }
      );
    }

    // Apenas pedidos abertos podem ser fechados
    if (order.status !== "ABERTO") {
      return NextResponse.json(
        { error: "Apenas pedidos abertos podem ser fechados" },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: "FECHADO",
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Error closing order:", error);
    return NextResponse.json(
      { error: "Error closing order" },
      { status: 500 }
    );
  }
}


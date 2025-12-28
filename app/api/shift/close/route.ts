import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    const start = startOfDay(today);
    const end = endOfDay(today);

    // Buscar todos os pedidos do dia (fechados ou delivery)
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        status: {
          in: ["FECHADO", "DELIVERY"],
        },
      },
      include: {
        items: true,
      },
    });

    // Calcular estatísticas
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    
    const deliveryOrders = orders.filter((o) => o.type === "DELIVERY");
    const mesaOrders = orders.filter((o) => o.type === "MESA");
    
    const deliveryRevenue = deliveryOrders.reduce((sum, o) => sum + o.total, 0);
    const mesaRevenue = mesaOrders.reduce((sum, o) => sum + o.total, 0);
    
    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Salvar resumo diário
    const summary = await prisma.dailySummary.upsert({
      where: {
        date: start,
      },
      update: {
        totalRevenue,
        totalOrders,
        deliveryOrders: deliveryOrders.length,
        mesaOrders: mesaOrders.length,
        deliveryRevenue,
        mesaRevenue,
        averageTicket,
        closedAt: new Date(),
        closedBy: (session.user as any).id,
      },
      create: {
        date: start,
        totalRevenue,
        totalOrders,
        deliveryOrders: deliveryOrders.length,
        mesaOrders: mesaOrders.length,
        deliveryRevenue,
        mesaRevenue,
        averageTicket,
        closedBy: (session.user as any).id,
      },
    });

    // Deletar pedidos do dia (cascade deleta os items automaticamente)
    await prisma.order.deleteMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });

    return NextResponse.json({
      success: true,
      summary,
      message: "Expediente encerrado com sucesso",
    });
  } catch (error) {
    console.error("Error closing shift:", error);
    return NextResponse.json(
      { error: "Error closing shift" },
      { status: 500 }
    );
  }
}


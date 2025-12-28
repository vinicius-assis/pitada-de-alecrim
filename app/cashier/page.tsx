import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Layout } from "@/components/Layout";
import { prisma } from "@/lib/prisma";
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { DollarSign, TrendingUp, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type SearchParams = {
  period?: string;
};

export default async function CashierPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const params = await searchParams;
  const period = params.period || "daily";
  const now = new Date();

  let startDate: Date;
  let endDate: Date = endOfDay(now);
  let periodLabel: string;

  switch (period) {
    case "daily":
      startDate = startOfDay(now);
      periodLabel = format(now, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
      break;
    case "monthly":
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      periodLabel = format(now, "MMMM 'de' yyyy", { locale: ptBR });
      break;
    case "quarterly":
      startDate = startOfQuarter(now);
      endDate = endOfQuarter(now);
      const quarter = Math.floor(now.getMonth() / 3) + 1;
      periodLabel = `${quarter}º Trimestre de ${now.getFullYear()}`;
      break;
    case "yearly":
      startDate = startOfYear(now);
      endDate = endOfYear(now);
      periodLabel = now.getFullYear().toString();
      break;
    default:
      startDate = startOfDay(now);
      periodLabel = format(now, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  }

  // Para período diário, verificar se já foi fechado
  let totalRevenue = 0;
  let ordersCount = 0;
  let avgOrder = 0;
  let deliveryRevenue = 0;
  let mesaRevenue = 0;
  let deliveryOrdersCount = 0;
  let mesaOrdersCount = 0;
  let orders: any[] = [];

  if (period === "daily") {
    // Verificar se o dia já foi fechado
    const summary = await prisma.dailySummary.findUnique({
      where: { date: startDate },
    });

    if (summary) {
      // Usar dados do resumo
      totalRevenue = summary.totalRevenue;
      ordersCount = summary.totalOrders;
      avgOrder = summary.averageTicket;
      deliveryRevenue = summary.deliveryRevenue;
      mesaRevenue = summary.mesaRevenue;
      deliveryOrdersCount = summary.deliveryOrders;
      mesaOrdersCount = summary.mesaOrders;
      orders = []; // Não há pedidos individuais após fechamento
    } else {
      // Buscar pedidos do dia atual
      const [revenue, count, average, orderList] = await Promise.all([
        prisma.order.aggregate({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
            status: {
              not: "CANCELADO",
            },
          },
          _sum: {
            total: true,
          },
        }),
        prisma.order.count({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
            status: {
              not: "CANCELADO",
            },
          },
        }),
        prisma.order.aggregate({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
            status: {
              not: "CANCELADO",
            },
          },
          _avg: {
            total: true,
          },
        }),
        prisma.order.findMany({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
            status: {
              not: "CANCELADO",
            },
          },
          include: {
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
        }),
      ]);

      totalRevenue = revenue._sum.total || 0;
      ordersCount = count;
      avgOrder = average._avg.total || 0;
      orders = orderList;

      const deliveryOrders = orders.filter((o) => o.type === "DELIVERY");
      const mesaOrders = orders.filter((o) => o.type === "MESA");
      deliveryRevenue = deliveryOrders.reduce((sum, o) => sum + o.total, 0);
      mesaRevenue = mesaOrders.reduce((sum, o) => sum + o.total, 0);
      deliveryOrdersCount = deliveryOrders.length;
      mesaOrdersCount = mesaOrders.length;
    }
  } else {
    // Para períodos maiores, agregar DailySummary
    const summaries = await prisma.dailySummary.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    if (summaries.length > 0) {
      totalRevenue = summaries.reduce((sum, s) => sum + s.totalRevenue, 0);
      ordersCount = summaries.reduce((sum, s) => sum + s.totalOrders, 0);
      deliveryRevenue = summaries.reduce((sum, s) => sum + s.deliveryRevenue, 0);
      mesaRevenue = summaries.reduce((sum, s) => sum + s.mesaRevenue, 0);
      deliveryOrdersCount = summaries.reduce((sum, s) => sum + s.deliveryOrders, 0);
      mesaOrdersCount = summaries.reduce((sum, s) => sum + s.mesaOrders, 0);
      avgOrder = ordersCount > 0 ? totalRevenue / ordersCount : 0;
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Controle de Caixa</h1>
          <div className="flex space-x-2">
            <a
              href="/cashier?period=daily"
              className={`btn ${
                period === "daily" ? "btn-primary" : "btn-secondary"
              }`}
            >
              Diário
            </a>
            <a
              href="/cashier?period=monthly"
              className={`btn ${
                period === "monthly" ? "btn-primary" : "btn-secondary"
              }`}
            >
              Mensal
            </a>
            <a
              href="/cashier?period=quarterly"
              className={`btn ${
                period === "quarterly" ? "btn-primary" : "btn-secondary"
              }`}
            >
              Trimestral
            </a>
            <a
              href="/cashier?period=yearly"
              className={`btn ${
                period === "yearly" ? "btn-primary" : "btn-secondary"
              }`}
            >
              Anual
            </a>
          </div>
        </div>

        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-primary-600 mr-2" />
            <span className="text-primary-800 font-medium">
              Período: {periodLabel}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
              <div className="bg-green-500 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {ordersCount}
                </p>
              </div>
              <div className="bg-blue-500 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(avgOrder)}
                </p>
              </div>
              <div className="bg-purple-500 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivery</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(deliveryRevenue)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {deliveryOrdersCount} pedidos
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Receita por Tipo
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Delivery</span>
                  <span className="text-sm font-bold text-gray-900">
                    {formatCurrency(deliveryRevenue)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${
                        totalRevenue > 0
                          ? (deliveryRevenue / totalRevenue) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Mesa</span>
                  <span className="text-sm font-bold text-gray-900">
                    {formatCurrency(mesaRevenue)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${
                        totalRevenue > 0 ? (mesaRevenue / totalRevenue) * 100 : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Últimos Pedidos
            </h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {orders.length > 0 ? (
                orders.slice(0, 10).map((order) => (
                  <div
                    key={order.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        #{order.orderNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      {formatCurrency(order.total)}
                    </p>
                  </div>
                ))
              ) : period === "daily" ? (
                <p className="text-center text-gray-500 py-4">
                  {ordersCount > 0
                    ? "Expediente já foi encerrado. Dados consolidados."
                    : "Nenhum pedido no período"}
                </p>
              ) : (
                <p className="text-center text-gray-500 py-4">
                  Nenhum dado disponível para este período
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}


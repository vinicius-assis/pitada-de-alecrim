import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Layout } from "@/components/Layout";
import { prisma } from "@/lib/prisma";
import { Utensils, DollarSign, Clock, CheckCircle } from "lucide-react";
import { startOfDay, endOfDay } from "date-fns";
import Link from "next/link";
import { CloseShiftButton } from "@/components/CloseShiftButton";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const today = new Date();
  const start = startOfDay(today);
  const end = endOfDay(today);

  const [todayOrders, todayRevenue, pendingOrders, completedOrders] =
    await Promise.all([
      prisma.order.count({
        where: {
          createdAt: {
            gte: start,
            lte: end,
          },
        },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: start,
            lte: end,
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
            gte: start,
            lte: end,
          },
          status: {
            in: ["PENDENTE", "EM_PREPARO"],
          },
        },
      }),
      prisma.order.count({
        where: {
          status: "ENTREGUE",
          createdAt: {
            gte: start,
            lte: end,
          },
        },
      }),
    ]);

  const stats = [
    {
      title: "Pedidos Hoje",
      value: todayOrders,
      icon: Utensils,
      color: "bg-blue-500",
      href: "/orders",
    },
    {
      title: "Receita Hoje",
      value: formatCurrency(todayRevenue._sum.total || 0),
      icon: DollarSign,
      color: "bg-green-500",
      href: "/cashier",
    },
    {
      title: "Pendentes",
      value: pendingOrders,
      icon: Clock,
      color: "bg-yellow-500",
      href: "/orders?status=pending",
    },
    {
      title: "Concluídos Hoje",
      value: completedOrders,
      icon: CheckCircle,
      color: "bg-primary-500",
      href: "/orders?status=completed",
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Bem-vindo, {session.user?.name}!
            </p>
          </div>
          <CloseShiftButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.title}
                href={stat.href}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Ações Rápidas
            </h2>
            <div className="space-y-2">
              <Link
                href="/orders/new"
                className="block w-full btn btn-primary text-center"
              >
                Novo Pedido
              </Link>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Informações
            </h2>
            <p className="text-gray-600">
              Use o menu acima para navegar pelas funcionalidades do sistema.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Layout } from "@/components/Layout";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { Eye, Edit, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { CloseOrderButton } from "@/components/CloseOrderButton";

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const today = new Date();
  const start = startOfDay(today);
  const end = endOfDay(today);

  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
    },
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
    take: 50,
  });

  const getStatusColor = (status: string, type: string) => {
    switch (status) {
      case "ABERTO":
        return "bg-green-100 text-green-800";
      case "FECHADO":
        return "bg-gray-100 text-gray-800";
      case "DELIVERY":
        return "bg-blue-100 text-blue-800";
      case "CANCELADO":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string, type: string) => {
    if (type === "DELIVERY") {
      return "Delivery";
    }
    return status;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Pedidos do Dia
          </h1>
          <p className="mt-2 text-gray-600">
            {format(today, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>

        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pedido
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente/Mesa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.type === "DELIVERY" ? "Delivery" : "Mesa"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.type === "DELIVERY"
                        ? order.customerName || "-"
                        : order.tableNumber
                        ? `Mesa ${order.tableNumber}`
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          order.status,
                          order.type
                        )}`}
                      >
                        {getStatusLabel(order.status, order.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", {
                        locale: ptBR,
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          href={`/orders/${order.id}`}
                          className="text-primary-600 hover:text-primary-900"
                          title="Ver detalhes"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        <Link
                          href={`/orders/${order.id}/edit`}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar pedido"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        {order.type === "MESA" && order.status === "ABERTO" && (
                          <CloseOrderButton orderId={order.id} />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhum pedido encontrado para hoje
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}


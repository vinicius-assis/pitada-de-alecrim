import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Layout } from "@/components/Layout";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { Eye, Edit } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type SearchParams = {
  status?: string;
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const params = await searchParams;
  const statusFilter = params.status
    ? searchParams.status === "pending"
      ? { in: ["PENDENTE", "EM_PREPARO"] }
      : searchParams.status === "completed"
      ? "ENTREGUE"
      : undefined
    : undefined;

  const orders = await prisma.order.findMany({
    where: statusFilter ? { status: statusFilter as any } : undefined,
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDENTE":
        return "bg-yellow-100 text-yellow-800";
      case "EM_PREPARO":
        return "bg-blue-100 text-blue-800";
      case "PRONTO":
        return "bg-green-100 text-green-800";
      case "ENTREGUE":
        return "bg-gray-100 text-gray-800";
      case "CANCELADO":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Histórico de Pedidos
          </h1>
          <div className="flex space-x-2">
            <Link
              href="/orders"
              className={`btn ${
                !params.status
                  ? "btn-primary"
                  : "btn-secondary"
              }`}
            >
              Todos
            </Link>
            <Link
              href="/orders?status=pending"
              className={`btn ${
                params.status === "pending"
                  ? "btn-primary"
                  : "btn-secondary"
              }`}
            >
              Pendentes
            </Link>
            <Link
              href="/orders?status=completed"
              className={`btn ${
                params.status === "completed"
                  ? "btn-primary"
                  : "btn-secondary"
              }`}
            >
              Concluídos
            </Link>
          </div>
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
                          order.status
                        )}`}
                      >
                        {order.status}
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
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        <Link
                          href={`/orders/${order.id}/edit`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhum pedido encontrado
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}


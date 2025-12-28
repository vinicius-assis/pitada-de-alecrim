import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Layout } from "@/components/Layout";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
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
            },
          },
        },
      },
    },
  });

  if (!order) {
    return (
      <Layout>
        <div className="text-center py-8">
          <p className="text-gray-500">Pedido não encontrado</p>
          <Link href="/orders" className="text-primary-600 hover:underline">
            Voltar para pedidos
          </Link>
        </div>
      </Layout>
    );
  }

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
        <Link
          href="/orders"
          className="inline-flex items-center text-primary-600 hover:text-primary-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Link>

        <div className="card">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Pedido #{order.orderNumber}
              </h1>
              <p className="text-gray-600 mt-1">
                {format(new Date(order.createdAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                  locale: ptBR,
                })}
              </p>
            </div>
            <span
              className={`px-4 py-2 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(
                order.status,
                order.type
              )}`}
            >
              {getStatusLabel(order.status, order.type)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Tipo de Pedido
              </h3>
              <p className="text-gray-900">
                {order.type === "DELIVERY" ? "Delivery" : "Mesa"}
              </p>
            </div>
            {order.type === "MESA" ? (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Mesa
                </h3>
                <p className="text-gray-900">Mesa {order.tableNumber}</p>
              </div>
            ) : (
              <>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Cliente
                  </h3>
                  <p className="text-gray-900">
                    {order.customerName || "Não informado"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Telefone
                  </h3>
                  <p className="text-gray-900">
                    {order.customerPhone || "Não informado"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Endereço de Entrega
                  </h3>
                  <p className="text-gray-900">
                    {order.deliveryAddress || "Não informado"}
                  </p>
                </div>
              </>
            )}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Atendente
              </h3>
              <p className="text-gray-900">{order.user.name}</p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Itens</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-start p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {item.dish.name}
                    </h4>
                    {item.notes && (
                      <p className="text-sm text-primary-600 mt-1">
                        Observação: {item.notes}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      Quantidade: {item.quantity} x {formatCurrency(item.price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t flex justify-between items-center">
              <span className="text-xl font-bold text-gray-900">Total:</span>
              <span className="text-2xl font-bold text-primary-600">
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}


"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Layout } from "@/components/Layout";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

type OrderStatus = "ABERTO" | "FECHADO" | "DELIVERY" | "CANCELADO";

export default function EditOrderPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string;
  const [order, setOrder] = useState<any>(null);
  const [status, setStatus] = useState<OrderStatus>("ABERTO");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      setOrder(data);
      setStatus(data.status);
      setCustomerName(data.customerName || "");
      setCustomerPhone(data.customerPhone || "");
      setTableNumber(data.tableNumber?.toString() || "");
      setDeliveryAddress(data.deliveryAddress || "");
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          customerName: customerName || null,
          customerPhone: customerPhone || null,
          tableNumber: order.type === "MESA" ? parseInt(tableNumber) : null,
          deliveryAddress: order.type === "DELIVERY" ? deliveryAddress : null,
        }),
      });

      if (res.ok) {
        router.push(`/orders/${orderId}`);
      } else {
        alert("Erro ao atualizar pedido");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Erro ao atualizar pedido");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center">Carregando...</div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="text-center py-8">
          <p className="text-gray-500">Pedido não encontrado</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <Link
          href={`/orders/${orderId}`}
          className="inline-flex items-center text-primary-600 hover:text-primary-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Link>

        <div className="card">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Editar Pedido #{order.orderNumber}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {order.type === "MESA" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status do Pedido
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OrderStatus)}
                  className="input"
                >
                  <option value="ABERTO">Aberto</option>
                  <option value="FECHADO">Fechado</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status do Pedido
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OrderStatus)}
                  className="input"
                  disabled
                >
                  <option value="DELIVERY">Delivery</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Pedidos de delivery não podem ter o status alterado
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Cliente
                </label>
                <input
                  type="text"
                  className="input"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  className="input"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
            </div>

            {order.type === "MESA" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número da Mesa
                </label>
                <input
                  type="number"
                  className="input"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Endereço de Entrega
                </label>
                <textarea
                  className="input"
                  rows={3}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <Link href={`/orders/${orderId}`} className="btn btn-secondary">
                Cancelar
              </Link>
              <button type="submit" disabled={saving} className="btn btn-primary">
                <Save className="w-4 h-4 inline mr-2" />
                {saving ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}


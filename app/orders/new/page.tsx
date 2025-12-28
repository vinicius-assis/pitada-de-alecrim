"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Layout } from "@/components/Layout";
import { Plus, Minus, X, ShoppingCart } from "lucide-react";

type Dish = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
};

type CartItem = {
  dish: Dish;
  quantity: number;
  notes?: string;
};

export default function NewOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderType = (searchParams.get("type") as "DELIVERY" | "MESA") || "MESA";

  const [dishes, setDishes] = useState<Dish[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  useEffect(() => {
    fetchDishes();
  }, []);

  const fetchDishes = async () => {
    try {
      const res = await fetch("/api/dishes");
      const data = await res.json();
      setDishes(data.filter((d: Dish) => d.available));
    } catch (error) {
      console.error("Error fetching dishes:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (dish: Dish) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.dish.id === dish.id);
      if (existing) {
        return prev.map((item) =>
          item.dish.id === dish.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { dish, quantity: 1 }];
    });
  };

  const updateQuantity = (dishId: string, delta: number) => {
    setCart((prev) => {
      const item = prev.find((item) => item.dish.id === dishId);
      if (!item) return prev;

      const newQuantity = item.quantity + delta;
      if (newQuantity <= 0) {
        return prev.filter((item) => item.dish.id !== dishId);
      }

      return prev.map((item) =>
        item.dish.id === dishId ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  const removeFromCart = (dishId: string) => {
    setCart((prev) => prev.filter((item) => item.dish.id !== dishId));
  };

  const total = cart.reduce(
    (sum, item) => sum + item.dish.price * item.quantity,
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: orderType,
          items: cart.map((item) => ({
            dishId: item.dish.id,
            quantity: item.quantity,
            price: item.dish.price,
            notes: item.notes,
          })),
          customerName: customerName || null,
          customerPhone: customerPhone || null,
          tableNumber: orderType === "MESA" ? parseInt(tableNumber) : null,
          deliveryAddress: orderType === "DELIVERY" ? deliveryAddress : null,
        }),
      });

      if (res.ok) {
        router.push("/orders");
      } else {
        alert("Erro ao criar pedido");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Erro ao criar pedido");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center">Carregando...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Novo Pedido - {orderType === "DELIVERY" ? "Delivery" : "Mesa"}
          </h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Informações do Cliente
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    className="input"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>
                {orderType === "MESA" ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
              </div>
            </div>

            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Pratos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dishes.map((dish) => (
                  <div
                    key={dish.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {dish.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {dish.description}
                        </p>
                      </div>
                      <span className="text-lg font-bold text-primary-600">
                        R$ {dish.price.toFixed(2)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => addToCart(dish)}
                      className="w-full btn btn-primary mt-2"
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      Adicionar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="card sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  <ShoppingCart className="w-5 h-5 inline mr-2" />
                  Carrinho
                </h2>
                <span className="text-sm text-gray-600">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} itens
                </span>
              </div>

              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Carrinho vazio
                </p>
              ) : (
                <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={item.dish.id}
                      className="border rounded-lg p-3 bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {item.dish.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            R$ {item.dish.price.toFixed(2)} cada
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.dish.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.dish.id, -1)}
                            className="p-1 rounded hover:bg-gray-200"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.dish.id, 1)}
                            className="p-1 rounded hover:bg-gray-200"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="font-bold text-gray-900">
                          R$ {(item.dish.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-primary-600">
                    R$ {total.toFixed(2)}
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={cart.length === 0 || submitting}
                  className="w-full btn btn-primary"
                >
                  {submitting ? "Criando..." : "Finalizar Pedido"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}


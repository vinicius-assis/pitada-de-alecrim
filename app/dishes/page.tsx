"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Layout } from "@/components/Layout";
import { Plus, Edit, Trash2, X } from "lucide-react";
import {
  formatCurrency,
  formatCurrencyInput,
  parseCurrencyInput,
} from "@/lib/utils";

type Dish = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  category: string | null;
  available: boolean;
};

export default function DishesPage() {
  const { data: session } = useSession();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
  });

  useEffect(() => {
    if (session && (session.user as any)?.role !== "ADMIN") {
      redirect("/dashboard");
    }
    fetchDishes();
  }, [session]);

  const fetchDishes = async () => {
    try {
      const res = await fetch("/api/dishes");
      const data = await res.json();
      setDishes(data);
    } catch (error) {
      console.error("Error fetching dishes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingDish ? `/api/dishes/${editingDish.id}` : "/api/dishes";
      const method = editingDish ? "PATCH" : "POST";

      // Se for acompanhamento, preço é 0
      const finalPrice =
        formData.category === "Acompanhamento"
          ? 0
          : parseCurrencyInput(formData.price);

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: finalPrice,
        }),
      });

      if (res.ok) {
        fetchDishes();
        setShowModal(false);
        resetForm();
      } else {
        alert("Erro ao salvar item");
      }
    } catch (error) {
      console.error("Error saving dish:", error);
      alert("Erro ao salvar item");
    }
  };

  const handleEdit = (dish: Dish) => {
    setEditingDish(dish);
    const category = dish.category || "";
    setFormData({
      name: dish.name,
      price:
        category === "Acompanhamento" ? "0,00" : formatCurrency(dish.price),
      category: category,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este item?")) return;

    try {
      const res = await fetch(`/api/dishes/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchDishes();
      } else {
        alert("Erro ao excluir item");
      }
    } catch (error) {
      console.error("Error deleting dish:", error);
      alert("Erro ao excluir item");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      category: "",
    });
    setEditingDish(null);
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
            Cadastro de Items
          </h1>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Novo Item
          </button>
        </div>

        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dishes.map((dish) => (
                  <tr key={dish.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {dish.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {dish.category || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(dish.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(dish)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar item"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(dish.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {dishes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhum item cadastrado
              </div>
            )}
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingDish ? "Editar Item" : "Novo Item"}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria *
                  </label>
                  <select
                    className="input"
                    value={formData.category}
                    onChange={(e) => {
                      const newCategory = e.target.value;
                      setFormData({
                        ...formData,
                        category: newCategory,
                        // Limpar preço se mudar para Acompanhamento, manter se mudar de Acompanhamento
                        price:
                          newCategory === "Acompanhamento"
                            ? "0,00"
                            : formData.category === "Acompanhamento"
                            ? ""
                            : formData.price,
                      });
                    }}
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    <option value="Bebidas">Bebidas</option>
                    <option value="Tipo de Carnes">Tipo de Carnes</option>
                    <option value="Acompanhamento">Acompanhamento</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preço {formData.category !== "Acompanhamento" ? "*" : ""}
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={
                      formData.category === "Acompanhamento"
                        ? "0,00"
                        : formData.price
                    }
                    onChange={(e) => {
                      const formatted = formatCurrencyInput(e.target.value);
                      setFormData({ ...formData, price: formatted });
                    }}
                    placeholder="0,00"
                    disabled={formData.category === "Acompanhamento"}
                    required={formData.category !== "Acompanhamento"}
                  />
                  {formData.category === "Acompanhamento" && (
                    <p className="text-sm text-gray-500 mt-1">
                      Acompanhamentos não têm preço
                    </p>
                  )}
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="btn btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

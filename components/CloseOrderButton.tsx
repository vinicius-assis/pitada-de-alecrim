"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export function CloseOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClose = async () => {
    if (!confirm("Tem certeza que deseja fechar este pedido?")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/close`, {
        method: "POST",
      });

      if (res.ok) {
        router.refresh();
      } else {
        const error = await res.json();
        alert(`Erro ao fechar pedido: ${error.error || "Erro desconhecido"}`);
      }
    } catch (error) {
      console.error("Error closing order:", error);
      alert("Erro ao fechar pedido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClose}
      disabled={loading}
      className="text-orange-600 hover:text-orange-900"
      title="Fechar pedido"
    >
      <X className="w-5 h-5" />
    </button>
  );
}


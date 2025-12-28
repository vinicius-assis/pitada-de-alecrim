"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Power } from "lucide-react";

export function CloseShiftButton() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handleCloseShift = async () => {
    if (!confirm("Tem certeza que deseja encerrar o expediente? Esta ação não pode ser desfeita.")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/shift/close", {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        alert(`Expediente encerrado!\nTotal: R$ ${data.summary.totalRevenue.toFixed(2)}\nPedidos: ${data.summary.totalOrders}`);
        router.refresh();
      } else {
        const error = await res.json();
        alert(`Erro ao encerrar expediente: ${error.error || "Erro desconhecido"}`);
      }
    } catch (error) {
      console.error("Error closing shift:", error);
      alert("Erro ao encerrar expediente");
    } finally {
      setLoading(false);
    }
  };

  if ((session?.user as any)?.role !== "ADMIN") {
    return null;
  }

  return (
    <button
      onClick={handleCloseShift}
      disabled={loading}
      className="btn btn-danger"
    >
      <Power className="w-4 h-4 inline mr-2" />
      {loading ? "Encerrando..." : "Encerrar Expediente"}
    </button>
  );
}


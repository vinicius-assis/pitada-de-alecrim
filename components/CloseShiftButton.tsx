"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Power } from "lucide-react";

interface CloseShiftButtonProps {
  onClose?: () => void;
}

export function CloseShiftButton({ onClose }: CloseShiftButtonProps) {
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
        onClose?.();
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
      className="w-full flex items-center justify-center px-4 py-3 text-base font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Power className="w-5 h-5 mr-3" />
      {loading ? "Encerrando..." : "Encerrar Expediente"}
    </button>
  );
}


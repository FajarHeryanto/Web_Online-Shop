/**
 * @file app/(main)/orders/cancel-order-button.tsx
 * @description Tombol "Batalkan Pesanan" dengan dialog konfirmasi.
 *
 * Client Component karena membutuhkan:
 *   - useState untuk loading & dialog
 *   - onClick handler untuk memanggil server action
 *   - useRouter untuk refresh data setelah pembatalan
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, XCircle } from "lucide-react";
import { cancelOrder } from "@/actions/order.actions";

interface CancelOrderButtonProps {
  orderId: string;
  orderNumber: string;
}

export function CancelOrderButton({
  orderId,
  orderNumber,
}: CancelOrderButtonProps) {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  async function handleCancel() {
    setIsLoading(true);
    setToast(null);

    try {
      const result = await cancelOrder(orderId);

      if (!result.success) {
        setToast({ type: "error", message: result.error || "Gagal membatalkan pesanan." });
        setIsLoading(false);
        return;
      }

      setToast({ type: "success", message: `Pesanan ${orderNumber} berhasil dibatalkan.` });
      setShowDialog(false);

      // Refresh halaman agar daftar pesanan ter-update
      router.refresh();
    } catch {
      setToast({ type: "error", message: "Terjadi kesalahan. Coba lagi." });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed right-4 top-4 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg transition-all ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.message}
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-white/70 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tombol Batalkan */}
      <button
        type="button"
        onClick={() => setShowDialog(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3.5 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700"
      >
        <XCircle className="h-3.5 w-3.5" />
        <span>Batalkan</span>
      </button>

      {/* Dialog Konfirmasi */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            {/* Header */}
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              Batalkan Pesanan?
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Yakin ingin membatalkan pesanan{" "}
              <span className="font-mono font-semibold text-slate-700">
                {orderNumber}
              </span>
              ? Tindakan ini tidak dapat dibatalkan.
            </p>

            {/* Tombol Aksi */}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowDialog(false)}
                disabled={isLoading}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Membatalkan...
                  </>
                ) : (
                  "Ya, Batalkan"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

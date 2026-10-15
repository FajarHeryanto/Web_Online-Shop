/**
 * @file types/midtrans.d.ts
 * @description Deklarasi tipe untuk Midtrans Snap.js yang dimuat via script tag.
 *
 * Snap.js menambahkan objek `snap` ke `window` global.
 * File ini mendeklarasikan tipenya agar TypeScript tidak error.
 */

interface SnapPayResult {
  order_id: string;
  transaction_status: string;
  gross_amount: string;
  payment_type: string;
  status_code: string;
  fraud_status?: string;
}

interface SnapInstance {
  /**
   * Membuka popup pembayaran Midtrans Snap.
   *
   * @param token - Snap token yang didapat dari server
   * @param options - Callback functions
   */
  pay(
    token: string,
    options?: {
      /** Dipanggil saat pembayaran berhasil */
      onSuccess?: (result: SnapPayResult) => void;
      /** Dipanggil saat pembayaran pending (menunggu) */
      onPending?: (result: SnapPayResult) => void;
      /** Dipanggil saat terjadi error */
      onError?: (result: SnapPayResult) => void;
      /** Dipanggil saat user menutup popup tanpa menyelesaikan */
      onClose?: () => void;
    }
  ): void;
}

declare global {
  interface Window {
    snap?: SnapInstance;
  }
}

export {};

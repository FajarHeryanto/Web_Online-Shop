/**
 * @file lib/midtrans.ts
 * @description Konfigurasi dan helper untuk Midtrans Snap API.
 *
 * Midtrans Snap API flow:
 *   1. Server membuat transaksi → mendapat `snap_token`
 *   2. Client membuka popup Snap dengan token tersebut
 *   3. User menyelesaikan pembayaran di popup
 *   4. Midtrans mengirim webhook notification ke server
 *
 * Environment Variables yang dibutuhkan:
 *   MIDTRANS_SERVER_KEY  → untuk server-side API calls
 *   MIDTRANS_CLIENT_KEY  → untuk client-side Snap popup
 *   MIDTRANS_IS_PRODUCTION → "true" untuk production, lainnya sandbox
 *
 * Dokumentasi resmi: https://docs.midtrans.com/docs/snap-integration
 */

// ============================================================
// KONFIGURASI
// ============================================================

const IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === "true";

const MIDTRANS_BASE_URL = IS_PRODUCTION
  ? "https://app.midtrans.com/snap/v1"
  : "https://app.sandbox.midtrans.com/snap/v1";

const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY ?? "";

// ============================================================
// TYPES
// ============================================================

/** Parameter untuk membuat transaksi Snap. */
export interface SnapTransactionParams {
  /** ID unik pesanan (orderNumber) */
  orderId: string;
  /** Total pembayaran dalam Rupiah (integer, tanpa desimal) */
  grossAmount: number;
  /** Nama pembeli */
  customerName: string;
  /** Email pembeli */
  customerEmail: string;
  /** Daftar item untuk ditampilkan di popup Snap */
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

/** Response dari Midtrans Snap API. */
interface SnapApiResponse {
  token: string;
  redirect_url: string;
}

// ============================================================
// CREATE SNAP TRANSACTION
// ============================================================

/**
 * Membuat transaksi Midtrans Snap dan mendapatkan token.
 *
 * Token ini digunakan di client untuk membuka popup pembayaran:
 *   window.snap.pay(token)
 *
 * @throws Error jika Midtrans API gagal
 *
 * @example
 *   const { token, redirectUrl } = await createSnapTransaction({
 *     orderId: "ORD-20261007-A3F8K",
 *     grossAmount: 350000,
 *     customerName: "Budi",
 *     customerEmail: "budi@email.com",
 *     items: [{ id: "1", name: "Kaos", price: 150000, quantity: 2 }],
 *   });
 */
export async function createSnapTransaction(
  params: SnapTransactionParams
): Promise<{ token: string; redirectUrl: string }> {
  // Validasi server key
  if (!SERVER_KEY) {
    throw new Error(
      "MIDTRANS_SERVER_KEY belum di-set. Tambahkan ke file .env"
    );
  }

  // Payload sesuai Midtrans Snap API spec
  const payload = {
    transaction_details: {
      order_id: params.orderId,
      gross_amount: Math.round(params.grossAmount), // Harus integer
    },
    item_details: params.items.map((item) => ({
      id: item.id,
      name: item.name.slice(0, 50), // Midtrans max 50 char
      price: Math.round(item.price),
      quantity: item.quantity,
    })),
    customer_details: {
      first_name: params.customerName,
      email: params.customerEmail,
    },
  };

  // Base64 encode "SERVER_KEY:" untuk Basic Auth
  const authString = Buffer.from(`${SERVER_KEY}:`).toString("base64");

  const response = await fetch(`${MIDTRANS_BASE_URL}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Basic ${authString}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("[Midtrans] API Error:", response.status, errorBody);
    throw new Error(`Midtrans API error: ${response.status}`);
  }

  const data: SnapApiResponse = await response.json();

  return {
    token: data.token,
    redirectUrl: data.redirect_url,
  };
}

// ============================================================
// VERIFY WEBHOOK SIGNATURE
// ============================================================

/**
 * Verifikasi signature dari webhook notification Midtrans.
 *
 * Signature = SHA512(order_id + status_code + gross_amount + server_key)
 *
 * @param orderId - order_id dari notification
 * @param statusCode - status_code dari notification
 * @param grossAmount - gross_amount dari notification
 * @param signatureKey - signature_key dari notification
 * @returns true jika signature valid
 */
export async function verifySignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string
): Promise<boolean> {
  const payload = `${orderId}${statusCode}${grossAmount}${SERVER_KEY}`;

  // Gunakan Web Crypto API (tersedia di Node.js 18+)
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const hashBuffer = await crypto.subtle.digest("SHA-512", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  return hashHex === signatureKey;
}

/**
 * foodApi.ts — REST client for the Go backend food/order endpoints
 * Base: VITE_API_URL (default http://localhost:8081/api)
 */

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8081/api";

// ── Types (mirror backend DTO) ────────────────────────────────────────────────

export interface ApiProduct {
  id: number;
  productId: string;
  merchantAddress: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  originalPrice: string;
  discountedPrice: string;
  discountRate: number;
  discountPercentage: number;
  quantity: number;
  availableQty: number;
  status: string;           // AVAILABLE | RESERVED | SOLD | EXPIRED
  expiryTime?: string;
  soldQuantity: number;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  listedAt: string;
}

export interface ApiProductListResponse {
  products: ApiProduct[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiOrder {
  id: number;
  orderId: string;
  productId: number;
  customerAddress: string;
  merchantAddress: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  status: string;           // PLACED | CONFIRMED | COMPLETED | CANCELLED
  paymentTxHash?: string;
  createdAt: string;
  completedAt?: string;
}

export interface ApiOrderListResponse {
  orders: ApiOrder[];
  total: number;
  page: number;
  limit: number;
}

// ── Health check ──────────────────────────────────────────────────────────────

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

// ── Products ──────────────────────────────────────────────────────────────────

export async function apiGetProducts(page = 1, limit = 50): Promise<ApiProductListResponse> {
  const res = await fetch(`${BASE}/products?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error(`GET /products failed: ${res.status}`);
  return res.json();
}

export async function apiGetProductsByMerchant(merchantAddress: string): Promise<ApiProductListResponse> {
  const res = await fetch(`${BASE}/products/merchant/${merchantAddress}`);
  if (!res.ok) throw new Error(`GET /products/merchant failed: ${res.status}`);
  return res.json();
}

export async function apiCreateProduct(payload: {
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  originalPrice: string;
  discountRate: number;
  quantity: number;
  expiryTime?: string;
  merchantAddress: string;
}): Promise<ApiProduct> {
  const res = await fetch(`${BASE}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`POST /products failed: ${res.status}`);
  return res.json();
}

export async function apiUpdateProductStatus(id: number, status: string): Promise<void> {
  const res = await fetch(`${BASE}/products/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`PUT /products/${id}/status failed: ${res.status}`);
}

export async function apiUpdateProductQuantity(id: number, quantity: number): Promise<void> {
  const res = await fetch(`${BASE}/products/${id}/quantity`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity }),
  });
  if (!res.ok) throw new Error(`PUT /products/${id}/quantity failed: ${res.status}`);
}

// ── Orders ────────────────────────────────────────────────────────────────────

export async function apiCreateOrder(payload: {
  productId: number;
  quantity: number;
  customerAddress: string;
}): Promise<ApiOrder> {
  const res = await fetch(`${BASE}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `POST /orders failed: ${res.status}`);
  }
  return res.json();
}

export async function apiGetCustomerOrders(customerAddress: string, page = 1, limit = 50): Promise<ApiOrderListResponse> {
  const res = await fetch(`${BASE}/orders/customer/${customerAddress}?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error(`GET /orders/customer failed: ${res.status}`);
  return res.json();
}

export async function apiGetMerchantOrders(merchantAddress: string, page = 1, limit = 50): Promise<ApiOrderListResponse> {
  const res = await fetch(`${BASE}/orders/merchant/${merchantAddress}?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error(`GET /orders/merchant failed: ${res.status}`);
  return res.json();
}

export async function apiUpdateOrderStatus(
  orderId: number,
  status: string,
  paymentTxHash?: string,
): Promise<void> {
  const res = await fetch(`${BASE}/orders/${orderId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, paymentTxHash }),
  });
  if (!res.ok) throw new Error(`PUT /orders/${orderId}/status failed: ${res.status}`);
}

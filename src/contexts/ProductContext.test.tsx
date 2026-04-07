import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ProductProvider, useProducts, type Product, type Order } from './ProductContext';

// ─── 測試用假資料 ──────────────────────────────────────────────────────────────

const mockProduct: Product = {
  id: 'prod-001',
  restaurantName: '測試餐廳',
  productName: '今日特餐',
  description: '好吃的特餐',
  originalPrice: 100,
  discountPrice: 60,
  discount: 40,
  quantity: 10,
  image: '🍱',
  category: 'fastfood',
  expiryTime: '2026-04-06T12:00',
  rating: 4.5,
  status: 'PUBLISHED',
  publishDate: '2026-04-05',
  merchantAddress: '0xMerchant001',
};

const mockOrder: Order = {
  orderId: 'order-001',
  productId: 'prod-001',
  merchantAddress: '0xMerchant001',
  productName: '今日特餐',
  quantity: 2,
  unitPrice: 60,
  totalPrice: 120,
  status: 'PLACED',
  timestamp: '2026-04-05 10:00',
  customerAddress: '0xCustomer001',
  pledgedAmount: 120,
};

// ─── Wrapper ───────────────────────────────────────────────────────────────────

const wrapper = ({ children }: { children: ReactNode }) => (
  <ProductProvider>{children}</ProductProvider>
);

// ProductContext 把所有狀態同步到 localStorage，測試間必須清空以避免交叉汙染
beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());

// ─── 測試套件 ──────────────────────────────────────────────────────────────────

describe('ProductContext — 商品管理', () => {
  it('初始狀態應為空列表', () => {
    const { result } = renderHook(() => useProducts(), { wrapper });
    expect(result.current.products).toEqual([]);
  });

  it('addProduct 應新增商品', () => {
    const { result } = renderHook(() => useProducts(), { wrapper });

    act(() => {
      result.current.addProduct(mockProduct);
    });

    expect(result.current.products).toHaveLength(1);
    expect(result.current.products[0].productName).toBe('今日特餐');
    expect(result.current.products[0].merchantAddress).toBe('0xMerchant001');
  });

  it('addProduct 多次應累積商品', () => {
    const { result } = renderHook(() => useProducts(), { wrapper });

    act(() => {
      result.current.addProduct(mockProduct);
      result.current.addProduct({ ...mockProduct, id: 'prod-002', productName: '明日便當' });
    });

    expect(result.current.products).toHaveLength(2);
  });

  it('updateProduct 應更新指定欄位', () => {
    const { result } = renderHook(() => useProducts(), { wrapper });

    act(() => {
      result.current.addProduct(mockProduct);
    });
    act(() => {
      result.current.updateProduct('prod-001', { quantity: 5, status: 'SOLD_OUT' });
    });

    const updated = result.current.products.find((p) => p.id === 'prod-001');
    expect(updated?.quantity).toBe(5);
    expect(updated?.status).toBe('SOLD_OUT');
    expect(updated?.productName).toBe('今日特餐'); // 未更新的欄位不變
  });

  it('deleteProduct 應移除商品', () => {
    const { result } = renderHook(() => useProducts(), { wrapper });

    act(() => {
      result.current.addProduct(mockProduct);
      result.current.addProduct({ ...mockProduct, id: 'prod-002' });
    });
    act(() => {
      result.current.deleteProduct('prod-001');
    });

    expect(result.current.products).toHaveLength(1);
    expect(result.current.products[0].id).toBe('prod-002');
  });
});

describe('ProductContext — 訂單管理', () => {
  it('初始狀態訂單應為空', () => {
    const { result } = renderHook(() => useProducts(), { wrapper });
    expect(result.current.orders).toEqual([]);
  });

  it('addOrder 應建立訂單並扣減商品庫存', () => {
    const { result } = renderHook(() => useProducts(), { wrapper });

    act(() => {
      result.current.addProduct(mockProduct);
    });
    act(() => {
      result.current.addOrder(mockOrder);
    });

    expect(result.current.orders).toHaveLength(1);
    expect(result.current.orders[0].status).toBe('PLACED');
    // 庫存應從 10 扣減 2
    const product = result.current.products.find((p) => p.id === 'prod-001');
    expect(product?.quantity).toBe(8);
  });

  it('updateOrderStatus 應更新訂單狀態', () => {
    const { result } = renderHook(() => useProducts(), { wrapper });

    act(() => {
      result.current.addProduct(mockProduct);
      result.current.addOrder(mockOrder);
    });
    act(() => {
      result.current.updateOrderStatus('order-001', 'CONFIRMED');
    });

    expect(result.current.orders[0].status).toBe('CONFIRMED');
  });

  it('updateOrderStatus CANCELLED 不影響其他訂單', () => {
    const { result } = renderHook(() => useProducts(), { wrapper });

    act(() => {
      result.current.addProduct(mockProduct);
      result.current.addOrder(mockOrder);
      result.current.addOrder({ ...mockOrder, orderId: 'order-002' });
    });
    act(() => {
      result.current.updateOrderStatus('order-001', 'CANCELLED');
    });

    const cancelled = result.current.orders.find((o) => o.orderId === 'order-001');
    const other = result.current.orders.find((o) => o.orderId === 'order-002');
    expect(cancelled?.status).toBe('CANCELLED');
    expect(other?.status).toBe('PLACED');
  });
});

describe('ProductContext — 交付照片核銷 (T3-4)', () => {
  it('uploadDeliveryPhoto 應標記訂單為 COMPLETED 並退還質押', () => {
    const { result } = renderHook(() => useProducts(), { wrapper });

    act(() => {
      result.current.addProduct(mockProduct);
      result.current.addOrder(mockOrder);
    });
    act(() => {
      result.current.uploadDeliveryPhoto('order-001', 'https://example.com/photo.jpg');
    });

    const order = result.current.orders.find((o) => o.orderId === 'order-001');
    expect(order?.status).toBe('COMPLETED');
    expect(order?.deliveryPhotoUrl).toBe('https://example.com/photo.jpg');
    expect(order?.pledgeReturned).toBe(true);
    expect(order?.deliveryConfirmedTime).toBeTruthy();
  });
});

describe('ProductContext — 評分與評論 (T3-5)', () => {
  it('submitReview 應記錄評分並給予平台幣', () => {
    const { result } = renderHook(() => useProducts(), { wrapper });

    act(() => {
      result.current.addProduct(mockProduct);
      result.current.addOrder(mockOrder);
    });
    act(() => {
      result.current.submitReview('order-001', 5, '非常好吃！');
    });

    const order = result.current.orders.find((o) => o.orderId === 'order-001');
    expect(order?.rating).toBe(5);
    expect(order?.review).toBe('非常好吃！');
    expect(order?.platformCoins).toBe(10);
  });
});

describe('ProductContext — 訂單查詢', () => {
  it('getOrdersByCustomer 應只回傳該消費者的訂單', () => {
    const { result } = renderHook(() => useProducts(), { wrapper });

    act(() => {
      result.current.addProduct(mockProduct);
      result.current.addOrder(mockOrder); // customerAddress: 0xCustomer001
      result.current.addOrder({ ...mockOrder, orderId: 'order-002', customerAddress: '0xCustomer002' });
    });

    const orders = result.current.getOrdersByCustomer('0xCustomer001');
    expect(orders).toHaveLength(1);
    expect(orders[0].orderId).toBe('order-001');
  });

  it('getOrdersByRestaurant 應只回傳該餐廳的訂單', () => {
    const { result } = renderHook(() => useProducts(), { wrapper });

    act(() => {
      result.current.addProduct(mockProduct);
      result.current.addOrder(mockOrder); // merchantAddress: 0xMerchant001
      result.current.addOrder({ ...mockOrder, orderId: 'order-002', merchantAddress: '0xMerchant002' });
    });

    const orders = result.current.getOrdersByRestaurant('0xMerchant001');
    expect(orders).toHaveLength(1);
    expect(orders[0].merchantAddress).toBe('0xMerchant001');
  });
});

describe('ProductContext — 平台幣 (T3-6)', () => {
  it('addPlatformCoins 應建立餘額紀錄', () => {
    const { result } = renderHook(() => useProducts(), { wrapper });

    act(() => {
      result.current.addPlatformCoins('0xUser001', 10, 'REVIEW', '評論食物');
    });

    const balance = result.current.getPlatformCoinBalance('0xUser001');
    expect(balance?.balance).toBe(10);
    expect(balance?.totalEarned).toBe(10);
  });

  it('addPlatformCoins 多次應累加餘額', () => {
    const { result } = renderHook(() => useProducts(), { wrapper });

    act(() => {
      result.current.addPlatformCoins('0xUser001', 10, 'REVIEW', '評論食物');
      result.current.addPlatformCoins('0xUser001', 20, 'COMPLETION', '完成訂單');
    });

    const balance = result.current.getPlatformCoinBalance('0xUser001');
    expect(balance?.balance).toBe(30);
    expect(balance?.totalEarned).toBe(30);
  });

  it('redeemPlatformCoins 應扣減餘額', () => {
    const { result } = renderHook(() => useProducts(), { wrapper });

    act(() => {
      result.current.addPlatformCoins('0xUser001', 50, 'COMPLETION', '完成訂單');
    });
    act(() => {
      result.current.redeemPlatformCoins('0xUser001', 20, '兌換折扣');
    });

    const balance = result.current.getPlatformCoinBalance('0xUser001');
    expect(balance?.balance).toBe(30);
    expect(balance?.totalRedeemed).toBe(20);
  });

  it('redeemPlatformCoins 餘額不足應回傳 false', () => {
    const { result } = renderHook(() => useProducts(), { wrapper });

    act(() => {
      result.current.addPlatformCoins('0xUser001', 10, 'REVIEW', '評論食物');
    });

    let success = true;
    act(() => {
      success = result.current.redeemPlatformCoins('0xUser001', 100, '兌換折扣');
    });

    expect(success).toBe(false);
    const balance = result.current.getPlatformCoinBalance('0xUser001');
    expect(balance?.balance).toBe(10); // 餘額不變
  });

  it('getPlatformCoinTransactions 應只回傳該使用者的交易', () => {
    const { result } = renderHook(() => useProducts(), { wrapper });

    act(() => {
      result.current.addPlatformCoins('0xUser001', 10, 'REVIEW', '評論食物');
      result.current.addPlatformCoins('0xUser002', 20, 'REVIEW', '評論食物');
    });

    const txns = result.current.getPlatformCoinTransactions('0xUser001');
    expect(txns).toHaveLength(1);
    expect(txns[0].userAddress).toBe('0xUser001');
  });
});

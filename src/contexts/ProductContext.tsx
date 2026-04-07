import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  checkHealth,
  apiGetProducts,
  apiGetCustomerOrders,
  apiGetMerchantOrders,
  apiCreateProduct,
  apiCreateOrder,
  apiUpdateOrderStatus,
  type ApiProduct,
  type ApiOrder,
} from '../api/foodApi';

export interface Product {
  id: string;
  restaurantName: string;
  productName: string;
  description: string;
  originalPrice: number;
  discountPrice?: number;
  discount?: number;
  quantity: number;
  image: string;
  category: string;
  expiryTime: string;
  rating: number;
  status: 'PUBLISHED' | 'SOLD_OUT' | 'DRAFT';
  publishDate: string;
  merchantAddress: string;
}

export interface Order {
  orderId: string;
  backendId?: number;        // 後端整數 ID（用於 API 呼叫）
  productId: string;
  merchantAddress: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: 'PLACED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  timestamp: string;
  customerAddress: string;
  // T3-3: 質押幣機制
  pledgedAmount?: number; // 消費者質押的 USDC 金額（等同訂單總價）
  pledgeReturned?: boolean; // 質押是否已退還給消費者
  // T3-4: 交付照片验证
  deliveryPhotoUrl?: string; // 餐廳上传的交付照片
  deliveryConfirmedTime?: string; // 餐廳确认交付的时间
  // T3-5: 评论与评分
  rating?: number; // 1-5 星评分
  review?: string; // 消费者评论
  reviewTime?: string; // 评论时间
  platformCoins?: number; // 消费者赚取的平台币
}

// T3-6: 平台币交易记录
export interface PlatformCoinTransaction {
  id: string;
  userAddress: string;
  amount: number; // 正数为入账，负数为出账
  type: 'REVIEW' | 'COMPLETION' | 'REDEMPTION' | 'REFUND';
  reason: string; // 描述如："评论食物"、"提现"等
  relatedOrderId?: string;
  timestamp: string;
}

// T3-6: 用户平台币余额
export interface UserPlatformCoinBalance {
  userAddress: string;
  balance: number;
  totalEarned: number;
  totalRedeemed: number;
  updatedAt: string;
}

interface ProductContextType {
  products: Product[];
  orders: Order[];
  platformCoinTransactions: PlatformCoinTransaction[];
  platformCoinBalances: Map<string, UserPlatformCoinBalance>;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  // T3-4: 交付照片与确认
  uploadDeliveryPhoto: (orderId: string, photoUrl: string) => void;
  // T3-5: 评分与评论
  submitReview: (orderId: string, rating: number, review: string) => void;
  // T3-10: 订单历史查询
  getOrdersByCustomer: (customerAddress: string) => Order[];
  getOrdersByRestaurant: (merchantAddress: string) => Order[];
  // T3-6: 平台币管理
  getPlatformCoinBalance: (userAddress: string) => UserPlatformCoinBalance | undefined;
  getPlatformCoinTransactions: (userAddress: string) => PlatformCoinTransaction[];
  addPlatformCoins: (userAddress: string, amount: number, type: PlatformCoinTransaction['type'], reason: string, relatedOrderId?: string) => void;
  redeemPlatformCoins: (userAddress: string, amount: number, reason: string) => boolean;
  // 後端同步
  syncCustomerOrders: (customerAddress: string) => Promise<void>;
  syncMerchantOrders: (merchantAddress: string) => Promise<void>;
  backendOnline: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// 初始化演示数据 - 注：初始产品为空，用户需要先发布商品
// 初始产品的 merchantAddress 如果设置为硬编码值，会与真实钱包地址不匹配，
// 导致订单无法显示。所以保持为空列表。
const INITIAL_PRODUCTS: Product[] = [];

const INITIAL_ORDERS: Order[] = [];

const INITIAL_PLATFORM_COIN_TRANSACTIONS: PlatformCoinTransaction[] = [];

// ── Map API types → local types ───────────────────────────────────────────────
function apiProductToLocal(p: ApiProduct): Product {
  return {
    id: String(p.id),
    restaurantName: '',
    productName: p.name,
    description: p.description,
    originalPrice: parseFloat(p.originalPrice),
    discountPrice: parseFloat(p.discountedPrice),
    discount: p.discountPercentage,
    quantity: p.quantity,
    availableQty: p.availableQty,
    image: p.imageUrl,
    category: p.category,
    expiryTime: p.expiryTime ?? '',
    rating: 0,
    status: p.status === 'AVAILABLE' ? 'PUBLISHED' : p.status === 'SOLD' ? 'SOLD_OUT' : 'DRAFT',
    publishDate: p.listedAt,
    merchantAddress: p.merchantAddress,
    name: p.name,
    productId: p.productId,
  } as unknown as Product;
}

function apiOrderToLocal(o: ApiOrder): Order {
  return {
    orderId: o.orderId,
    productId: String(o.productId),
    merchantAddress: o.merchantAddress,
    productName: '',
    quantity: o.quantity,
    unitPrice: parseFloat(o.unitPrice),
    totalPrice: parseFloat(o.totalPrice),
    status: o.status as Order['status'],
    timestamp: o.createdAt,
    customerAddress: o.customerAddress,
  };
}

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [platformCoinTransactions, setPlatformCoinTransactions] = useState<PlatformCoinTransaction[]>(INITIAL_PLATFORM_COIN_TRANSACTIONS);
  const [platformCoinBalances, setPlatformCoinBalances] = useState<Map<string, UserPlatformCoinBalance>>(new Map());
  const [backendOnline, setBackendOnline] = useState(false);

  // ── 從後端同步資料 ─────────────────────────────────────────────────────────
  const syncFromBackend = useCallback(async () => {
    try {
      const ok = await checkHealth();
      setBackendOnline(ok);
      if (!ok) return;

      // 拉取所有商品（覆蓋 localStorage 版本）
      const productRes = await apiGetProducts(1, 100);
      setProducts(productRes.products.map(apiProductToLocal));
      // 訂單為使用者維度，由各頁面按需拉取
    } catch {
      setBackendOnline(false);
    }
  }, []);

  // ── 從 localStorage 恢復資料（離線備援）────────────────────────────────────
  useEffect(() => {
    const savedProducts = localStorage.getItem('merchant_products');
    const savedOrders = localStorage.getItem('merchant_orders');
    const savedTransactions = localStorage.getItem('platform_coin_transactions');
    const savedBalances = localStorage.getItem('platform_coin_balances');

    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedOrders) setOrders(JSON.parse(savedOrders));
    if (savedTransactions) setPlatformCoinTransactions(JSON.parse(savedTransactions));
    if (savedBalances) {
      const balancesData = JSON.parse(savedBalances);
      setPlatformCoinBalances(new Map(Object.entries(balancesData)));
    }

    // 嘗試從後端同步（若在線則覆蓋 localStorage 資料）
    syncFromBackend();
  }, [syncFromBackend]);

  // 保存产品到 localStorage
  useEffect(() => {
    localStorage.setItem('merchant_products', JSON.stringify(products));
  }, [products]);

  // 保存订单到 localStorage
  useEffect(() => {
    localStorage.setItem('merchant_orders', JSON.stringify(orders));
  }, [orders]);

  // 保存平台币交易到 localStorage
  useEffect(() => {
    localStorage.setItem('platform_coin_transactions', JSON.stringify(platformCoinTransactions));
  }, [platformCoinTransactions]);

  // 保存平台币余额到 localStorage
  useEffect(() => {
    const balancesData = Object.fromEntries(platformCoinBalances);
    localStorage.setItem('platform_coin_balances', JSON.stringify(balancesData));
  }, [platformCoinBalances]);

  const addProduct = (product: Product) => {
    setProducts((prev) => [product, ...prev]);
    // 同步寫入後端（若在線）
    if (backendOnline) {
      const discountRate = product.originalPrice > 0
        ? Math.round((1 - (product.discountPrice ?? product.originalPrice) / product.originalPrice) * 100)
        : 0;
      apiCreateProduct({
        name: product.productName,
        description: product.description,
        category: product.category,
        imageUrl: product.image || '',
        originalPrice: String(product.originalPrice),
        discountRate,
        quantity: product.quantity,
        expiryTime: product.expiryTime || undefined,
        merchantAddress: product.merchantAddress,
      }).then((created) => {
        // 用後端回傳的 ID 更新本地商品
        setProducts((prev) =>
          prev.map((p) => p.id === product.id ? { ...p, id: String(created.id) } : p)
        );
      }).catch(() => { /* 離線時忽略 */ });
    }
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const addOrder = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
    // 更新产品库存
    updateProduct(order.productId, {
      quantity: Math.max(0, (products.find((p) => p.id === order.productId)?.quantity || 0) - order.quantity),
    });
    // 同步寫入後端（若在線）
    if (backendOnline) {
      const productBackendId = Number(order.productId);
      if (!isNaN(productBackendId) && productBackendId > 0) {
        apiCreateOrder({
          productId: productBackendId,
          quantity: order.quantity,
          customerAddress: order.customerAddress,
        }).then((created) => {
          // 用後端回傳的 ID 更新本地訂單（讓後續 updateOrderStatus 可用）
          setOrders((prev) =>
            prev.map((o) =>
              o.orderId === order.orderId
                ? { ...o, orderId: created.orderId, backendId: created.id }
                : o
            )
          );
        }).catch(() => { /* 離線時忽略 */ });
      }
    }
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.orderId === orderId ? { ...o, status } : o))
    );
    // 同步寫入後端（若在線且有 backendId）
    if (backendOnline) {
      const order = orders.find((o) => o.orderId === orderId);
      if (order?.backendId) {
        apiUpdateOrderStatus(order.backendId, status).catch(() => { /* 離線時忽略 */ });
      }
    }
  };

  // T3-4: 上传交付照片
  const uploadDeliveryPhoto = (orderId: string, photoUrl: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.orderId === orderId
          ? {
              ...o,
              deliveryPhotoUrl: photoUrl,
              deliveryConfirmedTime: new Date().toLocaleString('zh-TW'),
              status: 'COMPLETED',
              pledgeReturned: true,
            }
          : o
      )
    );
  };

  // T3-5: 提交评分与评论
  const submitReview = (orderId: string, rating: number, review: string) => {
    const platformCoinsEarned = 10; // 每次评论赚取 10 平台币
    setOrders((prev) =>
      prev.map((o) =>
        o.orderId === orderId
          ? {
              ...o,
              rating,
              review,
              reviewTime: new Date().toLocaleString('zh-TW'),
              platformCoins: platformCoinsEarned,
            }
          : o
      )
    );
    // 同时给用户添加平台币
    const order = orders.find((o) => o.orderId === orderId);
    if (order) {
      addPlatformCoins(order.customerAddress, platformCoinsEarned, 'REVIEW', `评论"${order.productName}"`, orderId);
    }
  };

  // T3-10: 获取消费者订单历史
  const getOrdersByCustomer = (customerAddress: string) => {
    return orders.filter((o) => o.customerAddress === customerAddress);
  };

  // T3-10: 获取餐厅订单历史
  const getOrdersByRestaurant = (merchantAddress: string) => {
    return orders.filter((o) => o.merchantAddress === merchantAddress);
  };

  // T3-6: 获取用户平台币余额
  const getPlatformCoinBalance = (userAddress: string): UserPlatformCoinBalance | undefined => {
    return platformCoinBalances.get(userAddress);
  };

  // T3-6: 获取用户平台币交易历史
  const getPlatformCoinTransactions = (userAddress: string): PlatformCoinTransaction[] => {
    return platformCoinTransactions.filter((t) => t.userAddress === userAddress);
  };

  // T3-6: 给用户添加平台币
  const addPlatformCoins = (
    userAddress: string,
    amount: number,
    type: PlatformCoinTransaction['type'],
    reason: string,
    relatedOrderId?: string
  ) => {
    // 创建交易记录
    const transaction: PlatformCoinTransaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userAddress,
      amount,
      type,
      reason,
      relatedOrderId,
      timestamp: new Date().toLocaleString('zh-TW'),
    };

    // 更新交易历史
    setPlatformCoinTransactions((prev) => [transaction, ...prev]);

    // 更新或创建用户余额
    setPlatformCoinBalances((prev) => {
      const existing = prev.get(userAddress);
      const newBalance: UserPlatformCoinBalance = existing
        ? {
            userAddress,
            balance: existing.balance + amount,
            totalEarned: existing.totalEarned + amount,
            totalRedeemed: existing.totalRedeemed,
            updatedAt: new Date().toLocaleString('zh-TW'),
          }
        : {
            userAddress,
            balance: amount,
            totalEarned: amount,
            totalRedeemed: 0,
            updatedAt: new Date().toLocaleString('zh-TW'),
          };

      const newMap = new Map(prev);
      newMap.set(userAddress, newBalance);
      return newMap;
    });
  };

  // ── 從後端按位址同步訂單 ────────────────────────────────────────────────────
  const syncCustomerOrders = useCallback(async (customerAddress: string) => {
    if (!backendOnline) return;
    try {
      const res = await apiGetCustomerOrders(customerAddress, 1, 100);
      const fetched = res.orders.map(apiOrderToLocal);
      setOrders((prev) => {
        // 合併：以 backendId / orderId 去重，後端版本優先
        const localOnly = prev.filter(
          (o) => !fetched.some((f) => f.orderId === o.orderId || (o.backendId && o.backendId === f.backendId))
        );
        return [...fetched, ...localOnly];
      });
    } catch { /* 忽略網路錯誤 */ }
  }, [backendOnline]);

  const syncMerchantOrders = useCallback(async (merchantAddress: string) => {
    if (!backendOnline) return;
    try {
      const res = await apiGetMerchantOrders(merchantAddress, 1, 100);
      const fetched = res.orders.map(apiOrderToLocal);
      setOrders((prev) => {
        const localOnly = prev.filter(
          (o) => !fetched.some((f) => f.orderId === o.orderId || (o.backendId && o.backendId === f.backendId))
        );
        return [...fetched, ...localOnly];
      });
    } catch { /* 忽略網路錯誤 */ }
  }, [backendOnline]);

  // T3-6: 用户提现或兑换平台币
  const redeemPlatformCoins = (userAddress: string, amount: number, reason: string): boolean => {
    const balance = platformCoinBalances.get(userAddress);

    // 检查余额是否足够
    if (!balance || balance.balance < amount) {
      return false;
    }

    // 创建交易记录
    const transaction: PlatformCoinTransaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userAddress,
      amount: -amount,
      type: 'REDEMPTION',
      reason,
      timestamp: new Date().toLocaleString('zh-TW'),
    };

    // 更新交易历史
    setPlatformCoinTransactions((prev) => [transaction, ...prev]);

    // 更新余额
    setPlatformCoinBalances((prev) => {
      const existing = prev.get(userAddress);
      if (!existing) return prev;

      const newBalance: UserPlatformCoinBalance = {
        userAddress,
        balance: existing.balance - amount,
        totalEarned: existing.totalEarned,
        totalRedeemed: existing.totalRedeemed + amount,
        updatedAt: new Date().toLocaleString('zh-TW'),
      };

      const newMap = new Map(prev);
      newMap.set(userAddress, newBalance);
      return newMap;
    });

    return true;
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        orders,
        platformCoinTransactions,
        platformCoinBalances,
        addProduct,
        updateProduct,
        deleteProduct,
        addOrder,
        updateOrderStatus,
        uploadDeliveryPhoto,
        submitReview,
        getOrdersByCustomer,
        getOrdersByRestaurant,
        getPlatformCoinBalance,
        getPlatformCoinTransactions,
        addPlatformCoins,
        redeemPlatformCoins,
        syncCustomerOrders,
        syncMerchantOrders,
        backendOnline,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within ProductProvider');
  }
  return context;
};

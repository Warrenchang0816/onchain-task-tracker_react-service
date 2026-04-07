import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OrderManagementPage from './OrderManagementPage';
import type { Product, Order } from '../contexts/ProductContext';

// ─── Mock ─────────────────────────────────────────────────────────────────────

vi.mock('../api/authApi', () => ({
  getAuthMe: vi.fn().mockResolvedValue({ authenticated: false, isPlatformWallet: false }),
}));

const mockWalletCtx = {
  account: '0xMerchant001' as string | null,
  isConnected: true,
  isConnecting: false,
  connect: vi.fn(),
  disconnect: vi.fn(),
};

vi.mock('../components/common/WalletConnect', () => ({
  useWallet: () => mockWalletCtx,
  WalletProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../components/common/PlatformCoinBadge', () => ({
  default: () => <span data-testid="platform-coin-badge" />,
}));

vi.mock('../components/wallet/WalletConnectPanel', () => ({
  default: () => <div data-testid="wallet-connect-panel" />,
}));

const mockUpdateOrderStatus = vi.fn();
const mockUploadDeliveryPhoto = vi.fn();
let mockOrders: Order[] = [];

vi.mock('../contexts/ProductContext', () => ({
  useProducts: () => ({
    products: [] as Product[],
    orders: mockOrders,
    addProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
    addOrder: vi.fn(),
    updateOrderStatus: mockUpdateOrderStatus,
    uploadDeliveryPhoto: mockUploadDeliveryPhoto,
    submitReview: vi.fn(),
    getOrdersByCustomer: vi.fn(() => []),
    getOrdersByRestaurant: vi.fn(() => []),
    getPlatformCoinBalance: vi.fn(),
    getPlatformCoinTransactions: vi.fn(() => []),
    addPlatformCoins: vi.fn(),
    redeemPlatformCoins: vi.fn(),
    platformCoinTransactions: [],
    platformCoinBalances: new Map(),
  }),
  ProductProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// ─── 測試資料 ──────────────────────────────────────────────────────────────────

const placedOrder: Order = {
  orderId: 'order-001',
  productId: 'p1',
  merchantAddress: '0xMerchant001',
  productName: '招牌便當',
  quantity: 2,
  unitPrice: 80,
  totalPrice: 160,
  status: 'PLACED',
  timestamp: '2026-04-05 10:00',
  customerAddress: '0xCustomer001',
  pledgedAmount: 160,
};

const confirmedOrder: Order = {
  ...placedOrder,
  orderId: 'order-002',
  status: 'CONFIRMED',
};

const completedOrder: Order = {
  ...placedOrder,
  orderId: 'order-003',
  productName: '已完成便當',
  status: 'COMPLETED',
  deliveryPhotoUrl: 'https://example.com/photo.jpg',
  deliveryConfirmedTime: '2026-04-05 12:00',
};

const cancelledOrder: Order = {
  ...placedOrder,
  orderId: 'order-004',
  productName: '已取消便當',
  status: 'CANCELLED',
};

function renderPage() {
  return render(
    <MemoryRouter>
      <OrderManagementPage />
    </MemoryRouter>
  );
}

beforeEach(() => {
  mockOrders = [];
  mockWalletCtx.account = '0xMerchant001';
  mockWalletCtx.isConnected = true;
  vi.clearAllMocks();
});

// ─── 測試套件 ──────────────────────────────────────────────────────────────────

describe('OrderManagementPage — 頁面基本渲染', () => {
  it('應顯示頁面標題「訂單管理」', () => {
    renderPage();
    // h1 和 nav 都含有「訂單管理」，用 heading role 精確定位
    expect(screen.getByRole('heading', { name: /訂單管理/ })).toBeInTheDocument();
  });

  it('未連接錢包應顯示提示', () => {
    mockWalletCtx.account = null;
    mockWalletCtx.isConnected = false;
    renderPage();
    expect(screen.getByText(/請先連接您的錢包/)).toBeInTheDocument();
  });
});

describe('OrderManagementPage — 統計卡片', () => {
  it('無訂單時統計應全為 0', () => {
    renderPage();
    // 全部、待處理、已完成皆為 0
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThanOrEqual(3);
  });

  it('有 PLACED 訂單時「待處理」應計為 1', () => {
    mockOrders = [placedOrder];
    renderPage();
    // 「⏳ 待處理 (1)」 Tab 按鈕
    expect(screen.getByRole('button', { name: /待處理.+1/ })).toBeInTheDocument();
  });

  it('應顯示正確總收入', () => {
    mockOrders = [placedOrder];
    renderPage();
    // 統計卡片的總收入 ¥160（`¥` + `160` 合併後的文字）
    const revenueEl = screen.getByText('總收入').nextElementSibling;
    expect(revenueEl?.textContent).toContain('160');
  });
});

describe('OrderManagementPage — 訂單列表', () => {
  it('應顯示訂單的商品名稱', () => {
    mockOrders = [placedOrder];
    renderPage();
    expect(screen.getByText(/招牌便當/)).toBeInTheDocument();
  });

  it('應顯示客戶地址縮寫', () => {
    mockOrders = [placedOrder];
    renderPage();
    expect(screen.getByText(/0xCust/)).toBeInTheDocument();
  });

  it('應顯示質押狀態', () => {
    mockOrders = [placedOrder];
    renderPage();
    expect(screen.getByText(/消費者質押中/)).toBeInTheDocument();
  });

  it('應只顯示當前商家的訂單', () => {
    const otherOrder: Order = {
      ...placedOrder,
      orderId: 'order-999',
      productName: '他人便當',
      merchantAddress: '0xOtherMerchant',
    };
    mockOrders = [placedOrder, otherOrder];
    renderPage();

    expect(screen.getByText(/招牌便當/)).toBeInTheDocument();
    expect(screen.queryByText(/他人便當/)).not.toBeInTheDocument();
  });
});

describe('OrderManagementPage — Tab 篩選', () => {
  it('點擊「待處理」Tab 應只顯示 PLACED 訂單', () => {
    mockOrders = [placedOrder, completedOrder];
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /待處理/ }));

    expect(screen.getByText('招牌便當')).toBeInTheDocument();
    expect(screen.queryByText('已完成便當')).not.toBeInTheDocument();
  });

  it('點擊「已完成」Tab 應只顯示 COMPLETED 訂單', () => {
    mockOrders = [placedOrder, completedOrder];
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /已完成/ }));

    expect(screen.queryByText('招牌便當')).not.toBeInTheDocument();
    expect(screen.getByText('已完成便當')).toBeInTheDocument();
  });

  it('「所有訂單」Tab 應顯示全部訂單', () => {
    mockOrders = [placedOrder, completedOrder];
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /已完成/ }));
    fireEvent.click(screen.getByRole('button', { name: /所有訂單/ }));

    expect(screen.getByText('招牌便當')).toBeInTheDocument();
    expect(screen.getByText('已完成便當')).toBeInTheDocument();
  });
});

describe('OrderManagementPage — 訂單操作按鈕', () => {
  it('PLACED 訂單應顯示「確認訂單」與「拒絕」按鈕', () => {
    mockOrders = [placedOrder];
    renderPage();
    expect(screen.getByRole('button', { name: /確認訂單/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /拒絕/ })).toBeInTheDocument();
  });

  it('點擊「確認訂單」應呼叫 updateOrderStatus(CONFIRMED)', () => {
    mockOrders = [placedOrder];
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /確認訂單/ }));

    expect(mockUpdateOrderStatus).toHaveBeenCalledWith('order-001', 'CONFIRMED');
  });

  it('點擊「拒絕」應呼叫 updateOrderStatus(CANCELLED)', () => {
    mockOrders = [placedOrder];
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /拒絕/ }));

    expect(mockUpdateOrderStatus).toHaveBeenCalledWith('order-001', 'CANCELLED');
  });

  it('CONFIRMED 訂單應顯示「上傳交付照片」按鈕', () => {
    mockOrders = [confirmedOrder];
    renderPage();
    expect(screen.getByRole('button', { name: /上傳交付照片/ })).toBeInTheDocument();
  });

  it('COMPLETED 訂單應顯示「交付完成」狀態', () => {
    mockOrders = [completedOrder];
    renderPage();
    expect(screen.getByText(/交付完成/)).toBeInTheDocument();
  });

  it('CANCELLED 訂單應顯示「已取消」狀態', () => {
    mockOrders = [cancelledOrder];
    renderPage();
    // 狀態 badge 與操作區均顯示「已取消」
    expect(screen.getAllByText(/已取消/).length).toBeGreaterThan(0);
  });
});

describe('OrderManagementPage — 搜尋', () => {
  it('搜尋訂單號應篩選結果', () => {
    const fishOrder: Order = { ...placedOrder, orderId: 'order-999', productName: '魚排套餐' };
    mockOrders = [placedOrder, fishOrder];
    renderPage();

    fireEvent.change(screen.getByPlaceholderText(/搜尋訂單號或商品名稱/), {
      target: { value: 'order-999' },
    });

    expect(screen.getByText(/魚排套餐/)).toBeInTheDocument();
    expect(screen.queryByText(/招牌便當/)).not.toBeInTheDocument();
  });

  it('搜尋商品名稱應篩選結果', () => {
    const fishOrder: Order = { ...placedOrder, orderId: 'order-999', productName: '魚排套餐' };
    mockOrders = [placedOrder, fishOrder];
    renderPage();

    fireEvent.change(screen.getByPlaceholderText(/搜尋訂單號或商品名稱/), {
      target: { value: '魚排' },
    });

    expect(screen.getByText(/魚排套餐/)).toBeInTheDocument();
    expect(screen.queryByText(/招牌便當/)).not.toBeInTheDocument();
  });
});

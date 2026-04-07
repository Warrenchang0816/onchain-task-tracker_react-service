import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TaskListPage from './TaskListPage';
import type { Product, Order } from '../contexts/ProductContext';

// ─── Mock ─────────────────────────────────────────────────────────────────────

vi.mock('../api/authApi', () => ({
  getAuthMe: vi.fn().mockResolvedValue({ authenticated: false, isPlatformWallet: false }),
}));

const mockWalletCtx = {
  account: null as string | null,
  isConnected: false,
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

// useProducts mock — 控制 context 回傳的資料，避免依賴 localStorage 非同步時序
const mockAddOrder = vi.fn();
let mockProducts: Product[] = [];

vi.mock('../contexts/ProductContext', () => ({
  useProducts: () => ({
    products: mockProducts,
    orders: [] as Order[],
    addOrder: mockAddOrder,
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
    addProduct: vi.fn(),
    updateOrderStatus: vi.fn(),
    uploadDeliveryPhoto: vi.fn(),
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

const sampleProduct: Product = {
  id: 'p1',
  restaurantName: '綠意餐廳',
  productName: '招牌便當',
  description: '好吃的便當',
  originalPrice: 120,
  discountPrice: 80,
  discount: 33,
  quantity: 5,
  image: '🍱',
  category: 'fastfood',
  expiryTime: '2099-12-31T23:59',
  rating: 4.8,
  status: 'PUBLISHED',
  publishDate: '2026-04-05',
  merchantAddress: '0xMerchant001',
};

const chineseProduct: Product = {
  ...sampleProduct,
  id: 'p2',
  productName: '炒飯套餐',
  restaurantName: '中華樓',
  category: 'chinese',
};

function renderPage() {
  return render(
    <MemoryRouter>
      <TaskListPage />
    </MemoryRouter>
  );
}

beforeEach(() => {
  mockProducts = [];
  mockWalletCtx.account = null;
  mockWalletCtx.isConnected = false;
  vi.clearAllMocks();
});

// ─── 測試套件 ──────────────────────────────────────────────────────────────────

describe('TaskListPage — 商城列表', () => {
  it('應顯示頁面標題「即期美食商城」', () => {
    renderPage();
    expect(screen.getByText(/即期美食商城/)).toBeInTheDocument();
  });

  it('沒有商品時應顯示空狀態提示', () => {
    renderPage();
    expect(screen.getByText(/未找到符合條件的商品/)).toBeInTheDocument();
  });

  it('有商品時應顯示商品卡片名稱', () => {
    mockProducts = [sampleProduct];
    renderPage();
    expect(screen.getByText('招牌便當')).toBeInTheDocument();
  });

  it('有商品時應顯示餐廳名稱', () => {
    mockProducts = [sampleProduct];
    renderPage();
    expect(screen.getByText(/綠意餐廳/)).toBeInTheDocument();
  });

  it('應顯示折扣標籤', () => {
    mockProducts = [sampleProduct];
    renderPage();
    expect(screen.getByText(/-33%/)).toBeInTheDocument();
  });

  it('應顯示折扣價格', () => {
    mockProducts = [sampleProduct];
    renderPage();
    expect(screen.getByText(/¥80/)).toBeInTheDocument();
  });

  it('應顯示剩餘庫存', () => {
    mockProducts = [sampleProduct];
    renderPage();
    expect(screen.getByText(/剩餘: 5 份/)).toBeInTheDocument();
  });
});

describe('TaskListPage — 分類篩選', () => {
  it('點擊分類按鈕應只顯示該分類商品', () => {
    mockProducts = [sampleProduct, chineseProduct];
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /中餐/ }));

    expect(screen.getByText('炒飯套餐')).toBeInTheDocument();
    expect(screen.queryByText('招牌便當')).not.toBeInTheDocument();
  });

  it('點擊「全部」應恢復顯示所有商品', () => {
    mockProducts = [sampleProduct, chineseProduct];
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /中餐/ }));
    fireEvent.click(screen.getByRole('button', { name: /全部/ }));

    expect(screen.getByText('招牌便當')).toBeInTheDocument();
    expect(screen.getByText('炒飯套餐')).toBeInTheDocument();
  });
});

describe('TaskListPage — 搜尋', () => {
  it('搜尋商品名稱應篩選結果', () => {
    const teaProduct: Product = { ...sampleProduct, id: 'p3', productName: '珍珠奶茶', category: 'coffee' };
    mockProducts = [sampleProduct, teaProduct];
    renderPage();

    fireEvent.change(screen.getByPlaceholderText(/搜尋商品或餐廳名稱/), {
      target: { value: '珍珠' },
    });

    expect(screen.getByText('珍珠奶茶')).toBeInTheDocument();
    expect(screen.queryByText('招牌便當')).not.toBeInTheDocument();
  });
});

describe('TaskListPage — 購買流程', () => {
  it('未連接錢包時點擊購買應顯示 alert', () => {
    mockProducts = [sampleProduct];
    mockWalletCtx.account = null;
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    renderPage();

    fireEvent.click(screen.getByText(/立即購買/));
    expect(alertSpy).toHaveBeenCalledWith('請先連接錢包');
    alertSpy.mockRestore();
  });

  it('已連接錢包時點擊購買應開啟購買 Modal', () => {
    mockProducts = [sampleProduct];
    mockWalletCtx.account = '0xCustomer001';
    renderPage();

    fireEvent.click(screen.getByText(/立即購買/));
    expect(screen.getByText(/購買確認/)).toBeInTheDocument();
  });

  it('購買 Modal 應顯示商品名稱', () => {
    mockProducts = [sampleProduct];
    mockWalletCtx.account = '0xCustomer001';
    renderPage();

    fireEvent.click(screen.getByText(/立即購買/));
    expect(screen.getAllByText(/招牌便當/).length).toBeGreaterThan(0);
  });

  it('購買 Modal 應顯示質押機制說明', () => {
    mockProducts = [sampleProduct];
    mockWalletCtx.account = '0xCustomer001';
    renderPage();

    fireEvent.click(screen.getByText(/立即購買/));
    expect(screen.getByText(/質押機制說明/)).toBeInTheDocument();
  });

  it('點擊取消應關閉 Modal', () => {
    mockProducts = [sampleProduct];
    mockWalletCtx.account = '0xCustomer001';
    renderPage();

    fireEvent.click(screen.getByText(/立即購買/));
    fireEvent.click(screen.getByRole('button', { name: /取消/ }));

    expect(screen.queryByText(/購買確認/)).not.toBeInTheDocument();
  });

  it('點擊「+」應增加數量', () => {
    mockProducts = [sampleProduct];
    mockWalletCtx.account = '0xCustomer001';
    renderPage();

    fireEvent.click(screen.getByText(/立即購買/));
    fireEvent.click(screen.getByText('+'));
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('點擊「−」數量不可低於 1', () => {
    mockProducts = [sampleProduct];
    mockWalletCtx.account = '0xCustomer001';
    renderPage();

    fireEvent.click(screen.getByText(/立即購買/));
    fireEvent.click(screen.getByText('−'));
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('確認質押後應進入步驟二', () => {
    mockProducts = [sampleProduct];
    mockWalletCtx.account = '0xCustomer001';
    renderPage();

    fireEvent.click(screen.getByText(/立即購買/));
    fireEvent.click(screen.getByText(/確認質押 ¥80.00 USDC/));

    expect(screen.getByText(/確認下單並質押/)).toBeInTheDocument();
  });

  it('確認下單應呼叫 addOrder 並顯示成功訊息', () => {
    mockProducts = [sampleProduct];
    mockWalletCtx.account = '0xCustomer001';
    renderPage();

    fireEvent.click(screen.getByText(/立即購買/));
    fireEvent.click(screen.getByText(/確認質押 ¥80.00 USDC/));
    fireEvent.click(screen.getByText(/確認下單並質押/));

    expect(mockAddOrder).toHaveBeenCalledOnce();
    expect(screen.getByText(/下單成功/)).toBeInTheDocument();
  });

  it('addOrder 應傳入正確的訂單資料', () => {
    mockProducts = [sampleProduct];
    mockWalletCtx.account = '0xCustomer001';
    renderPage();

    fireEvent.click(screen.getByText(/立即購買/));
    fireEvent.click(screen.getByText(/確認質押 ¥80.00 USDC/));
    fireEvent.click(screen.getByText(/確認下單並質押/));

    const orderArg = mockAddOrder.mock.calls[0][0];
    expect(orderArg.productId).toBe('p1');
    expect(orderArg.customerAddress).toBe('0xCustomer001');
    expect(orderArg.unitPrice).toBe(80);
    expect(orderArg.totalPrice).toBe(80);
    expect(orderArg.status).toBe('PLACED');
    expect(orderArg.pledgedAmount).toBe(80);
  });
});

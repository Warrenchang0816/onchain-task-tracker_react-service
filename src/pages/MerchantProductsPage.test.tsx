import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MerchantProductsPage from './MerchantProductsPage';
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

const mockAddProduct = vi.fn();
const mockUpdateProduct = vi.fn();
const mockDeleteProduct = vi.fn();
let mockProducts: Product[] = [];

vi.mock('../contexts/ProductContext', () => ({
  useProducts: () => ({
    products: mockProducts,
    orders: [] as Order[],
    addProduct: mockAddProduct,
    updateProduct: mockUpdateProduct,
    deleteProduct: mockDeleteProduct,
    addOrder: vi.fn(),
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

const myProduct: Product = {
  id: 'p1',
  restaurantName: '測試餐廳',
  productName: '招牌便當',
  description: '好吃',
  originalPrice: 120,
  discountPrice: 80,
  discount: 33,
  quantity: 10,
  image: '🍱',
  category: 'fastfood',
  expiryTime: '2026-04-06T12:00',
  rating: 4.5,
  status: 'PUBLISHED',
  publishDate: '2026-04-05',
  merchantAddress: '0xMerchant001',
};

function renderPage() {
  return render(
    <MemoryRouter>
      <MerchantProductsPage />
    </MemoryRouter>
  );
}

beforeEach(() => {
  mockProducts = [];
  mockWalletCtx.account = '0xMerchant001';
  mockWalletCtx.isConnected = true;
  vi.clearAllMocks();
  // 清除 KYC localStorage 資料
  localStorage.clear();
});

// ─── 測試套件 ──────────────────────────────────────────────────────────────────

describe('MerchantProductsPage — 頁面基本渲染', () => {
  it('應顯示頁面標題「食品發佈管理」', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /食品發佈管理/ })).toBeInTheDocument();
  });

  it('應顯示商家錢包地址', () => {
    renderPage();
    expect(screen.getByText(/0xMer/)).toBeInTheDocument();
  });

  it('未連接錢包時應顯示鎖定提示', () => {
    mockWalletCtx.account = null;
    renderPage();
    expect(screen.getByText(/請先連接錢包以管理商品/)).toBeInTheDocument();
  });
});

describe('MerchantProductsPage — 統計數字', () => {
  it('有上架商品時「發佈中」應計為 1', () => {
    mockProducts = [myProduct];
    renderPage();
    // 發佈中的數字
    const publishedEl = screen.getByText('發佈中').nextElementSibling;
    expect(publishedEl?.textContent).toBe('1');
  });

  it('沒有商品時統計應全為 0', () => {
    renderPage();
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThanOrEqual(2);
  });
});

describe('MerchantProductsPage — 商品列表', () => {
  it('應只顯示當前商家的商品', () => {
    const otherProduct: Product = {
      ...myProduct,
      id: 'p2',
      productName: '他人便當',
      merchantAddress: '0xOtherMerchant',
    };
    mockProducts = [myProduct, otherProduct];
    renderPage();

    expect(screen.getByText('招牌便當')).toBeInTheDocument();
    expect(screen.queryByText('他人便當')).not.toBeInTheDocument();
  });

  it('商品卡片應顯示原價', () => {
    mockProducts = [myProduct];
    renderPage();
    expect(screen.getByText(/¥120/)).toBeInTheDocument();
  });

  it('商品卡片應顯示折扣價', () => {
    mockProducts = [myProduct];
    renderPage();
    expect(screen.getByText(/¥80/)).toBeInTheDocument();
  });

  it('商品卡片應顯示庫存與過期時間', () => {
    mockProducts = [myProduct];
    renderPage();
    expect(screen.getByText(/庫存/)).toBeInTheDocument();
    expect(screen.getByText(/過期/)).toBeInTheDocument();
  });
});

describe('MerchantProductsPage — 新增商品表單', () => {
  it('點擊「發佈新商品」應顯示表單', () => {
    renderPage();
    fireEvent.click(screen.getByText(/發佈新商品/));
    expect(screen.getByText(/新增商品/)).toBeInTheDocument();
  });

  it('點擊取消應關閉表單', () => {
    renderPage();
    fireEvent.click(screen.getByText(/發佈新商品/));
    fireEvent.click(screen.getByRole('button', { name: /取消/ }));
    expect(screen.queryByText(/新增商品/)).not.toBeInTheDocument();
  });

  it('填寫完整表單並送出應呼叫 addProduct', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const { container } = renderPage();

    fireEvent.click(screen.getByText(/發佈新商品/));

    fireEvent.change(container.querySelector('[name="productName"]')!, {
      target: { value: '新鮮沙拉' },
    });
    fireEvent.change(container.querySelector('[name="originalPrice"]')!, {
      target: { value: '90' },
    });
    fireEvent.change(container.querySelector('[name="quantity"]')!, {
      target: { value: '5' },
    });
    fireEvent.change(container.querySelector('[name="expiryTime"]')!, {
      target: { value: '2026-12-31T23:59' },
    });

    fireEvent.click(screen.getByRole('button', { name: /發佈商品/ }));

    expect(mockAddProduct).toHaveBeenCalledOnce();
    const arg = mockAddProduct.mock.calls[0][0];
    expect(arg.productName).toBe('新鮮沙拉');
    expect(arg.originalPrice).toBe(90);
    expect(arg.quantity).toBe(5);
    expect(arg.merchantAddress).toBe('0xMerchant001');
    expect(arg.status).toBe('PUBLISHED');
    alertSpy.mockRestore();
  });
});

describe('MerchantProductsPage — 編輯商品', () => {
  it('點擊「編輯」應顯示編輯表單並預填商品名稱', () => {
    mockProducts = [myProduct];
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /編輯/ }));

    expect(screen.getByText(/編輯商品/)).toBeInTheDocument();
    expect(screen.getByDisplayValue('招牌便當')).toBeInTheDocument();
  });

  it('儲存修改應呼叫 updateProduct', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    mockProducts = [myProduct];
    const { container } = renderPage();

    fireEvent.click(screen.getByRole('button', { name: /編輯/ }));

    fireEvent.change(container.querySelector('[name="productName"]')!, {
      target: { value: '新版便當' },
    });

    fireEvent.click(screen.getByRole('button', { name: /儲存修改/ }));

    expect(mockUpdateProduct).toHaveBeenCalledOnce();
    const [id, updates] = mockUpdateProduct.mock.calls[0];
    expect(id).toBe('p1');
    expect(updates.productName).toBe('新版便當');
    alertSpy.mockRestore();
  });
});

describe('MerchantProductsPage — 刪除商品', () => {
  it('確認刪除應呼叫 deleteProduct', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    mockProducts = [myProduct];
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /刪除/ }));

    expect(mockDeleteProduct).toHaveBeenCalledWith('p1');
    confirmSpy.mockRestore();
  });

  it('取消刪除不應呼叫 deleteProduct', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    mockProducts = [myProduct];
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /刪除/ }));

    expect(mockDeleteProduct).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });
});

import { useState } from 'react';
import SidebarLayout from '../layouts/SidebarLayout';
import { useWallet } from '../components/common/WalletConnect';
import { useProducts, type Product } from '../contexts/ProductContext';

const TaskListPage = () => {
  const { account } = useWallet();
  const { products, addOrder } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // 購買 Modal 狀態
  const [purchasingProduct, setPurchasingProduct] = useState<Product | null>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [purchaseStep, setPurchaseStep] = useState<'input' | 'pledge' | 'done'>('input');

  const categories = [
    { id: 'all', label: '全部', emoji: '📦' },
    { id: 'fastfood', label: '快餐', emoji: '🍔' },
    { id: 'chinese', label: '中餐', emoji: '🍜' },
    { id: 'pizza', label: '披薩', emoji: '🍕' },
    { id: 'japanese', label: '日餐', emoji: '🍣' },
    { id: 'asian', label: '亞洲菜', emoji: '🍲' },
    { id: 'dessert', label: '甜品', emoji: '🍰' },
    { id: 'coffee', label: '咖啡', emoji: '☕' },
  ];

  let filteredProducts = products.filter((product) => {
    const matchCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchSearch =
      !searchTerm ||
      product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.restaurantName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch && product.quantity > 0;
  });

  if (sortBy === 'discount') {
    filteredProducts.sort((a, b) => (b.discount || 0) - (a.discount || 0));
  } else if (sortBy === 'price-low') {
    filteredProducts.sort((a, b) => (a.discountPrice || a.originalPrice) - (b.discountPrice || b.originalPrice));
  } else if (sortBy === 'price-high') {
    filteredProducts.sort((a, b) => (b.discountPrice || b.originalPrice) - (a.discountPrice || a.originalPrice));
  } else if (sortBy === 'rating') {
    filteredProducts.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'expiry') {
    filteredProducts.sort((a, b) => new Date(a.expiryTime).getTime() - new Date(b.expiryTime).getTime());
  }

  const openPurchaseModal = (product: Product) => {
    if (!account) {
      alert('請先連接錢包');
      return;
    }
    setPurchasingProduct(product);
    setPurchaseQuantity(1);
    setPurchaseStep('input');
  };

  const closePurchaseModal = () => {
    setPurchasingProduct(null);
    setPurchaseQuantity(1);
    setPurchaseStep('input');
  };

  const handleConfirmPledge = () => {
    if (!purchasingProduct || !account) return;
    if (purchaseQuantity <= 0 || purchaseQuantity > purchasingProduct.quantity) return;
    setPurchaseStep('pledge');
  };

  const handleConfirmOrder = () => {
    if (!purchasingProduct || !account) return;
    const unitPrice = purchasingProduct.discountPrice || purchasingProduct.originalPrice;
    const totalPrice = purchaseQuantity * unitPrice;

    addOrder({
      orderId: String(Date.now()),
      productId: purchasingProduct.id,
      merchantAddress: purchasingProduct.merchantAddress,
      productName: purchasingProduct.productName,
      quantity: purchaseQuantity,
      unitPrice,
      totalPrice,
      status: 'PLACED',
      timestamp: new Date().toLocaleString('zh-TW'),
      customerAddress: account,
      pledgedAmount: totalPrice, // T3-3: 質押 USDC 等同訂單金額
    });

    setPurchaseStep('done');
  };

  const unitPrice = purchasingProduct ? (purchasingProduct.discountPrice || purchasingProduct.originalPrice) : 0;
  const totalPrice = unitPrice * purchaseQuantity;

  return (
    <SidebarLayout>
      <div style={{ minHeight: 'calc(100vh - 200px)', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', padding: '40px 20px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '40px' }}>
            <h1 style={{ fontSize: '32px', color: '#065f46', marginBottom: '10px' }}>🍽️ 即期美食商城</h1>
            <p style={{ fontSize: '16px', color: '#047857', marginBottom: '20px' }}>
              發現餐廳發佈的即將到期食物，享受最高 50% 折扣，品質保證
            </p>
            {account && (
              <p style={{ fontSize: '12px', color: '#6b7280' }}>
                您的錢包: {account.slice(0, 6)}...{account.slice(-4)}
              </p>
            )}
          </div>

          {/* Search and Filter */}
          <div style={{ background: 'white', borderRadius: '8px', padding: '20px', marginBottom: '30px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="搜尋商品或餐廳名稱..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '12px 15px', border: '1px solid #d1fae5', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '10px', fontWeight: '600' }}>分類篩選</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    style={{
                      padding: '8px 16px',
                      background: selectedCategory === cat.id ? '#10b981' : '#f3f4f6',
                      color: selectedCategory === cat.id ? 'white' : '#6b7280',
                      border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: '500',
                    }}
                  >
                    {cat.emoji} {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', alignItems: 'center' }}>
              <label style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>排序:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ padding: '6px 10px', border: '1px solid #d1fae5', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
              >
                <option value="newest">最新發佈</option>
                <option value="expiry">即將過期</option>
                <option value="discount">折扣最高</option>
                <option value="price-low">價格最低</option>
                <option value="price-high">價格最高</option>
                <option value="rating">評分最高</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '8px', padding: '60px 20px', textAlign: 'center', color: '#6b7280' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔍</div>
              <p>未找到符合條件的商品</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  style={{
                    background: 'white', borderRadius: '8px', overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #d1fae5',
                    transition: 'all 0.3s',
                  }}
                  onMouseOver={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.15)';
                  }}
                  onMouseOut={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                  }}
                >
                  <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dbeafe 100%)', padding: '40px 20px', textAlign: 'center', fontSize: '60px', position: 'relative' }}>
                    {product.image}
                    <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#ef4444', color: 'white', padding: '6px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                      -{product.discount || 0}%
                    </div>
                  </div>

                  <div style={{ padding: '15px' }}>
                    <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '5px' }}>🏪 {product.restaurantName}</p>
                    <h3 style={{ fontSize: '15px', color: '#1f2937', marginBottom: '8px', fontWeight: '600' }}>{product.productName}</h3>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '10px', lineHeight: '1.4' }}>{product.description}</p>

                    <div style={{ marginBottom: '10px', fontSize: '12px' }}>
                      <span style={{ color: '#f59e0b' }}>★★★★★</span>
                      <span style={{ color: '#6b7280', marginLeft: '5px' }}>({product.rating})</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '10px' }}>
                      <span style={{ fontSize: '12px', color: '#6b7280', textDecoration: 'line-through' }}>¥{product.originalPrice}</span>
                      <span style={{ fontSize: '18px', color: '#ef4444', fontWeight: 'bold' }}>¥{product.discountPrice}</span>
                    </div>

                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '15px', padding: '8px', background: '#f0fdf4', borderRadius: '4px', textAlign: 'center' }}>
                      <div>📦 剩餘: {product.quantity} 份</div>
                      <div style={{ color: '#ef4444', fontWeight: '600', marginTop: '4px' }}>⏰ {product.expiryTime}</div>
                    </div>

                    <button
                      onClick={() => openPurchaseModal(product)}
                      style={{ width: '100%', padding: '10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                      onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.background = '#059669'; }}
                      onMouseOut={(e) => { (e.currentTarget as HTMLElement).style.background = '#10b981'; }}
                    >
                      🛒 立即購買
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 購買 Modal */}
      {purchasingProduct && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px',
        }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '30px', maxWidth: '440px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            {purchaseStep === 'input' && (
              <>
                <h3 style={{ fontSize: '18px', color: '#065f46', marginBottom: '4px' }}>🛒 購買確認</h3>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>
                  {purchasingProduct.restaurantName} — {purchasingProduct.productName}
                </p>

                <div style={{ padding: '14px', background: '#f0fdf4', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', lineHeight: '1.8' }}>
                  <div>原價：<span style={{ textDecoration: 'line-through', color: '#9ca3af' }}>¥{purchasingProduct.originalPrice}</span></div>
                  <div>折扣價：<strong style={{ color: '#ef4444', fontSize: '16px' }}>¥{purchasingProduct.discountPrice}</strong></div>
                  <div>剩餘庫存：{purchasingProduct.quantity} 份</div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>購買數量</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                      onClick={() => setPurchaseQuantity(q => Math.max(1, q - 1))}
                      style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #d1fae5', background: '#f0fdf4', fontSize: '18px', cursor: 'pointer', color: '#10b981', fontWeight: 'bold' }}
                    >−</button>
                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', minWidth: '32px', textAlign: 'center' }}>{purchaseQuantity}</span>
                    <button
                      onClick={() => setPurchaseQuantity(q => Math.min(purchasingProduct.quantity, q + 1))}
                      style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #d1fae5', background: '#f0fdf4', fontSize: '18px', cursor: 'pointer', color: '#10b981', fontWeight: 'bold' }}
                    >+</button>
                  </div>
                </div>

                <div style={{ padding: '12px', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '6px', marginBottom: '20px', fontSize: '13px' }}>
                  <div style={{ fontWeight: '600', color: '#92400e', marginBottom: '4px' }}>💎 質押機制說明</div>
                  <div style={{ color: '#78350f', lineHeight: '1.6' }}>
                    購買時需質押等額 USDC 給平台。<br />
                    餐廳確認交付後，質押幣全額退還。
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>質押 USDC：</span>
                  <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#065f46' }}>¥{totalPrice.toFixed(2)}</span>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={closePurchaseModal} style={{ flex: 1, padding: '12px', background: '#f3f4f6', color: '#6b7280', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
                    取消
                  </button>
                  <button onClick={handleConfirmPledge} style={{ flex: 2, padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                    確認質押 ¥{totalPrice.toFixed(2)} USDC
                  </button>
                </div>
              </>
            )}

            {purchaseStep === 'pledge' && (
              <>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔒</div>
                  <h3 style={{ fontSize: '18px', color: '#065f46', marginBottom: '8px' }}>確認質押</h3>
                  <p style={{ fontSize: '13px', color: '#6b7280' }}>確認後將質押 USDC 至平台合約</p>
                </div>

                <div style={{ padding: '16px', background: '#f0fdf4', border: '2px solid #10b981', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', lineHeight: '2' }}>
                  <div>🍽️ 商品：<strong>{purchasingProduct.productName}</strong></div>
                  <div>📦 數量：<strong>{purchaseQuantity} 份</strong></div>
                  <div>💵 單價：<strong>¥{unitPrice}</strong></div>
                  <div style={{ borderTop: '1px solid #d1fae5', marginTop: '8px', paddingTop: '8px' }}>
                    🔒 質押金額：<strong style={{ fontSize: '16px', color: '#065f46' }}>¥{totalPrice.toFixed(2)} USDC</strong>
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>交付確認後自動退還至您的錢包</div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setPurchaseStep('input')} style={{ flex: 1, padding: '12px', background: '#f3f4f6', color: '#6b7280', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
                    返回
                  </button>
                  <button onClick={handleConfirmOrder} style={{ flex: 2, padding: '12px', background: '#065f46', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                    ✅ 確認下單並質押
                  </button>
                </div>
              </>
            )}

            {purchaseStep === 'done' && (
              <>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
                  <h3 style={{ fontSize: '18px', color: '#065f46', marginBottom: '8px' }}>下單成功！</h3>
                </div>

                <div style={{ padding: '16px', background: '#f0fdf4', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', lineHeight: '2' }}>
                  <div>🛒 {purchasingProduct.productName} × {purchaseQuantity}</div>
                  <div>🔒 已質押 <strong style={{ color: '#065f46' }}>¥{totalPrice.toFixed(2)} USDC</strong> 至平台</div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>等待餐廳確認交付後自動退還</div>
                  <div style={{ borderTop: '1px solid #d1fae5', marginTop: '8px', paddingTop: '8px', fontSize: '12px', color: '#059669' }}>
                    💡 完成交付並評論可賺取 <strong>10 PC</strong> 平台幣
                  </div>
                </div>

                <button onClick={closePurchaseModal} style={{ width: '100%', padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                  知道了
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </SidebarLayout>
  );
};

export default TaskListPage;

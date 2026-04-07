import { useState } from 'react';
import SidebarLayout from '../layouts/SidebarLayout';
import { useWallet } from '../components/common/WalletConnect';
import { useProducts, type Product } from '../contexts/ProductContext';

const MerchantProductsPage = () => {
  const { account } = useWallet();
  const { products, orders, addProduct, deleteProduct, updateProduct } = useProducts();

  // 讀取 KYC 資料
  const kycData = account ? JSON.parse(localStorage.getItem(`kyc_${account}`) || '{}') : {};
  const kycRestaurantName = kycData.restaurantName || '';

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    originalPrice: '',
    discountPrice: '',
    quantity: '',
    category: 'fastfood',
    expiryTime: '',
  });

  const categories = [
    { id: 'fastfood', label: '快餐' },
    { id: 'chinese', label: '中餐' },
    { id: 'pizza', label: '披薩' },
    { id: 'japanese', label: '日餐' },
    { id: 'asian', label: '亞洲菜' },
    { id: 'dessert', label: '甜品' },
    { id: 'coffee', label: '咖啡' },
  ];

  // 只顯示當前商家的商品
  const myProducts = account
    ? products.filter((p) => p.merchantAddress === account)
    : [];

  // 計算每個商品的已售出數量
  const soldCounts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.productId] = (acc[o.productId] || 0) + o.quantity;
    return acc;
  }, {});

  const totalSold = myProducts.reduce((sum, p) => sum + (soldCounts[p.id] || 0), 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      productName: '',
      description: '',
      originalPrice: '',
      discountPrice: '',
      quantity: '',
      category: 'fastfood',
      expiryTime: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      alert('請先連接錢包');
      return;
    }

    const newProduct: Product = {
      id: String(Date.now()),
      restaurantName: kycRestaurantName || '我的餐廳',
      productName: formData.productName,
      description: formData.description,
      originalPrice: Number(formData.originalPrice),
      discountPrice: formData.discountPrice ? Number(formData.discountPrice) : Number(formData.originalPrice) * 0.5,
      discount: formData.discountPrice
        ? Math.round((1 - Number(formData.discountPrice) / Number(formData.originalPrice)) * 100)
        : 50,
      quantity: Number(formData.quantity),
      image: '📦',
      category: formData.category,
      expiryTime: formData.expiryTime,
      rating: 4.5,
      status: 'PUBLISHED',
      publishDate: new Date().toLocaleString('zh-TW'),
      merchantAddress: account,
    };

    addProduct(newProduct);
    resetForm();
    setShowForm(false);
    alert('✅ 商品發佈成功！消費者現在可以在商城看到您的商品');
  };

  const handleStartEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      productName: product.productName,
      description: product.description,
      originalPrice: String(product.originalPrice),
      discountPrice: String(product.discountPrice || ''),
      quantity: String(product.quantity),
      category: product.category,
      expiryTime: product.expiryTime,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    updateProduct(editingProduct.id, {
      productName: formData.productName,
      description: formData.description,
      originalPrice: Number(formData.originalPrice),
      discountPrice: formData.discountPrice ? Number(formData.discountPrice) : Number(formData.originalPrice) * 0.5,
      discount: formData.discountPrice
        ? Math.round((1 - Number(formData.discountPrice) / Number(formData.originalPrice)) * 100)
        : 50,
      quantity: Number(formData.quantity),
      category: formData.category,
      expiryTime: formData.expiryTime,
    });

    setEditingProduct(null);
    resetForm();
    alert('✅ 商品已更新');
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('確定要刪除這個商品嗎？')) {
      deleteProduct(id);
    }
  };

  const productForm = (isEdit: boolean) => (
    <div style={{
      background: 'white',
      borderRadius: '8px',
      padding: '30px',
      marginBottom: '30px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    }}>
      <h2 style={{ fontSize: '20px', color: '#065f46', marginBottom: '20px', fontWeight: '600' }}>
        {isEdit ? '編輯商品' : '新增商品'}
      </h2>

      {kycRestaurantName && (
        <div style={{
          padding: '8px 12px',
          background: '#d1fae5',
          borderRadius: '4px',
          fontSize: '13px',
          color: '#065f46',
          marginBottom: '16px',
        }}>
          🏪 餐廳名稱：{kycRestaurantName}
        </div>
      )}
      <form onSubmit={isEdit ? handleSaveEdit : handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
              商品名稱 <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="text"
              name="productName"
              value={formData.productName}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #d1fae5', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
              分類 <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '10px', border: '1px solid #d1fae5', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
              原始價格 (¥) <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="number"
              name="originalPrice"
              value={formData.originalPrice}
              onChange={handleInputChange}
              required
              step="0.01"
              style={{ width: '100%', padding: '10px', border: '1px solid #d1fae5', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
              數量 <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #d1fae5', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
              過期時間 <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="datetime-local"
              name="expiryTime"
              value={formData.expiryTime}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #d1fae5', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
              折扣價格 (¥) <span style={{ fontSize: '11px', color: '#6b7280' }}>（不填則自動 50%）</span>
            </label>
            <input
              type="number"
              name="discountPrice"
              value={formData.discountPrice}
              onChange={handleInputChange}
              step="0.01"
              style={{ width: '100%', padding: '10px', border: '1px solid #d1fae5', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
            商品描述
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            style={{ width: '100%', padding: '10px', border: '1px solid #d1fae5', borderRadius: '4px', fontSize: '14px', minHeight: '80px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              setEditingProduct(null);
              resetForm();
            }}
            style={{ padding: '10px 20px', background: '#f3f4f6', color: '#6b7280', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
          >
            取消
          </button>
          <button
            type="submit"
            style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
          >
            {isEdit ? '儲存修改' : '發佈商品'}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <SidebarLayout>
      <div style={{ minHeight: 'calc(100vh - 200px)', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', padding: '40px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <h1 style={{ fontSize: '32px', color: '#065f46', marginBottom: '10px' }}>📦 食品發佈管理</h1>
              <p style={{ fontSize: '16px', color: '#047857', marginBottom: '15px' }}>
                管理您發佈的即期食品，追蹤銷售進度
              </p>
              {account && (
                <p style={{ fontSize: '12px', color: '#6b7280' }}>
                  商家錢包: {account.slice(0, 6)}...{account.slice(-4)}
                  {kycRestaurantName && <span style={{ marginLeft: '8px', color: '#10b981', fontWeight: '600' }}>🏪 {kycRestaurantName}</span>}
                </p>
              )}
              {!kycRestaurantName && account && (
                <p style={{ fontSize: '12px', color: '#f59e0b', marginTop: '4px' }}>
                  ⚠️ 尚未完成 KYC，<a href="/merchant/kyc" style={{ color: '#10b981' }}>點此驗證</a>以顯示真實餐廳名稱
                </p>
              )}
            </div>
            <button
              onClick={() => { setShowForm(!showForm); setEditingProduct(null); resetForm(); }}
              style={{ padding: '12px 24px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
            >
              ➕ 發佈新商品
            </button>
          </div>

          {/* New Product Form */}
          {showForm && !editingProduct && productForm(false)}

          {/* Edit Form */}
          {editingProduct && productForm(true)}

          {/* Statistics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '15px',
            marginBottom: '30px',
          }}>
            <div style={{ background: 'white', padding: '15px', borderRadius: '6px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>發佈中</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                {myProducts.filter((p) => p.status === 'PUBLISHED').length}
              </div>
            </div>
            <div style={{ background: 'white', padding: '15px', borderRadius: '6px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>已售罄</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
                {myProducts.filter((p) => p.status === 'SOLD_OUT').length}
              </div>
            </div>
            <div style={{ background: 'white', padding: '15px', borderRadius: '6px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>總銷售份數</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>{totalSold}</div>
            </div>
          </div>

          {/* Products List */}
          {!account ? (
            <div style={{ background: 'white', borderRadius: '8px', padding: '60px 20px', textAlign: 'center', color: '#6b7280', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔒</div>
              <p>請先連接錢包以管理商品</p>
            </div>
          ) : myProducts.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '8px', padding: '60px 20px', textAlign: 'center', color: '#6b7280', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>📦</div>
              <p>尚未發佈任何商品</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {myProducts.map((product) => (
                <div
                  key={product.id}
                  style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #d1fae5' }}
                >
                  <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dbeafe 100%)', padding: '20px', textAlign: 'center', fontSize: '40px' }}>
                    📦
                  </div>

                  <div style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                      <h3 style={{ fontSize: '15px', color: '#1f2937', fontWeight: '600', margin: 0 }}>
                        {product.productName}
                      </h3>
                      <span style={{
                        fontSize: '11px',
                        padding: '4px 8px',
                        background: product.status === 'PUBLISHED' ? '#d1fae5' : '#fee2e2',
                        color: product.status === 'PUBLISHED' ? '#065f46' : '#7f1d1d',
                        borderRadius: '3px',
                        fontWeight: '600',
                      }}>
                        {product.status === 'PUBLISHED' ? '✓ 發佈中' : product.status === 'SOLD_OUT' ? '✕ 已售罄' : '草稿'}
                      </span>
                    </div>

                    <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '10px', lineHeight: '1.4' }}>
                      {product.description}
                    </p>

                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '10px', lineHeight: '1.6' }}>
                      <div>💰 原價: ¥{product.originalPrice} → <strong style={{ color: '#ef4444' }}>¥{product.discountPrice}</strong></div>
                      <div>📦 庫存: {product.quantity} 份 | 已售: <strong style={{ color: '#10b981' }}>{soldCounts[product.id] || 0}</strong> 份</div>
                      <div>⏰ 過期: {product.expiryTime}</div>
                      <div>📅 發佈: {product.publishDate}</div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', paddingTop: '10px', borderTop: '1px solid #f3f4f6' }}>
                      <button
                        onClick={() => handleStartEdit(product)}
                        style={{ flex: 1, padding: '8px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}
                      >
                        編輯
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        style={{ flex: 1, padding: '8px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}
                      >
                        刪除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
};

export default MerchantProductsPage;

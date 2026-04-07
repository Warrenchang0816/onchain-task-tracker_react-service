import { useEffect, useState } from 'react';
import { useWallet } from '../components/common/WalletConnect';
import SidebarLayout from '../layouts/SidebarLayout';
import { useProducts, type Order } from '../contexts/ProductContext';

const OrderManagementPage = () => {
  const { account, isConnected } = useWallet();
  const { orders, updateOrderStatus, uploadDeliveryPhoto, syncMerchantOrders } = useProducts();

  // 在線時從後端同步訂單
  useEffect(() => {
    if (account) syncMerchantOrders(account);
  }, [account, syncMerchantOrders]);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');
  const [filter, setFilter] = useState('');
  const [photoUploadingOrderId, setPhotoUploadingOrderId] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string>('');

  // 只顯示當前商家的訂單
  // 支持 account 為空的情況 - 顯示所有訂單或提示連接錢包
  const merchantOrders = account 
    ? orders.filter((order) => order.merchantAddress === account)
    : orders; // 如果未連接錢包，暫時顯示所有訂單便於調試

  const filteredOrders = merchantOrders.filter((order) => {
    const matchesStatus =
      activeTab === 'all' ||
      (activeTab === 'pending' && order.status === 'PLACED') ||
      (activeTab === 'completed' && order.status === 'COMPLETED');

    const matchesFilter =
      !filter ||
      order.orderId.toLowerCase().includes(filter.toLowerCase()) ||
      order.productName.toLowerCase().includes(filter.toLowerCase());

    return matchesStatus && matchesFilter;
  });

  const handleConfirmOrder = (orderId: string) => {
    updateOrderStatus(orderId, 'CONFIRMED');
  };

  const handleRejectOrder = (orderId: string) => {
    updateOrderStatus(orderId, 'CANCELLED');
  };

  // T3-4: 上传交付照片
  const handleUploadDeliveryPhoto = (orderId: string) => {
    if (!photoUrl.trim()) {
      alert('請輸入照片 URL');
      return;
    }
    uploadDeliveryPhoto(orderId, photoUrl);
    setPhotoUploadingOrderId(null);
    setPhotoUrl('');
    alert('✅ 交付照片已上傳，訂單標記為已完成');
  };

  // 处理文件上传并转换为 URL
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, orderId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Url = reader.result as string;
      uploadDeliveryPhoto(orderId, base64Url);
      setPhotoUploadingOrderId(null);
      alert('✅ 交付照片已上傳，訂單標記為已完成');
    };
    reader.readAsDataURL(file);
  };

  const stats = {
    total: merchantOrders.length,
    pending: merchantOrders.filter((o) => o.status === 'PLACED').length,
    completed: merchantOrders.filter((o) => o.status === 'COMPLETED').length,
    totalRevenue: merchantOrders.reduce((sum, o) => sum + o.totalPrice, 0),
  };

  const getStatusInfo = (status: Order['status']) => {
    switch (status) {
      case 'PLACED':
        return { label: '已下單', color: '#fef3c7', textColor: '#92400e', emoji: '📋' };
      case 'CONFIRMED':
        return { label: '已確認', color: '#d1fae5', textColor: '#065f46', emoji: '✅' };
      case 'COMPLETED':
        return { label: '已完成', color: '#d1fae5', textColor: '#065f46', emoji: '✅' };
      case 'CANCELLED':
        return { label: '已取消', color: '#fee2e2', textColor: '#7f1d1d', emoji: '❌' };
      default:
        return { label: '未知', color: '#f3f4f6', textColor: '#6b7280', emoji: '❓' };
    }
  };

  return (
    <SidebarLayout>
      <div style={{ minHeight: 'calc(100vh - 200px)', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', padding: '40px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '40px' }}>
            <h1 style={{ fontSize: '32px', color: '#065f46', marginBottom: '10px' }}>📦 訂單管理</h1>
            <p style={{ fontSize: '16px', color: '#047857', marginBottom: '15px' }}>管理您的商品訂單，確認訂單並安排交付</p>
            {isConnected && account ? (
              <p style={{ fontSize: '12px', color: '#6b7280' }}>
                商家錢包: {account.slice(0, 6)}...{account.slice(-4)}
              </p>
            ) : (
              <p style={{ fontSize: '12px', color: '#dc2626', fontWeight: 'bold' }}>
                ⚠️ 請先連接錢包以查看您的訂單
              </p>
            )}
          </div>

          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '20px',
            marginBottom: '40px',
          }}>
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>全部訂單</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{stats.total}</div>
            </div>
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>待處理</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>{stats.pending}</div>
            </div>
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>已完成</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{stats.completed}</div>
            </div>
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>總收入</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>¥{stats.totalRevenue}</div>
            </div>
          </div>

          {/* Tabs and Filter */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px',
            gap: '20px',
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #d1fae5' }}>
              <button
                onClick={() => setActiveTab('all')}
                style={{
                  padding: '10px 20px',
                  background: activeTab === 'all' ? '#10b981' : 'transparent',
                  color: activeTab === 'all' ? 'white' : '#6b7280',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500',
                  borderRadius: '4px 4px 0 0',
                  fontSize: '14px',
                }}
              >
                📋 所有訂單
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                style={{
                  padding: '10px 20px',
                  background: activeTab === 'pending' ? '#f59e0b' : 'transparent',
                  color: activeTab === 'pending' ? 'white' : '#6b7280',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500',
                  borderRadius: '4px 4px 0 0',
                  fontSize: '14px',
                }}
              >
                ⏳ 待處理 ({stats.pending})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                style={{
                  padding: '10px 20px',
                  background: activeTab === 'completed' ? '#10b981' : 'transparent',
                  color: activeTab === 'completed' ? 'white' : '#6b7280',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500',
                  borderRadius: '4px 4px 0 0',
                  fontSize: '14px',
                }}
              >
                ✅ 已完成 ({stats.completed})
              </button>
            </div>

            <input
              type="text"
              placeholder="搜尋訂單號或商品名稱..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                padding: '10px 15px',
                border: '1px solid #d1fae5',
                borderRadius: '4px',
                fontSize: '14px',
                width: 'min(100%, 250px)',
              }}
            />
          </div>

          {/* Orders Grid */}
          {!account ? (
            <div style={{
              background: 'white',
              borderRadius: '8px',
              padding: '60px 20px',
              textAlign: 'center',
              color: '#6b7280',
            }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔒</div>
              <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>請先連接您的錢包</p>
              <p style={{ fontSize: '14px' }}>連接您的 MetaMask 錢包以查看訂單</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div style={{
              background: 'white',
              borderRadius: '8px',
              padding: '60px 20px',
              textAlign: 'center',
              color: '#6b7280',
            }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>📦</div>
              <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>
                {activeTab === 'all' && '暫無訂單'}
                {activeTab === 'pending' && '暫無待處理訂單'}
                {activeTab === 'completed' && '暫無已完成訂單'}
              </p>
              <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '10px' }}>
                💡 提示：消費者購買您發佈的商品後，訂單就會出現在這裡。
                <br />
                請前往 <strong>📦 發佈商品</strong> 頁面發佈您的即期食物。
              </p>
              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>
                  📊 系統中總共有 {orders.length} 個訂單
                </p>
                {orders.length > 0 && (
                  <p style={{ fontSize: '12px', color: '#6b7280' }}>
                    | 您的訂單: {merchantOrders.length} 個
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '20px',
            }}>
              {filteredOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                return (
                  <div
                    key={order.orderId}
                    style={{
                      background: 'white',
                      borderRadius: '8px',
                      padding: '20px',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                      border: '1px solid #d1fae5',
                    }}
                  >
                    {/* Order Header */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      marginBottom: '15px',
                      paddingBottom: '15px',
                      borderBottom: '1px solid #f3f4f6',
                    }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                          {order.orderId}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                          {order.timestamp}
                        </div>
                      </div>
                      <div style={{
                        padding: '6px 12px',
                        background: statusInfo.color,
                        color: statusInfo.textColor,
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                      }}>
                        {statusInfo.emoji} {statusInfo.label}
                      </div>
                    </div>

                    {/* Order Details */}
                    <div style={{ marginBottom: '15px', lineHeight: '1.8' }}>
                      <div style={{ fontSize: '13px', color: '#4b5563', marginBottom: '8px' }}>
                        <strong>商品:</strong> {order.productName}
                      </div>
                      <div style={{ fontSize: '13px', color: '#4b5563', marginBottom: '8px' }}>
                        <strong>客戶:</strong> {order.customerAddress.slice(0, 6)}...{order.customerAddress.slice(-4)}
                      </div>
                      <div style={{ fontSize: '13px', color: '#4b5563', marginBottom: '8px' }}>
                        <strong>數量:</strong> {order.quantity} × ¥{order.unitPrice}
                      </div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#10b981',
                        paddingTop: '8px',
                        borderTop: '1px solid #f3f4f6',
                        marginTop: '8px',
                      }}>
                        小計: ¥{order.totalPrice}
                      </div>
                    </div>

                    {/* T3-3: 質押幣狀態 */}
                    {order.pledgedAmount && (
                      <div style={{
                        marginBottom: '10px',
                        padding: '8px 12px',
                        background: order.pledgeReturned ? '#d1fae5' : '#fef3c7',
                        borderRadius: '4px',
                        border: `1px solid ${order.pledgeReturned ? '#6ee7b7' : '#fcd34d'}`,
                        fontSize: '12px',
                        color: order.pledgeReturned ? '#065f46' : '#92400e',
                      }}>
                        {order.pledgeReturned
                          ? `✅ 已退還質押 ¥${order.pledgedAmount} USDC 給消費者`
                          : `🔒 消費者質押中：¥${order.pledgedAmount} USDC（交付確認後自動退還）`}
                      </div>
                    )}

                    {/* 交付照片显示 */}
                    {order.deliveryPhotoUrl && (
                      <div style={{
                        marginBottom: '15px',
                        padding: '10px',
                        background: '#f0fdf4',
                        borderRadius: '4px',
                        border: '1px solid #d1fae5',
                      }}>
                        <p style={{ fontSize: '12px', fontWeight: '600', color: '#065f46', marginBottom: '8px' }}>
                          📸 交付照片
                        </p>
                        <img
                          src={order.deliveryPhotoUrl}
                          alt="交付照片"
                          style={{
                            width: '100%',
                            borderRadius: '4px',
                            maxHeight: '200px',
                            objectFit: 'cover',
                          }}
                        />
                        <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px' }}>
                          ✓ 確認時間: {order.deliveryConfirmedTime}
                        </p>
                      </div>
                    )}

                    {/* T3-5: 消费者评分显示 */}
                    {order.rating && (
                      <div style={{
                        marginBottom: '15px',
                        padding: '10px',
                        background: '#fffbeb',
                        borderRadius: '4px',
                        border: '1px solid #fcd34d',
                      }}>
                        <p style={{ fontSize: '12px', fontWeight: '600', color: '#92400e', marginBottom: '6px' }}>
                          ⭐ 消費者評價
                        </p>
                        <p style={{ fontSize: '14px', color: '#f59e0b', marginBottom: '5px' }}>
                          {'★'.repeat(order.rating)}{'☆'.repeat(5 - order.rating)}
                        </p>
                        <p style={{ fontSize: '11px', color: '#92400e', lineHeight: '1.4', marginBottom: '5px' }}>
                          {order.review}
                        </p>
                        <p style={{ fontSize: '10px', color: '#b45309' }}>
                          📅 評論時間: {order.reviewTime}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{
                      display: 'flex',
                      gap: '10px',
                      paddingTop: '15px',
                      borderTop: '1px solid #f3f4f6',
                    }}>
                      {order.status === 'PLACED' && (
                        <>
                          <button
                            onClick={() => handleConfirmOrder(order.orderId)}
                            style={{
                              flex: 1,
                              padding: '10px',
                              background: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontWeight: '500',
                              fontSize: '12px',
                            }}
                          >
                            ✓ 確認訂單
                          </button>
                          <button
                            onClick={() => handleRejectOrder(order.orderId)}
                            style={{
                              flex: 1,
                              padding: '10px',
                              background: '#fee2e2',
                              color: '#dc2626',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontWeight: '500',
                              fontSize: '12px',
                            }}
                          >
                            ✕ 拒絕
                          </button>
                        </>
                      )}

                      {order.status === 'CONFIRMED' && (
                        <>
                          {photoUploadingOrderId === order.orderId ? (
                            <div style={{
                              flex: 1, borderRadius: 12,
                              border: '1.5px solid #6ee7b7',
                              background: '#f0fdf4', overflow: 'hidden',
                            }}>
                              {/* Header */}
                              <div style={{
                                padding: '10px 14px',
                                background: 'linear-gradient(135deg,#065f46,#059669)',
                                display: 'flex', alignItems: 'center', gap: 8,
                              }}>
                                <span className="material-symbols-outlined" style={{ color: 'white', fontSize: 16 }}>photo_camera</span>
                                <span style={{ color: 'white', fontWeight: 700, fontSize: 12 }}>上傳交付照片</span>
                              </div>

                              <div style={{ padding: '12px' }}>
                                {/* Preview */}
                                {photoUrl ? (
                                  <div style={{ marginBottom: 10, position: 'relative' }}>
                                    <img
                                      src={photoUrl}
                                      alt="預覽"
                                      style={{
                                        width: '100%', height: 120, objectFit: 'cover',
                                        borderRadius: 8, border: '1px solid #d1fae5',
                                      }}
                                    />
                                    <button
                                      onClick={() => setPhotoUrl('')}
                                      style={{
                                        position: 'absolute', top: 6, right: 6,
                                        background: 'rgba(0,0,0,0.5)', color: 'white',
                                        border: 'none', borderRadius: '50%',
                                        width: 22, height: 22, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 12, padding: 0,
                                      }}
                                    >✕</button>
                                  </div>
                                ) : (
                                  /* Drop zone */
                                  <label style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                                    justifyContent: 'center', gap: 6,
                                    height: 90, borderRadius: 8,
                                    border: '2px dashed #6ee7b7', background: '#ecfdf5',
                                    cursor: 'pointer', marginBottom: 8,
                                  }}>
                                    <span className="material-symbols-outlined" style={{ color: '#10b981', fontSize: 28 }}>add_photo_alternate</span>
                                    <span style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>點擊選取照片</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleFileUpload(e, order.orderId)}
                                      style={{ display: 'none' }}
                                    />
                                  </label>
                                )}

                                {/* Action buttons */}
                                <div style={{ display: 'flex', gap: 6 }}>
                                  <button
                                    onClick={() => handleUploadDeliveryPhoto(order.orderId)}
                                    disabled={!photoUrl}
                                    style={{
                                      flex: 1, padding: '8px',
                                      background: photoUrl ? 'linear-gradient(135deg,#10b981,#059669)' : '#d1d5db',
                                      color: 'white', border: 'none', borderRadius: 8,
                                      cursor: photoUrl ? 'pointer' : 'not-allowed',
                                      fontWeight: 700, fontSize: 12,
                                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                                    }}
                                  >
                                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check_circle</span>
                                    確認交付
                                  </button>
                                  <button
                                    onClick={() => { setPhotoUploadingOrderId(null); setPhotoUrl(''); }}
                                    style={{
                                      padding: '8px 12px', background: '#f3f4f6',
                                      color: '#6b7280', border: 'none', borderRadius: 8,
                                      cursor: 'pointer', fontSize: 12, fontWeight: 600,
                                    }}
                                  >取消</button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setPhotoUploadingOrderId(order.orderId)}
                              style={{
                                flex: 1, padding: '10px 14px',
                                background: 'linear-gradient(135deg,#10b981,#059669)',
                                color: 'white', border: 'none', borderRadius: 10,
                                cursor: 'pointer', fontWeight: 600, fontSize: 12,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                boxShadow: '0 3px 10px rgba(16,185,129,0.3)',
                              }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>photo_camera</span>
                              上傳交付照片
                            </button>
                          )}
                        </>
                      )}

                      {order.status === 'COMPLETED' && (
                        <div style={{
                          flex: 1,
                          padding: '10px',
                          background: '#d1fae5',
                          color: '#065f46',
                          borderRadius: '4px',
                          textAlign: 'center',
                          fontWeight: '500',
                          fontSize: '12px',
                        }}>
                          ✓ 交付完成
                        </div>
                      )}

                      {order.status === 'CANCELLED' && (
                        <div style={{
                          flex: 1,
                          padding: '10px',
                          background: '#fee2e2',
                          color: '#7f1d1d',
                          borderRadius: '4px',
                          textAlign: 'center',
                          fontWeight: '500',
                          fontSize: '12px',
                        }}>
                          ✕ 已取消
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
};

export default OrderManagementPage;

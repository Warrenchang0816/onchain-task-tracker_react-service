import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '../layouts/SidebarLayout';
import { useProducts } from '../contexts/ProductContext';
import { useWallet } from '../components/common/WalletConnect';

const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const { account } = useWallet();
  const { getOrdersByCustomer, syncCustomerOrders } = useProducts();

  // 在線時從後端同步訂單
  useEffect(() => {
    if (account) syncCustomerOrders(account);
  }, [account, syncCustomerOrders]);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'completed'>('all');

  const customerOrders = useMemo(
    () => (account ? getOrdersByCustomer(account) : []),
    [account, getOrdersByCustomer]
  );

  const filteredOrders = useMemo(() => {
    let filtered = customerOrders;
    
    if (selectedStatus === 'pending') {
      filtered = filtered.filter(o => !o.rating || o.status !== 'COMPLETED');
    } else if (selectedStatus === 'completed') {
      filtered = filtered.filter(o => o.rating && o.status === 'COMPLETED');
    }
    
    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [customerOrders, selectedStatus]);

  const stats = useMemo(() => ({
    total: customerOrders.length,
    pending: customerOrders.filter(o => o.status !== 'COMPLETED').length,
    completed: customerOrders.filter(o => o.status === 'COMPLETED').length,
    totalSpent: customerOrders.reduce((sum, o) => sum + o.totalPrice, 0),
    totalPlatformCoins: customerOrders.reduce((sum, o) => sum + (o.platformCoins || 0), 0),
  }), [customerOrders]);

  if (!account) {
    return (
      <SidebarLayout>
        <div style={{ minHeight: 'calc(100vh - 200px)', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', padding: '40px 20px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center', paddingTop: '100px' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔒</div>
            <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937', marginBottom: '20px' }}>
              請先連接您的錢包
            </p>
            <button
              onClick={() => navigate('/tasks')}
              style={{
                padding: '10px 20px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              返回商城
            </button>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div style={{ minHeight: 'calc(100vh - 200px)', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', padding: '40px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '40px' }}>
            <h1 style={{ fontSize: '32px', color: '#065f46', marginBottom: '10px' }}>📋 我的訂單</h1>
            <p style={{ fontSize: '16px', color: '#047857', marginBottom: '15px' }}>
              查看您的購買歷史、評論紀錄和平台幣獎勵
            </p>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>
              您的錢包: {account.slice(0, 6)}...{account.slice(-4)}
            </p>
          </div>

          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '15px',
            marginBottom: '30px',
          }}>
            <div style={{ background: 'white', padding: '15px', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>訂單總數</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{stats.total}</div>
            </div>
            <div style={{ background: 'white', padding: '15px', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>待評價</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>{stats.pending}</div>
            </div>
            <div style={{ background: 'white', padding: '15px', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>已完成</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{stats.completed}</div>
            </div>
            <div style={{ background: 'white', padding: '15px', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>平台幣</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>💰{stats.totalPlatformCoins}</div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '20px',
            borderBottom: '2px solid #d1fae5',
          }}>
            <button
              onClick={() => setSelectedStatus('all')}
              style={{
                padding: '10px 20px',
                background: selectedStatus === 'all' ? '#10b981' : 'transparent',
                color: selectedStatus === 'all' ? 'white' : '#6b7280',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500',
                borderRadius: '4px 4px 0 0',
                fontSize: '14px',
              }}
            >
              📋 全部訂單
            </button>
            <button
              onClick={() => setSelectedStatus('pending')}
              style={{
                padding: '10px 20px',
                background: selectedStatus === 'pending' ? '#f59e0b' : 'transparent',
                color: selectedStatus === 'pending' ? 'white' : '#6b7280',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500',
                borderRadius: '4px 4px 0 0',
                fontSize: '14px',
              }}
            >
              ⏳ 待評價 ({stats.pending})
            </button>
            <button
              onClick={() => setSelectedStatus('completed')}
              style={{
                padding: '10px 20px',
                background: selectedStatus === 'completed' ? '#10b981' : 'transparent',
                color: selectedStatus === 'completed' ? 'white' : '#6b7280',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500',
                borderRadius: '4px 4px 0 0',
                fontSize: '14px',
              }}
            >
              ✅ 已評價 ({stats.completed})
            </button>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div style={{
              background: 'white',
              borderRadius: '8px',
              padding: '60px 20px',
              textAlign: 'center',
              color: '#6b7280',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>📭</div>
              <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>
                {selectedStatus === 'pending' && '您沒有待評價的訂單'}
                {selectedStatus === 'completed' && '您還沒有評價任何訂單'}
                {selectedStatus === 'all' && '您還沒有訂單'}
              </p>
              <p style={{ fontSize: '13px', marginBottom: '20px' }}>
                前往 <strong>🍽️ 即期美食商城</strong> 購買美食吧！
              </p>
              <button
                onClick={() => navigate('/tasks')}
                style={{
                  padding: '10px 20px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                前往商城
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px',
            }}>
              {filteredOrders.map((order) => (
                <div
                  key={order.orderId}
                  style={{
                    background: 'white',
                    borderRadius: '8px',
                    padding: '20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #d1fae5',
                  }}
                >
                  {/* Order Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    marginBottom: '15px',
                  }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937' }}>
                        {order.productName}
                      </div>
                      <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '3px' }}>
                        {order.timestamp}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '11px',
                      padding: '4px 8px',
                      background: order.status === 'COMPLETED' ? '#d1fae5' : '#fef3c7',
                      color: order.status === 'COMPLETED' ? '#065f46' : '#92400e',
                      borderRadius: '3px',
                      fontWeight: '600',
                    }}>
                      {order.status === 'COMPLETED' ? '✅ 已完成' : '⏳ 進行中'}
                    </div>
                  </div>

                  {/* Order Details */}
                  <div style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    marginBottom: '10px',
                    padding: '10px',
                    background: '#f0fdf4',
                    borderRadius: '4px',
                    lineHeight: '1.6',
                  }}>
                    <div>💰 價格: ¥{order.totalPrice}</div>
                    <div>📦 數量: {order.quantity} 份 × ¥{order.unitPrice}</div>
                    <div>🏪 餐廳: {order.merchantAddress.slice(0, 6)}...{order.merchantAddress.slice(-4)}</div>
                  </div>

                  {/* T3-3: 質押狀態 */}
                  {order.pledgedAmount && (
                    <div style={{
                      fontSize: '12px',
                      padding: '8px 12px',
                      background: order.pledgeReturned ? '#d1fae5' : '#fef3c7',
                      borderRadius: '4px',
                      border: `1px solid ${order.pledgeReturned ? '#6ee7b7' : '#fcd34d'}`,
                      color: order.pledgeReturned ? '#065f46' : '#92400e',
                      marginBottom: '10px',
                    }}>
                      {order.pledgeReturned
                        ? `✅ 質押 ¥${order.pledgedAmount} USDC 已退還`
                        : `🔒 質押中：¥${order.pledgedAmount} USDC（等待餐廳確認交付）`}
                    </div>
                  )}

                  {/* Review Section */}
                  {order.rating ? (
                    <div style={{
                      padding: '10px',
                      background: '#fffbeb',
                      borderRadius: '4px',
                      marginBottom: '15px',
                    }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#92400e', marginBottom: '5px' }}>
                        ⭐ 您的評價
                      </div>
                      <div style={{ fontSize: '14px', color: '#f59e0b', marginBottom: '5px' }}>
                        {'★'.repeat(order.rating)}{'☆'.repeat(5 - order.rating)}
                      </div>
                      <p style={{ fontSize: '11px', color: '#92400e', lineHeight: '1.4' }}>
                        {order.review}
                      </p>
                      {order.platformCoins && (
                        <p style={{ fontSize: '11px', color: '#10b981', marginTop: '5px', fontWeight: '600' }}>
                          + 💰 {order.platformCoins} 平台幣
                        </p>
                      )}
                    </div>
                  ) : order.status === 'COMPLETED' ? (
                    <div style={{
                      padding: '10px',
                      background: '#fef3c7',
                      borderRadius: '4px',
                      marginBottom: '15px',
                      textAlign: 'center',
                    }}>
                      <p style={{ fontSize: '12px', color: '#92400e', fontWeight: '600', marginBottom: '8px' }}>
                        ⏳ 等待評價
                      </p>
                      <button
                        onClick={() => navigate(`/orders/${order.orderId}`)}
                        style={{
                          padding: '6px 12px',
                          background: '#f59e0b',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: '600',
                        }}
                      >
                        立即評分
                      </button>
                    </div>
                  ) : null}

                  {/* Action Button */}
                  {!order.rating && order.status === 'COMPLETED' && (
                    <button
                      onClick={() => navigate(`/orders/${order.orderId}`)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '12px',
                      }}
                    >
                      📝 評論並賺平台幣
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
};

export default OrderHistoryPage;

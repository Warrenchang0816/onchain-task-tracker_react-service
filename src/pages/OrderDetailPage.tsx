import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SidebarLayout from '../layouts/SidebarLayout';
import { useProducts } from '../contexts/ProductContext';

const OrderDetailPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { orders, submitReview } = useProducts();

  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>('');
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [submitted, setSubmitted] = useState(false);

  // 查找订单
  const order = useMemo(
    () => orders.find((o) => o.orderId === orderId),
    [orderId, orders]
  );

  if (!order) {
    return (
      <SidebarLayout>
        <div style={{ minHeight: 'calc(100vh - 200px)', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', padding: '40px 20px' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', paddingTop: '100px' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>❌</div>
            <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>訂單未找到</p>
            <button
              onClick={() => navigate('/tasks')}
              style={{
                marginTop: '20px',
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

  // 检查是否已评论
  if (order.rating) {
    return (
      <SidebarLayout>
        <div style={{ minHeight: 'calc(100vh - 200px)', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', padding: '40px 20px' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '40px' }}>
            <div style={{
              background: 'white',
              borderRadius: '8px',
              padding: '40px',
              textAlign: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
              <div style={{ fontSize: '40px', marginBottom: '20px' }}>✅</div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '10px' }}>
                感謝您的評論！
              </h2>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
                您已獲得 <strong style={{ color: '#10b981', fontSize: '16px' }}>{order.platformCoins || 10}</strong> 平台幣
              </p>
              <div style={{
                padding: '15px',
                background: '#f0fdf4',
                borderRadius: '4px',
                marginBottom: '20px',
              }}>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>您的評分</p>
                <p style={{ fontSize: '18px', color: '#f59e0b' }}>
                  {'★'.repeat(order.rating)}{'☆'.repeat(5 - order.rating)}
                </p>
                <p style={{ fontSize: '13px', color: '#4b5563', marginTop: '10px', lineHeight: '1.6' }}>
                  {order.review}
                </p>
              </div>
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
                繼續購物
              </button>
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  const handleSubmit = () => {
    if (rating === 0) {
      alert('請選擇評分');
      return;
    }
    if (!review.trim()) {
      alert('請輸入評論');
      return;
    }
    submitReview(orderId!, rating, review);
    setSubmitted(true);
    setTimeout(() => {
      navigate('/tasks');
    }, 2000);
  };

  return (
    <SidebarLayout>
      <div style={{ minHeight: 'calc(100vh - 200px)', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', padding: '40px 20px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {/* 订单信息概览 */}
          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <h1 style={{ fontSize: '24px', color: '#065f46', marginBottom: '20px' }}>
              📝 評論與評分
            </h1>

            {/* 订单摘要 */}
            <div style={{
              padding: '15px',
              background: '#f0fdf4',
              borderRadius: '4px',
              marginBottom: '20px',
              borderLeft: '4px solid #10b981',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '13px', color: '#6b7280' }}>
                <div>
                  <p style={{ fontWeight: '600', marginBottom: '3px' }}>訂單號</p>
                  <p>{order.orderId}</p>
                </div>
                <div>
                  <p style={{ fontWeight: '600', marginBottom: '3px' }}>商品名稱</p>
                  <p>{order.productName}</p>
                </div>
                <div>
                  <p style={{ fontWeight: '600', marginBottom: '3px' }}>數量</p>
                  <p>{order.quantity} 份</p>
                </div>
                <div>
                  <p style={{ fontWeight: '600', marginBottom: '3px' }}>總價格</p>
                  <p style={{ color: '#10b981', fontWeight: 'bold' }}>¥{order.totalPrice}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 评分表单 */}
          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            {/* 星级评分 */}
            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1f2937', marginBottom: '12px' }}>
                請評分 <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div style={{
                display: 'flex',
                gap: '10px',
                fontSize: '32px',
              }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '32px',
                      color: star <= (hoveredRating || rating) ? '#f59e0b' : '#e5e7eb',
                      transition: 'all 0.2s',
                      transform: star <= (hoveredRating || rating) ? 'scale(1.2)' : 'scale(1)',
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                {rating > 0 ? `您選擇了 ${rating} 星` : '點擊評分'}
              </p>
            </div>

            {/* 评论输入 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                評論 <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="分享您的食物品質、服務體驗等..."
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1fae5',
                  borderRadius: '4px',
                  fontSize: '14px',
                  minHeight: '120px',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  resize: 'none',
                }}
              />
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                {review.length} / 500 字符
              </p>
            </div>

            {/* 提交按鈕 */}
            <div style={{
              display: 'flex',
              gap: '10px',
              paddingTop: '20px',
              borderTop: '1px solid #f3f4f6',
            }}>
              <button
                onClick={() => navigate('/tasks')}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#f3f4f6',
                  color: '#6b7280',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                }}
              >
                返回商城
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitted || rating === 0 || !review.trim()}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: submitted ? '#10b981' : rating > 0 && review.trim() ? '#10b981' : '#d1d5db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: submitted || (rating === 0 || !review.trim()) ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                }}
              >
                {submitted ? '✅ 已提交' : '提交評論'}
              </button>
            </div>

            {/* 奖励提示 */}
            <div style={{
              marginTop: '20px',
              padding: '12px',
              background: '#fffbeb',
              borderRadius: '4px',
              borderLeft: '4px solid #f59e0b',
              fontSize: '12px',
              color: '#92400e',
            }}>
              <p style={{ fontWeight: '600', marginBottom: '3px' }}>💰 獎勵提示</p>
              <p>完成評論可獲得 <strong>10 平台幣</strong>，平台幣可用於折扣或現金提出。</p>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default OrderDetailPage;

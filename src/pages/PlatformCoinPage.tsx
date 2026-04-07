import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { useProducts } from '../contexts/ProductContext';
import type { UserPlatformCoinBalance, PlatformCoinTransaction } from '../contexts/ProductContext';
import SidebarLayout from '../layouts/SidebarLayout';

const PlatformCoinPage = () => {
  const navigate = useNavigate();
  const { account } = useWallet();
  const { getPlatformCoinBalance, getPlatformCoinTransactions, redeemPlatformCoins } = useProducts();

  const [balance, setBalance] = useState<UserPlatformCoinBalance | null>(null);
  const [transactions, setTransactions] = useState<PlatformCoinTransaction[]>([]);
  const [redeemMode, setRedeemMode] = useState<'discount' | 'listing' | null>(null);
  const [redeemAmount, setRedeemAmount] = useState<number>(0);
  const [redeemMessage, setRedeemMessage] = useState<string>('');

  useEffect(() => {
    if (!account) {
      setRedeemMessage('请先连接钱包');
      return;
    }

    const userBalance = getPlatformCoinBalance(account);
    const userTransactions = getPlatformCoinTransactions(account);

    if (userBalance) {
      setBalance(userBalance);
    } else {
      setBalance({
        userAddress: account,
        balance: 0,
        totalEarned: 0,
        totalRedeemed: 0,
        updatedAt: new Date().toLocaleString('zh-TW'),
      });
    }

    setTransactions(userTransactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  }, [account, getPlatformCoinBalance, getPlatformCoinTransactions]);

  if (!account) {
    return (
      <SidebarLayout>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>💰 平台幣管理</h2>
          <p style={{ color: '#ef4444', fontSize: '16px', marginTop: '20px' }}>请先连接钱包以查看平台幣信息</p>
        </div>
      </SidebarLayout>
    );
  }

  const handleRedeem = () => {
    if (!redeemAmount || redeemAmount <= 0) {
      setRedeemMessage('请输入有效金额');
      return;
    }

    if (!balance || redeemAmount > balance.balance) {
      setRedeemMessage('平台幣不足');
      return;
    }

    const reason = redeemMode === 'discount' ? `兑换 ${redeemAmount} PC 折扣` :
                   `用 ${redeemAmount} PC 支付上架费`;

    const success = redeemPlatformCoins(account, redeemAmount, reason);

    if (success) {
      setRedeemMessage(`✓ 兑换成功！已减少 ${redeemAmount} PC`);
      setRedeemAmount(0);
      setRedeemMode(null);
      // 刷新数据
      setTimeout(() => {
        const updatedBalance = getPlatformCoinBalance(account);
        if (updatedBalance) setBalance(updatedBalance);
      }, 500);
    } else {
      setRedeemMessage('兑换失败，请重试');
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'REVIEW': return '评论奖励';
      case 'COMPLETION': return '完成奖励';
      case 'REDEMPTION': return '兑换消耗';
      case 'REFUND': return '退款';
      default: return type;
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'REVIEW':
      case 'COMPLETION':
      case 'REFUND':
        return '#10b981';
      case 'REDEMPTION':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <SidebarLayout>
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2>💰 平台幣管理</h2>

      {/* 余额卡片 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          marginBottom: '30px',
          marginTop: '20px',
        }}
      >
        {/* 当前余额 */}
        <div
          style={{
            padding: '20px',
            borderRadius: '8px',
            backgroundColor: '#f0fdf4',
            border: '2px solid #10b981',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>当前余额</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#10b981' }}>{balance?.balance || 0}</div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>PC (Platform Coin)</div>
        </div>

        {/* 累计获得 */}
        <div
          style={{
            padding: '20px',
            borderRadius: '8px',
            backgroundColor: '#eff6ff',
            border: '2px solid #3b82f6',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>累计获得</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#3b82f6' }}>{balance?.totalEarned || 0}</div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>已赚取</div>
        </div>

        {/* 已兑换 */}
        <div
          style={{
            padding: '20px',
            borderRadius: '8px',
            backgroundColor: '#fef2f2',
            border: '2px solid #ef4444',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>已兑换</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ef4444' }}>{balance?.totalRedeemed || 0}</div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>已消耗</div>
        </div>
      </div>

      {/* 兑换区域 */}
      <div
        style={{
          padding: '20px',
          borderRadius: '8px',
          backgroundColor: '#faf5ff',
          border: '1px solid #d8b4fe',
          marginBottom: '30px',
        }}
      >
        <h3 style={{ marginTop: '0', marginBottom: '16px' }}>🎁 兑换选项</h3>

        {/* 兑换按钮组 */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '16px',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => {
              setRedeemMode('discount');
              setRedeemMessage('');
            }}
            style={{
              padding: '12px 20px',
              borderRadius: '6px',
              border: redeemMode === 'discount' ? '2px solid #a855f7' : '1px solid #d8b4fe',
              backgroundColor: redeemMode === 'discount' ? '#f3e8ff' : '#faf5ff',
              color: '#9333ea',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            📊 折扣优惠
          </button>

          <button
            onClick={() => {
              setRedeemMode('listing');
              setRedeemMessage('');
            }}
            style={{
              padding: '12px 20px',
              borderRadius: '6px',
              border: redeemMode === 'listing' ? '2px solid #f59e0b' : '1px solid #d8b4fe',
              backgroundColor: redeemMode === 'listing' ? '#fffbeb' : '#faf5ff',
              color: '#d97706',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            📝 支付上架费
          </button>
        </div>

        {/* 兑换输入区域 */}
        {redeemMode && (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              {redeemMode === 'discount' && '请输入要兑换的 PC 数量 (1 PC = 1% 折扣)'}
              {redeemMode === 'listing' && '请输入要支付的 PC 数量 (上架费: 0.5 USDC ≈ 50 PC)'}
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                min="1"
                max={balance?.balance || 0}
                value={redeemAmount}
                onChange={(e) => {
                  setRedeemAmount(parseInt(e.target.value) || 0);
                  setRedeemMessage('');
                }}
                placeholder="输入金额"
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d8b4fe',
                  fontSize: '14px',
                }}
              />
              <button
                onClick={handleRedeem}
                style={{
                  padding: '10px 20px',
                  borderRadius: '6px',
                  backgroundColor: '#a855f7',
                  color: 'white',
                  border: 'none',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#9333ea';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#a855f7';
                }}
              >
                确认兑换
              </button>
            </div>
          </div>
        )}

        {/* 消息提示 */}
        {redeemMessage && (
          <div
            style={{
              padding: '12px',
              borderRadius: '6px',
              backgroundColor: redeemMessage.includes('✓') ? '#dcfce7' : '#fee2e2',
              color: redeemMessage.includes('✓') ? '#166534' : '#991b1b',
              fontSize: '14px',
            }}
          >
            {redeemMessage}
          </div>
        )}
      </div>

      {/* 交易历史 */}
      <div
        style={{
          padding: '20px',
          borderRadius: '8px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
        }}
      >
        <h3 style={{ marginTop: '0', marginBottom: '16px' }}>📜 交易历史</h3>

        {transactions.length === 0 ? (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px 0' }}>
            还没有任何交易记录
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px',
              }}
            >
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', backgroundColor: '#f1f5f9' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>日期</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>类型</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>备注</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>数量</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn, index) => (
                  <tr key={txn.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px' }}>{txn.timestamp}</td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: `${getTransactionTypeColor(txn.type)}20`,
                          color: getTransactionTypeColor(txn.type),
                          fontWeight: '500',
                        }}
                      >
                        {getTransactionTypeLabel(txn.type)}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>{txn.reason}</td>
                    <td
                      style={{
                        padding: '12px',
                        textAlign: 'right',
                        color: txn.amount > 0 ? '#10b981' : '#ef4444',
                        fontWeight: '500',
                      }}
                    >
                      {txn.amount > 0 ? '+' : ''}{txn.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 帮助信息 */}
      <div
        style={{
          marginTop: '30px',
          padding: '16px',
          borderRadius: '8px',
          backgroundColor: '#e0f2fe',
          border: '1px solid #0284c7',
          fontSize: '14px',
          color: '#0c4a6e',
        }}
      >
        <strong>💡 如何赚取平台幣？</strong>
        <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
          <li>完成订单后评论餐厅：获得 10 PC</li>
          <li>积累平台幣后可用于兑换折扣或提现</li>
          <li>平台幣永不过期，持续积累</li>
        </ul>
      </div>
    </div>
    </SidebarLayout>
  );
};

export default PlatformCoinPage;

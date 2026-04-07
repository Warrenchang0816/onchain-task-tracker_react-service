import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../contexts/ProductContext';
import { useWallet } from '../../hooks/useWallet';

const PlatformCoinBadge = () => {
  const { account } = useWallet();
  const { getPlatformCoinBalance } = useProducts();
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    if (account) {
      const userBalance = getPlatformCoinBalance(account);
      setBalance(userBalance?.balance || 0);
    }
  }, [account, getPlatformCoinBalance]);

  if (!account) {
    return null;
  }

  return (
    <Link
      to="/my/coins"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        backgroundColor: '#f0f9ff',
        border: '1px solid #0ea5e9',
        borderRadius: '8px',
        color: '#0284c7',
        textDecoration: 'none',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        marginLeft: '16px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#e0f2fe';
        e.currentTarget.style.borderColor = '#0284c7';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#f0f9ff';
        e.currentTarget.style.borderColor = '#0ea5e9';
      }}
    >
      <span style={{ fontSize: '18px' }}>💰</span>
      <span>{balance} PC</span>
    </Link>
  );
};

export default PlatformCoinBadge;

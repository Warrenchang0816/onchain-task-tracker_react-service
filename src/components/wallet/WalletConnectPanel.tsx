import { useWallet } from '../common/WalletConnect';

function shortAddress(address?: string | null): string {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

const WalletConnectPanel = () => {
    const { account, isConnected, isConnecting, connect, disconnect, switchWallet } = useWallet();

    if (!window.ethereum) {
        return (
            <span style={{ fontSize: '13px', color: '#dc2626' }}>MetaMask 未安裝</span>
        );
    }

    if (!isConnected || !account) {
        return (
            <button
                type="button"
                onClick={connect}
                disabled={isConnecting}
                style={{
                    padding: '8px 16px',
                    background: '#154212',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: isConnecting ? 'wait' : 'pointer',
                    fontSize: '13px',
                    fontWeight: '600',
                }}
            >
                {isConnecting ? '連接中...' : '連接錢包'}
            </button>
        );
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
                padding: '6px 12px',
                background: '#f0fdf4',
                border: '1px solid #6ee7b7',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#065f46',
                fontFamily: 'monospace',
                fontWeight: '600',
            }}>
                ✅ {shortAddress(account)}
            </div>
            <button
                type="button"
                onClick={switchWallet}
                disabled={isConnecting}
                style={{
                    padding: '6px 12px',
                    background: '#154212',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: isConnecting ? 'wait' : 'pointer',
                    fontSize: '12px',
                }}
            >
                切換錢包
            </button>
            <button
                type="button"
                onClick={disconnect}
                style={{
                    padding: '6px 12px',
                    background: 'transparent',
                    color: '#6b7280',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                }}
            >
                中斷
            </button>
        </div>
    );
};

export default WalletConnectPanel;

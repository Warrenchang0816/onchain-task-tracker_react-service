import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface WalletContextType {
  account: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  switchWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // 在組件掛載時檢查已有的連接，並監聽帳號變化
  useEffect(() => {
    const eth = (window as any).ethereum;
    if (!eth) return;

    const checkConnection = async () => {
      try {
        const accounts = await eth.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Failed to check wallet connection:', error);
      }
    };

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
      } else {
        setAccount(null);
        setIsConnected(false);
      }
    };

    checkConnection();
    eth.on?.('accountsChanged', handleAccountsChanged);

    return () => {
      eth.removeListener?.('accountsChanged', handleAccountsChanged);
    };
  }, []);

  const connect = async () => {
    setIsConnecting(true);
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({
          method: 'eth_requestAccounts',
        });
        setAccount(accounts[0]);
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    const eth = (window as any).ethereum;
    if (eth) {
      try {
        await eth.request({
          method: 'wallet_revokePermissions',
          params: [{ eth_accounts: {} }],
        });
      } catch {
        // 部分環境不支援，忽略
      }
    }
    setAccount(null);
    setIsConnected(false);
  };

  const switchWallet = async () => {
    const eth = (window as any).ethereum;
    if (!eth) return;
    try {
      setIsConnecting(true);
      // 強制彈出帳號選擇器
      const result = await eth.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }],
      }) as { caveats?: { value: string[] }[] }[];
      const accounts = result?.[0]?.caveats?.[0]?.value ?? [];
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
      }
    } catch (error) {
      console.error('switchWallet failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <WalletContext.Provider value={{ account, isConnected, isConnecting, connect, disconnect, switchWallet }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

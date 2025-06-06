interface Window {
  ethereum?: {
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on: (eventName: string, handler: (...args: any[]) => void) => void;
    removeListener: (eventName: string, handler: (...args: any[]) => void) => void;
    isMetaMask?: boolean;
  };
  hashpack?: {
    connectToLocalWallet: () => Promise<{
      success: boolean;
      accountIds: string[];
      networkId?: string;
    }>;
  };
} 
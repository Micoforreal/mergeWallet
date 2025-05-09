import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect, useCallback } from 'react';

// Custom hook to handle Solana wallet connection
export const useSolanaWallet = () => {
  const { 
    publicKey, 
    connected, 
    connecting, 
    select, 
    connect, 
    disconnect,
    wallets,
    wallet
  } = useWallet();

  // Add status and error tracking
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'disconnected', 'connecting', 'connected', 'error'
  const [error, setError] = useState(null);

  // Reset error when connection status changes
  useEffect(() => {
    if (connected) {
      setConnectionStatus('connected');
      setError(null);
    } else if (connecting) {
      setConnectionStatus('connecting');
    } else if (connectionStatus !== 'error') {
      setConnectionStatus('disconnected');
    }
  }, [connected, connecting, connectionStatus]);

  // Get formatted address for display
  const getFormattedAddress = useCallback(() => {
    if (!publicKey) return '';
    const address = publicKey.toString();
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [publicKey]);

  // Check if any wallet adapters are available
  const hasWalletAdapters = wallets.length > 0;

  // Connect to wallet
  const connectWallet = useCallback(async () => {
    if (connected || connecting) return;
    
    try {
      setConnectionStatus('connecting');
      setError(null);

      // First check if any wallet adapters are available
      if (!hasWalletAdapters) {
        throw new Error('No wallet adapters available. Please install a Solana wallet extension.');
      }
      
      // Show wallet select modal if no wallet is selected yet
      if (!wallet && wallets.length > 0) {
        // Use the first available wallet if none is selected
        select(wallets[0].adapter.name);
      }

      // If wallet is selected, connect to it
      if (wallet) {
        await connect();
      } else {
        throw new Error('No wallet is selected or available. Please install a Solana wallet extension.');
      }
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      setConnectionStatus('error');
      setError(error.message || 'Failed to connect wallet');
      return error;
    }
  }, [connected, connecting, wallet, wallets, select, connect, hasWalletAdapters]);

  // Disconnect from wallet
  const disconnectWallet = useCallback(async () => {
    if (!connected) return;
    
    try {
      setConnectionStatus('disconnecting');
      await disconnect();
      setConnectionStatus('disconnected');
    } catch (error) {
      console.error('Error disconnecting from wallet:', error);
      setError(error.message || 'Failed to disconnect wallet');
      return error;
    }
  }, [connected, disconnect]);

  return {
    publicKey,
    connected,
    connecting,
    wallets,
    wallet,
    hasWalletAdapters,
    connectionStatus,
    error,
    select,
    connect,
    disconnect,
    getFormattedAddress,
    connectWallet,
    disconnectWallet
  };
}; 
import { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { 
  PhantomWalletAdapter
} from '@solana/wallet-adapter-phantom';
import {
  SolflareWalletAdapter
} from '@solana/wallet-adapter-solflare';
import {
  CoinbaseWalletAdapter
} from '@solana/wallet-adapter-coinbase';
import {
  TorusWalletAdapter
} from '@solana/wallet-adapter-torus';
import {
  LedgerWalletAdapter
} from '@solana/wallet-adapter-ledger';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Default styles that can be overridden by your app
import '@solana/wallet-adapter-react-ui/styles.css';

export const SolanaWalletProvider = ({ children }) => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Create wallet adapters without using the Buffer.alloc function
  const createPhantomWallet = () => {
    try {
      return new PhantomWalletAdapter();
    } catch (error) {
      console.error("Error creating Phantom adapter:", error);
      return null;
    }
  };

  const createSolflareWallet = () => {
    try {
      return new SolflareWalletAdapter();
    } catch (error) {
      console.error("Error creating Solflare adapter:", error);
      return null;
    }
  };

  // Only include wallets that were created successfully
  const wallets = useMemo(() => {
    const adapters = [];
    
    const phantom = createPhantomWallet();
    if (phantom) adapters.push(phantom);
    
    const solflare = createSolflareWallet();
    if (solflare) adapters.push(solflare);
    
    return adapters;
  }, []);

  // Only render the wallet providers if we have at least one wallet
  if (wallets.length === 0) {
    return (
      <div className="p-4 text-center">
        <p>No wallet adapters could be loaded. Please install a Solana wallet extension.</p>
        {children}
      </div>
    );
  }

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default SolanaWalletProvider; 
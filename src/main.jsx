import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/wallet-adapter.css'
import App from './App.jsx'
import SolanaWalletProvider from './components/SolanaWalletProvider'
import { WalletContextProvider } from './context/walletConnection'
import { Buffer } from 'buffer'
window.Buffer = Buffer;
// Error boundary for wallet connection errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error("Wallet error caught:", error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      // Fallback UI when wallet adapter fails
      return (
        <div className="p-6 max-w-md mx-auto bg-white">
          <h2 className="text-xl font-bold text-red-600 mb-4">
            Wallet Connection Error
          </h2>
          <p className="text-gray-700 mb-4">
            There was an error loading the wallet adapters. 
            You may need to install a Solana wallet browser extension like Phantom or Solflare.
          </p>
          <div className="mt-4">
            <a 
              href="https://phantom.app/download" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-black text-white px-4 py-2 rounded"
            >
              Install Phantom Wallet
            </a>
          </div>
        </div>
      );
    }
    
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>

    <ErrorBoundary>
    <WalletContextProvider>

      <SolanaWalletProvider>
        <App />
      </SolanaWalletProvider>
    </WalletContextProvider>
    </ErrorBoundary>
  </React.StrictMode>
)

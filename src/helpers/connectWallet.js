import Web3 from 'web3';

/**
 * Connect to an Ethereum wallet with improved error handling and state management
 * @param {Object} options - Connection options
 * @param {Function} options.setAccount - Function to set the connected account
 * @param {Function} options.setError - Function to set error message
 * @param {Function} options.setBalance - Optional function to set the account balance
 * @param {Function} options.setIsConnecting - Optional function to set connecting state
 * @param {Function} options.setChainId - Optional function to set the chain ID
 * @returns {Promise<{success: boolean, account: string|null, error: string|null}>}
 */
export const connectWallet = async ({
  setAccount,
  setError,
  setBalance,
  setIsConnecting,
  setChainId
}) => {
  // Set connecting state if available
  if (setIsConnecting) setIsConnecting(true);
  
  try {
    // Check if MetaMask or another Web3 provider is available
    if (!window.ethereum) {
      const errMsg = 'No Ethereum wallet detected. Please install MetaMask or another compatible wallet.';
      if (setError) setError(errMsg);
      return { success: false, account: null, error: errMsg };
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Create a Web3 instance
      const web3 = new Web3(window.ethereum);
      
      // Get the user's Ethereum account
      const account = accounts[0];
      console.log('Connected Account:', account);
      
      // Set the account in state
      if (setAccount) setAccount(account);
      
      // Get and set the balance if requested
      if (setBalance) {
        const balance = await web3.eth.getBalance(account);
        const formattedBalance = web3.utils.fromWei(balance, 'ether');
        console.log('Account Balance:', formattedBalance);
        setBalance(formattedBalance);
      }
      
      // Get and set the chain ID if requested
      if (setChainId) {
        const chainId = await web3.eth.getChainId();
        setChainId(chainId);
      }
      
      // Setup listeners for account and chain changes
      setupWalletListeners({ web3, setAccount, setChainId, setBalance });
      
      return { success: true, account, error: null };
    } catch (error) {
      const errMsg = error.message || "User denied wallet connection";
      console.error("Wallet connection error:", errMsg);
      if (setError) setError(errMsg);
      return { success: false, account: null, error: errMsg };
    }
  } catch (error) {
    const errMsg = error.message || "An unknown error occurred";
    console.error("Unexpected error:", errMsg);
    if (setError) setError(errMsg);
    return { success: false, account: null, error: errMsg };
  } finally {
    // Clear connecting state
    if (setIsConnecting) setIsConnecting(false);
  }
};

/**
 * Disconnect from the Ethereum wallet
 * @param {Object} options - Disconnection options
 * @param {Function} options.setAccount - Function to clear the account
 * @param {Function} options.setBalance - Optional function to clear the balance
 * @returns {Promise<void>}
 */
export const disconnectWallet = async ({ setAccount, setBalance, setChainId }) => {
  // Clear the account and balance
  if (setAccount) setAccount(null);
  if (setBalance) setBalance(null);
  if (setChainId) setChainId(null);
  
  // Remove event listeners
  if (window.ethereum) {
    window.ethereum.removeListener('accountsChanged', () => {});
    window.ethereum.removeListener('chainChanged', () => {});
  }
  
  console.log('Wallet disconnected');
};

/**
 * Setup event listeners for the Ethereum wallet
 * @param {Object} options - Options
 * @param {Object} options.web3 - Web3 instance
 * @param {Function} options.setAccount - Function to set the account
 * @param {Function} options.setChainId - Optional function to set the chain ID
 * @param {Function} options.setBalance - Optional function to set the balance
 */
const setupWalletListeners = ({ web3, setAccount, setChainId, setBalance }) => {
  if (!window.ethereum) return;
  
  // Listen for account changes
  window.ethereum.on('accountsChanged', async (accounts) => {
    if (accounts.length === 0) {
      // User has disconnected their wallet
      if (setAccount) setAccount(null);
      if (setBalance) setBalance(null);
      console.log('Wallet disconnected');
    } else {
      // User has switched accounts
      const newAccount = accounts[0];
      if (setAccount) setAccount(newAccount);
      console.log('Account changed:', newAccount);
      
      // Update balance if needed
      if (setBalance && web3) {
        const balance = await web3.eth.getBalance(newAccount);
        const formattedBalance = web3.utils.fromWei(balance, 'ether');
        setBalance(formattedBalance);
      }
    }
  });
  
  // Listen for chain changes
  window.ethereum.on('chainChanged', async (chainId) => {
    if (setChainId) setChainId(chainId);
    console.log('Chain changed:', chainId);
    
    // Update balance as it may be different on the new chain
    if (setBalance && setAccount && web3) {
      const accounts = await web3.eth.getAccounts();
      if (accounts.length > 0) {
        const balance = await web3.eth.getBalance(accounts[0]);
        const formattedBalance = web3.utils.fromWei(balance, 'ether');
        setBalance(formattedBalance);
      }
    }
    
    // You may want to reload the page to ensure all data is updated
    // window.location.reload();
  });
};

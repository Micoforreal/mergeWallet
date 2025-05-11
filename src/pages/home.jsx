/**
 * v0 by Vercel.
 * @see https://v0.dev/t/vNFNac6Wshl
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSolanaWallet } from "@/helpers/connectSolanaWallet";
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useState, useEffect, useCallback, useContext } from "react";
import LightProtocolService from "@/services/LightProtocolService";
import config from '@/config/lightProtocol';
import SwapTokenModal from "@/components/swapTokenModal";
import { WalletContext } from "@/context/walletConnection";
import { publicData } from "@/helpers/data";
import RecieveToken from "@/components/recieveToken";
import AlertToGetUsername from "@/components/alertToGetUsername";
import FallbackStorageAlert from "@/components/FallbackStorageAlert";
import BackupRestoreUsername from "@/components/BackupRestoreUsername";

export default function HomePage() {
    const { 
      publicKey, 
      connected, 
      hasWalletAdapters,
      error: walletError,
      wallet,
      connectWallet, 
      disconnectWallet, 
      getFormattedAddress 
    } = useSolanaWallet();
    
    // Use the LightProtocolService singleton
    const lightService = LightProtocolService;
    
    // User information state
    const [username, setUsername] = useState('');
    const {walletData, setWalletData} = useContext(WalletContext);

    const [showUsernameModal, setShowUsernameModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [savedUsername, setSavedUsername] = useState('');
    const [registrationStep, setRegistrationStep] = useState('initial'); // 'initial', 'creating-account', 'minting'
    const [usingFallbackStorage, setUsingFallbackStorage] = useState(false);
    
    // Modal states for wallet actions
    const [showReceiveModal, setShowReceiveModal] = useState(false);
    const [showSendModal, setShowSendModal] = useState(false);
    const [showSwapModal, setShowSwapModal] = useState(false);
    
    // Transaction states
    const [recipientUsername, setRecipientUsername] = useState('');
    const [sendAmount, setSendAmount] = useState('');
    const [swapFromAmount, setSwapFromAmount] = useState('');
    const [swapToAmount, setSwapToAmount] = useState('');
    const [isUsernameValid, setIsUsernameValid] = useState(false);
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    
    // Add these new state variables after the existing ones
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    
    // Add after other state variables
    const [isOnline, setIsOnline] = useState(window.navigator.onLine);
    
    // Add network status listeners
    useEffect(() => {
      const handleOnline = () => {
        setIsOnline(true);
        setErrorMessage(''); // Clear any network-related errors
        // Show a temporary notification
        alert('Network connection restored. You can now try blockchain operations again.');
      };
      
      const handleOffline = () => {
        setIsOnline(false);
        // Show a temporary notification
        setErrorMessage('Network connection lost. Using local storage until connection is restored.');
      };
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }, []);
    
    // Clear error message when wallet connection changes
    useEffect(() => {
      if (walletError) {
        setErrorMessage(walletError);
      } else {
        setErrorMessage('');
      }
    }, [walletError]);

    const connect = async () => {
      setWalletData(publicData);
    };

    useEffect(() => {
      connect();
    }, []);
    
    // Check if we need to show the username modal and load existing username
    useEffect(() => {
      if (connected && publicKey) {
        // Try to load existing username
        const fetchUsername = async () => {
          try {
            setIsLoading(true);
            setLoadingMessage('Checking username...');
            setErrorMessage('');
            
            // Check for fallback storage use
            const isFallback = await lightService.isUsingFallbackStorage(publicKey);
            setUsingFallbackStorage(isFallback);
            
            // Get username
            const existingUsername = await lightService.getUsername(publicKey);
            
            if (existingUsername) {
              setSavedUsername(existingUsername);
              setShowUsernameModal(false);
            } else {
              // No username found for this wallet, show the modal
              setShowUsernameModal(true);
              setSavedUsername('');
            }
          } catch (error) {
            console.error("Error fetching username:", error);
            setErrorMessage("Failed to load username: " + (error.message || "Unknown error"));
            setShowUsernameModal(true);
          } finally {
            setIsLoading(false);
            setLoadingMessage('');
          }
        };
        
        fetchUsername();
      } else {
        setShowUsernameModal(false);
        setSavedUsername('');
        setUsingFallbackStorage(false);
      }
    }, [connected, publicKey]);
    
    // Handle wallet connection
    const handleConnectWallet = async () => {
        if (connected) {
            await disconnectWallet();
            setSavedUsername('');
        } else {
            const error = await connectWallet();
            if (error) {
              setErrorMessage(error.message || 'Failed to connect wallet');
            }
        }
    };
    
    // Save username using Light Protocol
    const handleSaveUsername = useCallback(async () => {
      if (!username.trim() || !publicKey) {
        setErrorMessage('Username cannot be empty');
        return;
      }
      
      // Validate username format
      if (!config.USERNAME_REGEX.test(username)) {
        setErrorMessage('Username can only contain letters, numbers, underscores, and dashes');
        return;
      }
      
      // Validate username length
      if (username.length > config.MAX_USERNAME_LENGTH) {
        setErrorMessage(`Username cannot be longer than ${config.MAX_USERNAME_LENGTH} characters`);
        return;
      }
      
      try {
        setIsSubmitting(true);
        setErrorMessage('');
        setRegistrationStep('creating-account');
        setLoadingMessage('Checking if username is available...');
        
        // Check if username already exists
        const exists = await lightService.usernameExists(username);
        if (exists) {
          setErrorMessage('Username already taken. Please choose another.');
          setIsSubmitting(false);
          setRegistrationStep('initial');
          return;
        }
        
        // Initialize Light Account if needed
        setLoadingMessage('Initializing wallet...');
        await lightService.initLightAccount(publicKey);
        
        // Create a compressed NFT for the username
        setRegistrationStep('minting');
        setLoadingMessage('Registering username on blockchain...');
        const result = await lightService.createUsernameNFT(publicKey, username);
        
        // Check if fallback storage was used
        setUsingFallbackStorage(result.metadata.fallback === true);
        
        // Username saved successfully
        setSavedUsername(username);
        setShowUsernameModal(false);
        setRegistrationStep('initial');
        
        // Show appropriate success message
        if (result.metadata.fallback) {
          // Username stored locally
          setLoadingMessage('');
          // Will show the fallback alert instead
        } else {
          // Username registered on blockchain
          setLoadingMessage('');
          alert(`Username @${username} successfully registered on the blockchain!`);
        }
      } catch (error) {
        console.error('Error saving username:', error);
        setErrorMessage('Failed to save username: ' + error.message);
        setRegistrationStep('initial');
      } finally {
        setIsSubmitting(false);
        setLoadingMessage('');
      }
    }, [username, publicKey]);
    
    // Retry blockchain registration
    const handleRetryBlockchainRegistration = async () => {
      if (!savedUsername || !publicKey) {
        setErrorMessage('No username to register');
        return;
      }
      
      try {
        setIsSubmitting(true);
        setLoadingMessage('Attempting to register on blockchain...');
        setErrorMessage('');
        
        // Force Light Protocol to try again by temporarily setting useFallback to false
        lightService.useFallback = false;
        
        // Create a compressed NFT for the username
        const result = await lightService.createUsernameNFT(publicKey, savedUsername);
        
        // Check if fallback storage was still used
        setUsingFallbackStorage(result.metadata.fallback === true);
        
        if (!result.metadata.fallback) {
          alert("Username successfully registered on the blockchain!");
        } else {
          setErrorMessage("Blockchain registration failed again. Please try later when network conditions improve.");
        }
      } catch (error) {
        console.error('Error during blockchain registration retry:', error);
        setErrorMessage('Failed to register username: ' + error.message);
      } finally {
        setIsSubmitting(false);
        setLoadingMessage('');
      }
    };
    
    // Handle username restoration
    const handleUsernameRestored = (restoredUsername) => {
      setSavedUsername(restoredUsername);
      alert(`Username @${restoredUsername} has been restored successfully!`);
      
      // Refresh fallback status
      lightService.isUsingFallbackStorage(publicKey).then(setUsingFallbackStorage);
    };
    
    // Handle wallet actions
    const handleReceive = () => {
      setShowReceiveModal(true);
    };
    
    const handleSend = () => {
      setShowSendModal(true);
    };
    
    // Close all modals
    const closeAllModals = () => {
      setShowReceiveModal(false);
      setShowSendModal(false);
      setShowSwapModal(false);
    };
    
    // Mock transaction execution with username resolution
    const executeSendTransaction = async () => {
      setIsSubmitting(true);
      setErrorMessage('');
      
      try {
        // Simulate username resolution
        setIsCheckingUsername(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if username exists (mock)
        const usernameExists = recipientUsername.length > 2 && recipientUsername !== 'notfound';
        
        if (!usernameExists) {
          throw new Error('Username not found. Please check and try again.');
        }
        
        setIsCheckingUsername(false);
        
        // Simulate transaction
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Success
        closeAllModals();
        alert(`Successfully sent ${sendAmount} SOL to @${recipientUsername}!`);
        setRecipientUsername('');
        setSendAmount('');
      } catch (error) {
        setErrorMessage(error.message || 'Transaction failed');
        setIsCheckingUsername(false);
      } finally {
        setIsSubmitting(false);
      }
    };
    
    // Check if username exists (mock implementation)
    const checkUsername = async (username) => {
      if (!username || username.length < 2) {
        setIsUsernameValid(false);
        return false;
      }
      
      setIsCheckingUsername(true);
      
      try {
        // Try to use actual username check
        const exists = await lightService.usernameExists(username);
        setIsUsernameValid(exists);
        return exists;
      } catch {
        // Fallback to mock behavior if the real check fails
        const exists = username.length > 2 && username !== 'notfound';
        setIsUsernameValid(exists);
        return exists;
      } finally {
        setIsCheckingUsername(false);
      }
    };
    
    // Handle checking username while typing
    useEffect(() => {
      const timer = setTimeout(() => {
        if (recipientUsername) {
          checkUsername(recipientUsername);
        } else {
          setIsUsernameValid(false);
        }
      }, 500); // Debounce
      
      return () => clearTimeout(timer);
    }, [recipientUsername]);
    
    const executeSwapTransaction = async () => {
      setIsSubmitting(true);
      setErrorMessage('');
      
      try {
        // Simulate a transaction
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Success
        closeAllModals();
        alert('Swap executed successfully!');
        setSwapFromAmount('');
        setSwapToAmount('');
      } catch (error) {
        setErrorMessage('Swap failed: ' + error.message);
      } finally {
        setIsSubmitting(false);
      }
    };
    
  return (
    <div className="max-w-md mx-auto p-6 bg-white min-h-screen">
      <div className="flex items-center justify-between mb-8 border-b pb-4">
        <div className="flex items-center space-x-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-10 w-10 border border-gray-200 cursor-pointer">
                <AvatarImage src="/placeholder-user.jpg" alt="Wallet Icon" />
                <AvatarFallback className="bg-gray-100 text-gray-800">
                  {savedUsername ? savedUsername[0]?.toUpperCase() : 'W'}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
          </DropdownMenu>
          {connected ? (
            <div className="flex flex-col">
              {savedUsername ? (
                <span className="font-medium text-gray-900">@{savedUsername}</span>
              ) : (
                <span className="font-medium text-gray-900">{wallet?.adapter?.name || "Solana Wallet"}</span>
              )}
              <div className="flex items-center">
                {/* <span className="text-xs text-gray-500">{getFormattedAddress()}</span> */}
              </div>
            </div>
          ) : (
            <span className="font-medium text-gray-500">Not Connected</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isOnline && (
            <Badge variant="outline" className="text-xs font-normal border-red-200 bg-red-50 text-red-600">
              Offline
            </Badge>
          )}
          <Badge variant="outline" className="text-xs font-normal border-gray-200 text-gray-600">devnet</Badge>
        </div>
      </div>
      
      {/* Show fallback storage alert if needed */}
      {usingFallbackStorage && savedUsername && (
        <FallbackStorageAlert 
          isFallback={usingFallbackStorage} 
          username={savedUsername}
          onRetry={handleRetryBlockchainRegistration}
          onDismiss={() => setUsingFallbackStorage(false)}
        />
      )}
      
      {connected ? (
        <div className="text-center mb-8">
          <div className="text-3xl font-bold text-gray-900 mb-1">$00.00</div>
          <div className="text-sm text-gray-500 flex items-center justify-center">
            {savedUsername ? (
              <span className="font-medium">@{savedUsername}</span>
            ) : (
              <span>{getFormattedAddress()}</span>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="inline-flex h-6 w-6 ml-1 text-gray-400 hover:text-gray-600"
              onClick={() => {
                const textToCopy = savedUsername ? `@${savedUsername}` : publicKey.toString();
                navigator.clipboard.writeText(textToCopy);
                alert('Copied to clipboard!');
              }}
            >
              <CopyIcon className="h-4 w-4" />
              <span className="sr-only">Copy</span>
            </Button>
          </div>
          {!savedUsername && connected && (
            <div className="mt-3">
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs border-black text-black hover:bg-gray-50"
                onClick={() => setShowUsernameModal(true)}
              >
                Set Username
              </Button>
            </div>
          )}
          
          {/* Add backup/restore button when username exists */}
          {savedUsername && connected && (
            <div className="mt-3">
              <BackupRestoreUsername 
                lightService={lightService}
                publicKey={publicKey}
                username={savedUsername}
                onRestoreComplete={handleUsernameRestored}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 mb-8">
          <div className="text-lg text-gray-700 mb-6">Connect your Solana wallet to get started</div>
          <div className="flex flex-col items-center gap-4">

            {hasWalletAdapters ? (
              <WalletMultiButton className="bg-black hover:bg-gray-800 text-white font-normal py-3 px-6 rounded-md transition-colors duration-200 w-full max-w-xs" />
            ) : (
              <Button 
                className="bg-black hover:bg-gray-800 text-white font-normal py-3 px-6 rounded-md transition-colors duration-200 w-full max-w-xs"
                onClick={() => window.open('https://phantom.app/download', '_blank')}
              >
                Install Wallet
              </Button>
            )}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 w-full max-w-xs">
                <p className="text-xs text-red-600">{errorMessage}</p>
              </div>
            )}
            <p className="text-xs text-gray-500 max-w-xs text-center">
              Connect with Phantom, Solflare or other Solana wallets to continue.
              This will be your identity for username registration.
            </p>
          </div>
        </div>
      )}
      
      {connected && (
        <>
          <div className="grid grid-cols-3 gap-3 mb-8">
          <RecieveToken/>
            <Button 
              variant="outline" 
              className="text-sm font-normal text-gray-700 border-gray-200 hover:bg-gray-50"
              onClick={handleSend}
            >
              Send
            </Button>
          <SwapTokenModal />
          </div>
          
          <div className="border-t pt-4 mt-auto">
            <div className="flex items-center justify-between">
              <div className=" w-full space-y-5 items-center space-x-2">
                {walletData && (
                <>
                {walletData.map((item)=>(
                  <div key={item.symbol} className="flex items-center border rounded-lg p-2 justify-between">
                    <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                    <img src={item.logo} alt={item.symbol} className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{item.symbol}</span>
                    <div className="text-xs text-gray-500">{item?.address?.slice(0, 6)}...{item?.address?.slice(-4)}</div>
                  </div>
                </div>
                <div className="font-medium text-gray-900 mr-2">00 {item.symbol}</div>
                  </div>
                ))}
                </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Set Username Modal */}
      {showUsernameModal && (
        <AlertToGetUsername
          open={showUsernameModal}
          onOpenChange={setShowUsernameModal}
          onSave={handleSaveUsername}
          username={username}
          setUsername={setUsername}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
          registrationStep={registrationStep}
        />
      )}
      
      {/* Show loading indicator when needed */}
      {(isLoading || isSubmitting) && loadingMessage && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mb-4"></div>
              <p className="text-sm text-center">{loadingMessage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CopyIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  )
}

function CheckIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function XIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
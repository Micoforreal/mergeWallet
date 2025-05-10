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
import { useState, useEffect, useCallback,useContext } from "react";
import LightProtocolService from "@/services/LightProtocolService";
import config from '@/config/lightProtocol';
import SwapTokenModal from "@/components/swapTokenModal";
import { WalletContext } from "@/context/walletConnection";
import { publicData } from "@/helpers/data";
import RecieveToken from "@/components/recieveToken";
import AlertToGetUsername from "@/components/alertToGetUsername";

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
    
    // Light Protocol service for username storage
    const [lightService] = useState(() => new LightProtocolService());
    
    // User information state
    const [username, setUsername] = useState('');
    const {walletData, setWalletData} = useContext(WalletContext);

    const [showUsernameModal, setShowUsernameModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [savedUsername, setSavedUsername] = useState('');
    const [registrationStep, setRegistrationStep] = useState('initial'); // 'initial', 'creating-account', 'minting'
    
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
    
    // Clear error message when wallet connection changes
    useEffect(() => {
      if (walletError) {
        setErrorMessage(walletError);
      } else {
        setErrorMessage('');
      }
    }, [walletError]);

    const connect = async ()=>{
      setWalletData(publicData)
    }

    useEffect(()=>{
      connect()

    },[])
    
    // Check if we need to show the username modal and load existing username
    useEffect(() => {
      if (connected && publicKey) {
        // Try to load existing username
        const fetchUsername = async () => {
          try {
            const existingUsername = await lightService.getUsername(publicKey);
            
            if (existingUsername) {
              setSavedUsername(existingUsername);
              setShowUsernameModal(false);
            } else {
              // No username found for this wallet, show the modal
              setShowUsernameModal(true);
            }
          } catch (error) {
            console.error("Error fetching username:", error);
            setShowUsernameModal(true);
          }
        };
        
        fetchUsername();
      } else {
        setShowUsernameModal(false);
        setSavedUsername('');
      }
    }, [connected, publicKey, lightService]);
    
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
        
        // Check if username already exists
        const exists = await lightService.usernameExists(username);
        if (exists) {
          setErrorMessage('Username already taken. Please choose another.');
          setIsSubmitting(false);
          setRegistrationStep('initial');
          return;
        }
        
        // Initialize Light Account if needed
        await lightService.initLightAccount(publicKey);
        
        // Create a compressed NFT for the username
        setRegistrationStep('minting');
        await lightService.createUsernameNFT(publicKey, username);
        
        // Username saved successfully
        setSavedUsername(username);
        setShowUsernameModal(false);
        setRegistrationStep('initial');
        
      } catch (error) {
        console.error('Error saving username:', error);
        setErrorMessage('Failed to save username: ' + error.message);
        setRegistrationStep('initial');
      } finally {
        setIsSubmitting(false);
      }
    }, [username, publicKey, lightService]);
    
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
        const usernameExists = recipientUsername.length > 2; // Simplified check
        
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
        // Simulate API call to check username
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // For demo, assume all usernames with length > 2 exist except "notfound"
        const exists = username.length > 2 && username !== 'notfound';
        setIsUsernameValid(exists);
        return exists;
      } catch {
        // Error ignored but we set username as invalid
        setIsUsernameValid(false);
        return false;
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
                // <></>
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
        <Badge variant="outline" className="text-xs font-normal border-gray-200 text-gray-600">devnet</Badge>
      </div>
      
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
                 <div className="flex  w-full border rounded-lg items-center">
                 <Avatar className={'ms-3'}>
             <AvatarImage src={item.logo} alt={`coin icon`} />
            
             <AvatarFallback></AvatarFallback>
             </Avatar>
             <div>
               <div className="px-4">

             <div className="font-semibold capitalize">
             {item.chain}
             </div>
             <div className="text-muted-foreground">{item.balance} <span>{item.symbol}</span> </div>
               </div>
       
             
             </div>
             <div className="ms-auto me-3">
             <div className="font-semibold ">${item.balance}</div>
             {/* <Badge variant="destructive">-4.63%</Badge> */}
             </div>
               </div>
           

                ))}

                </>
              )}
              </div>
             
            </div>
          </div>
        </>
      )}

      {/* Username Modal */}
      {showUsernameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Set Your Username</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Choose a username for your wallet. This will be your identity for sending and receiving SOL.
            </p>
            
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  @
                </span>
                <input
                  type="text"
                  id="username"
                  className="w-full pl-7 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
                  placeholder="your-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              {errorMessage && (
                <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
              )}
            </div>
            
            <div className="mb-6 p-3 bg-gray-50 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Benefits of setting a username:</h3>
              <ul className="space-y-2 text-xs text-gray-600">
                <li className="flex items-start">
                  <CheckIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Friends can send you SOL using @{username || 'username'} instead of your wallet address</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Your username is saved as a compressed NFT using Light Protocol</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>Usernames make transactions social and easy to remember</span>
                </li>
              </ul>
            </div>
            
            {isSubmitting && (
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm font-medium text-gray-600 mb-2">
                  {registrationStep === 'creating-account' 
                    ? 'Creating Light Account...' 
                    : 'Minting username as compressed NFT...'}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-black h-1.5 rounded-full transition-all duration-300"
                    style={{ width: registrationStep === 'creating-account' ? '40%' : '80%' }}
                  ></div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  disconnectWallet();
                  setShowUsernameModal(false);
                }}
                className="border-gray-200 text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveUsername}
                disabled={isSubmitting || !username.trim()}
                className="bg-black hover:bg-gray-800 text-white"
              >
                {isSubmitting ? 'Saving...' : 'Save Username'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Receive Modal */}
      {showReceiveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Receive with Username</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Share your username to receive SOL or tokens.
            </p>
            
            <div className="mb-6 p-4 bg-gray-50 rounded-md">
              <p className="text-sm font-medium text-gray-700 mb-2">Your Light Protocol username:</p>
              {savedUsername ? (
                <div className="flex items-center justify-between">
                  <div className="bg-black text-white px-3 py-2 rounded-md font-medium">
                    @{savedUsername}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 text-gray-600"
                    onClick={() => {
                      navigator.clipboard.writeText(`@${savedUsername}`);
                      alert('Username copied to clipboard!');
                    }}
                  >
                    <CopyIcon className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-red-500 text-sm">
                  You need to set a username first to receive payments.
                </div>
              )}
              
              <p className="mt-4 text-xs text-gray-500">
                Users can send you SOL by entering your username instead of your wallet address.
              </p>
            </div>
            
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={closeAllModals}
                className="border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Send Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Send with Username</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Enter the recipient's username and amount to send.
            </p>
            
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Recipient Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  @
                </span>
                <input
                  type="text"
                  id="username"
                  className={`w-full pl-7 px-3 py-2 border ${isUsernameValid ? 'border-green-300' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-black text-gray-900`}
                  placeholder="username"
                  value={recipientUsername}
                  onChange={(e) => setRecipientUsername(e.target.value)}
                  disabled={isSubmitting}
                />
                {isCheckingUsername && (
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                )}
                {!isCheckingUsername && isUsernameValid && recipientUsername && (
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-green-500">
                    <CheckIcon className="h-4 w-4" />
                  </span>
                )}
              </div>
              {recipientUsername && !isCheckingUsername && !isUsernameValid && (
                <p className="mt-1 text-xs text-red-500">
                  Username not found
                </p>
              )}
            </div>
            
            <div className="mb-6">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount (SOL)
              </label>
              <input
                type="number"
                id="amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
                placeholder="0.00"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                disabled={isSubmitting}
                min="0"
                step="0.001"
              />
            </div>
            
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 rounded-md border border-red-100">
                <p className="text-sm text-red-600">{errorMessage}</p>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={closeAllModals}
                className="border-gray-200 text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={executeSendTransaction}
                disabled={isSubmitting || !recipientUsername || !sendAmount || !isUsernameValid}
                className="bg-black hover:bg-gray-800 text-white"
              >
                {isSubmitting ? (
                  isCheckingUsername ? 'Checking username...' : 'Sending...'
                ) : (
                  'Send SOL'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Swap Modal */}
    
    </div>
  )
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
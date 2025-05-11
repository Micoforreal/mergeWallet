import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import config from '../config/lightProtocol';
import StorageService from './StorageService';

/**
 * Light Protocol service for username storage using ZK compressed NFTs
 */
export class LightProtocolService {
  constructor() {
    // Use configuration
    this.network = config.NETWORK;
    this.connection = new Connection(clusterApiUrl(this.network), 'confirmed');
    this.statelessWallet = null;
    this.lightAccount = null;
    this.PREFIX = config.PREFIX;
    this.USERNAME_LIST = config.USERNAME_LIST;
    
    // Initialize with fallback mode
    this.storage = StorageService;
    this.useFallback = config.USE_FALLBACK_STORAGE;
    this.hasLightProtocol = false;
    this.sdkLoaded = false;
    this.retryCount = 0;
    this.maxRetries = config.MAX_RETRIES;
    this.isOnline = window.navigator.onLine;
    
    // Setup network status listeners
    this._setupNetworkListeners();
    
    // Attempt to load the Light Protocol SDK
    this._loadLightProtocolSDK();
  }
  
  /**
   * Setup event listeners for online/offline status
   * @private
   */
  _setupNetworkListeners() {
    window.addEventListener('online', () => {
      console.log('Network connection restored');
      this.isOnline = true;
      // Try to reload the SDK when we get back online
      if (!this.sdkLoaded && !this.useFallback) {
        this._loadLightProtocolSDK();
      }
    });
    
    window.addEventListener('offline', () => {
      console.log('Network connection lost');
      this.isOnline = false;
      // If we're offline, force fallback mode
      this.useFallback = true;
    });
  }
  
  /**
   * Attempt to load the Light Protocol SDK
   * @private
   */
  async _loadLightProtocolSDK() {
    try {
      // If offline, don't even try to load the SDK
      if (!this.isOnline) {
        console.warn('Offline mode detected, using fallback storage');
        this.hasLightProtocol = false;
        this.useFallback = true;
        return;
      }
      
      // Try to load the real SDK
      let lightProtocolModule;
      try {
        // Dynamic import for browser compatibility
        lightProtocolModule = await import('@lightprotocol/stateless.js');
      } catch (e) {
        console.warn('Light Protocol SDK could not be loaded, using mock implementation:', e);
        // Use our mock implementation instead
        lightProtocolModule = await import('./MockLightProtocol');
      }
      
      // Check if required functions exist
      this.hasLightProtocol = !!(
        lightProtocolModule.initStatelessWallet && 
        lightProtocolModule.initializeCompressedNft &&
        lightProtocolModule.mintCompressedNft &&
        lightProtocolModule.fetchCompressedNfts
      );
      
      if (this.hasLightProtocol) {
        this.sdk = lightProtocolModule;
        this.sdkLoaded = true;
        this.useFallback = this.useFallback || !this.hasLightProtocol;
        console.log('Light Protocol SDK loaded successfully');
      } else {
        console.warn('Light Protocol SDK is missing required functions');
        this.useFallback = true;
      }
    } catch (error) {
      console.warn('Light Protocol SDK not available:', error);
      this.hasLightProtocol = false;
      this.useFallback = true;
    } finally {
      console.log("Light Protocol available:", this.hasLightProtocol);
      console.log("Using fallback storage:", this.useFallback);
    }
  }
  
  /**
   * Ensure the SDK is loaded before continuing
   * @private
   */
  async _ensureSDKLoaded() {
    if (!this.sdkLoaded && !this.useFallback) {
      try {
        await this._loadLightProtocolSDK();
      } catch (error) {
        console.warn('Failed to load Light Protocol SDK:', error);
        this.useFallback = true;
      }
    }
    return this.hasLightProtocol;
  }

  /**
   * Retry a function with exponential backoff
   * @private
   * @param {Function} fn - The function to retry
   * @param {string} operation - Name of the operation for logging
   * @returns {Promise<any>} - Result of the function
   */
  async _withRetry(fn, operation) {
    let retryCount = 0;
    let lastError = null;

    while (retryCount < this.maxRetries) {
      // Check if we're online before attempting
      if (!this.isOnline) {
        console.warn(`${operation} - Device is offline, using fallback storage`);
        this.useFallback = true;
        throw new Error('Network connection unavailable');
      }
      
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        retryCount++;
        
        // Check if the error is a network error
        const isNetworkError = error.message?.includes('network') || 
                              error.message?.includes('connection') ||
                              error.message?.includes('timeout') ||
                              error.name === 'TimeoutError' ||
                              !this.isOnline;
                              
        if (isNetworkError) {
          console.warn(`${operation} - Network error detected, using fallback storage`);
          this.useFallback = true;
          throw new Error('Network error: ' + error.message);
        }
        
        console.warn(`${operation} failed (attempt ${retryCount}/${this.maxRetries}):`, error);
        
        if (retryCount < this.maxRetries) {
          // Exponential backoff
          const delay = config.RETRY_DELAY * Math.pow(2, retryCount - 1);
          await this._delay(delay);
        }
      }
    }

    throw new Error(`${operation} failed after ${this.maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
  }

  /**
   * Initialize a Light Account for a user if they don't have one
   * @param {Object} publicKey - User's wallet public key
   * @returns {Promise<string>} - The Light Account ID
   */
  async initLightAccount(publicKey) {
    try {
      console.log(`Initializing Light Account for: ${publicKey.toString()}`);
      
      // Ensure SDK is loaded
      await this._ensureSDKLoaded();
      
      if (this.useFallback || !this.hasLightProtocol) {
        console.warn("Using fallback for Light Account initialization");
        this.useFallback = true;
        return publicKey.toString();
      }
      
      return await this._withRetry(async () => {
        // Try to initialize stateless wallet
        const pk = new PublicKey(publicKey.toString());
        const statelessWallet = await this.sdk.initStatelessWallet({
          connection: this.connection,
          payer: pk,
        });
        
        this.statelessWallet = statelessWallet;
        console.log("Stateless wallet initialized:", statelessWallet);
        
        return statelessWallet.publicKey.toString();
      }, "Light Account initialization");
    } catch (error) {
      console.error("Error initializing Light Account:", error);
      this.useFallback = true;
      throw error;
    }
  }

  /**
   * Create a compressed NFT to store username
   * @param {Object} owner - Owner's wallet public key
   * @param {string} username - Username to store
   * @returns {Promise<object>} - Transaction result
   */
  async createUsernameNFT(owner, username) {
    try {
      console.log(`Creating username NFT for ${username}`);
      
      // Ensure username is valid
      if (!username || username.trim() === '') {
        throw new Error('Username cannot be empty');
      }
      
      // Validate username format
      if (!config.USERNAME_REGEX.test(username)) {
        throw new Error('Username can only contain letters, numbers, underscores, and dashes');
      }
      
      // Validate username length
      if (username.length > config.MAX_USERNAME_LENGTH) {
        throw new Error(`Username cannot be longer than ${config.MAX_USERNAME_LENGTH} characters`);
      }
      
      // Get the owner's public key
      const ownerKey = owner.toString();
      
      // Ensure SDK is loaded
      await this._ensureSDKLoaded();
      
      if (this.useFallback || !this.hasLightProtocol) {
        // Use fallback localStorage implementation
        console.log("Using fallback storage implementation");
        await this._delay(1000); // Simulate network delay
        
        // Generate a simulated mint address
        const mintAddress = this._generateMockMintAddress();
        const txSignature = this._generateMockTxSignature();
        
        // Store the username in persistent storage
        await this._storeUsername(ownerKey, username, mintAddress);
        
        return {
          mintAddress,
          txSignature,
          metadata: {
            name: `Username: ${username}`,
            symbol: config.COLLECTION_SYMBOL,
            description: `Registered username: ${username}`,
            fallback: true
          }
        };
      }
      
      try {
        return await this._withRetry(async () => {
          // Create compressed NFT with Light Protocol
          const metadata = {
            name: `Username: ${username}`,
            symbol: config.COLLECTION_SYMBOL,
            description: `Registered username: ${username}`,
            attributes: [
              {
                trait_type: 'username',
                value: username
              },
              {
                trait_type: 'registration_date',
                value: new Date().toISOString()
              }
            ]
          };
          
          // Create a JSON metadata string
          const metadataJSON = JSON.stringify(metadata);
          // Convert to base64
          const base64Data = btoa(metadataJSON);
          const dataUri = `data:application/json;base64,${base64Data}`;
          
          // Initialize the compressed NFT
          const nftResult = await this.sdk.initializeCompressedNft({
            connection: this.connection,
            payer: new PublicKey(ownerKey),
            metadata: {
              ...metadata,
              uri: dataUri
            }
          });
          
          console.log("Compressed NFT initialized:", nftResult);
          
          // Mint the NFT
          const mintResult = await this.sdk.mintCompressedNft({
            connection: this.connection,
            payer: new PublicKey(ownerKey),
            recipient: new PublicKey(ownerKey),
            nftMint: nftResult.mint
          });
          
          console.log("Compressed NFT minted:", mintResult);
          
          // Store the username in persistent storage as a backup
          await this._storeUsername(ownerKey, username, nftResult.mint.toString());
          
          return {
            mintAddress: nftResult.mint.toString(),
            txSignature: mintResult.signature,
            metadata
          };
        }, "Username NFT creation");
      } catch (error) {
        console.warn("Error creating compressed NFT, using fallback:", error);
        this.useFallback = true;
        
        // Use fallback storage implementation
        await this._delay(1000); // Simulate network delay
        
        // Generate a simulated mint address
        const mintAddress = this._generateMockMintAddress();
        const txSignature = this._generateMockTxSignature();
        
        // Store the username in persistent storage
        await this._storeUsername(ownerKey, username, mintAddress);
        
        return {
          mintAddress,
          txSignature,
          metadata: {
            name: `Username: ${username}`,
            symbol: config.COLLECTION_SYMBOL,
            description: `Registered username: ${username}`,
            fallback: true
          }
        };
      }
    } catch (error) {
      console.error("Error creating username NFT:", error);
      throw error;
    }
  }
  
  /**
   * Get username for a wallet
   * @param {Object} owner - Owner's wallet public key
   * @returns {Promise<string|null>} - Username or null if not found
   */
  async getUsername(owner) {
    try {
      if (!owner) return null;
      
      const ownerKey = owner.toString();
      
      // Ensure SDK is loaded
      await this._ensureSDKLoaded();
      
      if (this.useFallback || !this.hasLightProtocol) {
        // Use fallback implementation
        await this._delay(300);
        
        // Get the username from storage
        const usernameData = await this.storage.getItem(this.PREFIX + ownerKey);
        if (!usernameData) return null;
        
        return usernameData.username;
      }
      
      try {
        return await this._withRetry(async () => {
          // Try to fetch compressed NFTs for this wallet
          const nfts = await this.sdk.fetchCompressedNfts({
            connection: this.connection,
            owner: new PublicKey(ownerKey),
          });
          
          if (!nfts || nfts.length === 0) {
            // Check storage as fallback
            const usernameData = await this.storage.getItem(this.PREFIX + ownerKey);
            if (!usernameData) return null;
            
            return usernameData.username;
          }
          
          // Look for username NFT
          const usernameNft = nfts.find(nft => 
            nft.metadata && 
            nft.metadata.attributes && 
            nft.metadata.attributes.some(attr => attr.trait_type === 'username')
          );
          
          if (!usernameNft) {
            // Check storage as fallback
            const usernameData = await this.storage.getItem(this.PREFIX + ownerKey);
            if (!usernameData) return null;
            
            return usernameData.username;
          }
          
          // Extract username from NFT
          const usernameAttr = usernameNft.metadata.attributes.find(attr => 
            attr.trait_type === 'username'
          );
          
          const username = usernameAttr ? usernameAttr.value : null;
          
          // Update local storage with the username from the blockchain
          if (username) {
            await this._storeUsername(ownerKey, username, usernameNft.mint);
          }
          
          return username;
        }, "Username retrieval");
      } catch (error) {
        console.warn("Error fetching compressed NFTs, using fallback:", error);
        
        // Get the username from storage
        const usernameData = await this.storage.getItem(this.PREFIX + ownerKey);
        if (!usernameData) return null;
        
        return usernameData.username;
      }
    } catch (error) {
      console.error("Error getting username:", error);
      return null;
    }
  }
  
  /**
   * Check if a username already exists
   * @param {string} username - Username to check
   * @returns {Promise<boolean>} - True if username exists
   */
  async usernameExists(username) {
    if (!username) return false;
    
    try {
      // Always check local storage first for quicker results
      const usernameList = await this._getAllUsernames();
      if (usernameList.includes(username.toLowerCase())) {
        return true;
      }
      
      // Ensure SDK is loaded
      await this._ensureSDKLoaded();
      
      // If we're using fallback or no Light Protocol, just return based on local storage check
      if (this.useFallback || !this.hasLightProtocol) {
        await this._delay(300);
        return false;
      }
      
      return await this._withRetry(async () => {
        // Here we would implement a proper on-chain check for username existence
        // This would depend on Light Protocol's exact APIs
        
        // For example, we might search for NFTs with this username in metadata
        // Or we might have a central registry of usernames

        // For now, just rely on local storage check (above)
        return false;
      }, "Username existence check");
    } catch (error) {
      console.error("Error checking if username exists:", error);
      return false;
    }
  }
  
  /**
   * Store username in persistent storage
   * @private
   * @param {string} ownerKey - Owner's public key
   * @param {string} username - Username
   * @param {string} mintAddress - Mint address of the NFT
   * @returns {Promise<void>}
   */
  async _storeUsername(ownerKey, username, mintAddress) {
    // Store the mapping from owner to username
    const data = {
      username,
      mintAddress,
      registeredAt: new Date().toISOString(),
      lastVerified: new Date().toISOString()
    };
    
    await this.storage.setItem(this.PREFIX + ownerKey, data);
    
    // Add to the list of usernames
    const usernameList = await this._getAllUsernames();
    if (!usernameList.includes(username.toLowerCase())) {
      usernameList.push(username.toLowerCase());
      await this.storage.setItem(this.USERNAME_LIST, usernameList);
    }
  }
  
  /**
   * Get all usernames
   * @private
   * @returns {Promise<string[]>} - List of usernames
   */
  async _getAllUsernames() {
    const list = await this.storage.getItem(this.USERNAME_LIST);
    return list || [];
  }
  
  /**
   * Generate a mock mint address
   * @private
   * @returns {string} - Mock mint address
   */
  _generateMockMintAddress() {
    return Array.from({ length: 32 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
  }
  
  /**
   * Generate a mock transaction signature
   * @private
   * @returns {string} - Mock transaction signature
   */
  _generateMockTxSignature() {
    return Array.from({ length: 64 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
  }
  
  /**
   * Delay execution
   * @private
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise<void>}
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Check if a wallet is using fallback storage
   * @param {Object} publicKey - User's wallet public key
   * @returns {Promise<boolean>} - True if using fallback storage
   */
  async isUsingFallbackStorage(publicKey) {
    if (!publicKey) return true;
    
    const ownerKey = publicKey.toString();
    const usernameData = await this.storage.getItem(this.PREFIX + ownerKey);
    
    if (!usernameData) return this.useFallback;
    
    // Check if we have a "fallback" flag in the data
    return usernameData.fallback === true || this.useFallback;
  }

  /**
   * Export username data for backup
   * @param {Object} publicKey - User's wallet public key
   * @returns {Promise<object|null>} - Username data for backup
   */
  async exportUsernameData(publicKey) {
    if (!publicKey) return null;
    
    const ownerKey = publicKey.toString();
    const usernameData = await this.storage.getItem(this.PREFIX + ownerKey);
    
    if (!usernameData) return null;
    
    return {
      username: usernameData.username,
      mintAddress: usernameData.mintAddress,
      registeredAt: usernameData.registeredAt,
      walletAddress: ownerKey,
      network: this.network,
      exportedAt: new Date().toISOString()
    };
  }

  /**
   * Import username data from backup
   * @param {Object} publicKey - User's wallet public key
   * @param {object} backupData - Backup data
   * @returns {Promise<boolean>} - True if import was successful
   */
  async importUsernameData(publicKey, backupData) {
    if (!publicKey || !backupData || !backupData.username || !backupData.mintAddress) {
      return false;
    }
    
    try {
      const ownerKey = publicKey.toString();
      
      // Verify the backup belongs to this wallet
      if (backupData.walletAddress && backupData.walletAddress !== ownerKey) {
        console.warn("Backup data belongs to a different wallet");
        return false;
      }
      
      // Store the username
      await this._storeUsername(
        ownerKey, 
        backupData.username, 
        backupData.mintAddress
      );
      
      return true;
    } catch (error) {
      console.error("Error importing username data:", error);
      return false;
    }
  }
}

export default new LightProtocolService(); 
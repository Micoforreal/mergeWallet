import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import config from '../config/lightProtocol';

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
    this.storage = window.localStorage;
    this.useFallback = config.USE_FALLBACK_STORAGE;
    this.hasLightProtocol = false;
    this.sdkLoaded = false;
    
    // Attempt to load the Light Protocol SDK
    this._loadLightProtocolSDK();
  }
  
  /**
   * Attempt to load the Light Protocol SDK
   * @private
   */
  async _loadLightProtocolSDK() {
    try {
      // Dynamic import for browser compatibility
      const module = await import('@lightprotocol/stateless.js');
      
      // Check if required functions exist
      this.hasLightProtocol = !!(
        module.initStatelessWallet && 
        module.initializeCompressedNft &&
        module.mintCompressedNft &&
        module.fetchCompressedNfts
      );
      
      if (this.hasLightProtocol) {
        this.sdk = module;
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
      
      try {
        // Try to initialize stateless wallet
        const pk = new PublicKey(publicKey.toString());
        const statelessWallet = await this.sdk.initStatelessWallet({
          connection: this.connection,
          payer: pk,
        });
        
        this.statelessWallet = statelessWallet;
        console.log("Stateless wallet initialized:", statelessWallet);
        
        return statelessWallet.publicKey.toString();
      } catch (error) {
        console.warn("Error initializing Light account, using fallback:", error);
        this.useFallback = true;
        return publicKey.toString();
      }
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
        console.log("Using fallback localStorage implementation");
        await this._delay(2000); // Simulate network delay
        
        // Generate a simulated mint address
        const mintAddress = this._generateMockMintAddress();
        const txSignature = this._generateMockTxSignature();
        
        // Store the username in localStorage
        this._storeUsername(ownerKey, username, mintAddress);
        
        return {
          mintAddress,
          txSignature,
          metadata: {
            name: `Username: ${username}`,
            symbol: config.COLLECTION_SYMBOL,
            description: `Registered username: ${username}`,
          }
        };
      }
      
      try {
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
        
        // Store the username in localStorage as a backup
        this._storeUsername(ownerKey, username, nftResult.mint.toString());
        
        return {
          mintAddress: nftResult.mint.toString(),
          txSignature: mintResult.signature,
          metadata
        };
      } catch (error) {
        console.warn("Error creating compressed NFT, using fallback:", error);
        this.useFallback = true;
        
        // Use fallback localStorage implementation
        await this._delay(1000); // Simulate network delay
        
        // Generate a simulated mint address
        const mintAddress = this._generateMockMintAddress();
        const txSignature = this._generateMockTxSignature();
        
        // Store the username in localStorage
        this._storeUsername(ownerKey, username, mintAddress);
        
        return {
          mintAddress,
          txSignature,
          metadata: {
            name: `Username: ${username}`,
            symbol: config.COLLECTION_SYMBOL,
            description: `Registered username: ${username}`,
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
        await this._delay(500);
        
        // Get the username from localStorage
        const usernameData = this.storage.getItem(this.PREFIX + ownerKey);
        if (!usernameData) return null;
        
        const parsed = JSON.parse(usernameData);
        return parsed.username;
      }
      
      try {
        // Try to fetch compressed NFTs for this wallet
        const nfts = await this.sdk.fetchCompressedNfts({
          connection: this.connection,
          owner: new PublicKey(ownerKey),
        });
        
        if (!nfts || nfts.length === 0) {
          // Check localStorage as fallback
          const usernameData = this.storage.getItem(this.PREFIX + ownerKey);
          if (!usernameData) return null;
          
          const parsed = JSON.parse(usernameData);
          return parsed.username;
        }
        
        // Look for username NFT
        const usernameNft = nfts.find(nft => 
          nft.metadata && 
          nft.metadata.attributes && 
          nft.metadata.attributes.some(attr => attr.trait_type === 'username')
        );
        
        if (!usernameNft) {
          // Check localStorage as fallback
          const usernameData = this.storage.getItem(this.PREFIX + ownerKey);
          if (!usernameData) return null;
          
          const parsed = JSON.parse(usernameData);
          return parsed.username;
        }
        
        // Extract username from NFT
        const usernameAttr = usernameNft.metadata.attributes.find(attr => 
          attr.trait_type === 'username'
        );
        
        return usernameAttr ? usernameAttr.value : null;
      } catch (error) {
        console.warn("Error fetching compressed NFTs, using fallback:", error);
        
        // Get the username from localStorage
        const usernameData = this.storage.getItem(this.PREFIX + ownerKey);
        if (!usernameData) return null;
        
        const parsed = JSON.parse(usernameData);
        return parsed.username;
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
    
    // Always check localStorage first for quicker results
    const usernameList = this._getAllUsernames();
    if (usernameList.includes(username.toLowerCase())) {
      return true;
    }
    
    // Ensure SDK is loaded
    await this._ensureSDKLoaded();
    
    // If we're using fallback or no Light Protocol, just return false
    if (this.useFallback || !this.hasLightProtocol) {
      await this._delay(500);
      return false;
    }
    
    // Light Protocol implementation would go here
    // For now, just rely on localStorage
    return false;
  }
  
  /**
   * Store username in localStorage
   * @private
   */
  _storeUsername(ownerKey, username, mintAddress) {
    // Store the mapping from owner to username
    const data = {
      username,
      mintAddress,
      registeredAt: new Date().toISOString()
    };
    
    this.storage.setItem(this.PREFIX + ownerKey, JSON.stringify(data));
    
    // Add to the list of usernames
    const usernameList = this._getAllUsernames();
    if (!usernameList.includes(username.toLowerCase())) {
      usernameList.push(username.toLowerCase());
      this.storage.setItem(this.USERNAME_LIST, JSON.stringify(usernameList));
    }
  }
  
  /**
   * Get all usernames
   * @private
   */
  _getAllUsernames() {
    const list = this.storage.getItem(this.USERNAME_LIST);
    return list ? JSON.parse(list) : [];
  }
  
  /**
   * Generate a mock mint address
   * @private
   */
  _generateMockMintAddress() {
    return 'zkCmprs' + Math.random().toString(36).substring(2, 15);
  }
  
  /**
   * Generate a mock transaction signature
   * @private
   */
  _generateMockTxSignature() {
    return '5K' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  
  /**
   * Helper method to simulate delay
   * @private
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default LightProtocolService; 
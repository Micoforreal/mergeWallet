/**
 * Light Protocol Service
 * A wrapper for Light Protocol SDK functions with fallback to local storage
 */

import { PublicKey } from '@solana/web3.js';
import config from '@/config/lightProtocol';
import * as MockLightProtocol from './MockLightProtocol';

// Local storage keys
const USERNAME_KEY_PREFIX = 'light_username_';
const USERNAMES_LIST_KEY = 'light_usernames_list';

export default class LightProtocolService {
  constructor() {
    this.isLightConnected = false;
    this.usernameCache = new Map();
    
    // Try to load existing usernames from localStorage
    this.loadExistingUsernames();
    
    console.log('LightProtocolService initialized in mock mode');
  }
  
  /**
   * Load existing usernames from localStorage
   */
  loadExistingUsernames() {
    try {
      const usernamesList = JSON.parse(localStorage.getItem(USERNAMES_LIST_KEY) || '[]');
      
      usernamesList.forEach(({ username, publicKey }) => {
        this.usernameCache.set(username.toLowerCase(), publicKey);
      });
      
      console.log(`Loaded ${this.usernameCache.size} usernames from local storage`);
    } catch (error) {
      console.error('Error loading existing usernames:', error);
    }
  }
  
  /**
   * Check if the Light Protocol SDK is connected
   */
  async isConnected() {
    // In mock mode, always return false to use localStorage fallback
    return this.isLightConnected;
  }
  
  /**
   * Initialize a Light account for the given public key
   */
  async initLightAccount(publicKey) {
    try {
      console.log(`Initializing Light account for: ${publicKey.toString()}`);
      // In mock mode, just pretend to initialize
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error('Error initializing Light account:', error);
      return false;
    }
  }
  
  /**
   * Get username for a public key
   */
  async getUsername(publicKey) {
    if (!publicKey) return null;
    
    try {
      const publicKeyStr = publicKey.toString();
      
      // First check localStorage
      const storedUsername = localStorage.getItem(`${USERNAME_KEY_PREFIX}${publicKeyStr}`);
      if (storedUsername) {
        return storedUsername;
      }
      
      // Use mock implementation
      console.log('Using local storage for username lookup');
      return null;
    } catch (error) {
      console.error('Error getting username:', error);
      return null;
    }
  }
  
  /**
   * Check if a username exists
   */
  async usernameExists(username) {
    if (!username) return false;
    
    try {
      const lowercaseUsername = username.toLowerCase();
      
      // Check if username exists in local cache
      if (this.usernameCache.has(lowercaseUsername)) {
        return true;
      }
      
      // Check if username exists in localStorage
      const usernamesList = JSON.parse(localStorage.getItem(USERNAMES_LIST_KEY) || '[]');
      return usernamesList.some(entry => entry.username.toLowerCase() === lowercaseUsername);
    } catch (error) {
      console.error('Error checking if username exists:', error);
      return false;
    }
  }
  
  /**
   * Create a username NFT for the given public key
   */
  async createUsernameNFT(publicKey, username) {
    if (!publicKey || !username) {
      throw new Error('Public key and username are required');
    }
    
    try {
      const publicKeyStr = publicKey.toString();
      const lowercaseUsername = username.toLowerCase();
      
      console.log(`Creating username NFT: ${username} for ${publicKeyStr}`);
      
      // Check if username already exists
      if (await this.usernameExists(username)) {
        throw new Error('Username already exists');
      }
      
      // Validate username format using config
      if (!config.USERNAME_REGEX.test(username)) {
        throw new Error('Username can only contain letters, numbers, underscores, and dashes');
      }
      
      // Validate username length using config
      if (username.length > config.MAX_USERNAME_LENGTH) {
        throw new Error(`Username cannot be longer than ${config.MAX_USERNAME_LENGTH} characters`);
      }
      
      // Mock the compressed NFT creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Store username in localStorage
      localStorage.setItem(`${USERNAME_KEY_PREFIX}${publicKeyStr}`, username);
      
      // Update username list
      let usernamesList = JSON.parse(localStorage.getItem(USERNAMES_LIST_KEY) || '[]');
      usernamesList.push({
        username,
        publicKey: publicKeyStr,
        timestamp: Date.now()
      });
      localStorage.setItem(USERNAMES_LIST_KEY, JSON.stringify(usernamesList));
      
      // Update cache
      this.usernameCache.set(lowercaseUsername, publicKeyStr);
      
      console.log(`Username ${username} registered for ${publicKeyStr}`);
      return true;
    } catch (error) {
      console.error('Error creating username NFT:', error);
      throw error;
    }
  }
  
  /**
   * Get public key for a username
   */
  async getPublicKeyByUsername(username) {
    if (!username) return null;
    
    try {
      const lowercaseUsername = username.toLowerCase();
      
      // Check if username exists in local cache
      if (this.usernameCache.has(lowercaseUsername)) {
        const publicKeyStr = this.usernameCache.get(lowercaseUsername);
        return new PublicKey(publicKeyStr);
      }
      
      // Check if username exists in localStorage
      const usernamesList = JSON.parse(localStorage.getItem(USERNAMES_LIST_KEY) || '[]');
      const entry = usernamesList.find(entry => entry.username.toLowerCase() === lowercaseUsername);
      
      if (entry) {
        return new PublicKey(entry.publicKey);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting public key by username:', error);
      return null;
    }
  }
} 
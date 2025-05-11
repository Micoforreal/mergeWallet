/**
 * Mock implementation of Light Protocol SDK for testing
 * This provides the same API as the real SDK but works entirely locally
 */

import { PublicKey } from '@solana/web3.js';

/**
 * Initialize a stateless wallet
 */
export const initStatelessWallet = async ({ connection, payer }) => {
  console.log('Mock: Initializing stateless wallet');
  return {
    publicKey: payer,
    connection
  };
};

/**
 * Initialize a compressed NFT
 */
export const initializeCompressedNft = async ({ connection, payer, metadata }) => {
  console.log('Mock: Initializing compressed NFT');
  return {
    mint: generateMockAddress(),
    metadata,
    connection
  };
};

/**
 * Mint a compressed NFT
 */
export const mintCompressedNft = async ({ connection, payer, recipient, nftMint }) => {
  console.log('Mock: Minting compressed NFT');
  return {
    signature: generateMockSignature(),
    mint: nftMint
  };
};

/**
 * Fetch compressed NFTs for a wallet
 */
export const fetchCompressedNfts = async ({ connection, owner }) => {
  console.log('Mock: Fetching compressed NFTs');
  // Return empty array for testing
  return [];
};

/**
 * Generate a mock Solana address
 */
function generateMockAddress() {
  const bytes = new Uint8Array(32);
  window.crypto.getRandomValues(bytes);
  try {
    return new PublicKey(bytes);
  } catch (e) {
    // Fallback if the random values don't create a valid pubkey
    return new PublicKey('11111111111111111111111111111111');
  }
}

/**
 * Generate a mock transaction signature
 */
function generateMockSignature() {
  return Array.from({ length: 64 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
} 
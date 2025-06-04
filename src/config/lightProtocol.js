/**
 * Light Protocol configuration
 */

// Network settings
export const NETWORK = 'devnet'; // 'devnet', 'testnet', or 'mainnet-beta'

// Metadata settings
export const COLLECTION_NAME = 'Light Username Collection';
export const COLLECTION_SYMBOL = 'LUC';
export const COLLECTION_DESCRIPTION = 'Light Protocol username collection for social wallet interactions';

// Storage keys
export const PREFIX = 'light_protocol_username_';
export const USERNAME_LIST = 'light_protocol_username_list';

// Whether to use fallback localStorage if Light Protocol is unavailable
// Set to false for production to enforce blockchain storage
// The system will still fall back to localStorage if Light Protocol fails
export const USE_FALLBACK_STORAGE = false;

// Maximum username length
export const MAX_USERNAME_LENGTH = 20;

// Username validation regex (alphanumeric, underscore, dash)
export const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;

// Storage options
export const INDEXEDDB_NAME = 'mergeWalletStorage';
export const INDEXEDDB_VERSION = 1;
export const INDEXEDDB_STORE = 'usernames';

// Error retry settings
export const MAX_RETRIES = 3;
export const RETRY_DELAY = 1000; // ms

export default {
  NETWORK,
  COLLECTION_NAME,
  COLLECTION_SYMBOL,
  COLLECTION_DESCRIPTION,
  PREFIX,
  USERNAME_LIST,
  USE_FALLBACK_STORAGE,
  MAX_USERNAME_LENGTH,
  USERNAME_REGEX,
  INDEXEDDB_NAME,
  INDEXEDDB_VERSION,
  INDEXEDDB_STORE,
  MAX_RETRIES,
  RETRY_DELAY
}; 
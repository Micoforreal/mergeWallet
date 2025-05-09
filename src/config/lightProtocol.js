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
// NOTE: Set to true for development/testing, set to false only in production when Light Protocol is fully integrated
export const USE_FALLBACK_STORAGE = true;

// Maximum username length
export const MAX_USERNAME_LENGTH = 20;

// Username validation regex (alphanumeric, underscore, dash)
export const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;

export default {
  NETWORK,
  COLLECTION_NAME,
  COLLECTION_SYMBOL,
  COLLECTION_DESCRIPTION,
  PREFIX,
  USERNAME_LIST,
  USE_FALLBACK_STORAGE,
  MAX_USERNAME_LENGTH,
  USERNAME_REGEX
}; 
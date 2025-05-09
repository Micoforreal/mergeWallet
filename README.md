# Merge Wallet

A Solana wallet integration with React and Vite that uses Light Protocol for username storage.

## Features

- Solana Wallet Adapter integration
- Multi-wallet support (Phantom, Solflare)
- Username storage with Light Protocol
- Error boundary for wallet connection issues
- Responsive mobile-friendly UI

## Setup

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

## Technical Details

### Wallet Integration

The application uses `@solana/wallet-adapter-react` for Solana wallet integration, with a simplified adapter that handles common errors and edge cases. This is implemented in:

- `src/components/SolanaWalletProvider.jsx` - Simplified wallet provider with error handling
- `src/helpers/connectSolanaWallet.js` - Custom hook for wallet connection

### Buffer Polyfill

The application uses `vite-plugin-node-polyfills` to handle Buffer compatibility in the browser environment, avoiding common issues with wallet adapter libraries.

### Light Protocol Integration

Username storage is implemented using Light Protocol's compressed NFTs, allowing for gas-efficient storage of user data.

## Development

### File Structure

- `/src/components` - React components
- `/src/helpers` - Utility functions
- `/src/pages` - Application pages
- `/src/services` - Service layer (API calls, blockchain interactions)

### Environment Variables

To configure your development environment, create a `.env` file with:

```
VITE_SOLANA_NETWORK=devnet
```

## License

MIT

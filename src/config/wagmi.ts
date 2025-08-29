import { createConfig, http } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { injected, coinbaseWallet } from 'wagmi/connectors'

// Simplified configuration for development
export const developmentConfig = createConfig({
  chains: [mainnet],
  connectors: [
    injected(), // MetaMask and other injected wallets
    coinbaseWallet({ appName: 'Portfolio Dashboard' }), // Coinbase Wallet
  ],
  transports: {
    [mainnet.id]: http(),
  },
})

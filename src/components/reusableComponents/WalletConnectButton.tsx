import * as React from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { walletIcon } from '@/assets/export'

export function WalletConnectButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading'
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated')

        if (!ready) {
          return null
        }

        if (!connected) {
          return (
            <button
              onClick={openConnectModal}
              className="inline-flex items-center gap-2 h-9 px-3 font-[500] !text-textSlateBlack rounded-full text-sm !bg-neonGreen shadow-[0px_0px_0px_1px_#1F6619,0px_1px_2px_0px_#1F661966,0px_0.75px_0px_0px_#FFFFFF33_inset] hover:shadow-[0px_0px_0px_1px_#1F6619,0px_4px_8px_2px_#1F661966,0px_0.75px_0px_0px_#FFFFFF33_inset] transition-shadow duration-300 ease-in-out cursor-pointer"
            >
              <img className="w-4" src={walletIcon} />
              Connect Wallet
            </button>
          )
        }

        if (chain.unsupported) {
          return (
            <button
              onClick={openChainModal}
              className="inline-flex items-center gap-2 h-9 px-3 font-[500] !text-textSlateBlack rounded-lg text-sm !bg-red-500 shadow-[0px_0px_0px_1px_#7F1D1D,0px_1px_2px_0px_#7F1D1D66,0px_0.75px_0px_0px_#FFFFFF33_inset] hover:shadow-[0px_0px_0px_1px_#7F1D1D,0px_4px_8px_2px_#7F1D1D66,0px_0.75px_0px_0px_#FFFFFF33_inset] transition-shadow duration-300 ease-in-out cursor-pointer"
            >
              Wrong network
            </button>
          )
        }

        return (
          <div className="flex items-center gap-2">
            <button
              onClick={openChainModal}
              className="inline-flex items-center gap-2 h-9 px-3 font-[500] !text-textSlateBlack rounded-lg text-sm !bg-neonGreen shadow-[0px_0px_0px_1px_#1F6619,0px_1px_2px_0px_#1F661966,0px_0.75px_0px_0px_#FFFFFF33_inset] hover:shadow-[0px_0px_0px_1px_#1F6619,0px_4px_8px_2px_#1F661966,0px_0.75px_0px_0px_#FFFFFF33_inset] transition-shadow duration-300 ease-in-out cursor-pointer"
            >
              {chain.hasIcon && (
                <div className="w-4 h-4">
                  {chain.iconUrl && (
                    <img
                      alt={chain.name ?? 'Chain icon'}
                      src={chain.iconUrl}
                      className="w-4 h-4"
                    />
                  )}
                </div>
              )}
              {/* {chain.name} */}
            </button>

            <button
              onClick={openAccountModal}
              className="inline-flex items-center gap-2 h-9 px-3 font-[500] !text-textSlateBlack rounded-lg text-sm !bg-neonGreen shadow-[0px_0px_0px_1px_#1F6619,0px_1px_2px_0px_#1F661966,0px_0.75px_0px_0px_#FFFFFF33_inset] hover:shadow-[0px_0px_0px_1px_#1F6619,0px_4px_8px_2px_#1F661966,0px_0.75px_0px_0px_#FFFFFF33_inset] transition-shadow duration-300 ease-in-out cursor-pointer"
            >
              {account.displayName}
              {account.displayBalance
                ? ` (${account.displayBalance})`
                : ''}
            </button>
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}

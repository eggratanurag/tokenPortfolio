import * as React from 'react'
import { Button } from './button'
import { walletIcon } from '@/assets/export'

export function WalletConnectButton() {
  return (
    <Button 
      className="rounded-full"
      leftIcon={<img className="w-4" src={walletIcon} />}
    >
      Connect Wallet
    </Button>
  )
}

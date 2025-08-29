import './App.css'
import { tokenIcon } from '@/assets/export';
import { DataTableDemo } from "@/components/reusableComponents/table"
import PortfolioSummary from "@/components/reusableComponents/PortfolioSummary"
import { WalletConnectButton } from "@/components/reusableComponents/WalletConnectButton"

function App() {

  return (
    <div className='bg-wolfDarkGray font-Inter flex flex-col h-full w-full flex-1'>

      {/* navbar  */}
      <div className='w-full flex justify-between px-3 py-3.5 '>
        <div className='flex gap-2 w-full flex-1 items-center '>
          <img src={tokenIcon} />
          <p className='font-[600] text-white text-xl' >Token Portfolio</p>
        </div>
        <WalletConnectButton />
      </div>

      <div className=' w-full sm:p-[28px] text-textSlateWhite '>
        <PortfolioSummary />
      </div>

      <div className='w-full px-[10px] sm:px-[28px] py-[15px]' >
        <DataTableDemo  />
      </div>
    </div>
  )
}

export default App

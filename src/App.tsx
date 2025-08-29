import './App.css'
import { tokenIcon, walletIcon } from '@/assets/export';
import { Button } from "@/components/reusableComponents/button"
import { DataTableDemo } from "@/components/reusableComponents/table"
import PortfolioSummary from "@/components/reusableComponents/PortfolioSummary"

function App() {

  return (
    <div className='bg-wolfDarkGray font-Inter flex flex-col h-full w-full flex-1'>

      {/* navbar  */}
      <div className='w-full flex justify-between px-3 py-3.5 '>
        <div className='flex gap-2 w-full flex-1 items-center '>
          <img src={tokenIcon} />
          <p className='font-[600] text-white text-xl' >Token Portfolio</p>
        </div>
        <Button className='rounded-full bg-neonGreen' leftIcon={<img className='w-4' src={walletIcon} />}>Connect Wallet</Button>
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

import React from 'react';
import { useAppSelector } from '@/store/storeHooks';
import DonutChart from './../ui/donutChart';
import { getChartColor } from '@/utils/colorPalette';


const PortfolioSummary: React.FC = () => {
  const watchlistTokens = useAppSelector(state => state.watchList.tokens);
  const portfolioTokens = useAppSelector(state => state.portfolio.tokens);

  // Calculate portfolio total and token percentages
  const calculatePortfolioData = () => {
    let totalValue = 0;
    const tokenData: Array<{ name: string; value: number; percentage: number }> = [];

    watchlistTokens.forEach(watchlistToken => {
      const portfolioToken = portfolioTokens.find(pt => pt.id === watchlistToken.id);
      const holdings = portfolioToken?.holdings || 0;
      const currentPrice = watchlistToken.current_price || 0;
      const tokenValue = holdings * currentPrice;
      
      if (tokenValue > 0) {
        tokenData.push({
          name: watchlistToken.name,
          value: tokenValue,
          percentage: 0 // Will be calculated after total
        });
        totalValue += tokenValue;
      }
    });

    // Calculate percentages
    if (totalValue > 0) {
      tokenData.forEach(token => {
        token.percentage = (token.value / totalValue) * 100;
      });
    }

    return { totalValue, tokenData };
  };

  const { totalValue, tokenData } = calculatePortfolioData();

  // Prepare data for donut chart
  const chartSeries = tokenData.map(token => token.value);
  const chartLabels = tokenData.map(token => token.name);

  // Format total value
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Get current time
  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <div className='bg-wolfGray sm:rounded-[12px] p-6'>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Portfolio Total Section */}
        <div className='text-start flex flex-col justify-between'>
          <div className='flex flex-col justify-start text-start gap-5'>
            <p className='text-md font-[500] text-graySubText'>Portfolio Total</p>
            <p className='text-[40px] md:text-[56px] font-[500]'>
              {formatCurrency(totalValue)}
            </p>
          </div>
          <p className='text-graySubText text-xs'>
            Last updated: {getCurrentTime()}
          </p>
        </div>

        {/* Donut Chart Section */}
        <div className='text-start'>
          <div className='flex flex-col justify-start text-start gap-5'>
            <p className='text-md font-[500] text-graySubText'>Portfolio Total</p>
            <div className='flex items-center gap-4'>
              {/* Donut Chart */}
                <DonutChart 
                  series={chartSeries} 
                  labels={chartLabels} 
                  width="200px" 
                  height="200px" 
                />

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioSummary;

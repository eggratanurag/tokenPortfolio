import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface SparklineChartProps {
  data: number[];
  priceChange: number;
}

const SparklineChart: React.FC<SparklineChartProps> = React.memo(({ data, priceChange }) => {
  const isPositive = priceChange >= 0;
  
  // Memoize options to prevent recreation on every render
  const options: ApexOptions = React.useMemo(() => ({
    chart: {
      type: 'line',
      sparkline: {
        enabled: true
      },
      toolbar: {
        show: false
      }
    },
    stroke: {
      curve: 'smooth',
      width: 2,
      colors: [isPositive ? '#10B981' : '#EF4444']
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.1,
        stops: [0, 100],
        colorStops: [
          {
            offset: 0,
            color: isPositive ? '#10B981' : '#EF4444',
            opacity: 0.3
          },
          {
            offset: 100,
            color: isPositive ? '#10B981' : '#EF4444',
            opacity: 0.1
          }
        ]
      }
    },
    tooltip: {
      fixed: {
        enabled: false
      },
      x: {
        show: false
      },
      y: {
        title: {
          formatter: () => 'Price: $'
        }
      },
      marker: {
        show: false
      },
      theme: 'dark',
      style: {
        fontSize: '12px'
      }
    },
    grid: {
      show: false
    },
    xaxis: {
      type: 'numeric',
      labels: {
        show: false
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      labels: {
        show: false
      }
    },
    markers: {
      size: 0
    }
  }), [isPositive]);

  // Memoize series to prevent recreation on every render
  const series = React.useMemo(() => [
    {
      name: 'Price',
      data: data
    }
  ], [data]);

  return (
    <div className="w-20 h-12">
      <ReactApexChart
        options={options}
        series={series}
        type="line"
        height="100%"
        width="100%"
      />
    </div>
  );
});

SparklineChart.displayName = 'SparklineChart';

export default SparklineChart;

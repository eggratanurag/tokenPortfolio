import React, { memo, useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { getChartColors } from "@/utils/colorPalette";

interface DonutChartProps {
  series: number[];
  labels?: string[];
  width?: number | string;
  height?: number | string;
  legend?: boolean;
  colors?: string[];
}

const Index: React.FC<DonutChartProps> = memo(
  ({ series, labels, width, height, colors }) => {
    const total = series.reduce((acc: number, val: number) => acc + val, 0);

    // Generate colors if not provided, using our color palette
    const chartColors = useMemo(() => {
      if (colors && colors.length > 0) {
        return colors;
      }
      return getChartColors(series.length);
    }, [colors, series.length]);

    const optionsForDonutChart: ApexOptions = {
      chart: {
        type: "donut",
      },
      stroke: {
        show: true,
        width: 1,
        colors: ["white"],
      },
      plotOptions: {
        pie: {
          donut: {
            size: "50%",
          },
        },
      },
      dataLabels: { enabled: false },
      tooltip: {
        enabled: true,
        fillSeriesColor: false,
      },
      legend: {
        show: false, // disable Apex legend
      },
      labels: labels ?? [],
      colors: chartColors, // Use our generated colors
    };

    return (
      <div className="flex flex-col gap-3 w-full md:flex-row items-start">
        {/* Donut Chart */}
        <div className="flex h-full w-full sm:w-auto  items-center justify-center">
        {/* @ts-expect-error react-apexcharts has incomplete TypeScript definitions */}
        <ReactApexChart
          series={series ?? []}
          width={width}
          height={height}
          options={optionsForDonutChart}
          type="donut"
        />
        </div>

        {/* Custom Labels */}
        <div className="flex w-full  flex-col gap-2 mt-3">
          {labels?.map((label: string, i: number) => {
            const value = series[i] ?? 0;
            const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            const color = chartColors[i] ?? "#999";

            return (
              <div
                key={i}
                className="flex min-w-[200px] items-center justify-between"
              >
                <span
                  className="font-medium"
                  style={{ color }}
                >
                  {label}
                </span>
                <span className="text-gray-400">{percent}%</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

export default Index;

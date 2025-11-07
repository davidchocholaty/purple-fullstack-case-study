"use client";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface CurrencyFrequencyChartProps {
  data: Array<{ currency: string; count: number }>;
}

const CHART_COLORS = [
  "#522473",
  "#7B3A9E",
  "#A450C9",
  "#CD66F4",
  "#E88CFF",
  "#F4B2FF",
  "#FAD8FF",
  "#FFE4FF",
];

export default function CurrencyFrequencyChart({ data }: CurrencyFrequencyChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  
  const chartData = {
    labels: data.map((item) => {
      const percentage = ((item.count / total) * 100).toFixed(1);
      return `${item.currency} (${percentage}%)`;
    }),
    datasets: [
      {
        label: "Conversions",
        data: data.map((item) => item.count),
        backgroundColor: CHART_COLORS.slice(0, data.length),
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          color: "#141414",
          font: {
            family: "Roboto, sans-serif",
            size: 14,
          },
          padding: 15,
          boxWidth: 15,
          boxHeight: 15,
        },
      },
      tooltip: {
        backgroundColor: "#522473",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: 12,
        cornerRadius: 6,
        callbacks: {
          label: function(context: { label: string; parsed: number; dataset: { data: number[] } }) {
            const label = context.label || "";
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
    },
  };

  return (
    <div style={{ height: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Pie data={chartData} options={options} />
    </div>
  );
}


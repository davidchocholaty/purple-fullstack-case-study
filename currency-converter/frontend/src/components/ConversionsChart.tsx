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

// Original color palette for reference
const BASE_COLORS = [
  "#522473", "#7B3A9E", "#A450C9", "#CD66F4",
  "#E88CFF", "#F4B2FF", "#FAD8FF", "#FFE4FF",
];

// Generate colors dynamically based on purple theme
const generateColors = (count: number): string[] => {
  // Handle edge cases
  if (count === 0) return [];
  if (count === 1) return [BASE_COLORS[0]];
  
  // If count matches or is less than base palette, use base colors
  if (count <= BASE_COLORS.length) {
    return BASE_COLORS.slice(0, count);
  }
  
  // For more colors, generate smooth gradient in purple theme
  const colors: string[] = [];
  const baseHue = 285; // Purple
  
  for (let i = 0; i < count; i++) {
    // Map index to position in base palette range
    const palettePosition = (i / (count - 1)) * (BASE_COLORS.length - 1);
    
    // Vary saturation and lightness to create distinct colors
    const saturation = 45 + ((i * 15) % 25);
    const lightness = 25 + (palettePosition * 8);
    
    colors.push(`hsl(${baseHue}, ${saturation}%, ${lightness}%)`);
  }
  
  return colors;
};

export default function CurrencyFrequencyChart({ data }: CurrencyFrequencyChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const colors = generateColors(data.length);
  
  const chartData = {
    labels: data.map((item) => {
      const percentage = ((item.count / total) * 100).toFixed(1);
      return `${item.currency} (${percentage}%)`;
    }),
    datasets: [
      {
        label: "Conversions",
        data: data.map((item) => item.count),
        backgroundColor: colors,
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
          label: function(context: { label: string; parsed: number }) {
            const label = context.label || "";
            const value = context.parsed || 0;
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


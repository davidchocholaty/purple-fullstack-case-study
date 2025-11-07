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
  
  // For more colors, interpolate between base colors
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    const position = (i / (count - 1)) * (BASE_COLORS.length - 1);
    const lowerIndex = Math.floor(position);
    const upperIndex = Math.min(lowerIndex + 1, BASE_COLORS.length - 1);
    const fraction = position - lowerIndex;
    
    // Simple interpolation for now, or just cycle through
    if (fraction === 0 || lowerIndex === upperIndex) {
      colors.push(BASE_COLORS[lowerIndex]);
    } else {
      // Interpolate using HSL for smooth gradient
      const baseHue = 285;
      const saturation = 40 + (i % 3) * 10;
      const lightness = 25 + (i * (65 / count));
      colors.push(`hsl(${baseHue}, ${saturation}%, ${lightness}%)`);
    }
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


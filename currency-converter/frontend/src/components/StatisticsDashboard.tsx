"use client";

import dynamic from "next/dynamic";
import { Table } from "@/components/ui";
import type { ConversionRecord, CurrencyPairStat, CurrencyFrequency } from "@/types";

const CurrencyFrequencyChart = dynamic(() => import("./ConversionsChart"), {
  ssr: false,
});

interface StatisticsDashboardProps {
  targetCurrencyFrequency: CurrencyFrequency[];
  recentConversions: ConversionRecord[];
  currencyPairStats: CurrencyPairStat[];
}

export default function StatisticsDashboard({
  targetCurrencyFrequency,
  recentConversions,
  currencyPairStats,
}: StatisticsDashboardProps) {
  return (
    <>
      {targetCurrencyFrequency.length > 0 && (
        <div className="history-table-container">
          <h2 className="history-title">Target Currency Distribution</h2>
          <CurrencyFrequencyChart data={targetCurrencyFrequency} />
        </div>
      )}

      {recentConversions.length > 0 && (
        <Table
          title="Recent Conversions"
          data={recentConversions}
          columns={[
            { header: "From", accessor: "fromCurrency" },
            { header: "To", accessor: "toCurrency" },
            { 
              header: "Amount", 
              accessor: "amount",
              render: (value) => (value as number).toFixed(2)
            },
            { 
              header: "Result", 
              accessor: "convertedAmount",
              render: (value) => (value as number).toFixed(2)
            },
            { 
              header: "Rate", 
              accessor: "rate",
              render: (value) => (value as number).toFixed(4)
            },
            { 
              header: "Time", 
              accessor: "timestamp",
              render: (value) => new Date(value as string).toLocaleString()
            },
          ]}
        />
      )}

      {currencyPairStats.length > 0 && (
        <Table
          title="Currency Pair Statistics"
          data={currencyPairStats}
          columns={[
            { header: "From", accessor: "fromCurrency" },
            { header: "To", accessor: "toCurrency" },
            { header: "Conversions", accessor: "conversion_count" },
            { 
              header: "Avg Amount", 
              accessor: "avg_amount",
              render: (value) => (value as number).toFixed(2)
            },
            { 
              header: "First Used", 
              accessor: "first_conversion",
              render: (value) => new Date(value as string).toLocaleString()
            },
            { 
              header: "Last Used", 
              accessor: "last_conversion",
              render: (value) => new Date(value as string).toLocaleString()
            },
          ]}
        />
      )}
    </>
  );
}



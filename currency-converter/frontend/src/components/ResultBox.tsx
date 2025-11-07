interface ResultBoxProps {
  convertedAmount: number;
  targetCurrency: string;
  conversionCount: number | null;
  mostUsedCurrency: string | null;
  rateUpdatedAt: Date | null;
}

export default function ResultBox({
  convertedAmount,
  targetCurrency,
  conversionCount,
  mostUsedCurrency,
  rateUpdatedAt,
}: ResultBoxProps) {
  // Format the timestamp for display
  const formatTimestamp = (date: Date | null) => {
    if (!date) return "Unknown";
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    // Fall back to formatted date
    return date.toLocaleString();
  };
  return (
    <div className="result-box">
      <div className="result-text-top">
        <div className="result-label">Result</div>
        <div className="result-value">
          {convertedAmount.toFixed(2)} {targetCurrency}
        </div>
        {rateUpdatedAt && (
          <div className="result-timestamp">
            Exchange rate from {formatTimestamp(rateUpdatedAt)}
          </div>
        )}
      </div>
      <div className="result-divider"></div>
      <div className="result-text-bottom">
        <div className="result-label">Number of calculations made</div>
        <div className="result-value">{conversionCount ?? 0}</div>
      </div>
      {mostUsedCurrency && (
        <>
          <div className="result-divider"></div>
          <div className="result-text-bottom">
            <div className="result-label">Most used currency</div>
            <div className="result-value">{mostUsedCurrency}</div>
          </div>
        </>
      )}
    </div>
  );
}


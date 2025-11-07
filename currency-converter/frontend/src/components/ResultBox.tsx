interface ResultBoxProps {
  convertedAmount: number;
  targetCurrency: string;
  conversionCount: number | null;
  mostUsedCurrency: string | null;
}

export default function ResultBox({
  convertedAmount,
  targetCurrency,
  conversionCount,
  mostUsedCurrency,
}: ResultBoxProps) {
  return (
    <div className="result-box">
      <div className="result-text-top">
        <div className="result-label">Result</div>
        <div className="result-value">
          {convertedAmount.toFixed(2)} {targetCurrency}
        </div>
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


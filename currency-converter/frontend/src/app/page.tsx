"use client";

import { useState } from "react";

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY"];

export default function Page() {
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [conversionCount, setConversionCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCurrencyChange = (type: "from" | "to", value: string) => {
    const otherCurrency = type === "from" ? toCurrency : fromCurrency;
    const setThisCurrency = type === "from" ? setFromCurrency : setToCurrency;
    const setOtherCurrency = type === "from" ? setToCurrency : setFromCurrency;

    setThisCurrency(value);
    
    if (value === otherCurrency) {
      const availableCurrencies = CURRENCIES.filter((c) => c !== value);
      setOtherCurrency(availableCurrencies[0] || CURRENCIES[0]);
    }
  };

  const handleConvert = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:4000/api/convert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromCurrency,
          to: toCurrency,
          amount: parseFloat(amount),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to convert currency");
      }

      const data = await response.json();
      setConvertedAmount(data.convertedAmount);
      
      // Fetch updated conversion count from database
      const countResponse = await fetch("http://localhost:4000/api/stats/count");
      if (countResponse.ok) {
        const countData = await countResponse.json();
        setConversionCount(countData.count);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <h1 className="page-title">Purple currency converter</h1>
      <div className="currency-box">
        <div className="currency-box-content">
          <div className="field">
            <label className="field-label" htmlFor="amount">Amount to convert</label>
            <div className="currency-input-box">
              <input
                id="amount"
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0.01"
                step="0.01"
              />
            </div>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="fromCurrency">From</label>
            <div className="currency-select-box">
            <select
              id="fromCurrency"
              value={fromCurrency}
              onChange={(e) => handleCurrencyChange("from", e.target.value)}
            >
                {CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="toCurrency">To</label>
            <div className="currency-select-box">
            <select
              id="toCurrency"
              value={toCurrency}
              onChange={(e) => handleCurrencyChange("to", e.target.value)}
            >
                {CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      <button 
        className="convert-button" 
        type="button"
        onClick={handleConvert}
        disabled={isLoading}
      >
        {isLoading ? "Converting..." : "Convert currency"}
      </button>
      {error && <div className="error-message">{error}</div>}
      {convertedAmount !== null && (
        <div className="result-box">
          <div className="result-text-top">
            <div className="result-label">Result</div>
            <div className="result-value">
              {convertedAmount.toFixed(2)} {toCurrency}
            </div>
          </div>
          <div className="result-divider"></div>
          <div className="result-text-bottom">
            <div className="result-label">Number of calculations made</div>
            <div className="result-value">{conversionCount ?? 0}</div>
          </div>
        </div>
      )}
    </div>
  );
}

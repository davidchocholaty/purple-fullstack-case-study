"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const CurrencyFrequencyChart = dynamic(() => import("../components/ConversionsChart"), {
  ssr: false,
});

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY"];

export default function Page() {
  const [mode, setMode] = useState<"basic" | "budget">("basic");
  const [wallet, setWallet] = useState<Record<string, number>>({});
  const [walletLoaded, setWalletLoaded] = useState(false);
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [conversionCount, setConversionCount] = useState<number | null>(null);
  const [mostUsedCurrency, setMostUsedCurrency] = useState<string | null>(null);
  const [recentConversions, setRecentConversions] = useState<Array<{
    id: number;
    fromCurrency: string;
    toCurrency: string;
    amount: number;
    convertedAmount: number;
    rate: number;
    timestamp: string;
  }>>([]);
  const [currencyPairStats, setCurrencyPairStats] = useState<Array<{
    fromCurrency: string;
    toCurrency: string;
    conversion_count: number;
    avg_amount: number;
    first_conversion: string;
    last_conversion: string;
  }>>([]);
  const [targetCurrencyFrequency, setTargetCurrencyFrequency] = useState<Array<{
    currency: string;
    count: number;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load wallet and stats on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load wallet
        const walletResponse = await fetch("http://localhost:4000/api/wallet");
        if (walletResponse.ok) {
          const walletData = await walletResponse.json();
          if (walletData.initialized) {
            setWallet(walletData.wallet);
          } else {
            // Initialize wallet if not exists
            const initResponse = await fetch("http://localhost:4000/api/wallet/initialize", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ currencies: CURRENCIES }),
            });
            if (initResponse.ok) {
              const initData = await initResponse.json();
              setWallet(initData.wallet);
            }
          }
          setWalletLoaded(true);
        }

        // Load stats
        const statsResponse = await fetch("http://localhost:4000/api/stats");
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          if (statsData.totalConversions > 0) {
            setConversionCount(statsData.totalConversions);
            setMostUsedCurrency(statsData.mostUsedCurrency?.currency || null);
            setRecentConversions(statsData.recentConversions || []);
            setCurrencyPairStats(statsData.currencyPairStats || []);
            setTargetCurrencyFrequency(statsData.targetCurrencyFrequency || []);
          }
        }
      } catch (err) {
        console.error("Failed to load initial data:", err);
      }
    };

    loadInitialData();
  }, []);

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

  const handleConvert = async (amountOverride?: number) => {
    const amountNum = amountOverride ?? parseFloat(amount);
    
    if (!amountNum || amountNum <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    // Budget mode validation
    if (mode === "budget") {
      if (!wallet[fromCurrency] || wallet[fromCurrency] < amountNum) {
        const available = wallet[fromCurrency] !== undefined ? wallet[fromCurrency].toFixed(2) : "0.00";
        setError(`Insufficient ${fromCurrency} balance. Available: ${available}`);
        return;
      }
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
          amount: amountNum,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to convert currency");
      }

      const data = await response.json();
      setConvertedAmount(data.convertedAmount);

      // Update wallet in budget mode
      if (mode === "budget") {
        const newWallet = {
          ...wallet,
          [fromCurrency]: (wallet[fromCurrency] || 0) - amountNum,
          [toCurrency]: (wallet[toCurrency] || 0) + data.convertedAmount,
        };
        setWallet(newWallet);
        
        // Save wallet to database
        await fetch("http://localhost:4000/api/wallet/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet: newWallet }),
        });
      }
      
      // Fetch updated statistics from database
      const statsResponse = await fetch("http://localhost:4000/api/stats");
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setConversionCount(statsData.totalConversions);
        setMostUsedCurrency(statsData.mostUsedCurrency?.currency || null);
        setRecentConversions(statsData.recentConversions || []);
        setCurrencyPairStats(statsData.currencyPairStats || []);
        setTargetCurrencyFrequency(statsData.targetCurrencyFrequency || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConvertAll = async () => {
    const amountToConvert = wallet[fromCurrency];
    
    if (amountToConvert <= 0) {
      setError(`No ${fromCurrency} balance to convert`);
      return;
    }

    // Pass amount directly to avoid race condition
    await handleConvert(amountToConvert);
  };

  const handleResetWallet = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/wallet/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currencies: CURRENCIES }),
      });

      if (response.ok) {
        const data = await response.json();
        setWallet(data.wallet);
        setError(null);
      } else {
        setError("Failed to reset wallet");
      }
    } catch {
      setError("Failed to reset wallet");
    }
  };

  return (
    <div className="app-container">
      <h1 className="page-title">Purple Currency Converter</h1>
      
      <div className="mode-toggle">
        <button 
          className={`mode-button ${mode === "basic" ? "active" : ""}`}
          onClick={() => setMode("basic")}
        >
          Basic Mode
        </button>
        <button 
          className={`mode-button ${mode === "budget" ? "active" : ""}`}
          onClick={() => setMode("budget")}
        >
          Budget Mode
        </button>
      </div>

      {mode === "budget" && walletLoaded && (
        <div className="wallet-display">
          <div className="wallet-header">
            <h3 className="wallet-title">Your Wallet</h3>
            <button 
              className="reset-wallet-button"
              onClick={handleResetWallet}
              type="button"
            >
              Regenerate Wallet
            </button>
          </div>
          <div className="wallet-balances">
            {CURRENCIES.map((currency) => (
              <div key={currency} className="wallet-item">
                <span className="wallet-currency">{currency}</span>
                <span className="wallet-balance">{wallet[currency]?.toFixed(2) || "0.00"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
      <div className="button-group">
        <button 
          className="convert-button" 
          type="button"
          onClick={() => handleConvert()}
          disabled={isLoading}
        >
          {isLoading ? "Converting..." : "Convert currency"}
        </button>
        {mode === "budget" && (
          <button 
            className="convert-button convert-all-button" 
            type="button"
            onClick={handleConvertAll}
            disabled={isLoading}
          >
            Convert All {fromCurrency}
          </button>
        )}
      </div>
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
      )}
      {conversionCount !== null && conversionCount > 0 && (
        <>
          {targetCurrencyFrequency.length > 0 && (
            <div className="history-table-container">
              <h2 className="history-title">Target Currency Distribution</h2>
              <CurrencyFrequencyChart data={targetCurrencyFrequency} />
            </div>
          )}
          {recentConversions.length > 0 && (
            <div className="history-table-container">
              <h2 className="history-title">Recent Conversions</h2>
          <table className="history-table">
            <thead>
              <tr>
                <th>From</th>
                <th>To</th>
                <th>Amount</th>
                <th>Result</th>
                <th>Rate</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {recentConversions.map((conversion) => (
                <tr key={conversion.id}>
                  <td>{conversion.fromCurrency}</td>
                  <td>{conversion.toCurrency}</td>
                  <td>{conversion.amount.toFixed(2)}</td>
                  <td>{conversion.convertedAmount.toFixed(2)}</td>
                  <td>{conversion.rate.toFixed(4)}</td>
                  <td>{new Date(conversion.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
            </div>
          )}
          {currencyPairStats.length > 0 && (
            <div className="history-table-container">
              <h2 className="history-title">Currency Pair Statistics</h2>
          <table className="history-table">
            <thead>
              <tr>
                <th>From</th>
                <th>To</th>
                <th>Conversions</th>
                <th>Avg Amount</th>
                <th>First Used</th>
                <th>Last Used</th>
              </tr>
            </thead>
            <tbody>
              {currencyPairStats.map((stat, index) => (
                <tr key={`${stat.fromCurrency}-${stat.toCurrency}-${index}`}>
                  <td>{stat.fromCurrency}</td>
                  <td>{stat.toCurrency}</td>
                  <td>{stat.conversion_count}</td>
                  <td>{stat.avg_amount.toFixed(2)}</td>
                  <td>{new Date(stat.first_conversion).toLocaleString()}</td>
                  <td>{new Date(stat.last_conversion).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

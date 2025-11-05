"use client";

import { useState } from "react";

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY"];

export default function Page() {
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");

  const handleFromCurrencyChange = (value: string) => {
    setFromCurrency(value);
    if (value === toCurrency) {
      // If same currency selected, change the other dropdown
      const availableCurrencies = CURRENCIES.filter((c) => c !== value);
      setToCurrency(availableCurrencies[0] || CURRENCIES[0]);
    }
  };

  const handleToCurrencyChange = (value: string) => {
    setToCurrency(value);
    if (value === fromCurrency) {
      // If same currency selected, change the other dropdown
      const availableCurrencies = CURRENCIES.filter((c) => c !== value);
      setFromCurrency(availableCurrencies[0] || CURRENCIES[0]);
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
                onChange={(e) => handleFromCurrencyChange(e.target.value)}
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
                onChange={(e) => handleToCurrencyChange(e.target.value)}
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
      <button className="convert-button" type="button">
        Convert currency
      </button>
      <div className="result-box">
        <div className="result-text-top">
          <div className="result-label">Result</div>
          <div className="result-value">4 942,52 CZK</div>
        </div>
        <div className="result-divider"></div>
        <div className="result-text-bottom">
          <div className="result-label">Number of calculations made</div>
          <div className="result-value">3</div>
        </div>
      </div>
    </div>
  );
}

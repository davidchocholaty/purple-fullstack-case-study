"use client";

import Input from "./ui/Input";
import Select from "./ui/Select";
import Button from "./ui/Button";
import type { AppMode } from "@/types";

interface CurrencyConverterFormProps {
  amount: string;
  fromCurrency: string;
  toCurrency: string;
  currencies: string[];
  mode: AppMode;
  isLoading: boolean;
  onAmountChange: (value: string) => void;
  onFromCurrencyChange: (value: string) => void;
  onToCurrencyChange: (value: string) => void;
  onConvert: () => void;
  onConvertAll?: () => void;
}

export default function CurrencyConverterForm({
  amount,
  fromCurrency,
  toCurrency,
  currencies,
  mode,
  isLoading,
  onAmountChange,
  onFromCurrencyChange,
  onToCurrencyChange,
  onConvert,
  onConvertAll,
}: CurrencyConverterFormProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      onConvert();
    }
  };

  return (
    <>
      <div className="currency-box">
        <div className="currency-box-content">
          <Input
            label="Amount to convert"
            id="amount"
            type="number"
            placeholder="0"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            onKeyDown={handleKeyDown}
            min="0.01"
            step="0.01"
          />
          
          <Select
            label="From"
            id="fromCurrency"
            value={fromCurrency}
            onChange={(e) => onFromCurrencyChange(e.target.value)}
          >
            {currencies.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </Select>

          <Select
            label="To"
            id="toCurrency"
            value={toCurrency}
            onChange={(e) => onToCurrencyChange(e.target.value)}
          >
            {currencies.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="button-group">
        <Button onClick={onConvert} disabled={isLoading}>
          {isLoading ? "Converting..." : "Convert currency"}
        </Button>
        {mode === "budget" && onConvertAll && (
          <Button variant="secondary" onClick={onConvertAll} disabled={isLoading}>
            Convert All {fromCurrency}
          </Button>
        )}
      </div>
    </>
  );
}


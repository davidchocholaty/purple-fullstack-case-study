"use client";

import { useCurrencyConverter } from "@/hooks/useCurrencyConverter";
import Wallet from "@/components/Wallet";
import CurrencyConverterForm from "@/components/CurrencyConverterForm";
import ResultBox from "@/components/ResultBox";
import StatisticsDashboard from "@/components/StatisticsDashboard";

export default function Page() {
  const {
    mode,
    wallet,
    walletLoaded,
    amount,
    fromCurrency,
    toCurrency,
    convertedAmount,
    conversionCount,
    mostUsedCurrency,
    recentConversions,
    currencyPairStats,
    targetCurrencyFrequency,
    isLoading,
    error,
    currencies,
    setMode,
    setAmount,
    handleCurrencyChange,
    handleConvert,
    handleConvertAll,
    handleResetWallet,
  } = useCurrencyConverter();

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
        <Wallet 
          wallet={wallet} 
          currencies={currencies} 
          onReset={handleResetWallet} 
        />
      )}

      <CurrencyConverterForm
        amount={amount}
        fromCurrency={fromCurrency}
        toCurrency={toCurrency}
        currencies={currencies}
        mode={mode}
        isLoading={isLoading}
        onAmountChange={setAmount}
        onFromCurrencyChange={(value) => handleCurrencyChange("from", value)}
        onToCurrencyChange={(value) => handleCurrencyChange("to", value)}
        onConvert={() => handleConvert()}
        onConvertAll={mode === "budget" ? handleConvertAll : undefined}
      />

      {error && <div className="error-message">{error}</div>}

      {convertedAmount !== null && (
        <ResultBox
          convertedAmount={convertedAmount}
          targetCurrency={toCurrency}
          conversionCount={conversionCount}
          mostUsedCurrency={mostUsedCurrency}
        />
      )}

      {conversionCount !== null && conversionCount > 0 && (
        <StatisticsDashboard
          targetCurrencyFrequency={targetCurrencyFrequency}
          recentConversions={recentConversions}
          currencyPairStats={currencyPairStats}
        />
      )}
    </div>
  );
}


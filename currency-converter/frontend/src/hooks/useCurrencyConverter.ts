import { useState, useEffect } from "react";
import { api } from "@/services/api";
import type { AppMode, Wallet, ConversionRecord, CurrencyPairStat, CurrencyFrequency } from "@/types";

export function useCurrencyConverter() {
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [mode, setMode] = useState<AppMode>("basic");
  const [wallet, setWallet] = useState<Wallet>({});
  const [walletLoaded, setWalletLoaded] = useState(false);
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("");
  const [toCurrency, setToCurrency] = useState("");
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [conversionCount, setConversionCount] = useState<number | null>(null);
  const [mostUsedCurrency, setMostUsedCurrency] = useState<string | null>(null);
  const [recentConversions, setRecentConversions] = useState<ConversionRecord[]>([]);
  const [currencyPairStats, setCurrencyPairStats] = useState<CurrencyPairStat[]>([]);
  const [targetCurrencyFrequency, setTargetCurrencyFrequency] = useState<CurrencyFrequency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load currencies, wallet and stats on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load currencies from backend
        const currenciesData = await api.getCurrencies();
        const currenciesList = currenciesData.currencies;
        setCurrencies(currenciesList);
        
        // Set default currencies once loaded
        if (currenciesList.length > 0) {
          setFromCurrency(currenciesList[0]);
          setToCurrency(currenciesList.length > 1 ? currenciesList[1] : currenciesList[0]);
        }

        // Load wallet
        const walletData = await api.getWallet();
        if (walletData.initialized) {
          setWallet(walletData.wallet);
        } else {
          const initData = await api.initializeWallet(currenciesList);
          setWallet(initData.wallet);
        }
        setWalletLoaded(true);

        // Load stats
        const statsData = await api.getStatistics();
        if (statsData.totalConversions > 0) {
          setConversionCount(statsData.totalConversions);
          setMostUsedCurrency(statsData.mostUsedCurrency?.currency || null);
          setRecentConversions(statsData.recentConversions || []);
          setCurrencyPairStats(statsData.currencyPairStats || []);
          setTargetCurrencyFrequency(statsData.targetCurrencyFrequency || []);
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
      const availableCurrencies = currencies.filter((c) => c !== value);
      setOtherCurrency(availableCurrencies[0] || currencies[0]);
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
      const data = await api.convertCurrency(fromCurrency, toCurrency, amountNum);
      setConvertedAmount(data.convertedAmount);

      // Update wallet in budget mode
      if (mode === "budget") {
        const oldWallet = { ...wallet };
        const newWallet = {
          ...wallet,
          [fromCurrency]: (wallet[fromCurrency] || 0) - amountNum,
          [toCurrency]: (wallet[toCurrency] || 0) + data.convertedAmount,
        };
        setWallet(newWallet);
        
        // Save wallet to database
        try {
          await api.updateWallet(newWallet);
        } catch {
          // Revert wallet on error
          setWallet(oldWallet);
          setError("Conversion succeeded but failed to save wallet. Balances reverted.");
        }
      }
      
      // Fetch updated statistics
      const statsData = await api.getStatistics();
      setConversionCount(statsData.totalConversions);
      setMostUsedCurrency(statsData.mostUsedCurrency?.currency || null);
      setRecentConversions(statsData.recentConversions || []);
      setCurrencyPairStats(statsData.currencyPairStats || []);
      setTargetCurrencyFrequency(statsData.targetCurrencyFrequency || []);
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

    await handleConvert(amountToConvert);
  };

  const handleResetWallet = async () => {
    try {
      const data = await api.resetWallet(currencies);
      setWallet(data.wallet);
      setError(null);
    } catch {
      setError("Failed to reset wallet");
    }
  };

  return {
    // State
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
    
    // Actions
    setMode,
    setAmount,
    handleCurrencyChange,
    handleConvert,
    handleConvertAll,
    handleResetWallet,
  };
}


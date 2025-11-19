import { useState, useEffect } from "react";
import { trpc } from "@/utils/trpc";
import type { AppMode, Wallet, ConversionRecord, CurrencyPairStat, CurrencyFrequency } from "@/types";
import { conversionFormSchema } from "@/validation/schemas";

export function useCurrencyConverter() {
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [mode, setMode] = useState<AppMode>("basic");
  const [wallet, setWallet] = useState<Wallet>({});
  const [walletLoaded, setWalletLoaded] = useState(false);
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("");
  const [toCurrency, setToCurrency] = useState("");
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [rateUpdatedAt, setRateUpdatedAt] = useState<Date | null>(null);
  const [conversionCount, setConversionCount] = useState<number | null>(null);
  const [mostUsedCurrency, setMostUsedCurrency] = useState<string | null>(null);
  const [recentConversions, setRecentConversions] = useState<ConversionRecord[]>([]);
  const [currencyPairStats, setCurrencyPairStats] = useState<CurrencyPairStat[]>([]);
  const [targetCurrencyFrequency, setTargetCurrencyFrequency] = useState<CurrencyFrequency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // tRPC queries and mutations
  const currenciesQuery = trpc.conversion.getCurrencies.useQuery();
  const walletQuery = trpc.wallet.getWallet.useQuery(undefined, {
    enabled: currenciesQuery.isSuccess,
  });
  const statsQuery = trpc.stats.getStats.useQuery();
  const initializeWalletMutation = trpc.wallet.initialize.useMutation();
  const resetWalletMutation = trpc.wallet.reset.useMutation();
  const updateWalletMutation = trpc.wallet.update.useMutation();
  const convertMutation = trpc.conversion.convert.useMutation();

  // Load currencies, wallet and stats on mount
  useEffect(() => {
    if (currenciesQuery.data) {
      const currenciesList = [...currenciesQuery.data.currencies]; // Convert to mutable array
      setCurrencies(currenciesList);
      
      // Set default currencies once loaded
      if (currenciesList.length > 0) {
        setFromCurrency(currenciesList[0]);
        setToCurrency(currenciesList.length > 1 ? currenciesList[1] : currenciesList[0]);
      }
    }

    if (currenciesQuery.error) {
      setError("Failed to load currencies. Please try again later.");
    }
  }, [currenciesQuery.data, currenciesQuery.error]);

  useEffect(() => {
    if (walletQuery.data) {
      if (walletQuery.data.initialized) {
        setWallet(walletQuery.data.wallet);
        setWalletLoaded(true);
      } else if (currenciesQuery.data && !initializeWalletMutation.isPending && !walletQuery.isLoading) {
        // Initialize wallet if not initialized
        initializeWalletMutation.mutate(undefined, {
          onSuccess: (data) => {
            setWallet(data.wallet);
            setWalletLoaded(true);
            walletQuery.refetch();
          },
          onError: (err) => {
            console.error("Failed to initialize wallet:", err);
            setError("Failed to initialize wallet. Please try again later.");
          },
        });
      }
    }

    if (walletQuery.error) {
      console.error("Wallet query error:", walletQuery.error);
      setError("Failed to load wallet. Please try again later.");
    }
  }, [walletQuery.data, walletQuery.error, walletQuery.isLoading, currenciesQuery.data, initializeWalletMutation.isPending]);

  useEffect(() => {
    if (statsQuery.data) {
      if (statsQuery.data.totalConversions > 0) {
        setConversionCount(statsQuery.data.totalConversions);
        setMostUsedCurrency(statsQuery.data.mostUsedCurrency?.currency || null);
        setRecentConversions(statsQuery.data.recentConversions || []);
        setCurrencyPairStats(statsQuery.data.currencyPairStats || []);
        setTargetCurrencyFrequency(statsQuery.data.targetCurrencyFrequency || []);
      }
    }

    if (statsQuery.error) {
      console.error("Failed to load statistics:", statsQuery.error);
    }
  }, [statsQuery.data, statsQuery.error]);

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
    // Validate form inputs using Zod
    const validationResult = conversionFormSchema.safeParse({
      amount: amountOverride?.toString() ?? amount,
      fromCurrency,
      toCurrency,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      setError(firstError.message);
      return;
    }

    const amountNum = amountOverride ?? parseFloat(amount);

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

    convertMutation.mutate(
      { from: fromCurrency, to: toCurrency, amount: amountNum },
      {
        onSuccess: (data) => {
          setConvertedAmount(data.convertedAmount);
          setRateUpdatedAt(new Date(data.updatedAt));

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
            updateWalletMutation.mutate(
              { wallet: newWallet },
              {
                onError: () => {
                  // Revert wallet on error
                  setWallet(oldWallet);
                  setError("Conversion succeeded but failed to save wallet. Balances reverted.");
                },
              }
            );
          }
          
          // Fetch updated statistics
          statsQuery.refetch().then((result) => {
            if (result.data) {
              setConversionCount(result.data.totalConversions);
              setMostUsedCurrency(result.data.mostUsedCurrency?.currency || null);
              setRecentConversions(result.data.recentConversions || []);
              setCurrencyPairStats(result.data.currencyPairStats || []);
              setTargetCurrencyFrequency(result.data.targetCurrencyFrequency || []);
            }
          });
        },
        onError: (err) => {
          setError(err.message || "An error occurred");
        },
        onSettled: () => {
          setIsLoading(false);
        },
      }
    );
  };

  const handleConvertAll = async () => {
    const amountToConvert = wallet[fromCurrency];
    
    if (amountToConvert === undefined || amountToConvert <= 0) {
      setError(`No ${fromCurrency} balance to convert`);
      return;
    }

    await handleConvert(amountToConvert);
  };

  const handleResetWallet = async () => {
    resetWalletMutation.mutate(undefined, {
      onSuccess: (data) => {
        setWallet(data.wallet);
        setError(null);
      },
      onError: () => {
        setError("Failed to reset wallet");
      },
    });
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
    rateUpdatedAt,
    
    // Actions
    setMode,
    setAmount,
    handleCurrencyChange,
    handleConvert,
    handleConvertAll,
    handleResetWallet,
  };
}


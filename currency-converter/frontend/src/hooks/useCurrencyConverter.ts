import { useState, useEffect, useMemo, useRef, startTransition } from "react";
import { trpc } from "@/utils/trpc";
import type { AppMode } from "@/types";
import { conversionFormSchema } from "@/validation/schemas";

export function useCurrencyConverter() {
  const [mode, setMode] = useState<AppMode>("basic");
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("");
  const [toCurrency, setToCurrency] = useState("");
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [rateUpdatedAt, setRateUpdatedAt] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasInitializedDefaults = useRef(false);

  const utils = trpc.useUtils();

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

  const currencies = useMemo(() => [...(currenciesQuery.data?.currencies ?? [])], [currenciesQuery.data]);
  const wallet = walletQuery.data?.wallet ?? {};
  const walletLoaded = walletQuery.data?.initialized ?? false;
  const conversionCount = statsQuery.data?.totalConversions ?? null;
  const mostUsedCurrency = statsQuery.data?.mostUsedCurrency?.currency ?? null;
  const recentConversions = statsQuery.data?.recentConversions ?? [];
  const currencyPairStats = statsQuery.data?.currencyPairStats ?? [];
  const targetCurrencyFrequency = statsQuery.data?.targetCurrencyFrequency ?? [];

  const effectiveFromCurrency = useMemo(() => {
    if (fromCurrency && currencies.includes(fromCurrency as (typeof currencies)[number])) {
      return fromCurrency;
    }
    return currencies[0] || "";
  }, [currencies, fromCurrency]);

  const effectiveToCurrency = useMemo(() => {
    if (toCurrency && currencies.includes(toCurrency as (typeof currencies)[number]) && toCurrency !== effectiveFromCurrency) {
      return toCurrency;
    }
    if (currencies.length > 0) {
      const alternative = currencies.find((c) => c !== effectiveFromCurrency);
      return alternative || effectiveFromCurrency;
    }
    return "";
  }, [currencies, toCurrency, effectiveFromCurrency]);

  // Set default currencies once when they're first loaded
  useEffect(() => {
    if (currencies.length > 0 && !fromCurrency && !toCurrency && !hasInitializedDefaults.current) {
      hasInitializedDefaults.current = true;
      // Use startTransition to defer state updates and avoid cascading renders
      startTransition(() => {
        setFromCurrency(currencies[0]);
        setToCurrency(currencies.length > 1 ? currencies[1] : currencies[0]);
      });
    }
  }, [currencies, fromCurrency, toCurrency]);

  // Initialize wallet if not initialized
  useEffect(() => {
    if (
      walletQuery.data &&
      !walletQuery.data.initialized &&
      currenciesQuery.data &&
      !initializeWalletMutation.isPending &&
      !walletQuery.isLoading
    ) {
      initializeWalletMutation.mutate(undefined, {
        onSuccess: (data) => {
          utils.wallet.getWallet.setData(undefined, { wallet: data.wallet, initialized: true });
        },
        onError: (err) => {
          console.error("Failed to initialize wallet:", err);
          setError("Failed to initialize wallet. Please try again later.");
        },
      });
    }
  }, [
    walletQuery.data,
    currenciesQuery.data,
    initializeWalletMutation.isPending,
    walletQuery.isLoading,
    initializeWalletMutation,
    utils,
  ]);

  // Combine errors from queries
  const combinedError = useMemo(() => {
    if (error) return error;
    if (currenciesQuery.error) return "Failed to load currencies. Please try again later.";
    if (walletQuery.error) return "Failed to load wallet. Please try again later.";
    if (statsQuery.error) return "Failed to load statistics. Please try again later.";
    return null;
  }, [error, currenciesQuery.error, walletQuery.error, statsQuery.error]);

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
      fromCurrency: effectiveFromCurrency,
      toCurrency: effectiveToCurrency,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      setError(firstError.message);
      return;
    }

    const amountNum = amountOverride ?? parseFloat(amount);

    // Budget mode validation
    if (mode === "budget") {
      if (!wallet[effectiveFromCurrency] || wallet[effectiveFromCurrency] < amountNum) {
        const available = wallet[effectiveFromCurrency] !== undefined ? wallet[effectiveFromCurrency].toFixed(2) : "0.00";
        setError(`Insufficient ${effectiveFromCurrency} balance. Available: ${available}`);
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    convertMutation.mutate(
      { from: effectiveFromCurrency, to: effectiveToCurrency, amount: amountNum },
      {
        onSuccess: (data) => {
          setConvertedAmount(data.convertedAmount);
          setRateUpdatedAt(new Date(data.updatedAt));

            // Update wallet in budget mode
            if (mode === "budget") {
              const oldWallet = { ...wallet };
              const newWallet = {
                ...wallet,
                [effectiveFromCurrency]: (wallet[effectiveFromCurrency] || 0) - amountNum,
                [effectiveToCurrency]: (wallet[effectiveToCurrency] || 0) + data.convertedAmount,
              };
              
              // Optimistically update cache
              utils.wallet.getWallet.setData(undefined, (prev) => ({
                ...(prev ?? { initialized: true, wallet: {} }),
                wallet: newWallet,
              }));
              
              // Save wallet to database
              updateWalletMutation.mutate(
                { wallet: newWallet },
                {
                  onError: () => {
                    // Revert wallet on error
                    utils.wallet.getWallet.setData(undefined, (prev) => ({
                      ...(prev ?? { initialized: true, wallet: {} }),
                      wallet: oldWallet,
                    }));
                    setError("Conversion succeeded but failed to save wallet. Balances reverted.");
                  },
                }
              );
            }
          
          // Fetch updated statistics
          statsQuery.refetch();
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
    const amountToConvert = wallet[effectiveFromCurrency];
    
    if (amountToConvert === undefined || amountToConvert <= 0) {
      setError(`No ${effectiveFromCurrency} balance to convert`);
      return;
    }

    await handleConvert(amountToConvert);
  };

  const handleResetWallet = async () => {
    resetWalletMutation.mutate(undefined, {
      onSuccess: (data) => {
        utils.wallet.getWallet.setData(undefined, { wallet: data.wallet, initialized: true });
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
    fromCurrency: effectiveFromCurrency,
    toCurrency: effectiveToCurrency,
    convertedAmount,
    conversionCount,
    mostUsedCurrency,
    recentConversions,
    currencyPairStats,
    targetCurrencyFrequency,
    isLoading,
    error: combinedError,
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


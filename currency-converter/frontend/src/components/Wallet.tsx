"use client";

import type { Wallet as WalletType } from "@/types";

interface WalletProps {
  wallet: WalletType;
  currencies: string[];
  onReset: () => void;
}

export default function Wallet({ wallet, currencies, onReset }: WalletProps) {
  return (
    <div className="wallet-display">
      <div className="wallet-header">
        <h3 className="wallet-title">Your Wallet</h3>
        <button 
          className="reset-wallet-button"
          onClick={onReset}
          type="button"
        >
          Reset Wallet
        </button>
      </div>
      <div className="wallet-balances">
        {currencies.map((currency) => (
          <div key={currency} className="wallet-item">
            <span className="wallet-currency">{currency}</span>
            <span className="wallet-balance">
              {wallet[currency]?.toFixed(2) || "0.00"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}


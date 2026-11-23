import React from "react";
import { getFundingCapacityStatus, type PoolLiquidityStats } from "@/lib/format";

interface MarketplaceCardProps {
  id: string;
  faceValue: bigint;
  fundedAmount: bigint;
  poolStats?: PoolLiquidityStats | null;
  onFund?: (id: string) => Promise<void> | void;
  onFunded?: () => void;
}

/**
 * MarketplaceCard displays invoice values along with its funding capacity status based on pool liquidity.
 * Users can fund invoices if the pool capacity permits, and the component triggers a refresh of the indication after funding completes.
 */
export function MarketplaceCard({
  id,
  faceValue,
  fundedAmount,
  poolStats,
  onFund,
  onFunded,
}: MarketplaceCardProps) {
  const [isFunding, setIsFunding] = React.useState(false);
  const requiredAmount = faceValue - fundedAmount;
  const status = getFundingCapacityStatus(requiredAmount, poolStats);

  const statusStyles = {
    fundable: "bg-green-100 text-green-800",
    "capacity-limited": "bg-amber-100 text-amber-800",
    unavailable: "bg-red-100 text-red-800",
  };

  const handleFund = async () => {
    if (!onFund) return;
    try {
      setIsFunding(true);
      await onFund(id);
      if (onFunded) {
        onFunded();
      }
    } finally {
      setIsFunding(false);
    }
  };

  return (
    <div className="border border-slate-700 bg-card rounded-xl p-4 shadow-sm flex flex-col justify-between gap-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-slate-400">Invoice #{id.slice(0, 8)}</span>
        <span
          data-testid="capacity-status"
          className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase ${statusStyles[status]}`}
        >
          {status}
        </span>
      </div>
      <div className="space-y-1">
        <p className="text-sm text-slate-300">Face Value: <strong className="text-slate-100 font-mono">{faceValue.toString()}</strong></p>
        <p className="text-xs text-slate-400">Required: <strong className="text-slate-200 font-mono">{requiredAmount.toString()}</strong></p>
      </div>
      {onFund && (
        <button
          onClick={handleFund}
          disabled={isFunding || status === "unavailable"}
          className="w-full py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isFunding ? "Funding..." : "Fund Invoice"}
        </button>
      )}
    </div>
  );
}

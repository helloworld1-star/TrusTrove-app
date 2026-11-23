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
    fundable: "bg-green-500/20 text-green-400 border-green-500/30",
    "capacity-limited": "bg-amber-500/20 text-amber-400 border-amber-500/30",
    unavailable: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  const statusLabels = {
    fundable: "Fundable",
    "capacity-limited": "Capacity Limited",
    unavailable: "Unavailable",
  };

  const handleFundClick = async () => {
    if (!onFund || status === "unavailable") return;
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
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm" data-testid={`marketplace-card-${id}`}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-muted-foreground">#{id.slice(0, 8)}</span>
          <span
            className={`px-2 py-0.5 text-[10px] font-mono rounded-full border ${statusStyles[status]}`}
            data-testid="funding-capacity-badge"
          >
            {statusLabels[status]}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground font-bold uppercase block">Required Funding</span>
          <span className="text-base font-bold font-mono text-foreground">
            {Number(requiredAmount) / 1_000_000} USDC
          </span>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-border/40">
        <button
          type="button"
          disabled={status === "unavailable" || isFunding}
          onClick={handleFundClick}
          className="w-full py-2 bg-primary text-primary-foreground text-xs font-mono rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isFunding ? "Funding..." : status === "unavailable" ? "Cannot Fund" : "Fund Invoice"}
        </button>
      </div>
    </div>
  );
}

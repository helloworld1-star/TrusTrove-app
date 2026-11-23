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

  const statusLabels = {
    fundable: "Fundable",
    "capacity-limited": "Capacity Limited",
    unavailable: "Unavailable",
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
    <div className="border rounded-lg p-4 shadow-sm flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="font-semibold">Invoice #{id}</span>
        <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusStyles[status]}`}>
          {statusLabels[status]}
        </span>
      </div>
      <div className="text-sm text-gray-600">
        <div>Face Value: {faceValue.toString()}</div>
        <div>Required: {requiredAmount.toString()}</div>
      </div>
      {onFund && (
        <button
          onClick={handleFund}
          disabled={status === "unavailable" || isFunding}
          className="mt-2 bg-blue-600 text-white py-1.5 px-3 rounded text-sm disabled:opacity-50"
        >
          {isFunding ? "Funding..." : "Fund Invoice"}
        </button>
      )}
    </div>
  );
}

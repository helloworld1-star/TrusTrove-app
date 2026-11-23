import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MarketplaceCard } from "./MarketplaceCard";
import { getFundingCapacityStatus } from "../lib/format";

describe("getFundingCapacityStatus", () => {
  it("returns fundable when available liquidity meets required amount", () => {
    expect(getFundingCapacityStatus(100n, { availableLiquidity: 150n, maxCapacity: 200n })).toBe("fundable");
  });

  it("returns capacity-limited when available liquidity is positive but less than required", () => {
    expect(getFundingCapacityStatus(100n, { availableLiquidity: 50n, maxCapacity: 200n })).toBe("capacity-limited");
  });

  it("returns unavailable when pool stats are missing (empty boundary)", () => {
    expect(getFundingCapacityStatus(100n, null)).toBe("unavailable");
  });

  it("returns unavailable on invalid negative boundary values", () => {
    expect(getFundingCapacityStatus(-10n, { availableLiquidity: 100n, maxCapacity: 200n })).toBe("unavailable");
    expect(getFundingCapacityStatus(100n, { availableLiquidity: -5n, maxCapacity: 200n })).toBe("unavailable");
  });
});

describe("MarketplaceCard", () => {
  it("renders expected fundable status and refreshes indication after funding", async () => {
    const onFund = jest.fn().mockResolvedValue(undefined);
    const onFunded = jest.fn();

    const { rerender } = render(
      <MarketplaceCard
        id="1"
        faceValue={100n}
        fundedAmount={0n}
        poolStats={{ availableLiquidity: 100n, maxCapacity: 100n }}
        onFund={onFund}
        onFunded={onFunded}
      />
    );

    expect(screen.getByText("Fundable")).toBeInTheDocument();

    const button = screen.getByRole("button", { name: /fund invoice/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(onFund).toHaveBeenCalledWith("1");
      expect(onFunded).toHaveBeenCalled();
    });

    rerender(
      <MarketplaceCard
        id="1"
        faceValue={100n}
        fundedAmount={100n}
        poolStats={{ availableLiquidity: 0n, maxCapacity: 100n }}
        onFund={onFund}
        onFunded={onFunded}
      />
    );

    expect(screen.getByText("Unavailable")).toBeInTheDocument();
  });

  it("disables funding when status is unavailable (permission boundary)", () => {
    const onFund = jest.fn();
    render(
      <MarketplaceCard
        id="2"
        faceValue={100n}
        fundedAmount={0n}
        poolStats={null}
        onFund={onFund}
      />
    );

    expect(screen.getByText("Unavailable")).toBeInTheDocument();
    const button = screen.getByRole("button", { name: /fund invoice/i });
    expect(button).toBeDisabled();
  });
});

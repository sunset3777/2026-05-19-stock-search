"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchStockList } from "@/features/stocks/api/client";
import type { StockListResult, StockSummary } from "@/features/stocks/types/stocks.types";
import { HeroSection } from "./HeroSection";
import { NewsSection } from "./NewsSection";
import { WatchlistSection } from "./WatchlistSection";

export function LandingPage() {
  const [query, setQuery] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [stockResult, setStockResult] = useState<StockListResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setIsLoading(true);
      setError("");

      fetchStockList(query, 5)
        .then((result) => {
          if (controller.signal.aborted) {
            return;
          }

          setStockResult(result);
          setSelectedSymbol((current) => current ?? result.stocks[0]?.symbol ?? null);
        })
        .catch((fetchError: Error) => {
          if (controller.signal.aborted) {
            return;
          }

          setError(fetchError.message);
          setStockResult(null);
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setIsLoading(false);
          }
        });
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [query]);

  const stocks = useMemo(() => stockResult?.stocks ?? [], [stockResult]);
  const selectedStock = useMemo(
    () => stocks.find((stock) => stock.symbol === selectedSymbol) ?? stocks[0] ?? null,
    [selectedSymbol, stocks],
  );

  function handleSelectStock(stock: StockSummary) {
    setSelectedSymbol(stock.symbol);
  }

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-slate-950">
      <HeroSection
        filteredStocks={stocks}
        isLoading={isLoading}
        onQueryChange={setQuery}
        onSelectStock={handleSelectStock}
        query={query}
        selectedStock={selectedStock}
        sourceDate={stockResult?.source.updatedDate ?? null}
      />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-10 sm:px-8 lg:px-10">
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-700">
            {error}
          </div>
        )}
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <WatchlistSection
            onSelectStock={handleSelectStock}
            selectedStock={selectedStock}
            selectedSymbol={selectedStock?.symbol ?? null}
            stocks={stocks}
          />
          <NewsSection
            dataSources={stockResult?.dataSources ?? []}
            sourceDate={stockResult?.source.updatedDate ?? null}
          />
        </div>
      </div>
    </main>
  );
}

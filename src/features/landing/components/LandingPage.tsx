"use client";

import { useMemo, useState } from "react";
import { agentInsights, marketNews, stockProfiles } from "../constants/landingData";
import type { StockProfile } from "../types/landing.types";
import { AgentSummary } from "./AgentSummary";
import { CompanyFocus } from "./CompanyFocus";
import { HeroSection } from "./HeroSection";
import { NewsSection } from "./NewsSection";
import { WatchlistSection } from "./WatchlistSection";

export function LandingPage() {
  const [query, setQuery] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState(stockProfiles[0].symbol);

  const filteredStocks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return stockProfiles;
    }

    return stockProfiles.filter(
      (stock) =>
        stock.symbol.includes(normalizedQuery) ||
        stock.name.toLowerCase().includes(normalizedQuery) ||
        stock.industry.toLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  const selectedStock =
    stockProfiles.find((stock) => stock.symbol === selectedSymbol) ?? stockProfiles[0];

  function handleSelectStock(stock: StockProfile) {
    setSelectedSymbol(stock.symbol);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <HeroSection
        filteredStocks={filteredStocks}
        onQueryChange={setQuery}
        onSelectStock={handleSelectStock}
        query={query}
        selectedStock={selectedStock}
      />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 pb-16 sm:px-8 lg:px-10">
        <CompanyFocus selectedStock={selectedStock} stocks={stockProfiles} />
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <WatchlistSection
            onSelectStock={handleSelectStock}
            selectedSymbol={selectedStock.symbol}
            stocks={filteredStocks}
          />
          <NewsSection news={marketNews} selectedCompany={selectedStock.name} />
        </div>
        <AgentSummary insights={agentInsights} />
      </div>
    </main>
  );
}

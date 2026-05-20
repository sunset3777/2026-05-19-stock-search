import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import type { StockProfile } from "../types/landing.types";
import { MiniSparkline } from "./MiniSparkline";

type HeroSectionProps = {
  filteredStocks: StockProfile[];
  onQueryChange: (query: string) => void;
  onSelectStock: (stock: StockProfile) => void;
  query: string;
  selectedStock: StockProfile;
};

export function HeroSection({
  filteredStocks,
  onQueryChange,
  onSelectStock,
  query,
  selectedStock,
}: HeroSectionProps) {
  const router = useRouter();
  const [searchError, setSearchError] = useState("");

  function findExactStock() {
    const normalizedQuery = query.trim().toLowerCase();

    return filteredStocks.find(
      (stock) =>
        stock.symbol.toLowerCase() === normalizedQuery ||
        stock.name.toLowerCase() === normalizedQuery,
    );
  }

  function handleSearchSubmit() {
    const exactStock = findExactStock();

    if (exactStock) {
      void router.push(`/stocks/${exactStock.symbol}`);
      return;
    }

    setSearchError("找不到完全符合的股票，請輸入可用代號或點選下方建議。");
  }

  function handleQueryChange(value: string) {
    setSearchError("");
    onQueryChange(value);
  }

  function handleSuggestionClick(stock: StockProfile) {
    onSelectStock(stock);
    void router.push(`/stocks/${stock.symbol}`);
  }

  return (
    <section className="border-b border-white/10 bg-slate-950">
      <div className="mx-auto grid min-h-[680px] w-full max-w-7xl gap-10 px-5 py-8 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-10 lg:py-10">
        <div className="flex flex-col justify-between gap-12">
          <header className="flex items-center justify-between gap-4">
            <Link className="text-lg font-semibold tracking-tight text-white" href="/">
              Stock Search
            </Link>
            <nav aria-label="主選單" className="hidden items-center gap-6 text-sm text-slate-300 sm:flex">
              <a className="transition hover:text-white" href="#companies">
                企業焦點
              </a>
              <a className="transition hover:text-white" href="#watchlist">
                觀察清單
              </a>
              <a className="transition hover:text-white" href="#news">
                最新新聞
              </a>
            </nav>
          </header>

          <div className="max-w-2xl">
            <p className="text-sm font-medium text-blue-300">AI Stock Research Platform</p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-normal text-white sm:text-5xl lg:text-6xl">
              用企業脈絡閱讀股票，而不是只看價格跳動。
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
              整合公司基本面、觀察清單、近期新聞與 Agent 分析摘要，為進階投資者建立更清楚的研究入口。
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                className="inline-flex h-12 items-center justify-center rounded-md bg-blue-500 px-5 text-sm font-semibold text-white transition hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
                href="#watchlist"
              >
                查看觀察清單
              </a>
              <a
                className="inline-flex h-12 items-center justify-center rounded-md border border-white/15 px-5 text-sm font-semibold text-slate-100 transition hover:border-white/30 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
                href="#companies"
              >
                了解企業焦點
              </a>
            </div>

            <div className="mt-8 max-w-xl rounded-lg border border-white/10 bg-white/[0.03] p-3">
              <label className="text-sm font-medium text-slate-300" htmlFor="stock-search">
                搜尋股票、公司或產業
              </label>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <input
                  className="h-12 min-w-0 flex-1 rounded-md border border-white/10 bg-slate-900 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                  id="stock-search"
                  onChange={(event) => handleQueryChange(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleSearchSubmit();
                    }
                  }}
                  placeholder="輸入 2330、台積電、半導體..."
                  value={query}
                />
                <button
                  className="inline-flex h-12 items-center justify-center rounded-md bg-blue-500 px-4 text-sm font-semibold text-white transition hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
                  onClick={handleSearchSubmit}
                  type="button"
                >
                  搜尋
                </button>
              </div>
              <div className="mt-3 flex flex-col gap-1 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                <span>{filteredStocks.length} 筆結果</span>
                <span>可用代號：2330、2454、2308、2317</span>
              </div>
              {(searchError || (query.trim() && filteredStocks.length === 0)) && (
                <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-sm leading-6 text-amber-100">
                  {searchError || "找不到符合條件的股票，請改用可用代號搜尋。"}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                {filteredStocks.slice(0, 4).map((stock) => (
                  <button
                    className="rounded-md border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:border-blue-300 hover:text-blue-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
                    key={stock.symbol}
                    onClick={() => handleSuggestionClick(stock)}
                    type="button"
                  >
                    {stock.symbol} {stock.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <dl className="grid grid-cols-3 gap-3 border-t border-white/10 pt-6">
            <HeroMetric label="追蹤股票" value="4" />
            <HeroMetric label="新聞摘要" value="3" />
            <HeroMetric label="分析模組" value="4" />
          </dl>
        </div>

        <div className="flex items-center">
          <div className="w-full rounded-lg border border-white/10 bg-slate-900 p-4 shadow-2xl shadow-black/30">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-sm text-slate-400">焦點企業</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">
                  {selectedStock.name} {selectedStock.symbol}
                </h2>
              </div>
              <span className="rounded-md bg-blue-500/10 px-3 py-2 text-sm font-medium text-blue-200 ring-1 ring-blue-400/20">
                {selectedStock.agentStatus}
              </span>
            </div>

            <div className="grid gap-4 py-5 sm:grid-cols-3">
              <DashboardMetric label="現價" value={`${selectedStock.price}`} />
              <DashboardMetric
                label="漲跌"
                value={`${selectedStock.changePercent > 0 ? "+" : ""}${selectedStock.changePercent}%`}
              />
              <DashboardMetric label="市值" value={selectedStock.marketCap} />
            </div>

            <div className="rounded-lg border border-white/10 bg-slate-950 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">價格趨勢</p>
                  <p className="mt-1 text-sm text-slate-200">{selectedStock.thesis}</p>
                </div>
                <span className="shrink-0 rounded-md bg-slate-800 px-3 py-2 text-sm text-slate-300">
                  {selectedStock.industry}
                </span>
              </div>
              <div className="mt-5 h-28">
                <MiniSparkline values={selectedStock.sparkline} variant="large" />
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {selectedStock.highlights.map((highlight) => (
                <div
                  className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-300"
                  key={highlight}
                >
                  {highlight}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold text-white">{value}</dd>
    </div>
  );
}

function DashboardMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

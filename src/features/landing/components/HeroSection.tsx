import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import type { StockSummary } from "@/features/stocks/types/stocks.types";
import { MiniSparkline } from "./MiniSparkline";

type HeroSectionProps = {
  filteredStocks: StockSummary[];
  isLoading: boolean;
  onQueryChange: (query: string) => void;
  onSelectStock: (stock: StockSummary) => void;
  query: string;
  selectedStock: StockSummary | null;
  sourceDate: string | null;
};

export function HeroSection({
  filteredStocks,
  isLoading,
  onQueryChange,
  onSelectStock,
  query,
  selectedStock,
  sourceDate,
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

    setSearchError("找不到完全符合的股票，請輸入上市股票代號或公司簡稱。");
  }

  function handleQueryChange(value: string) {
    setSearchError("");
    onQueryChange(value);
  }

  function handleSuggestionClick(stock: StockSummary) {
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
            <nav aria-label="主要導覽" className="hidden items-center gap-6 text-sm text-slate-300 sm:flex">
              <a className="transition hover:text-white" href="#companies">
                焦點公司
              </a>
              <a className="transition hover:text-white" href="#watchlist">
                股票清單
              </a>
              <a className="transition hover:text-white" href="#news">
                資料來源
              </a>
            </nav>
          </header>

          <div className="max-w-2xl">
            <p className="text-sm font-medium text-blue-300">TWSE OpenAPI</p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-normal text-white sm:text-5xl lg:text-6xl">
              查詢台股上市公司行情與基本資料
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
              串接臺灣證券交易所公開資料，提供上市股票收盤價、漲跌、成交量、本益比與公司基本資訊。
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                className="inline-flex h-12 items-center justify-center rounded-md bg-blue-500 px-5 text-sm font-semibold text-white transition hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
                href="#watchlist"
              >
                瀏覽股票清單
              </a>
              <a
                className="inline-flex h-12 items-center justify-center rounded-md border border-white/15 px-5 text-sm font-semibold text-slate-100 transition hover:border-white/30 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
                href="#companies"
              >
                查看焦點公司
              </a>
            </div>

            <div className="mt-8 max-w-xl rounded-lg border border-white/10 bg-white/[0.03] p-3">
              <label className="text-sm font-medium text-slate-300" htmlFor="stock-search">
                搜尋上市股票
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
                  placeholder="輸入 2330、台積電、產業代號..."
                  value={query}
                />
                <button
                  className="inline-flex h-12 items-center justify-center rounded-md bg-blue-500 px-4 text-sm font-semibold text-white transition hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                  disabled={isLoading}
                  onClick={handleSearchSubmit}
                  type="button"
                >
                  搜尋
                </button>
              </div>
              <div className="mt-3 flex flex-col gap-1 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                <span>{isLoading ? "資料載入中" : `${filteredStocks.length} 筆結果`}</span>
                <span>{sourceDate ? `資料日期 ${sourceDate}` : "資料來源 TWSE"}</span>
              </div>
              {(searchError || (query.trim() && filteredStocks.length === 0 && !isLoading)) && (
                <p className="mt-3 rounded-md border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-sm leading-6 text-amber-100">
                  {searchError || "沒有符合條件的上市股票，請改用股票代號或公司簡稱搜尋。"}
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
            <HeroMetric label="資料來源" value="TWSE" />
            <HeroMetric label="市場" value="上市" />
            <HeroMetric label="更新頻率" value="日資料" />
          </dl>
        </div>

        <div className="flex items-center">
          <div className="w-full rounded-lg border border-white/10 bg-slate-900 p-4 shadow-2xl shadow-black/30">
            {selectedStock ? (
              <>
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-sm text-slate-400">目前選取</p>
                    <h2 className="mt-1 text-2xl font-semibold text-white">
                      {selectedStock.name} {selectedStock.symbol}
                    </h2>
                  </div>
                  <span className="rounded-md bg-blue-500/10 px-3 py-2 text-sm font-medium text-blue-200 ring-1 ring-blue-400/20">
                    上市
                  </span>
                </div>

                <div className="grid gap-4 py-5 sm:grid-cols-3">
                  <DashboardMetric label="收盤價" value={formatNumber(selectedStock.closePrice)} />
                  <DashboardMetric
                    label="漲跌幅"
                    tone={selectedStock.changePercent && selectedStock.changePercent < 0 ? "negative" : "positive"}
                    value={formatPercent(selectedStock.changePercent)}
                  />
                  <DashboardMetric label="成交量" value={formatCompact(selectedStock.tradeVolume)} />
                </div>

                <div className="rounded-lg border border-white/10 bg-slate-950 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-400">今日行情摘要</p>
                      <p className="mt-1 text-sm text-slate-200">
                        成交值 {formatCompact(selectedStock.tradeValue)}，成交筆數{" "}
                        {formatCompact(selectedStock.transactionCount)}。
                      </p>
                    </div>
                    <span className="shrink-0 rounded-md bg-slate-800 px-3 py-2 text-sm text-slate-300">
                      {selectedStock.industry ?? "產業未提供"}
                    </span>
                  </div>
                  <div className="mt-5 h-28">
                    <MiniSparkline values={selectedStock.sparkline} variant="large" />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex min-h-96 items-center justify-center rounded-lg border border-dashed border-white/10 bg-slate-950 p-6 text-center text-sm text-slate-400">
                {isLoading ? "正在讀取 TWSE 公開資料..." : "目前沒有可顯示的股票資料。"}
              </div>
            )}
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

function DashboardMetric({
  label,
  tone,
  value,
}: {
  label: string;
  tone?: "positive" | "negative";
  value: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`mt-2 text-xl font-semibold ${tone === "negative" ? "text-rose-300" : tone === "positive" ? "text-emerald-300" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}

function formatNumber(value: number | null) {
  return value === null ? "暫無" : value.toLocaleString("zh-TW");
}

function formatPercent(value: number | null) {
  if (value === null) {
    return "暫無";
  }

  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function formatCompact(value: number | null) {
  return value === null
    ? "暫無"
    : new Intl.NumberFormat("zh-TW", { notation: "compact" }).format(value);
}

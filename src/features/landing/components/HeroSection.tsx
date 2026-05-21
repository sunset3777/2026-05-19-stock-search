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

    setSearchError("找不到完全符合的股票，請輸入股票代號或從下方清單選取。");
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
    <section className="border-b border-slate-200 bg-[#f7f9fc]">
      <div className="mx-auto w-full max-w-7xl px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-4">
          <Link className="text-lg font-semibold tracking-normal text-slate-950" href="/">
            台股分析搜尋
          </Link>
          <nav aria-label="主導覽" className="hidden items-center gap-6 text-sm text-slate-600 sm:flex">
            <a className="transition hover:text-slate-950" href="#watchlist">
              股票清單
            </a>
            <a className="transition hover:text-slate-950" href="#news">
              資料來源
            </a>
          </nav>
        </header>

        <div className="grid gap-6 py-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.65fr)] lg:items-start">
          <div>
            <p className="text-sm font-medium text-blue-700">TWSE OpenAPI + FinMind</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-normal text-slate-950 sm:text-5xl">
              用公開資料快速查看台股行情與財務概況
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
              查詢上市股票與 ETF 的成交資訊、股價走勢、月營收與財報摘要。資料狀態會明確標示，避免把缺資料誤判成投資訊號。
            </p>

            <div className="mt-7 max-w-2xl rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <label className="text-sm font-medium text-slate-700" htmlFor="stock-search">
                搜尋股票
              </label>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <input
                  className="h-12 min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  id="stock-search"
                  onChange={(event) => handleQueryChange(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleSearchSubmit();
                    }
                  }}
                  placeholder="輸入 2330、台積電或 0050"
                  value={query}
                />
                <button
                  className="inline-flex h-12 items-center justify-center rounded-md bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                  disabled={isLoading}
                  onClick={handleSearchSubmit}
                  type="button"
                >
                  查詢
                </button>
              </div>

              <div className="mt-3 flex flex-col gap-1 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <span>{isLoading ? "正在讀取股票清單" : `顯示 ${filteredStocks.length} 筆結果`}</span>
                <span>{sourceDate ? `資料日期 ${sourceDate}` : "等待 TWSE 回應"}</span>
              </div>

              {(searchError || (query.trim() && filteredStocks.length === 0 && !isLoading)) && (
                <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-800">
                  {searchError || "目前沒有符合條件的股票，請調整代號或名稱。"}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {filteredStocks.slice(0, 4).map((stock) => (
                  <button
                    className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
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

          <MarketSnapshot isLoading={isLoading} selectedStock={selectedStock} />
        </div>
      </div>
    </section>
  );
}

function MarketSnapshot({
  isLoading,
  selectedStock,
}: {
  isLoading: boolean;
  selectedStock: StockSummary | null;
}) {
  if (!selectedStock) {
    return (
      <div className="flex min-h-80 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
        {isLoading ? "正在讀取 TWSE 公開資料..." : "尚未選取股票"}
      </div>
    );
  }

  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <p className="text-sm text-slate-500">目前焦點</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">
            {selectedStock.name} {selectedStock.symbol}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{selectedStock.industry ?? "產業資料暫無"}</p>
        </div>
        <span className="rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 ring-1 ring-blue-100">
          上市
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
        <DashboardMetric label="收盤價" value={formatNumber(selectedStock.closePrice)} />
        <DashboardMetric
          label="漲跌幅"
          tone={selectedStock.changePercent && selectedStock.changePercent < 0 ? "negative" : "positive"}
          value={formatPercent(selectedStock.changePercent)}
        />
        <DashboardMetric label="成交量" value={formatCompact(selectedStock.tradeVolume)} />
      </div>

      <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">成交概況</p>
            <p className="mt-1 text-sm text-slate-700">
              成交值 {formatCompact(selectedStock.tradeValue)}，成交筆數{" "}
              {formatCompact(selectedStock.transactionCount)}
            </p>
          </div>
          <Link
            className="shrink-0 rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:text-blue-700"
            href={`/stocks/${selectedStock.symbol}`}
          >
            詳細資料
          </Link>
        </div>
        <div className="mt-5 h-28">
          <MiniSparkline values={selectedStock.sparkline} variant="large" />
        </div>
      </div>
    </aside>
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
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p
        className={`mt-2 text-xl font-semibold ${
          tone === "negative" ? "text-rose-600" : tone === "positive" ? "text-emerald-700" : "text-slate-950"
        }`}
      >
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

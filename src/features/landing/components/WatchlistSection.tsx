import Link from "next/link";
import type { StockSummary } from "@/features/stocks/types/stocks.types";
import { MiniSparkline } from "./MiniSparkline";

type WatchlistSectionProps = {
  onSelectStock: (stock: StockSummary) => void;
  selectedStock: StockSummary | null;
  selectedSymbol: string | null;
  stocks: StockSummary[];
};

export function WatchlistSection({
  onSelectStock,
  selectedStock,
  selectedSymbol,
  stocks,
}: WatchlistSectionProps) {
  return (
    <section id="watchlist">
      <div className="mb-5">
        <p className="text-sm font-medium text-blue-300">Watchlist</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">瀏覽股票清單</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          從 TWSE 公開資料篩選股票，點選清單會更新焦點資訊，進入分析頁可查看股價走勢與月營收。
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-white/10 bg-slate-900">
        {selectedStock && (
          <article className="border-b border-white/10 bg-slate-950/70 p-5">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <p className="text-sm text-slate-400">
                  {selectedStock.industry ?? "產業資料暫無"}
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-white">
                  {selectedStock.name} {selectedStock.symbol}
                </h3>
              </div>
              <Link
                className="inline-flex h-10 items-center justify-center rounded-md border border-blue-300/40 px-4 text-sm font-semibold text-blue-100 transition hover:border-blue-200 hover:bg-blue-400/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
                href={`/stocks/${selectedStock.symbol}`}
              >
                查看分析
              </Link>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <InfoTile label="收盤價" value={formatNumber(selectedStock.closePrice)} />
              <InfoTile
                label="漲跌幅"
                tone={(selectedStock.changePercent ?? 0) >= 0 ? "positive" : "negative"}
                value={formatPercent(selectedStock.changePercent)}
              />
              <InfoTile label="成交量" value={formatCompact(selectedStock.tradeVolume)} />
            </div>
          </article>
        )}

        {stocks.length === 0 ? (
          <div className="p-6 text-sm leading-6 text-slate-400">
            找不到符合條件的股票，請調整搜尋字串，或稍後再重新讀取 TWSE 資料。
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {stocks.map((stock) => {
              const selected = stock.symbol === selectedSymbol;

              return (
                <article
                  className={`grid gap-4 p-4 transition sm:grid-cols-[1fr_120px_120px_120px] sm:items-center ${
                    selected ? "bg-blue-500/10" : "hover:bg-white/[0.03]"
                  }`}
                  key={stock.symbol}
                >
                  <button
                    className="text-left outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                    onClick={() => onSelectStock(stock)}
                    type="button"
                  >
                    <p className="text-sm text-slate-500">{stock.symbol}</p>
                    <h3 className="mt-1 font-semibold text-white">{stock.name}</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      {stock.industry ?? "產業資料暫無"}
                    </p>
                  </button>
                  <div>
                    <p className="text-sm text-slate-500">收盤價</p>
                    <p className="mt-1 font-semibold text-white">{formatNumber(stock.closePrice)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">漲跌幅</p>
                    <p
                      className={`mt-1 font-semibold ${
                        (stock.changePercent ?? 0) >= 0 ? "text-emerald-300" : "text-rose-300"
                      }`}
                    >
                      {formatPercent(stock.changePercent)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="h-10 w-24">
                      <MiniSparkline values={stock.sparkline} />
                    </div>
                    <Link
                      className="rounded-md border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:border-blue-300 hover:text-blue-200"
                      href={`/stocks/${stock.symbol}`}
                    >
                      分析
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function InfoTile({
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
      <p className="text-sm text-slate-500">{label}</p>
      <p
        className={`mt-2 text-lg font-semibold ${
          tone === "positive"
            ? "text-emerald-300"
            : tone === "negative"
              ? "text-rose-300"
              : "text-white"
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

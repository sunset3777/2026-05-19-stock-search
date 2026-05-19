import Link from "next/link";
import type { StockProfile } from "../types/landing.types";
import { MiniSparkline } from "./MiniSparkline";

type WatchlistSectionProps = {
  onSelectStock: (stock: StockProfile) => void;
  selectedSymbol: string;
  stocks: StockProfile[];
};

export function WatchlistSection({
  onSelectStock,
  selectedSymbol,
  stocks,
}: WatchlistSectionProps) {
  return (
    <section id="watchlist">
      <div className="mb-5">
        <p className="text-sm font-medium text-blue-300">Watchlist</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">股票觀察清單</h2>
      </div>

      <div className="overflow-hidden rounded-lg border border-white/10 bg-slate-900">
        {stocks.length === 0 ? (
          <div className="p-6 text-sm leading-6 text-slate-400">
            找不到符合搜尋條件的股票，請嘗試輸入公司名稱、股票代號或產業。
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
                    <p className="mt-1 text-sm text-slate-400">{stock.industry}</p>
                  </button>
                  <div>
                    <p className="text-sm text-slate-500">現價</p>
                    <p className="mt-1 font-semibold text-white">{stock.price}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">漲跌</p>
                    <p
                      className={`mt-1 font-semibold ${
                        stock.changePercent >= 0 ? "text-emerald-300" : "text-rose-300"
                      }`}
                    >
                      {stock.changePercent >= 0 ? "+" : ""}
                      {stock.changePercent}%
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
                      詳細
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

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
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-blue-700">Watchlist</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">股票清單</h2>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-slate-500">
          依 TWSE 公開資料整理上市股票行情。選取股票可更新上方焦點卡，進入詳細頁可查看股價、月營收與財報資料。
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {selectedStock && (
          <article className="border-b border-slate-100 bg-slate-50 px-5 py-4">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm text-slate-500">{selectedStock.industry ?? "產業資料暫無"}</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-950">
                  {selectedStock.name} {selectedStock.symbol}
                </h3>
              </div>
              <Link
                className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                href={`/stocks/${selectedStock.symbol}`}
              >
                查看詳細
              </Link>
            </div>
          </article>
        )}

        {stocks.length === 0 ? (
          <div className="p-6 text-sm leading-6 text-slate-500">
            目前沒有符合條件的股票，請調整搜尋文字或稍後重新讀取 TWSE 資料。
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">股票</th>
                  <th className="px-4 py-3 font-medium">收盤價</th>
                  <th className="px-4 py-3 font-medium">漲跌幅</th>
                  <th className="px-4 py-3 font-medium">成交量</th>
                  <th className="px-4 py-3 font-medium">走勢</th>
                  <th className="px-5 py-3 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stocks.map((stock) => {
                  const selected = stock.symbol === selectedSymbol;

                  return (
                    <tr className={selected ? "bg-blue-50/70" : "hover:bg-slate-50"} key={stock.symbol}>
                      <td className="px-5 py-4">
                        <button
                          className="text-left outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                          onClick={() => onSelectStock(stock)}
                          type="button"
                        >
                          <p className="font-semibold text-slate-950">
                            {stock.name} <span className="text-slate-500">{stock.symbol}</span>
                          </p>
                          <p className="mt-1 text-sm text-slate-500">{stock.industry ?? "產業資料暫無"}</p>
                        </button>
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-900">{formatNumber(stock.closePrice)}</td>
                      <td className="px-4 py-4">
                        <span
                          className={
                            (stock.changePercent ?? 0) >= 0
                              ? "font-medium text-emerald-700"
                              : "font-medium text-rose-600"
                          }
                        >
                          {formatPercent(stock.changePercent)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-700">{formatCompact(stock.tradeVolume)}</td>
                      <td className="px-4 py-4">
                        <div className="h-9 w-28">
                          <MiniSparkline values={stock.sparkline} />
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                          href={`/stocks/${stock.symbol}`}
                        >
                          詳細
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
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

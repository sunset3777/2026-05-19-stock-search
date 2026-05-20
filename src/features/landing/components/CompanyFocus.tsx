import type { StockSummary } from "@/features/stocks/types/stocks.types";

type CompanyFocusProps = {
  onSelectStock: (stock: StockSummary) => void;
  selectedStock: StockSummary | null;
  stocks: StockSummary[];
};

export function CompanyFocus({ onSelectStock, selectedStock, stocks }: CompanyFocusProps) {
  return (
    <section className="pt-14" id="companies">
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-blue-300">Company Focus</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">焦點上市公司</h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-slate-400">
          依 TWSE 日成交資訊呈現收盤價、漲跌與成交量，點選公司可切換焦點或進入詳細頁。
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-lg border border-white/10 bg-slate-900 p-5">
          {selectedStock ? (
            <>
              <div className="flex flex-col justify-between gap-4 sm:flex-row">
                <div>
                  <p className="text-sm text-slate-400">{selectedStock.industry ?? "產業未提供"}</p>
                  <h3 className="mt-2 text-3xl font-semibold text-white">{selectedStock.name}</h3>
                </div>
                <span className="h-fit rounded-md bg-slate-800 px-3 py-2 text-sm text-slate-300">
                  {selectedStock.symbol}
                </span>
              </div>
              <p className="mt-5 text-base leading-8 text-slate-300">
                TWSE 最新日成交資料顯示，收盤價為 {formatNumber(selectedStock.closePrice)}，
                漲跌幅 {formatPercent(selectedStock.changePercent)}。
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <InfoTile label="成交量" value={formatCompact(selectedStock.tradeVolume)} />
                <InfoTile label="成交值" value={formatCompact(selectedStock.tradeValue)} />
                <InfoTile label="成交筆數" value={formatCompact(selectedStock.transactionCount)} />
              </div>
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-white/10 bg-slate-950 p-6 text-sm text-slate-400">
              尚無焦點公司資料。
            </div>
          )}
        </article>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {stocks.slice(0, 3).map((stock) => (
            <button
              className={`rounded-lg border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 ${
                stock.symbol === selectedStock?.symbol
                  ? "border-blue-400/50 bg-blue-400/10"
                  : "border-white/10 bg-white/[0.03] hover:border-blue-400/40 hover:bg-blue-400/5"
              }`}
              key={stock.symbol}
              onClick={() => onSelectStock(stock)}
              type="button"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-400">{stock.symbol}</p>
                  <h4 className="mt-1 font-semibold text-white">{stock.name}</h4>
                </div>
                <span className="text-sm text-blue-300">{formatPercent(stock.changePercent)}</span>
              </div>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-400">
                收盤價 {formatNumber(stock.closePrice)}，成交量 {formatCompact(stock.tradeVolume)}。
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-slate-950 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-100">{value}</p>
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

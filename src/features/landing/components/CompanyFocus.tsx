import Link from "next/link";
import type { StockProfile } from "../types/landing.types";

type CompanyFocusProps = {
  selectedStock: StockProfile;
  stocks: StockProfile[];
};

export function CompanyFocus({ selectedStock, stocks }: CompanyFocusProps) {
  return (
    <section className="pt-14" id="companies">
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-blue-300">Company Focus</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">企業資訊與投資脈絡</h2>
        </div>
        <Link
          className="text-sm font-medium text-blue-300 transition hover:text-blue-200"
          href={`/stocks/${selectedStock.symbol}`}
        >
          查看完整企業頁
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-lg border border-white/10 bg-slate-900 p-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row">
            <div>
              <p className="text-sm text-slate-400">{selectedStock.industry}</p>
              <h3 className="mt-2 text-3xl font-semibold text-white">
                {selectedStock.name}
              </h3>
            </div>
            <span className="h-fit rounded-md bg-slate-800 px-3 py-2 text-sm text-slate-300">
              {selectedStock.symbol}
            </span>
          </div>
          <p className="mt-5 text-base leading-8 text-slate-300">
            {selectedStock.business}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <InfoTile label="營收觀察" value={selectedStock.revenue} />
            <InfoTile label="風險等級" value={riskLabel[selectedStock.riskLevel]} />
            <InfoTile label="Agent 狀態" value={selectedStock.agentStatus} />
          </div>
        </article>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {stocks.slice(0, 3).map((stock) => (
            <Link
              className="rounded-lg border border-white/10 bg-white/[0.03] p-4 transition hover:border-blue-400/40 hover:bg-blue-400/5"
              href={`/stocks/${stock.symbol}`}
              key={stock.symbol}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-400">{stock.symbol}</p>
                  <h4 className="mt-1 font-semibold text-white">{stock.name}</h4>
                </div>
                <span className="text-sm text-blue-300">{stock.industry}</span>
              </div>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-400">
                {stock.thesis}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

const riskLabel: Record<StockProfile["riskLevel"], string> = {
  low: "低",
  medium: "中",
  high: "高",
};

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-slate-950 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-100">{value}</p>
    </div>
  );
}

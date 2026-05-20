import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { fetchStockDetail } from "@/features/stocks/api/client";
import type { StockDetail, StockPricePoint } from "@/features/stocks/types/stocks.types";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type HistoryRange = "1M" | "3M" | "1Y";

const historyRanges: HistoryRange[] = ["1M", "3M", "1Y"];

export default function StockDetailPage() {
  const router = useRouter();
  const symbol = typeof router.query.symbol === "string" ? router.query.symbol : "";
  const [stock, setStock] = useState<StockDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeRange, setActiveRange] = useState<HistoryRange>("3M");

  useEffect(() => {
    if (!router.isReady || !symbol) {
      return;
    }

    let active = true;

    Promise.resolve()
      .then(() => {
        if (!active) {
          return null;
        }

        setIsLoading(true);
        setError("");

        return fetchStockDetail(symbol);
      })
      .then((result) => {
        if (active && result) {
          setStock(result);
        }
      })
      .catch((fetchError: Error) => {
        if (active) {
          setStock(null);
          setError(fetchError.message);
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [router.isReady, symbol]);

  const rangedHistory = useMemo(() => {
    if (!stock) {
      return [];
    }

    return filterHistoryByRange(stock.history.points, activeRange);
  }, [activeRange, stock]);

  const historyStats = useMemo(() => getHistoryStats(rangedHistory), [rangedHistory]);

  if (isLoading) {
    return (
      <StockPageShell>
        <CenteredPanel title="正在讀取股票資料" text="正在取得 TWSE 行情與 FinMind 歷史股價。" />
      </StockPageShell>
    );
  }

  if (error || !stock) {
    return (
      <StockPageShell>
        <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col justify-center">
          <BackLink />
          <section className="mt-8 rounded-lg border border-white/10 bg-slate-900 p-6">
            <h1 className="text-3xl font-semibold text-white">找不到股票資料</h1>
            <p className="mt-4 text-slate-400">
              {error || "目前沒有回傳這個股票代號的資料。"}
            </p>
          </section>
        </div>
      </StockPageShell>
    );
  }

  return (
    <StockPageShell>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-5 border-b border-white/10 pb-6">
          <BackLink />
          <div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-end">
            <div>
              <p className="text-sm font-medium text-blue-300">
                {stock.company?.industry ?? stock.summary.industry ?? "上市股票"}
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-normal text-white sm:text-5xl">
                {stock.summary.name} {stock.summary.symbol}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
                TWSE 日成交資料日期 {stock.source.updatedDate}。歷史走勢使用{" "}
                {stock.history.isAdjusted ? "FinMind 還原股價" : "FinMind 一般日線"}，
                用於趨勢觀察，不等同即時報價或投資保證。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
              <TopMetric label="收盤價" value={formatNumber(stock.summary.closePrice)} />
              <TopMetric
                label="漲跌幅"
                value={formatPercent(stock.summary.changePercent)}
                tone={(stock.summary.changePercent ?? 0) >= 0 ? "positive" : "negative"}
              />
              <TopMetric label="成交量" value={formatCompact(stock.summary.tradeVolume)} />
              <TopMetric label="成交值" value={formatCompact(stock.summary.tradeValue)} />
            </div>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.55fr)]">
          <div className="rounded-lg border border-white/10 bg-slate-900 p-5">
            <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-medium text-blue-300">Price History</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">歷史股價走勢</h2>
              </div>
              <div className="flex flex-wrap gap-2" role="tablist" aria-label="歷史股價區間">
                {historyRanges.map((range) => (
                  <button
                    aria-selected={activeRange === range}
                    className={`h-10 rounded-md border px-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 ${
                      activeRange === range
                        ? "border-blue-400 bg-blue-500 text-white"
                        : "border-white/10 bg-slate-950 text-slate-300 hover:border-blue-300"
                    }`}
                    key={range}
                    onClick={() => setActiveRange(range)}
                    role="tab"
                    type="button"
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {stock.history.unavailableReason && (
              <p className="mb-4 rounded-md border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-sm leading-6 text-amber-100">
                {stock.history.unavailableReason}
              </p>
            )}

            <div className="rounded-lg border border-white/10 bg-slate-950 p-4">
              <div className="h-72">
                {rangedHistory.length > 1 ? (
                  <PriceChart points={rangedHistory} />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    歷史股價資料不足，無法繪製走勢。
                  </div>
                )}
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-4">
                <TechnicalCard label="區間報酬" value={formatPercent(historyStats.returnPercent)} />
                <TechnicalCard label="區間高點" value={formatNumber(historyStats.high)} />
                <TechnicalCard label="區間低點" value={formatNumber(historyStats.low)} />
                <TechnicalCard label="交易日數" value={`${rangedHistory.length} 日`} />
              </div>
            </div>
          </div>

          <aside className="rounded-lg border border-white/10 bg-slate-900 p-5">
            <p className="text-sm font-medium text-blue-300">Valuation</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">估值指標</h2>
            <div className="mt-5 flex flex-col gap-3">
              <AgentCard label="本益比" text={formatNumber(stock.valuation?.peRatio ?? null)} />
              <AgentCard label="殖利率" text={formatPercent(stock.valuation?.dividendYield ?? null)} />
              <AgentCard label="股價淨值比" text={formatNumber(stock.valuation?.pbRatio ?? null)} />
              <AgentCard label="月平均價" text={formatNumber(stock.monthlyAveragePrice)} />
            </div>
          </aside>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <ReportPanel title="公司基本資料">
            {stock.company ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoTile label="市場" value={stock.company.market} />
                <InfoTile label="上市日期" value={stock.company.listingDate ?? "暫無"} />
                <InfoTile label="董事長" value={stock.company.chairman ?? "暫無"} />
                <InfoTile label="總經理" value={stock.company.generalManager ?? "暫無"} />
                <InfoTile label="實收資本額" value={formatCompact(stock.company.capital)} />
                <InfoTile label="公司網站" value={stock.company.website ?? "暫無"} />
              </div>
            ) : (
              <p className="text-sm leading-7 text-slate-400">TWSE 目前沒有提供這檔股票的公司基本資料。</p>
            )}
          </ReportPanel>

          <ReportPanel title="交易統計">
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoTile label="漲跌" value={formatSignedNumber(stock.summary.change)} />
              <InfoTile label="成交筆數" value={formatCompact(stock.summary.transactionCount)} />
              <InfoTile label="成交量" value={formatCompact(stock.summary.tradeVolume)} />
              <InfoTile label="成交值" value={formatCompact(stock.summary.tradeValue)} />
            </div>
          </ReportPanel>
        </section>
      </div>
    </StockPageShell>
  );
}

function StockPageShell({ children }: { children: React.ReactNode }) {
  return (
    <main
      className={`${geistSans.className} ${geistMono.className} min-h-screen bg-slate-950 px-5 py-8 text-slate-50 sm:px-8 lg:px-10`}
    >
      {children}
    </main>
  );
}

function BackLink() {
  return (
    <Link className="w-fit text-sm font-medium text-blue-300 hover:text-blue-200" href="/">
      回到首頁
    </Link>
  );
}

function CenteredPanel({ text, title }: { text: string; title: string }) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col justify-center">
      <section className="rounded-lg border border-white/10 bg-slate-900 p-6">
        <h1 className="text-3xl font-semibold text-white">{title}</h1>
        <p className="mt-4 text-slate-400">{text}</p>
      </section>
    </div>
  );
}

function TopMetric({
  label,
  tone,
  value,
}: {
  label: string;
  tone?: "positive" | "negative";
  value: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-slate-900 p-4">
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

function PriceChart({ points }: { points: StockPricePoint[] }) {
  const width = 900;
  const height = 280;
  const min = Math.min(...points.map((point) => point.close));
  const max = Math.max(...points.map((point) => point.close));
  const range = max - min || 1;
  const path = points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * width;
      const y = height - ((point.close - min) / range) * height;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <svg
      aria-label="歷史收盤價走勢"
      className="h-full w-full"
      preserveAspectRatio="none"
      role="img"
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <linearGradient id="chartGlow" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map((line) => (
        <line
          key={line}
          stroke="#1e293b"
          strokeWidth="1"
          x1="0"
          x2={width}
          y1={(height / 3) * line}
          y2={(height / 3) * line}
        />
      ))}
      <path d={`${path} L ${width} ${height} L 0 ${height} Z`} fill="url(#chartGlow)" />
      <path d={path} fill="none" stroke="#60a5fa" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
    </svg>
  );
}

function TechnicalCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-200">{value}</p>
    </div>
  );
}

function AgentCard({ label, text }: { label: string; text: string }) {
  return (
    <article className="rounded-lg border border-white/10 bg-slate-950 p-4">
      <p className="text-sm font-medium text-blue-300">{label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
    </article>
  );
}

function ReportPanel({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-white/10 bg-slate-900 p-5">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-slate-950 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold text-slate-100">{value}</p>
    </div>
  );
}

function filterHistoryByRange(points: StockPricePoint[], range: HistoryRange) {
  const countByRange: Record<HistoryRange, number> = {
    "1M": 22,
    "3M": 66,
    "1Y": 260,
  };

  return points.slice(-countByRange[range]);
}

function getHistoryStats(points: StockPricePoint[]) {
  if (points.length === 0) {
    return {
      high: null,
      low: null,
      returnPercent: null,
    };
  }

  const first = points[0];
  const last = points[points.length - 1];
  const high = Math.max(...points.map((point) => point.high));
  const low = Math.min(...points.map((point) => point.low));
  const returnPercent = first.close === 0 ? null : ((last.close - first.close) / first.close) * 100;

  return {
    high,
    low,
    returnPercent,
  };
}

function formatNumber(value: number | null) {
  return value === null ? "暫無" : value.toLocaleString("zh-TW");
}

function formatSignedNumber(value: number | null) {
  if (value === null) {
    return "暫無";
  }

  return `${value >= 0 ? "+" : ""}${value.toLocaleString("zh-TW")}`;
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

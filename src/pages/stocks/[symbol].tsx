import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { fetchStockDetail } from "@/features/stocks/api/client";
import type {
  DataSourceInfo,
  StockDetail,
  StockFinancialPeriod,
  StockMonthlyRevenue,
  StockPricePoint,
} from "@/features/stocks/types/stocks.types";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

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
  const recentRevenue = useMemo(() => stock?.revenue.points.slice(-12) ?? [], [stock]);
  const latestRevenue = recentRevenue[recentRevenue.length - 1] ?? null;
  const financialPeriods = stock?.financials.periods.slice(0, 4) ?? [];
  const latestFinancial = financialPeriods[0] ?? null;

  if (isLoading) {
    return (
      <StockPageShell>
        <CenteredPanel
          title="正在讀取股票資料"
          text="正在取得 TWSE 交易資料、FinMind 股價、月營收與財報資料。"
        />
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
              {error || "目前沒有取得這檔股票的公開資料。"}
            </p>
          </section>
        </div>
      </StockPageShell>
    );
  }

  const isEtf = stock.instrument.type === "etf";

  return (
    <StockPageShell>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-5 border-b border-white/10 pb-6">
          <BackLink />
          <div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-end">
            <div>
              <p className="text-sm font-medium text-blue-300">
                {isEtf
                  ? "ETF"
                  : stock.company?.industry ?? stock.summary.industry ?? "上市股票"}
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-normal text-white sm:text-5xl">
                {stock.summary.name} {stock.summary.symbol}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
                TWSE 日成交資料日期 {stock.source.updatedDate}。個股顯示公司財務三表；ETF
                不適用公司財報，頁面會保留交易、股價與成交資訊。
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
                <h2 className="mt-2 text-2xl font-semibold text-white">股價走勢</h2>
                <p className="mt-2 text-sm text-slate-400">{stock.history.source.message}</p>
              </div>
              <div className="flex flex-wrap gap-2" role="tablist" aria-label="股價區間">
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
              <Notice source={stock.history.source} text={stock.history.unavailableReason} />
            )}

            <div className="rounded-lg border border-white/10 bg-slate-950 p-4">
              <div className="h-72">
                {rangedHistory.length > 1 ? (
                  <PriceChart points={rangedHistory} />
                ) : (
                  <EmptyState text="歷史股價資料不足，暫時無法繪製走勢。" />
                )}
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-4">
                <MetricCard label="區間報酬" value={formatPercent(historyStats.returnPercent)} />
                <MetricCard label="區間高點" value={formatNumber(historyStats.high)} />
                <MetricCard label="區間低點" value={formatNumber(historyStats.low)} />
                <MetricCard label="交易日數" value={`${rangedHistory.length} 日`} />
              </div>
            </div>
          </div>

          <aside className="rounded-lg border border-white/10 bg-slate-900 p-5">
            <p className="text-sm font-medium text-blue-300">Valuation</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">估值概況</h2>
            <div className="mt-5 flex flex-col gap-3">
              <InfoCard label="本益比" text={formatNumber(stock.valuation?.peRatio ?? null)} />
              <InfoCard label="殖利率" text={formatPercent(stock.valuation?.dividendYield ?? null)} />
              <InfoCard label="股價淨值比" text={formatNumber(stock.valuation?.pbRatio ?? null)} />
              <InfoCard label="月均價" text={formatNumber(stock.monthlyAveragePrice)} />
            </div>
          </aside>
        </section>

        {!isEtf && (
          <ReportPanel title="月營收趨勢">
            {stock.revenue.unavailableReason && (
              <Notice source={stock.revenue.source} text={stock.revenue.unavailableReason} />
            )}
            {recentRevenue.length > 0 && latestRevenue ? (
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
                <div className="rounded-lg border border-white/10 bg-slate-950 p-4">
                  <div className="h-64">
                    <RevenueChart points={recentRevenue} />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                  <InfoTile
                    label="最新月份"
                    value={`${latestRevenue.revenueYear}/${padMonth(latestRevenue.revenueMonth)}`}
                  />
                  <InfoTile label="月營收" value={formatCompact(latestRevenue.revenue)} />
                  <InfoTile label="月增率 MoM" value={formatPercent(latestRevenue.momPercent)} />
                  <InfoTile label="年增率 YoY" value={formatPercent(latestRevenue.yoyPercent)} />
                  <InfoTile label="公告日期" value={latestRevenue.announceDate ?? "暫無"} />
                </div>
              </div>
            ) : (
              <EmptyState text="目前沒有可顯示的月營收資料。" />
            )}
          </ReportPanel>
        )}

        <ReportPanel title={isEtf ? "ETF 資料說明" : "財報三表摘要"}>
          {isEtf ? (
            <EtfFinancialsMessage stock={stock} />
          ) : (
            <>
              {stock.financials.unavailableReason && (
                <Notice source={stock.financials.source} text={stock.financials.unavailableReason} />
              )}
              {latestFinancial ? (
                <FinancialsPanel latest={latestFinancial} periods={financialPeriods} />
              ) : (
                <EmptyState text="目前沒有可顯示的財報三表資料。" />
              )}
            </>
          )}
        </ReportPanel>

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
            ) : isEtf ? (
              <EmptyState text="ETF 沒有上市公司基本資料，此頁保留交易與價格資料。" />
            ) : (
              <EmptyState text="TWSE 目前沒有回傳這檔股票的公司基本資料。" />
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

function EtfFinancialsMessage({ stock }: { stock: StockDetail }) {
  return (
    <div className="rounded-lg border border-white/10 bg-slate-950 p-5">
      <p className="text-sm font-medium text-blue-300">
        {stock.instrument.category ?? "ETF"}
      </p>
      <h3 className="mt-2 text-xl font-semibold text-white">
        {stock.summary.symbol} 是 ETF，不適用公司財務三表
      </h3>
      <p className="mt-4 text-sm leading-7 text-slate-400">
        ETF 不是單一營運公司，因此不會有損益表、資產負債表與現金流量表。此頁會保留可用的交易資料、
        股價走勢、成交量與成交值；後續可再補 ETF 成分股、淨值、折溢價與配息資料。
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <InfoTile label="收盤價" value={formatNumber(stock.summary.closePrice)} />
        <InfoTile label="成交量" value={formatCompact(stock.summary.tradeVolume)} />
        <InfoTile label="成交值" value={formatCompact(stock.summary.tradeValue)} />
      </div>
    </div>
  );
}

function FinancialsPanel({
  latest,
  periods,
}: {
  latest: StockFinancialPeriod;
  periods: StockFinancialPeriod[];
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-blue-300">Latest Quarter</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">{latest.date}</h3>
        </div>
        <p className="max-w-lg text-sm leading-6 text-slate-400">
          以下為最新季度核心財務指標，數字以 FinMind 財報三表整理。
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <FinancialMetricCard label="營收" value={formatCompact(latest.incomeStatement.revenue)} />
        <FinancialMetricCard label="EPS" value={formatNumber(latest.incomeStatement.eps)} />
        <FinancialMetricCard label="營業利益" value={formatCompact(latest.incomeStatement.operatingIncome)} />
        <FinancialMetricCard label="淨利" value={formatCompact(latest.incomeStatement.netIncome)} />
        <FinancialMetricCard label="毛利率" value={formatPercent(latest.incomeStatement.grossMargin)} />
        <FinancialMetricCard label="淨利率" value={formatPercent(latest.incomeStatement.netMargin)} />
        <FinancialMetricCard label="負債比" value={formatPercent(latest.balanceSheet.debtRatio)} />
        <FinancialMetricCard label="自由現金流" value={formatCompact(latest.cashFlow.freeCashFlow)} />
      </div>

      <div>
        <h3 className="text-base font-semibold text-white">最近 4 季財務表現</h3>
        <div className="mt-4 overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="bg-slate-950 text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">季度</th>
                <th className="px-4 py-3 font-medium">營收</th>
                <th className="px-4 py-3 font-medium">EPS</th>
                <th className="px-4 py-3 font-medium">毛利率</th>
                <th className="px-4 py-3 font-medium">淨利率</th>
                <th className="px-4 py-3 font-medium">負債比</th>
                <th className="px-4 py-3 font-medium">自由現金流</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {periods.map((period) => (
                <tr className="text-slate-200" key={period.date}>
                  <td className="px-4 py-3 text-slate-400">{period.date}</td>
                  <td className="px-4 py-3">{formatCompact(period.incomeStatement.revenue)}</td>
                  <td className="px-4 py-3">{formatNumber(period.incomeStatement.eps)}</td>
                  <td className="px-4 py-3">{formatPercent(period.incomeStatement.grossMargin)}</td>
                  <td className="px-4 py-3">{formatPercent(period.incomeStatement.netMargin)}</td>
                  <td className="px-4 py-3">{formatPercent(period.balanceSheet.debtRatio)}</td>
                  <td className="px-4 py-3">{formatCompact(period.cashFlow.freeCashFlow)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FinancialMetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-lg border border-white/10 bg-slate-950 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-3 text-xl font-semibold text-white">{value}</p>
    </article>
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
      返回首頁
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
  const chartPoints = points.map((point) => ({
    date: point.date,
    value: point.close,
  }));

  return <LineChart ariaLabel="股價收盤走勢" points={chartPoints} stroke="#60a5fa" />;
}

function RevenueChart({ points }: { points: StockMonthlyRevenue[] }) {
  const chartPoints = points.map((point) => ({
    date: `${point.revenueYear}/${padMonth(point.revenueMonth)}`,
    value: point.revenue,
  }));

  return <LineChart ariaLabel="月營收趨勢" points={chartPoints} stroke="#34d399" />;
}

function LineChart({
  ariaLabel,
  points,
  stroke,
}: {
  ariaLabel: string;
  points: { date: string; value: number }[];
  stroke: string;
}) {
  const width = 900;
  const height = 280;
  const min = Math.min(...points.map((point) => point.value));
  const max = Math.max(...points.map((point) => point.value));
  const range = max - min || 1;
  const path = points
    .map((point, index) => {
      const x = points.length === 1 ? width / 2 : (index / (points.length - 1)) * width;
      const y = height - ((point.value - min) / range) * height;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <svg
      aria-label={ariaLabel}
      className="h-full w-full"
      preserveAspectRatio="none"
      role="img"
      viewBox={`0 0 ${width} ${height}`}
    >
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
      <path d={path} fill="none" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
    </svg>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-200">{value}</p>
    </div>
  );
}

function InfoCard({ label, text }: { label: string; text: string }) {
  return (
    <article className="rounded-lg border border-white/10 bg-slate-950 p-4">
      <p className="text-sm font-medium text-blue-300">{label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
    </article>
  );
}

function ReportPanel({ children, title }: { children: ReactNode; title: string }) {
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

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-white/10 bg-slate-950 p-6 text-center text-sm leading-6 text-slate-400">
      {text}
    </div>
  );
}

function Notice({ source, text }: { source: DataSourceInfo; text: string }) {
  return (
    <p className={`mb-4 rounded-md border px-3 py-2 text-sm leading-6 ${getNoticeClass(source.status)}`}>
      {text}
    </p>
  );
}

function getNoticeClass(status: DataSourceInfo["status"]) {
  if (status === "premium_required" || status === "fallback") {
    return "border-amber-300/20 bg-amber-300/10 text-amber-100";
  }

  return "border-slate-300/10 bg-slate-800 text-slate-300";
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
    return { high: null, low: null, returnPercent: null };
  }

  const first = points[0];
  const last = points[points.length - 1];
  const high = Math.max(...points.map((point) => point.high));
  const low = Math.min(...points.map((point) => point.low));
  const returnPercent = first.close === 0 ? null : ((last.close - first.close) / first.close) * 100;

  return { high, low, returnPercent };
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

function padMonth(month: number) {
  return String(month).padStart(2, "0");
}

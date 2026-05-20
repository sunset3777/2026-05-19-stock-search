import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { marketNews, stockProfiles } from "@/features/landing/constants/landingData";
import type { ChartPoint, StockRiskLevel, TimeRange } from "@/features/landing/types/landing.types";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const timeRanges: TimeRange[] = ["1D", "5D", "1M", "6M", "1Y"];

export default function StockDetailPage() {
  const router = useRouter();
  const [activeRange, setActiveRange] = useState<TimeRange>("1M");
  const symbol = typeof router.query.symbol === "string" ? router.query.symbol : "";
  const stock = stockProfiles.find((item) => item.symbol === symbol);

  const relatedNews = useMemo(
    () => (stock ? marketNews.filter((item) => item.company === stock.name) : []),
    [stock],
  );

  if (!stock) {
    return (
      <StockPageShell>
        <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col justify-center">
          <Link className="text-sm font-medium text-blue-300 hover:text-blue-200" href="/">
            返回首頁
          </Link>
          <section className="mt-8 rounded-lg border border-white/10 bg-slate-900 p-6">
            <h1 className="text-3xl font-semibold text-white">找不到股票資料</h1>
            <p className="mt-4 text-slate-400">
              目前詳細頁只支援 mock data 中的股票代號：2330、2454、2308、2317。
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {stockProfiles.map((item) => (
                <Link
                  className="rounded-md border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:border-blue-300 hover:text-blue-200"
                  href={`/stocks/${item.symbol}`}
                  key={item.symbol}
                >
                  {item.symbol} {item.name}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </StockPageShell>
    );
  }

  const chartPoints = stock.chartSeries[activeRange];
  const technical = stock.technicals[activeRange];

  return (
    <StockPageShell>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-5 border-b border-white/10 pb-6">
          <Link className="w-fit text-sm font-medium text-blue-300 hover:text-blue-200" href="/">
            返回首頁
          </Link>
          <div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-end">
            <div>
              <p className="text-sm font-medium text-blue-300">{stock.industry}</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-normal text-white sm:text-5xl">
                {stock.name} {stock.symbol}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
                {stock.business}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
              <TopMetric label="現價" value={`${stock.price}`} />
              <TopMetric
                label="漲跌"
                value={`${stock.changePercent > 0 ? "+" : ""}${stock.changePercent}%`}
                tone={stock.changePercent >= 0 ? "positive" : "negative"}
              />
              <TopMetric label="市值" value={stock.marketCap} />
              <TopMetric label="Agent 狀態" value={stock.agentStatus} />
            </div>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.55fr)]">
          <div className="rounded-lg border border-white/10 bg-slate-900 p-5">
            <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-medium text-blue-300">Price Action</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">線圖與技術面</h2>
              </div>
              <div className="flex flex-wrap gap-2" role="tablist" aria-label="線圖時程">
                {timeRanges.map((range) => (
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

            <div className="rounded-lg border border-white/10 bg-slate-950 p-4">
              <div className="h-72">
                <PriceChart points={chartPoints} />
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-5">
                <TechnicalCard label="趨勢" value={technical.trend} />
                <TechnicalCard label="動能" value={technical.momentum} />
                <TechnicalCard label="支撐" value={technical.support} />
                <TechnicalCard label="壓力" value={technical.resistance} />
                <TechnicalCard label="量能" value={technical.volume} />
              </div>
            </div>
          </div>

          <aside className="rounded-lg border border-white/10 bg-slate-900 p-5">
            <p className="text-sm font-medium text-blue-300">Agent View</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">預先生成分析摘要</h2>
            <div className="mt-5 flex flex-col gap-3">
              <AgentCard label="技術面" text={stock.agentReport.technical} />
              <AgentCard label="風險" text={stock.agentReport.risk} />
              <AgentCard label="發展方向" text={stock.agentReport.direction} />
              <AgentCard label="投資建議" text={stock.agentReport.suggestion} />
            </div>
          </aside>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <ReportPanel title="企業介紹與基本面">
            <p className="text-sm leading-7 text-slate-300">{stock.thesis}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {stock.fundamentals.map((metric) => (
                <div className="rounded-lg border border-white/10 bg-slate-950 p-4" key={metric.label}>
                  <p className="text-sm text-slate-500">{metric.label}</p>
                  <p className="mt-2 text-lg font-semibold text-white">{metric.value}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{metric.note}</p>
                </div>
              ))}
            </div>
          </ReportPanel>

          <ReportPanel title="近期新聞脈絡">
            {relatedNews.length > 0 ? (
              <div className="flex flex-col gap-3">
                {relatedNews.map((news) => (
                  <article className="rounded-lg border border-white/10 bg-slate-950 p-4" key={news.id}>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                      <span>{news.date}</span>
                      <span>{news.category}</span>
                    </div>
                    <h3 className="mt-3 text-base font-semibold text-white">{news.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{news.summary}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-white/10 bg-slate-950 p-4 text-sm leading-6 text-slate-400">
                目前 mock 新聞尚未包含 {stock.name} 的近期新聞。後續可串接新聞 API 或企業公告來源。
              </p>
            )}
          </ReportPanel>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <ReportPanel title="風險矩陣">
            <div className="grid gap-3">
              {stock.risks.map((risk) => (
                <div className="rounded-lg border border-white/10 bg-slate-950 p-4" key={risk.title}>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-white">{risk.title}</h3>
                    <RiskBadge level={risk.level} />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{risk.description}</p>
                </div>
              ))}
            </div>
          </ReportPanel>

          <ReportPanel title="同業比較">
            <div className="overflow-hidden rounded-lg border border-white/10">
              {stock.peers.map((peer) => (
                <div
                  className="grid gap-3 border-b border-white/10 bg-slate-950 p-4 last:border-b-0 sm:grid-cols-[1fr_96px]"
                  key={peer.symbol}
                >
                  <div>
                    <p className="text-sm text-slate-500">{peer.symbol}</p>
                    <h3 className="mt-1 font-semibold text-white">{peer.name}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-400">{peer.note}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm text-slate-500">{peer.industry}</p>
                    <p
                      className={`mt-2 font-semibold ${
                        peer.changePercent >= 0 ? "text-emerald-300" : "text-rose-300"
                      }`}
                    >
                      {peer.changePercent >= 0 ? "+" : ""}
                      {peer.changePercent}%
                    </p>
                  </div>
                </div>
              ))}
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

function PriceChart({ points }: { points: ChartPoint[] }) {
  const width = 900;
  const height = 280;
  const min = Math.min(...points.map((point) => point.value));
  const max = Math.max(...points.map((point) => point.value));
  const range = max - min || 1;
  const path = points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * width;
      const y = height - ((point.value - min) / range) * height;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <svg
      aria-label="股票價格線圖"
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
      {points.map((point, index) => {
        const x = (index / (points.length - 1)) * width;
        const y = height - ((point.value - min) / range) * height;
        return <circle cx={x} cy={y} fill="#bfdbfe" key={`${point.label}-${point.value}`} r="4" />;
      })}
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

function RiskBadge({ level }: { level: StockRiskLevel }) {
  const styles: Record<StockRiskLevel, string> = {
    low: "bg-emerald-400/10 text-emerald-200 ring-emerald-300/20",
    medium: "bg-amber-300/10 text-amber-100 ring-amber-300/20",
    high: "bg-rose-400/10 text-rose-200 ring-rose-300/20",
  };
  const labels: Record<StockRiskLevel, string> = {
    low: "低",
    medium: "中",
    high: "高",
  };

  return (
    <span className={`rounded-md px-2.5 py-1.5 text-xs font-medium ring-1 ${styles[level]}`}>
      {labels[level]}風險
    </span>
  );
}

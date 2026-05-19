import Link from "next/link";
import { useRouter } from "next/router";
import { Geist, Geist_Mono } from "next/font/google";
import { stockProfiles } from "@/features/landing/constants/landingData";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function StockDetailPage() {
  const router = useRouter();
  const symbol = typeof router.query.symbol === "string" ? router.query.symbol : "";
  const stock = stockProfiles.find((item) => item.symbol === symbol);

  return (
    <main
      className={`${geistSans.className} ${geistMono.className} min-h-screen bg-slate-950 px-5 py-8 text-slate-50 sm:px-8 lg:px-10`}
    >
      <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col justify-center">
        <Link className="text-sm font-medium text-blue-300 hover:text-blue-200" href="/">
          返回首頁
        </Link>
        <section className="mt-8 rounded-lg border border-white/10 bg-slate-900 p-6">
          {stock ? (
            <>
              <p className="text-sm text-slate-400">{stock.industry}</p>
              <h1 className="mt-3 text-4xl font-semibold text-white">
                {stock.name} {stock.symbol}
              </h1>
              <p className="mt-5 text-base leading-8 text-slate-300">{stock.business}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <DetailMetric label="現價" value={`${stock.price}`} />
                <DetailMetric label="市值" value={stock.marketCap} />
                <DetailMetric label="Agent 狀態" value={stock.agentStatus} />
              </div>
              <p className="mt-6 rounded-lg border border-blue-400/20 bg-blue-400/10 p-4 text-sm leading-6 text-blue-100">
                詳細分析頁架構已建立。後續可接入完整線圖、技術面、新聞脈絡與 Agent 報告。
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-semibold text-white">找不到股票資料</h1>
              <p className="mt-4 text-slate-400">
                目前詳細頁只支援首頁 mock data 中的股票代號。
              </p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function DetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-slate-950 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 font-semibold text-white">{value}</p>
    </div>
  );
}

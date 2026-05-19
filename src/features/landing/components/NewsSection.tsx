import type { MarketNews } from "../types/landing.types";

type NewsSectionProps = {
  news: MarketNews[];
  selectedCompany: string;
};

export function NewsSection({ news, selectedCompany }: NewsSectionProps) {
  return (
    <section id="news">
      <div className="mb-5">
        <p className="text-sm font-medium text-blue-300">Market News</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">最近新聞資訊</h2>
      </div>

      <div className="rounded-lg border border-white/10 bg-slate-900 p-4">
        <div className="mb-4 rounded-md bg-slate-950 p-3 text-sm leading-6 text-slate-400">
          目前使用 mock 新聞資料。正式串接前，新聞摘要僅用於首頁版面與資訊架構展示。
        </div>
        <div className="flex flex-col gap-3">
          {news.map((item) => (
            <article
              className={`rounded-lg border p-4 ${
                item.company === selectedCompany
                  ? "border-blue-400/40 bg-blue-400/10"
                  : "border-white/10 bg-white/[0.03]"
              }`}
              key={item.id}
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span>{item.date}</span>
                <span>{item.company}</span>
                <span className="rounded bg-slate-800 px-2 py-1 text-slate-300">
                  {item.category}
                </span>
              </div>
              <h3 className="mt-3 text-base font-semibold leading-6 text-white">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{item.summary}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

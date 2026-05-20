export function AgentSummary() {
  return (
    <section className="rounded-lg border border-white/10 bg-slate-900 p-5">
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-blue-300">Coverage</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">本次串接範圍</h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-slate-400">
          目前聚焦上市股票公開資料；上櫃、逐筆即時報價與投資建議不在此版本範圍。
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <CoverageCard label="價格" title="日成交資訊" text="收盤價、開高低、漲跌、成交量與成交值。" />
        <CoverageCard label="估值" title="基本估值" text="本益比、殖利率與股價淨值比。" />
        <CoverageCard label="公司" title="基本資料" text="上市日期、資本額、負責人與網站。" />
        <CoverageCard label="限制" title="非即時資料" text="TWSE OpenAPI 提供的是公開日資料，不等同盤中報價。" />
      </div>
    </section>
  );
}

function CoverageCard({
  label,
  text,
  title,
}: {
  label: string;
  text: string;
  title: string;
}) {
  return (
    <article className="min-h-44 rounded-lg border border-white/10 bg-slate-950 p-4">
      <span className="rounded-md bg-blue-500/10 px-2.5 py-1.5 text-xs font-medium text-blue-200 ring-1 ring-blue-400/20">
        {label}
      </span>
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-400">{text}</p>
    </article>
  );
}

type NewsSectionProps = {
  sourceDate: string | null;
};

export function NewsSection({ sourceDate }: NewsSectionProps) {
  return (
    <section id="news">
      <div className="mb-5">
        <p className="text-sm font-medium text-blue-300">Data Source</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">公開資料狀態</h2>
      </div>

      <div className="rounded-lg border border-white/10 bg-slate-900 p-4">
        <div className="rounded-md bg-slate-950 p-3 text-sm leading-6 text-slate-400">
          本頁資料由臺灣證券交易所 OpenAPI 提供，透過本站 server proxy 正規化後顯示。
        </div>
        <div className="mt-4 grid gap-3">
          <InfoRow label="行情資料" value="上市個股日成交資訊" />
          <InfoRow label="估值資料" value="本益比、殖利率、股價淨值比" />
          <InfoRow label="公司資料" value="上市公司基本資料" />
          <InfoRow label="資料日期" value={sourceDate ?? "等待 TWSE 回應"} />
        </div>
      </div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-100">{value}</p>
    </div>
  );
}

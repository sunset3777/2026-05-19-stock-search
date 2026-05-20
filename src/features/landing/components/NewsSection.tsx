import type { DataSourceInfo } from "@/features/stocks/types/stocks.types";

type NewsSectionProps = {
  dataSources: DataSourceInfo[];
  sourceDate: string | null;
};

export function NewsSection({ dataSources, sourceDate }: NewsSectionProps) {
  const sources =
    dataSources.length > 0
      ? dataSources
      : [
          {
            id: "twse-list-pending",
            label: "TWSE 股票清單",
            provider: "TWSE" as const,
            dataset: "TWSE OpenAPI",
            accessLevel: "free_safe" as const,
            status: "no_data" as const,
            message: "等待 TWSE 回應。",
          },
        ];

  return (
    <section id="news">
      <div className="mb-5">
        <p className="text-sm font-medium text-blue-300">Data Source</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">資料來源狀態</h2>
      </div>

      <div className="rounded-lg border border-white/10 bg-slate-900 p-4">
        <div className="rounded-md bg-slate-950 p-3 text-sm leading-6 text-slate-400">
          首頁顯示股票清單的資料來源狀態。股價走勢、月營收與財報三表會在股票詳細頁顯示完整狀態。
        </div>
        <div className="mt-4 grid gap-3">
          {sources.map((source) => (
            <SourceRow key={source.id} source={source} />
          ))}
          <InfoRow label="資料日期" value={sourceDate ?? "等待 TWSE 回應"} />
        </div>
      </div>
    </section>
  );
}

function SourceRow({ source }: { source: DataSourceInfo }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{source.provider}</p>
          <p className="mt-2 text-sm font-semibold text-slate-100">{source.label}</p>
        </div>
        <span className={`rounded-md px-2.5 py-1.5 text-xs font-medium ${getBadgeClass(source.status)}`}>
          {getStatusLabel(source.status)}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-400">{source.message}</p>
    </div>
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

function getStatusLabel(status: DataSourceInfo["status"]) {
  const labels: Record<DataSourceInfo["status"], string> = {
    available: "可用",
    fallback: "降級",
    premium_required: "需權限",
    rate_limited: "額度滿",
    no_data: "暫無",
    error: "錯誤",
  };

  return labels[status];
}

function getBadgeClass(status: DataSourceInfo["status"]) {
  if (status === "available") {
    return "bg-emerald-400/10 text-emerald-200 ring-1 ring-emerald-300/20";
  }

  if (status === "fallback") {
    return "bg-amber-300/10 text-amber-100 ring-1 ring-amber-300/20";
  }

  if (status === "premium_required") {
    return "bg-blue-400/10 text-blue-100 ring-1 ring-blue-300/20";
  }

  return "bg-slate-700/60 text-slate-200 ring-1 ring-white/10";
}

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
      <div className="mb-4">
        <p className="text-sm font-medium text-blue-700">Data Source</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-950">資料來源狀態</h2>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <p className="rounded-md bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-600">
          首頁顯示股票清單來源狀態；股價、月營收與財報三表會在股票詳細頁顯示各自的資料狀態。
        </p>
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
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{source.provider}</p>
          <p className="mt-1 text-sm font-semibold text-slate-950">{source.label}</p>
        </div>
        <span className={`rounded-md px-2.5 py-1.5 text-xs font-medium ${getBadgeClass(source.status)}`}>
          {getStatusLabel(source.status)}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-500">{source.message}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
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
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";
  }

  if (status === "fallback") {
    return "bg-amber-50 text-amber-700 ring-1 ring-amber-100";
  }

  if (status === "premium_required") {
    return "bg-blue-50 text-blue-700 ring-1 ring-blue-100";
  }

  return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
}

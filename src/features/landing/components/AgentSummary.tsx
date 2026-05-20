import type { AgentInsight } from "../types/landing.types";

type AgentSummaryProps = {
  insights: AgentInsight[];
};

export function AgentSummary({ insights }: AgentSummaryProps) {
  return (
    <section className="rounded-lg border border-white/10 bg-slate-900 p-5">
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-blue-300">Agent Summary</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Agent 分析摘要</h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-slate-400">
          將技術面、風險、發展方向與投資建議拆成可檢查的模組，讓分析結果更容易追蹤。
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {insights.map((insight) => (
          <article
            className="min-h-44 rounded-lg border border-white/10 bg-slate-950 p-4"
            key={insight.title}
          >
            <span className="rounded-md bg-blue-500/10 px-2.5 py-1.5 text-xs font-medium text-blue-200 ring-1 ring-blue-400/20">
              {insight.label}
            </span>
            <h3 className="mt-4 text-lg font-semibold text-white">{insight.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">{insight.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export type StockRiskLevel = "low" | "medium" | "high";

export type StockTrend = "up" | "flat" | "down";

export type TimeRange = "1D" | "5D" | "1M" | "6M" | "1Y";

export type ChartPoint = {
  label: string;
  value: number;
};

export type TechnicalSnapshot = {
  trend: string;
  momentum: string;
  support: string;
  resistance: string;
  volume: string;
};

export type FundamentalMetric = {
  label: string;
  value: string;
  note: string;
};

export type PeerComparison = {
  symbol: string;
  name: string;
  industry: string;
  changePercent: number;
  note: string;
};

export type RiskFactor = {
  title: string;
  level: StockRiskLevel;
  description: string;
};

export type AgentReport = {
  technical: string;
  risk: string;
  direction: string;
  suggestion: string;
};

export type StockProfile = {
  symbol: string;
  name: string;
  industry: string;
  business: string;
  price: number;
  changePercent: number;
  marketCap: string;
  revenue: string;
  riskLevel: StockRiskLevel;
  agentStatus: string;
  thesis: string;
  highlights: string[];
  trend: StockTrend;
  sparkline: number[];
  fundamentals: FundamentalMetric[];
  peers: PeerComparison[];
  risks: RiskFactor[];
  agentReport: AgentReport;
  chartSeries: Record<TimeRange, ChartPoint[]>;
  technicals: Record<TimeRange, TechnicalSnapshot>;
};

export type MarketNews = {
  id: string;
  company: string;
  category: string;
  date: string;
  title: string;
  summary: string;
};

export type AgentInsight = {
  title: string;
  description: string;
  label: string;
};

export type StockRiskLevel = "low" | "medium" | "high";

export type StockTrend = "up" | "flat" | "down";

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

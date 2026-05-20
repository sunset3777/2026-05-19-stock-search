export type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};

export type ApiSuccessResponse<T> = {
  data: T;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export type StockSummary = {
  symbol: string;
  name: string;
  date: string;
  closePrice: number | null;
  change: number | null;
  changePercent: number | null;
  tradeVolume: number | null;
  tradeValue: number | null;
  transactionCount: number | null;
  industry: string | null;
  sparkline: number[];
};

export type StockPricePoint = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  change: number;
  tradeVolume: number;
  tradeValue: number;
  transactionCount: number;
};

export type DataAccessLevel = "free_safe" | "premium" | "unknown";

export type DataSourceStatus =
  | "available"
  | "fallback"
  | "premium_required"
  | "rate_limited"
  | "no_data"
  | "error";

export type DataSourceInfo = {
  id: string;
  label: string;
  provider: "TWSE" | "FinMind";
  dataset: string;
  accessLevel: DataAccessLevel;
  status: DataSourceStatus;
  message: string;
};

export type InstrumentType = "stock" | "etf" | "unknown";

export type StockInstrumentProfile = {
  type: InstrumentType;
  category: string | null;
  source: DataSourceInfo;
};

export type StockHistory = {
  dataset: "TaiwanStockPrice" | "TaiwanStockPriceAdj";
  isAdjusted: boolean;
  points: StockPricePoint[];
  unavailableReason: string | null;
  source: DataSourceInfo;
};

export type StockMonthlyRevenue = {
  date: string;
  revenue: number;
  revenueMonth: number;
  revenueYear: number;
  announceDate: string | null;
  momPercent: number | null;
  yoyPercent: number | null;
};

export type StockRevenue = {
  dataset: "TaiwanStockMonthRevenue";
  points: StockMonthlyRevenue[];
  unavailableReason: string | null;
  source: DataSourceInfo;
};

export type StockFinancialPeriod = {
  date: string;
  incomeStatement: {
    revenue: number | null;
    grossProfit: number | null;
    operatingIncome: number | null;
    netIncome: number | null;
    eps: number | null;
    grossMargin: number | null;
    operatingMargin: number | null;
    netMargin: number | null;
  };
  balanceSheet: {
    totalAssets: number | null;
    totalLiabilities: number | null;
    equity: number | null;
    cashAndEquivalents: number | null;
    currentAssets: number | null;
    currentLiabilities: number | null;
    debtRatio: number | null;
    currentRatio: number | null;
  };
  cashFlow: {
    operatingCashFlow: number | null;
    investingCashFlow: number | null;
    financingCashFlow: number | null;
    endingCash: number | null;
    capitalExpenditure: number | null;
    freeCashFlow: number | null;
  };
};

export type StockFinancials = {
  datasets: {
    incomeStatement: "TaiwanStockFinancialStatements";
    balanceSheet: "TaiwanStockBalanceSheet";
    cashFlow: "TaiwanStockCashFlowsStatement";
  };
  periods: StockFinancialPeriod[];
  unavailableReason: string | null;
  source: DataSourceInfo;
};

export type StockDetail = {
  summary: StockSummary;
  instrument: StockInstrumentProfile;
  ohlc: {
    open: number | null;
    high: number | null;
    low: number | null;
    close: number | null;
  };
  valuation: {
    peRatio: number | null;
    dividendYield: number | null;
    pbRatio: number | null;
  } | null;
  monthlyAveragePrice: number | null;
  company: {
    chairman: string | null;
    generalManager: string | null;
    listingDate: string | null;
    market: string;
    industry: string | null;
    capital: number | null;
    address: string | null;
    website: string | null;
  } | null;
  history: StockHistory;
  revenue: StockRevenue;
  financials: StockFinancials;
  dataSources: DataSourceInfo[];
  source: {
    provider: "TWSE";
    updatedDate: string;
  };
};

export type StockListResult = {
  stocks: StockSummary[];
  source: {
    provider: "TWSE";
    updatedDate: string | null;
  };
  dataSources: DataSourceInfo[];
};

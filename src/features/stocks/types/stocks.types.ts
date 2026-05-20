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

export type StockHistory = {
  dataset: "TaiwanStockPrice" | "TaiwanStockPriceAdj";
  isAdjusted: boolean;
  points: StockPricePoint[];
  unavailableReason: string | null;
};

export type StockDetail = {
  summary: StockSummary;
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
};

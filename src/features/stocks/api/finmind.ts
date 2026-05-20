import type { StockHistory, StockPricePoint } from "../types/stocks.types";

const FINMIND_BASE_URL = "https://api.finmindtrade.com/api/v4/data";

type FinMindDataset = "TaiwanStockPrice" | "TaiwanStockPriceAdj";

type FinMindResponse<T> = {
  msg: string;
  status: number;
  data?: T[];
};

type FinMindStockPriceRow = {
  date: string;
  stock_id: string;
  Trading_Volume: number;
  Trading_money: number;
  open: number;
  max: number;
  min: number;
  close: number;
  spread: number;
  Trading_turnover: number;
};

export async function getStockHistory(symbol: string): Promise<StockHistory> {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setFullYear(startDate.getFullYear() - 1);

  const start = formatDate(startDate);
  const end = formatDate(endDate);

  const adjusted = await fetchFinMindPrices("TaiwanStockPriceAdj", symbol, start, end);
  const adjustedReason = adjusted.ok ? null : adjusted.reason;

  if (adjusted.ok && adjusted.points.length > 0) {
    return {
      dataset: "TaiwanStockPriceAdj",
      isAdjusted: true,
      points: adjusted.points,
      unavailableReason: null,
    };
  }

  const regular = await fetchFinMindPrices("TaiwanStockPrice", symbol, start, end);

  if (regular.ok && regular.points.length > 0) {
    return {
      dataset: "TaiwanStockPrice",
      isAdjusted: false,
      points: regular.points,
      unavailableReason:
        adjustedReason ?? "FinMind 還原股價需要會員權限，已改用一般歷史日線。",
    };
  }

  const regularReason = regular.ok ? null : regular.reason;

  return {
    dataset: "TaiwanStockPrice",
    isAdjusted: false,
    points: [],
    unavailableReason: regularReason ?? adjustedReason ?? "無法取得歷史股價資料。",
  };
}

async function fetchFinMindPrices(
  dataset: FinMindDataset,
  symbol: string,
  startDate: string,
  endDate: string,
): Promise<{ ok: true; points: StockPricePoint[] } | { ok: false; reason: string }> {
  const url = new URL(FINMIND_BASE_URL);
  url.searchParams.set("dataset", dataset);
  url.searchParams.set("data_id", symbol);
  url.searchParams.set("start_date", startDate);
  url.searchParams.set("end_date", endDate);

  const headers: HeadersInit = {
    Accept: "application/json",
  };

  if (process.env.FINMIND_API_TOKEN) {
    headers.Authorization = `Bearer ${process.env.FINMIND_API_TOKEN}`;
  }

  try {
    const response = await fetch(url, { headers });
    const payload = (await response.json()) as FinMindResponse<FinMindStockPriceRow>;

    if (!response.ok || payload.status !== 200 || !payload.data) {
      return {
        ok: false,
        reason: payload.msg || `FinMind ${dataset} request failed.`,
      };
    }

    return {
      ok: true,
      points: payload.data.map(toStockPricePoint),
    };
  } catch {
    return {
      ok: false,
      reason: `無法連線到 FinMind ${dataset}。`,
    };
  }
}

function toStockPricePoint(row: FinMindStockPriceRow): StockPricePoint {
  return {
    date: row.date,
    open: row.open,
    high: row.max,
    low: row.min,
    close: row.close,
    change: row.spread,
    tradeVolume: row.Trading_Volume,
    tradeValue: row.Trading_money,
    transactionCount: row.Trading_turnover,
  };
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

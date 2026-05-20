import type {
  StockHistory,
  StockMonthlyRevenue,
  StockPricePoint,
  StockRevenue,
} from "../types/stocks.types";

const FINMIND_BASE_URL = "https://api.finmindtrade.com/api/v4/data";

type FinMindDataset =
  | "TaiwanStockPrice"
  | "TaiwanStockPriceAdj"
  | "TaiwanStockMonthRevenue";

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

type FinMindMonthlyRevenueRow = {
  date: string;
  stock_id: string;
  country: string;
  revenue: number;
  revenue_month: number;
  revenue_year: number;
  create_time: string;
};

export async function getStockHistory(symbol: string): Promise<StockHistory> {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setFullYear(startDate.getFullYear() - 1);

  const start = formatDate(startDate);
  const end = formatDate(endDate);

  const adjusted = await fetchFinMind<FinMindStockPriceRow>(
    "TaiwanStockPriceAdj",
    symbol,
    start,
    end,
  );
  const adjustedReason = adjusted.ok ? null : adjusted.reason;

  if (adjusted.ok && adjusted.rows.length > 0) {
    return {
      dataset: "TaiwanStockPriceAdj",
      isAdjusted: true,
      points: adjusted.rows.map(toStockPricePoint),
      unavailableReason: null,
    };
  }

  const regular = await fetchFinMind<FinMindStockPriceRow>(
    "TaiwanStockPrice",
    symbol,
    start,
    end,
  );

  if (regular.ok && regular.rows.length > 0) {
    return {
      dataset: "TaiwanStockPrice",
      isAdjusted: false,
      points: regular.rows.map(toStockPricePoint),
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

export async function getStockRevenue(symbol: string): Promise<StockRevenue> {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setMonth(startDate.getMonth() - 24);

  const response = await fetchFinMind<FinMindMonthlyRevenueRow>(
    "TaiwanStockMonthRevenue",
    symbol,
    formatDate(startDate),
    formatDate(endDate),
  );

  if (!response.ok) {
    return {
      dataset: "TaiwanStockMonthRevenue",
      points: [],
      unavailableReason: response.reason,
    };
  }

  const rows = response.rows
    .map(toMonthlyRevenue)
    .sort((a, b) => a.date.localeCompare(b.date));

  const points = rows.map((point, index) => {
    const previous = rows[index - 1];
    const previousYear = rows.find(
      (candidate) =>
        candidate.revenueYear === point.revenueYear - 1 &&
        candidate.revenueMonth === point.revenueMonth,
    );

    return {
      ...point,
      momPercent:
        previous && previous.revenue !== 0
          ? round(((point.revenue - previous.revenue) / previous.revenue) * 100, 2)
          : null,
      yoyPercent:
        previousYear && previousYear.revenue !== 0
          ? round(((point.revenue - previousYear.revenue) / previousYear.revenue) * 100, 2)
          : null,
    };
  });

  return {
    dataset: "TaiwanStockMonthRevenue",
    points,
    unavailableReason: points.length > 0 ? null : "FinMind 沒有回傳月營收資料。",
  };
}

async function fetchFinMind<T>(
  dataset: FinMindDataset,
  symbol: string,
  startDate: string,
  endDate: string,
): Promise<{ ok: true; rows: T[] } | { ok: false; reason: string }> {
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
    const payload = (await response.json()) as FinMindResponse<T>;

    if (!response.ok || payload.status !== 200 || !payload.data) {
      return {
        ok: false,
        reason: payload.msg || `FinMind ${dataset} request failed.`,
      };
    }

    return {
      ok: true,
      rows: payload.data,
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

function toMonthlyRevenue(row: FinMindMonthlyRevenueRow): Omit<
  StockMonthlyRevenue,
  "momPercent" | "yoyPercent"
> {
  return {
    date: row.date,
    revenue: row.revenue,
    revenueMonth: row.revenue_month,
    revenueYear: row.revenue_year,
    announceDate: row.create_time || null,
  };
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function round(value: number, digits: number) {
  const base = 10 ** digits;
  return Math.round(value * base) / base;
}

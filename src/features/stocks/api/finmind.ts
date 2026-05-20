import type {
  DataAccessLevel,
  DataSourceInfo,
  DataSourceStatus,
  InstrumentType,
  StockFinancialPeriod,
  StockFinancials,
  StockHistory,
  StockInstrumentProfile,
  StockMonthlyRevenue,
  StockPricePoint,
  StockRevenue,
} from "../types/stocks.types";

const FINMIND_BASE_URL = "https://api.finmindtrade.com/api/v4/data";

type FinMindDataset =
  | "TaiwanStockInfo"
  | "TaiwanStockPrice"
  | "TaiwanStockPriceAdj"
  | "TaiwanStockMonthRevenue"
  | "TaiwanStockFinancialStatements"
  | "TaiwanStockBalanceSheet"
  | "TaiwanStockCashFlowsStatement";

type FinMindResponse<T> = {
  msg: string;
  status: number;
  data?: T[];
};

type FinMindFailure = {
  code: DataSourceStatus;
  message: string;
  rawMessage: string;
};

type FinMindResult<T> =
  | { ok: true; rows: T[] }
  | { ok: false; failure: FinMindFailure };

type FinMindStockInfoRow = {
  industry_category?: string;
  stock_id: string;
  stock_name?: string;
  type?: string;
  date?: string;
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

type FinMindFinancialRow = {
  date: string;
  stock_id: string;
  type: string;
  value: number;
  origin_name: string;
};

type FinancialRowsByDate = Map<string, FinMindFinancialRow[]>;

const dataSourceMeta: Record<
  FinMindDataset,
  { accessLevel: DataAccessLevel; label: string }
> = {
  TaiwanStockInfo: { accessLevel: "free_safe", label: "FinMind 標的分類" },
  TaiwanStockPrice: { accessLevel: "free_safe", label: "FinMind 一般股價" },
  TaiwanStockPriceAdj: { accessLevel: "premium", label: "FinMind 還原股價" },
  TaiwanStockMonthRevenue: { accessLevel: "free_safe", label: "FinMind 月營收" },
  TaiwanStockFinancialStatements: { accessLevel: "free_safe", label: "FinMind 損益表" },
  TaiwanStockBalanceSheet: { accessLevel: "free_safe", label: "FinMind 資產負債表" },
  TaiwanStockCashFlowsStatement: { accessLevel: "free_safe", label: "FinMind 現金流量表" },
};

export async function getInstrumentProfile(symbol: string): Promise<StockInstrumentProfile> {
  const response = await fetchFinMind<FinMindStockInfoRow>(
    "TaiwanStockInfo",
    symbol,
    undefined,
    undefined,
  );

  if (!response.ok) {
    return {
      type: "unknown",
      category: null,
      source: createFinMindSource(
        "instrument-profile",
        "TaiwanStockInfo",
        response.failure.code,
        response.failure.message,
      ),
    };
  }

  const row = response.rows.find((item) => item.stock_id === symbol) ?? response.rows[0];
  const category = row?.industry_category?.trim() || null;
  const type: InstrumentType = category?.toLowerCase() === "etf" ? "etf" : "stock";

  return {
    type,
    category,
    source: createFinMindSource(
      "instrument-profile",
      "TaiwanStockInfo",
      "available",
      category ? `標的分類為 ${category}。` : "標的分類資料可用。",
    ),
  };
}

export function getFinancialsNotApplicableForEtf(): StockFinancials {
  const message = "ETF 不適用公司財務三表，此頁保留交易、股價與成交資訊。";

  return {
    datasets: {
      incomeStatement: "TaiwanStockFinancialStatements",
      balanceSheet: "TaiwanStockBalanceSheet",
      cashFlow: "TaiwanStockCashFlowsStatement",
    },
    periods: [],
    unavailableReason: message,
    source: {
      id: "financials",
      label: "FinMind 財報三表",
      provider: "FinMind",
      dataset:
        "TaiwanStockFinancialStatements / TaiwanStockBalanceSheet / TaiwanStockCashFlowsStatement",
      accessLevel: "free_safe",
      status: "no_data",
      message,
    },
  };
}

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

  if (adjusted.ok && adjusted.rows.length > 0) {
    return {
      dataset: "TaiwanStockPriceAdj",
      isAdjusted: true,
      points: adjusted.rows.map(toStockPricePoint),
      unavailableReason: null,
      source: createFinMindSource("history-adjusted", "TaiwanStockPriceAdj", "available"),
    };
  }

  const regular = await fetchFinMind<FinMindStockPriceRow>(
    "TaiwanStockPrice",
    symbol,
    start,
    end,
  );

  if (regular.ok && regular.rows.length > 0) {
    const adjustedFailure = adjusted.ok ? null : adjusted.failure;

    return {
      dataset: "TaiwanStockPrice",
      isAdjusted: false,
      points: regular.rows.map(toStockPricePoint),
      unavailableReason: adjustedFailure
        ? "進階還原股價需要 FinMind sponsor 權限，目前使用一般股價。"
        : null,
      source: createFinMindSource(
        "history",
        "TaiwanStockPrice",
        adjustedFailure ? "fallback" : "available",
        adjustedFailure ? "還原股價不可用，已降級使用一般股價。" : "一般股價資料可用。",
      ),
    };
  }

  const failure = regular.ok
    ? createFailure("no_data", "FinMind 一般股價暫無資料。", "")
    : regular.failure;

  return {
    dataset: "TaiwanStockPrice",
    isAdjusted: false,
    points: [],
    unavailableReason: failure.message,
    source: createFinMindSource("history", "TaiwanStockPrice", failure.code, failure.message),
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
      unavailableReason: response.failure.message,
      source: createFinMindSource(
        "monthly-revenue",
        "TaiwanStockMonthRevenue",
        response.failure.code,
        response.failure.message,
      ),
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
  const status: DataSourceStatus = points.length > 0 ? "available" : "no_data";
  const message = points.length > 0 ? "月營收資料可用。" : "FinMind 暫無月營收資料。";

  return {
    dataset: "TaiwanStockMonthRevenue",
    points,
    unavailableReason: points.length > 0 ? null : message,
    source: createFinMindSource("monthly-revenue", "TaiwanStockMonthRevenue", status, message),
  };
}

export async function getStockFinancials(symbol: string): Promise<StockFinancials> {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setFullYear(startDate.getFullYear() - 2);

  const start = formatDate(startDate);
  const end = formatDate(endDate);
  const [income, balance, cashFlow] = await Promise.all([
    fetchFinMind<FinMindFinancialRow>("TaiwanStockFinancialStatements", symbol, start, end),
    fetchFinMind<FinMindFinancialRow>("TaiwanStockBalanceSheet", symbol, start, end),
    fetchFinMind<FinMindFinancialRow>("TaiwanStockCashFlowsStatement", symbol, start, end),
  ]);

  const failures = [income, balance, cashFlow]
    .filter((result): result is { ok: false; failure: FinMindFailure } => !result.ok)
    .map((result) => result.failure);
  const incomeRows = income.ok ? groupFinancialRowsByDate(income.rows) : new Map();
  const balanceRows = balance.ok ? groupFinancialRowsByDate(balance.rows) : new Map();
  const cashFlowRows = cashFlow.ok ? groupFinancialRowsByDate(cashFlow.rows) : new Map();
  const dates = Array.from(
    new Set([...incomeRows.keys(), ...balanceRows.keys(), ...cashFlowRows.keys()]),
  ).sort((a, b) => b.localeCompare(a));
  const periods = dates.map((date) =>
    toFinancialPeriod(date, incomeRows, balanceRows, cashFlowRows),
  );
  const status = getAggregateStatus(periods.length, failures);
  const message = getAggregateMessage(periods.length, failures, "財報三表資料可用。");

  return {
    datasets: {
      incomeStatement: "TaiwanStockFinancialStatements",
      balanceSheet: "TaiwanStockBalanceSheet",
      cashFlow: "TaiwanStockCashFlowsStatement",
    },
    periods,
    unavailableReason: status === "available" ? null : message,
    source: {
      id: "financials",
      label: "FinMind 財報三表",
      provider: "FinMind",
      dataset:
        "TaiwanStockFinancialStatements / TaiwanStockBalanceSheet / TaiwanStockCashFlowsStatement",
      accessLevel: "free_safe",
      status,
      message,
    },
  };
}

export function createFinMindSource(
  id: string,
  dataset: FinMindDataset,
  status: DataSourceStatus,
  message?: string,
): DataSourceInfo {
  const meta = dataSourceMeta[dataset];

  return {
    id,
    label: meta.label,
    provider: "FinMind",
    dataset,
    accessLevel: meta.accessLevel,
    status,
    message: message ?? getDefaultStatusMessage(status),
  };
}

async function fetchFinMind<T>(
  dataset: FinMindDataset,
  symbol: string,
  startDate?: string,
  endDate?: string,
): Promise<FinMindResult<T>> {
  const url = new URL(FINMIND_BASE_URL);
  url.searchParams.set("dataset", dataset);
  url.searchParams.set("data_id", symbol);

  if (startDate) {
    url.searchParams.set("start_date", startDate);
  }

  if (endDate) {
    url.searchParams.set("end_date", endDate);
  }

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
        failure: normalizeFinMindFailure(payload.msg, payload.status, dataset),
      };
    }

    if (payload.data.length === 0) {
      return {
        ok: false,
        failure: createFailure("no_data", `${dataSourceMeta[dataset].label} 暫無資料。`, ""),
      };
    }

    return {
      ok: true,
      rows: payload.data,
    };
  } catch {
    return {
      ok: false,
      failure: createFailure("error", `暫時無法連線 ${dataSourceMeta[dataset].label}。`, ""),
    };
  }
}

function normalizeFinMindFailure(
  rawMessage: string | undefined,
  status: number | undefined,
  dataset: FinMindDataset,
) {
  const message = rawMessage ?? "";
  const normalized = message.toLowerCase();

  if (
    normalized.includes("your level is free") ||
    normalized.includes("sponsor") ||
    normalized.includes("update your user level")
  ) {
    return createFailure(
      "premium_required",
      `${dataSourceMeta[dataset].label} 需要 FinMind sponsor 權限。`,
      message,
    );
  }

  if (status === 402 || normalized.includes("upper limit") || normalized.includes("rate")) {
    return createFailure(
      "rate_limited",
      "FinMind API 額度已達上限，請稍後再試或設定 token。",
      message,
    );
  }

  return createFailure("error", `${dataSourceMeta[dataset].label} 暫時無法取得。`, message);
}

function createFailure(
  code: DataSourceStatus,
  message: string,
  rawMessage: string,
): FinMindFailure {
  return { code, message, rawMessage };
}

function getAggregateStatus(rowCount: number, failures: FinMindFailure[]): DataSourceStatus {
  if (rowCount > 0 && failures.length === 0) {
    return "available";
  }

  if (rowCount > 0) {
    return "fallback";
  }

  return failures[0]?.code ?? "no_data";
}

function getAggregateMessage(
  rowCount: number,
  failures: FinMindFailure[],
  availableMessage: string,
) {
  if (rowCount > 0 && failures.length === 0) {
    return availableMessage;
  }

  if (rowCount > 0) {
    return `部分資料源暫不可用：${failures.map((failure) => failure.message).join("；")}`;
  }

  return failures[0]?.message ?? "FinMind 暫無資料。";
}

function getDefaultStatusMessage(status: DataSourceStatus) {
  const messages: Record<DataSourceStatus, string> = {
    available: "資料可用。",
    fallback: "已使用替代資料。",
    premium_required: "需要進階權限。",
    rate_limited: "API 額度已達上限。",
    no_data: "目前暫無資料。",
    error: "資料源暫時無法取得。",
  };

  return messages[status];
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

function toFinancialPeriod(
  date: string,
  incomeRows: FinancialRowsByDate,
  balanceRows: FinancialRowsByDate,
  cashFlowRows: FinancialRowsByDate,
): StockFinancialPeriod {
  const income = incomeRows.get(date) ?? [];
  const balance = balanceRows.get(date) ?? [];
  const cashFlow = cashFlowRows.get(date) ?? [];
  const revenue = getFinancialValue(income, "Revenue");
  const grossProfit = getFinancialValue(income, "GrossProfit");
  const operatingIncome = getFinancialValue(income, "OperatingIncome");
  const netIncome =
    getFinancialValue(income, "IncomeAfterTaxes") ??
    getFinancialValue(income, "IncomeAfterTax") ??
    getFinancialValue(income, "EquityAttributableToOwnersOfParent");
  const totalAssets = getFinancialValue(balance, "TotalAssets");
  const totalLiabilities = getFinancialValue(balance, "Liabilities");
  const equity = getFinancialValue(balance, "Equity");
  const currentAssets = getFinancialValue(balance, "CurrentAssets");
  const currentLiabilities = getFinancialValue(balance, "CurrentLiabilities");
  const operatingCashFlow =
    getFinancialValue(cashFlow, "CashFlowsFromOperatingActivities") ??
    getFinancialValue(cashFlow, "NetCashInflowFromOperatingActivities");
  const capitalExpenditure = getFinancialValue(cashFlow, "PropertyAndPlantAndEquipment");

  return {
    date,
    incomeStatement: {
      revenue,
      grossProfit,
      operatingIncome,
      netIncome,
      eps: getFinancialValue(income, "EPS"),
      grossMargin: percentage(grossProfit, revenue),
      operatingMargin: percentage(operatingIncome, revenue),
      netMargin: percentage(netIncome, revenue),
    },
    balanceSheet: {
      totalAssets,
      totalLiabilities,
      equity,
      cashAndEquivalents: getFinancialValue(balance, "CashAndCashEquivalents"),
      currentAssets,
      currentLiabilities,
      debtRatio: percentage(totalLiabilities, totalAssets),
      currentRatio:
        currentAssets !== null && currentLiabilities !== null && currentLiabilities !== 0
          ? round(currentAssets / currentLiabilities, 2)
          : null,
    },
    cashFlow: {
      operatingCashFlow,
      investingCashFlow: getFinancialValue(cashFlow, "CashProvidedByInvestingActivities"),
      financingCashFlow: getFinancialValue(cashFlow, "CashFlowsProvidedFromFinancingActivities"),
      endingCash: getFinancialValue(cashFlow, "CashBalancesEndOfPeriod"),
      capitalExpenditure,
      freeCashFlow:
        operatingCashFlow !== null && capitalExpenditure !== null
          ? operatingCashFlow + capitalExpenditure
          : null,
    },
  };
}

function groupFinancialRowsByDate(rows: FinMindFinancialRow[]) {
  return rows.reduce<FinancialRowsByDate>((groups, row) => {
    const current = groups.get(row.date) ?? [];
    current.push(row);
    groups.set(row.date, current);
    return groups;
  }, new Map());
}

function getFinancialValue(rows: FinMindFinancialRow[], type: string) {
  const row = rows.find((candidate) => candidate.type === type);
  return row && Number.isFinite(row.value) ? row.value : null;
}

function percentage(numerator: number | null, denominator: number | null) {
  if (numerator === null || denominator === null || denominator === 0) {
    return null;
  }

  return round((numerator / denominator) * 100, 2);
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function round(value: number, digits: number) {
  const base = 10 ** digits;
  return Math.round(value * base) / base;
}

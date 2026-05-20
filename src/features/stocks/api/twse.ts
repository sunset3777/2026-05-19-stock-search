import type { StockDetail, StockListResult, StockSummary } from "../types/stocks.types";
import { getStockHistory, getStockRevenue } from "./finmind";

const TWSE_BASE_URL = "https://openapi.twse.com.tw/v1";

type TwseDailyRow = {
  Date: string;
  Code: string;
  Name: string;
  TradeVolume: string;
  TradeValue: string;
  OpeningPrice: string;
  HighestPrice: string;
  LowestPrice: string;
  ClosingPrice: string;
  Change: string;
  Transaction: string;
};

type TwseAverageRow = {
  Date: string;
  Code: string;
  Name: string;
  ClosingPrice: string;
  MonthlyAveragePrice: string;
};

type TwseValuationRow = {
  Date: string;
  Code: string;
  Name: string;
  PEratio: string;
  DividendYield: string;
  PBratio: string;
};

type TwseCompanyRow = {
  出表日期?: string;
  公司代號?: string;
  公司名稱?: string;
  公司簡稱?: string;
  產業別?: string;
  地址?: string;
  董事長?: string;
  總經理?: string;
  上市日期?: string;
  實收資本額?: string;
  網址?: string;
};

type TwseDatasets = {
  daily: TwseDailyRow[];
  averages: TwseAverageRow[];
  valuations: TwseValuationRow[];
  companies: TwseCompanyRow[];
};

async function fetchTwse<T>(path: string): Promise<T> {
  const response = await fetch(`${TWSE_BASE_URL}${path}`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`TWSE request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function fetchTwseDatasets(): Promise<TwseDatasets> {
  const [daily, averages, valuations, companies] = await Promise.all([
    fetchTwse<TwseDailyRow[]>("/exchangeReport/STOCK_DAY_ALL"),
    fetchTwse<TwseAverageRow[]>("/exchangeReport/STOCK_DAY_AVG_ALL"),
    fetchTwse<TwseValuationRow[]>("/exchangeReport/BWIBBU_ALL"),
    fetchTwse<TwseCompanyRow[]>("/opendata/t187ap03_L"),
  ]);

  return { daily, averages, valuations, companies };
}

export async function getStockList(query: string, limit: number): Promise<StockListResult> {
  const { daily, companies } = await fetchTwseDatasets();
  const companyBySymbol = createCompanyMap(companies);
  const normalizedQuery = query.trim().toLowerCase();

  const stocks = daily
    .filter((row) => /^\d{4}$/.test(row.Code))
    .map((row) => toStockSummary(row, companyBySymbol.get(row.Code)))
    .filter((stock) => {
      if (!normalizedQuery) {
        return true;
      }

      return (
        stock.symbol.toLowerCase().includes(normalizedQuery) ||
        stock.name.toLowerCase().includes(normalizedQuery) ||
        (stock.industry ?? "").toLowerCase().includes(normalizedQuery)
      );
    })
    .slice(0, limit);

  return {
    stocks,
    source: {
      provider: "TWSE",
      updatedDate: stocks[0]?.date ?? null,
    },
  };
}

export async function getStockDetail(symbol: string): Promise<StockDetail | null> {
  const normalizedSymbol = symbol.trim().toUpperCase();
  const [{ daily, averages, valuations, companies }, history, revenue] = await Promise.all([
    fetchTwseDatasets(),
    getStockHistory(normalizedSymbol),
    getStockRevenue(normalizedSymbol),
  ]);
  const dailyRow = daily.find((row) => row.Code.toUpperCase() === normalizedSymbol);

  if (!dailyRow) {
    return null;
  }

  const company = createCompanyMap(companies).get(dailyRow.Code);
  const average = averages.find((row) => row.Code === dailyRow.Code);
  const valuation = valuations.find((row) => row.Code === dailyRow.Code);
  const summary = toStockSummary(dailyRow, company);

  return {
    summary,
    ohlc: {
      open: parseNumber(dailyRow.OpeningPrice),
      high: parseNumber(dailyRow.HighestPrice),
      low: parseNumber(dailyRow.LowestPrice),
      close: parseNumber(dailyRow.ClosingPrice),
    },
    valuation: valuation
      ? {
          peRatio: parseNumber(valuation.PEratio),
          dividendYield: parseNumber(valuation.DividendYield),
          pbRatio: parseNumber(valuation.PBratio),
        }
      : null,
    monthlyAveragePrice: average ? parseNumber(average.MonthlyAveragePrice) : null,
    company: company ? toCompany(company) : null,
    history,
    revenue,
    source: {
      provider: "TWSE",
      updatedDate: summary.date,
    },
  };
}

function createCompanyMap(companies: TwseCompanyRow[]) {
  return new Map(
    companies
      .filter((company) => company.公司代號)
      .map((company) => [String(company.公司代號), company]),
  );
}

function toStockSummary(row: TwseDailyRow, company?: TwseCompanyRow): StockSummary {
  const closePrice = parseNumber(row.ClosingPrice);
  const change = parseNumber(row.Change);
  const previousClose =
    closePrice !== null && change !== null ? closePrice - change : null;
  const changePercent =
    previousClose && previousClose !== 0 && change !== null
      ? round((change / previousClose) * 100, 2)
      : null;

  return {
    symbol: row.Code,
    name: cleanText(company?.公司簡稱) ?? cleanText(row.Name) ?? row.Code,
    date: formatMinguoDate(row.Date),
    closePrice,
    change,
    changePercent,
    tradeVolume: parseNumber(row.TradeVolume),
    tradeValue: parseNumber(row.TradeValue),
    transactionCount: parseNumber(row.Transaction),
    industry: company?.產業別 ? `產業代號 ${company.產業別}` : null,
    sparkline: createSparkline(row),
  };
}

function toCompany(row: TwseCompanyRow): StockDetail["company"] {
  return {
    chairman: cleanText(row.董事長),
    generalManager: cleanText(row.總經理),
    listingDate: row.上市日期 ? formatGregorianCompactDate(row.上市日期) : null,
    market: "上市",
    industry: row.產業別 ? `產業代號 ${row.產業別}` : null,
    capital: parseNumber(row.實收資本額 ?? ""),
    address: cleanText(row.地址),
    website: cleanText(row.網址),
  };
}

function createSparkline(row: TwseDailyRow) {
  const open = parseNumber(row.OpeningPrice);
  const high = parseNumber(row.HighestPrice);
  const low = parseNumber(row.LowestPrice);
  const close = parseNumber(row.ClosingPrice);
  const change = parseNumber(row.Change) ?? 0;

  if (open === null || high === null || low === null || close === null) {
    return [0, 0, 0, 0, 0, 0];
  }

  const previous = close - change;

  return [previous, open, (open + high) / 2, high, low, close].map((value) =>
    round(value, 2),
  );
}

function parseNumber(value: string) {
  const normalized = value.replace(/,/g, "").trim();

  if (!normalized || normalized === "--") {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function cleanText(value?: string) {
  const normalized = value?.trim();
  return normalized && normalized !== "－" ? normalized : null;
}

function formatMinguoDate(value: string) {
  if (!/^\d{7}$/.test(value)) {
    return value;
  }

  const year = Number(value.slice(0, 3)) + 1911;
  const month = value.slice(3, 5);
  const day = value.slice(5, 7);

  return `${year}-${month}-${day}`;
}

function formatGregorianCompactDate(value: string) {
  if (!/^\d{8}$/.test(value)) {
    return value;
  }

  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}

function round(value: number, digits: number) {
  const base = 10 ** digits;
  return Math.round(value * base) / base;
}

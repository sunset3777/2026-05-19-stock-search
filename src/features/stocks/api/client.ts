import type { ApiResponse, StockDetail, StockListResult } from "../types/stocks.types";

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || "error" in payload) {
    const message = "error" in payload ? payload.error.message : "資料讀取失敗";
    throw new Error(message);
  }

  return payload.data;
}

export function fetchStockList(query: string, limit = 80) {
  const params = new URLSearchParams();

  if (query.trim()) {
    params.set("q", query.trim());
  }

  params.set("limit", String(limit));

  return fetchJson<StockListResult>(`/api/stocks?${params.toString()}`);
}

export function fetchStockDetail(symbol: string) {
  return fetchJson<StockDetail>(`/api/stocks/${encodeURIComponent(symbol)}`);
}

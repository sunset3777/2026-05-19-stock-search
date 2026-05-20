import type { NextApiRequest, NextApiResponse } from "next";
import { getStockDetail } from "@/features/stocks/api/twse";
import type { ApiResponse, StockDetail } from "@/features/stocks/types/stocks.types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<StockDetail>>,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: { code: "method_not_allowed", message: "只支援 GET" } });
    return;
  }

  const symbol = typeof req.query.symbol === "string" ? req.query.symbol : "";

  if (!symbol.trim()) {
    res.status(400).json({ error: { code: "missing_symbol", message: "缺少股票代號。" } });
    return;
  }

  try {
    const data = await getStockDetail(symbol);

    if (!data) {
      res.status(404).json({
        error: {
          code: "stock_not_found",
          message: "找不到這個上市股票代號。",
        },
      });
      return;
    }

    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    res.status(200).json({ data });
  } catch {
    res.status(502).json({
      error: {
        code: "twse_fetch_failed",
        message: "無法讀取 TWSE 公開資料，請稍後再試。",
      },
    });
  }
}

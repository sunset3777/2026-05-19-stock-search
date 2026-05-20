import type { NextApiRequest, NextApiResponse } from "next";
import { getStockList } from "@/features/stocks/api/twse";
import type { ApiResponse, StockListResult } from "@/features/stocks/types/stocks.types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<StockListResult>>,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: { code: "method_not_allowed", message: "只支援 GET" } });
    return;
  }

  try {
    const query = typeof req.query.q === "string" ? req.query.q : "";
    const rawLimit = typeof req.query.limit === "string" ? Number(req.query.limit) : 80;
    const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 200) : 80;
    const data = await getStockList(query, limit);

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

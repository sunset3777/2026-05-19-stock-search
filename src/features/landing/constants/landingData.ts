import type {
  AgentInsight,
  ChartPoint,
  MarketNews,
  StockProfile,
  TechnicalSnapshot,
  TimeRange,
} from "../types/landing.types";

const ranges: TimeRange[] = ["1D", "5D", "1M", "6M", "1Y"];

function createSeries(base: number, values: number[]): Record<TimeRange, ChartPoint[]> {
  return ranges.reduce(
    (series, range, rangeIndex) => {
      series[range] = values.map((value, index) => ({
        label: range === "1D" ? `${9 + index}:00` : `T-${values.length - index - 1}`,
        value: Math.round((base + value + rangeIndex * 3) * 10) / 10,
      }));
      return series;
    },
    {} as Record<TimeRange, ChartPoint[]>,
  );
}

function createTechnicals(name: string): Record<TimeRange, TechnicalSnapshot> {
  return {
    "1D": {
      trend: `${name} 盤中維持區間震盪`,
      momentum: "短線動能偏中性",
      support: "靠近開盤低點形成第一層支撐",
      resistance: "上檔需觀察前高是否放量突破",
      volume: "量能集中在早盤與尾盤",
    },
    "5D": {
      trend: "五日線附近整理",
      momentum: "追價力道尚未明顯擴散",
      support: "短線支撐落在週內低點區",
      resistance: "週內高點為第一壓力",
      volume: "成交量略高於近週平均",
    },
    "1M": {
      trend: "月線趨勢偏多但斜率放緩",
      momentum: "動能仍在，需確認量價同步",
      support: "月線附近具觀察價值",
      resistance: "整理區上緣為主要壓力",
      volume: "量能維持溫和放大",
    },
    "6M": {
      trend: "中期趨勢仍維持上行結構",
      momentum: "波段動能較短線穩定",
      support: "季線附近是中期支撐",
      resistance: "前波大量區可能形成壓力",
      volume: "量能結構健康但未過熱",
    },
    "1Y": {
      trend: "長期趨勢由基本面敘事支撐",
      momentum: "評價面需搭配獲利成長檢查",
      support: "年度整理平台具長線參考性",
      resistance: "歷史高檔區需留意估值壓力",
      volume: "長線資金關注度維持高檔",
    },
  };
}

export const stockProfiles: StockProfile[] = [
  {
    symbol: "2330",
    name: "台積電",
    industry: "半導體製造",
    business:
      "全球先進製程晶圓代工龍頭，核心需求來自高效能運算、智慧手機、車用電子與 AI 加速器。",
    price: 875,
    changePercent: 1.42,
    marketCap: "22.7 兆",
    revenue: "月營收年增 34%",
    riskLevel: "medium",
    agentStatus: "分析完成",
    thesis:
      "先進製程需求仍是主要成長引擎，AI 伺服器與高效能運算提供中長期支撐，但短線需留意估值與匯率波動。",
    highlights: ["AI 伺服器需求", "3nm 產能利用率", "海外擴廠成本"],
    trend: "up",
    sparkline: [38, 42, 41, 46, 51, 55, 61, 59, 66, 72],
    fundamentals: [
      { label: "營收動能", value: "高", note: "AI 與 HPC 需求延續" },
      { label: "毛利率", value: "穩健", note: "先進製程組合支撐" },
      { label: "資本支出", value: "偏高", note: "需追蹤海外建廠成本" },
    ],
    peers: [
      { symbol: "2454", name: "聯發科", industry: "IC 設計", changePercent: -0.58, note: "終端需求復甦速度是關鍵" },
      { symbol: "2308", name: "台達電", industry: "電源管理", changePercent: 2.18, note: "資料中心電源需求受惠" },
      { symbol: "2317", name: "鴻海", industry: "電子製造", changePercent: 0.31, note: "AI 伺服器占比提升" },
    ],
    risks: [
      { title: "估值風險", level: "medium", description: "市場已反映部分 AI 成長預期，短線評價修正需留意。" },
      { title: "匯率風險", level: "medium", description: "新台幣波動可能影響財報換算與市場情緒。" },
      { title: "產能風險", level: "low", description: "先進製程需求強，但海外擴產進度仍需追蹤。" },
    ],
    agentReport: {
      technical: "趨勢偏多，但短線已接近整理區上緣，需等待量能確認突破。",
      risk: "主要風險來自估值與匯率，基本面支撐仍在。",
      direction: "中長期方向仍取決於 AI 與 HPC 訂單能見度。",
      suggestion: "保守投資人可等待拉回，積極投資人需設定明確停損與分批策略。",
    },
    chartSeries: createSeries(850, [5, 8, 3, 11, 14, 20, 18, 26, 23, 31]),
    technicals: createTechnicals("台積電"),
  },
  {
    symbol: "2454",
    name: "聯發科",
    industry: "IC 設計",
    business:
      "聚焦手機晶片、智慧裝置、車用與連網晶片，營運受產品週期、庫存水位與高階平台競爭影響。",
    price: 1210,
    changePercent: -0.58,
    marketCap: "1.9 兆",
    revenue: "季度毛利率改善",
    riskLevel: "medium",
    agentStatus: "等待新聞更新",
    thesis:
      "產品組合升級有助中期表現，但手機需求復甦速度與高階平台競爭仍是主要變數。",
    highlights: ["旗艦手機晶片", "邊緣 AI 裝置", "庫存週期"],
    trend: "flat",
    sparkline: [58, 60, 57, 56, 59, 61, 60, 62, 61, 63],
    fundamentals: [
      { label: "營收動能", value: "中", note: "手機需求溫和復甦" },
      { label: "毛利率", value: "改善", note: "產品組合升級" },
      { label: "庫存", value: "下降", note: "通路水位逐步正常化" },
    ],
    peers: [
      { symbol: "2330", name: "台積電", industry: "半導體製造", changePercent: 1.42, note: "先進製程需求強" },
      { symbol: "2308", name: "台達電", industry: "電源管理", changePercent: 2.18, note: "資料中心動能較明確" },
      { symbol: "2317", name: "鴻海", industry: "電子製造", changePercent: 0.31, note: "AI 伺服器題材延續" },
    ],
    risks: [
      { title: "需求風險", level: "medium", description: "消費電子復甦速度仍有不確定性。" },
      { title: "競爭風險", level: "medium", description: "高階手機平台競爭可能壓抑獲利彈性。" },
      { title: "庫存風險", level: "low", description: "庫存水位已有改善，但仍需追蹤通路拉貨。" },
    ],
    agentReport: {
      technical: "價格呈區間震盪，尚未出現明確波段突破。",
      risk: "需求復甦速度與高階平台競爭是主要風險。",
      direction: "若旗艦平台放量，毛利率有機會維持改善。",
      suggestion: "適合等待區間突破或財報確認後再提高部位。",
    },
    chartSeries: createSeries(1180, [8, 4, 0, -3, 2, 5, 1, 6, 4, 9]),
    technicals: createTechnicals("聯發科"),
  },
  {
    symbol: "2308",
    name: "台達電",
    industry: "電源與能源管理",
    business:
      "提供電源管理、散熱、工業自動化與資料中心能源解決方案，受惠節能與 AI 機房建置需求。",
    price: 393,
    changePercent: 2.18,
    marketCap: "1.0 兆",
    revenue: "資料中心動能升溫",
    riskLevel: "low",
    agentStatus: "分析完成",
    thesis:
      "資料中心電源與節能需求提升，提供較穩定的長期成長敘事，波動相對低於高 beta 半導體股。",
    highlights: ["資料中心電源", "工業自動化", "能源效率"],
    trend: "up",
    sparkline: [45, 47, 48, 50, 53, 52, 56, 60, 64, 68],
    fundamentals: [
      { label: "營收動能", value: "穩健", note: "資料中心需求支撐" },
      { label: "產品組合", value: "改善", note: "高效率電源占比提升" },
      { label: "波動", value: "相對低", note: "題材與基本面較均衡" },
    ],
    peers: [
      { symbol: "2330", name: "台積電", industry: "半導體製造", changePercent: 1.42, note: "AI 供應鏈核心" },
      { symbol: "2454", name: "聯發科", industry: "IC 設計", changePercent: -0.58, note: "手機平台復甦觀察" },
      { symbol: "2317", name: "鴻海", industry: "電子製造", changePercent: 0.31, note: "伺服器出貨成長" },
    ],
    risks: [
      { title: "訂單風險", level: "low", description: "需求能見度尚可，但仍需追蹤資料中心建置節奏。" },
      { title: "成本風險", level: "medium", description: "原物料與匯率變化可能影響毛利率。" },
      { title: "評價風險", level: "medium", description: "股價若提前反映題材，短線可能整理。" },
    ],
    agentReport: {
      technical: "中期趨勢偏多，拉回若未跌破支撐仍屬健康整理。",
      risk: "風險結構相對均衡，但需避免追高。",
      direction: "資料中心與能源效率是中長期主軸。",
      suggestion: "可作為穩健型觀察標的，分批比一次性追價更合適。",
    },
    chartSeries: createSeries(370, [2, 3, 5, 7, 10, 9, 13, 17, 20, 24]),
    technicals: createTechnicals("台達電"),
  },
  {
    symbol: "2317",
    name: "鴻海",
    industry: "電子製造服務",
    business:
      "全球 EMS 大廠，布局消費電子、伺服器、電動車與雲端基礎建設，AI 伺服器占比提升是市場焦點。",
    price: 168,
    changePercent: 0.31,
    marketCap: "2.3 兆",
    revenue: "AI 伺服器占比提高",
    riskLevel: "medium",
    agentStatus: "資料整理中",
    thesis:
      "AI 伺服器成長提高評價想像，但低毛利結構仍限制獲利彈性，需追蹤產品組合改善速度。",
    highlights: ["AI 伺服器", "電動車平台", "營益率改善"],
    trend: "flat",
    sparkline: [50, 52, 49, 51, 52, 54, 53, 55, 54, 56],
    fundamentals: [
      { label: "營收動能", value: "中高", note: "AI 伺服器出貨支撐" },
      { label: "毛利率", value: "偏低", note: "EMS 結構限制彈性" },
      { label: "新事業", value: "觀察", note: "電動車平台仍需驗證" },
    ],
    peers: [
      { symbol: "2330", name: "台積電", industry: "半導體製造", changePercent: 1.42, note: "AI 上游能見度高" },
      { symbol: "2454", name: "聯發科", industry: "IC 設計", changePercent: -0.58, note: "產品週期較明顯" },
      { symbol: "2308", name: "台達電", industry: "電源管理", changePercent: 2.18, note: "資料中心題材穩健" },
    ],
    risks: [
      { title: "毛利率風險", level: "medium", description: "營收成長不一定能完全轉化為獲利彈性。" },
      { title: "產品組合風險", level: "medium", description: "AI 伺服器占比提升速度仍需財報驗證。" },
      { title: "新事業風險", level: "medium", description: "電動車布局仍有執行與量產不確定性。" },
    ],
    agentReport: {
      technical: "價格處於整理區，尚未形成明確多空方向。",
      risk: "毛利率與產品組合是判斷評價上修的關鍵。",
      direction: "AI 伺服器出貨若持續提升，中期敘事可延續。",
      suggestion: "適合以財報驗證作為加碼依據，避免只追題材。",
    },
    chartSeries: createSeries(160, [0, 2, -1, 1, 3, 4, 3, 5, 4, 6]),
    technicals: createTechnicals("鴻海"),
  },
];

export const marketNews: MarketNews[] = [
  {
    id: "news-1",
    company: "台積電",
    category: "產業需求",
    date: "2026-05-19",
    title: "AI 晶片需求延續，先進製程能見度維持高檔",
    summary:
      "市場關注高效能運算訂單與海外擴廠成本，短線評價仍受資本支出節奏影響。",
  },
  {
    id: "news-2",
    company: "聯發科",
    category: "產品週期",
    date: "2026-05-18",
    title: "高階手機平台競爭升溫，法人觀察毛利率修復速度",
    summary:
      "新平台放量有助產品組合改善，但終端需求復甦仍需追蹤通路庫存變化。",
  },
  {
    id: "news-3",
    company: "台達電",
    category: "資料中心",
    date: "2026-05-17",
    title: "資料中心電源與散熱題材延續，能源效率成關鍵敘事",
    summary:
      "AI 機房建置帶動高效率電源需求，市場同步評估產能配置與訂單持續性。",
  },
];

export const agentInsights: AgentInsight[] = [
  {
    title: "技術面",
    label: "趨勢",
    description: "比較價格區間、量能變化與短中期趨勢，避免只看單日漲跌。",
  },
  {
    title: "風險評估",
    label: "控管",
    description: "標記估值、波動、流動性與資料不足風險，協助設定觀察條件。",
  },
  {
    title: "發展方向",
    label: "情境",
    description: "以短中長期情境拆解企業成長邏輯與可能的反向風險。",
  },
  {
    title: "投資建議",
    label: "分級",
    description: "依保守、中性、積極風險承受度輸出不同觀察建議，不做絕對指令。",
  },
];

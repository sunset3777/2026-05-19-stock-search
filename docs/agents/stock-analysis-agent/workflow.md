# Stock Analysis Agent Workflow

## Purpose

This document defines the first version of the stock analysis Agent workflow for a Taiwan stock analysis platform.

The Agent focuses on producing a structured stock analysis report from mock data or manually prepared input. It does not require a live market data API in the first version.

## Scope

The Agent should analyze:

- Technical indicators and price trend
- Chart interpretation
- Risk assessment
- Development direction
- Investment suggestion by risk profile

The Agent should not:

- Provide absolute buy or sell instructions
- Claim real-time market accuracy when using mock or manual data
- Hide missing or low-confidence input data
- Replace professional investment advice

## Input Contract

Use `StockAnalysisInput` as the first version input shape.

```ts
type StockMarket = "TW";

type PricePoint = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

type VolumePoint = {
  date: string;
  volume: number;
};

type StockAnalysisInput = {
  symbol: string;
  companyName: string;
  market: StockMarket;
  currentPrice: number;
  priceHistory: PricePoint[];
  volumeHistory: VolumePoint[];
  fundamentalSummary?: string;
  newsSummary?: string;
  userQuestion?: string;
};
```

## Output Contract

Use `StockAnalysisReport` as the first version output shape.

```ts
type ConfidenceLevel = "low" | "medium" | "high";

type RiskLevel = "low" | "medium" | "high";

type InvestmentSuggestion = {
  conservative: string;
  neutral: string;
  aggressive: string;
};

type StockAnalysisReport = {
  summary: string;
  technicalAnalysis: string;
  chartInsight: string;
  riskAssessment: {
    level: RiskLevel;
    reasons: string[];
  };
  growthDirection: {
    shortTerm: string;
    midTerm: string;
    longTerm: string;
  };
  investmentSuggestion: InvestmentSuggestion;
  confidenceLevel: ConfidenceLevel;
  missingData: string[];
  disclaimer: string;
};
```

## Workflow

1. Receive stock input
   - Accept Taiwan stock symbol, company name, current price, historical prices, volume data, optional fundamental summary, optional news summary, and optional user question.

2. Validate data completeness
   - Check whether price history exists.
   - Check whether volume history exists.
   - Check whether fundamental or news context is missing.
   - Record missing data in `missingData`.

3. Analyze technical conditions
   - Identify short-term and mid-term price trend.
   - Compare recent close prices against previous ranges.
   - Review volume changes against price movement.
   - Identify possible support and resistance areas from historical high and low ranges.

4. Interpret chart behavior
   - Explain whether the chart shows upward trend, downward trend, sideways consolidation, or high volatility.
   - Call out visible abnormal moves such as sharp price gaps, fast pullbacks, or volume spikes.
   - Keep chart interpretation tied to the provided data only.

5. Assess risk
   - Evaluate volatility risk from price range changes.
   - Evaluate liquidity risk from volume changes.
   - Evaluate information risk when fundamentals or news are missing.
   - Set `riskAssessment.level` to `low`, `medium`, or `high`.

6. Estimate development direction
   - Provide short-term direction based on technical momentum.
   - Provide mid-term direction based on trend continuation or reversal risk.
   - Provide long-term direction based on available fundamental and industry context.
   - State uncertainty clearly when long-term inputs are insufficient.

7. Generate investment suggestion
   - Produce three suggestions by risk profile:
     - `conservative`: focus on capital preservation, waiting zones, and risk control.
     - `neutral`: focus on staged observation and position sizing.
     - `aggressive`: focus on momentum opportunities and strict stop-loss discipline.
   - Avoid direct commands such as "must buy", "must sell", or guaranteed return language.

8. Set confidence level
   - Use `high` only when price, volume, fundamental, and news context are all sufficient.
   - Use `medium` when price and volume are sufficient but fundamentals or news are incomplete.
   - Use `low` when key historical price or volume data is missing.

9. Return report
   - Return a structured `StockAnalysisReport`.
   - Always include a disclaimer that the report is for reference only and not professional investment advice.

## Agent Response Rules

- Use Traditional Chinese for user-facing report text.
- Keep financial terms clear and consistent.
- Separate facts, interpretation, risk, and suggestion.
- Mention data limitations before making lower-confidence conclusions.
- Do not fabricate unavailable financial data, news, or analyst ratings.
- Do not present mock data as real-time market data.

## Frontend Usage Notes

The frontend can map `StockAnalysisReport` to these display sections:

- Summary
- Technical analysis
- Chart insight
- Risk assessment
- Development direction
- Investment suggestion
- Missing data and disclaimer

The frontend should show `confidenceLevel`, `missingData`, and `disclaimer` near the analysis result so users can understand the reliability of the report.

## Future Expansion

Later versions can add:

- Real market data provider adapter
- Technical indicator calculation module
- News and disclosure summarization
- Multi-market support
- User risk preference input
- Historical report comparison

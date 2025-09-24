export const YEAR_OPTIONS = [2025, 2024, 2023];

export const formatCurrency = (value) =>
  value?.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

export const formatPercent = (value) => {
  if (value == null || Number.isNaN(value)) return "—";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "—";
  return `${numeric >= 0 ? "+" : ""}${numeric.toFixed(1)}%`;
};

export const formatAbsolutePercent = (value) => {
  if (value == null || Number.isNaN(value)) return "—";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "—";
  return `${numeric.toFixed(1)}%`;
};

export const normalizeStoreRecord = (record) => ({
  ...record,
  TotalSalesYear:
    record.TotalSalesYear != null && Number.isFinite(Number(record.TotalSalesYear))
      ? Number(record.TotalSalesYear)
      : null,
  AvgSalesPerEmployee:
    record.AvgSalesPerEmployee != null && Number.isFinite(Number(record.AvgSalesPerEmployee))
      ? Number(record.AvgSalesPerEmployee)
      : null,
  AvgGrowth:
    record.AvgGrowth != null && Number.isFinite(Number(record.AvgGrowth))
      ? Number(record.AvgGrowth)
      : null,
  PrevYearSales:
    record.PrevYearSales != null && Number.isFinite(Number(record.PrevYearSales))
      ? Number(record.PrevYearSales)
      : null,
  SalesYoY:
    record.SalesYoY != null && Number.isFinite(Number(record.SalesYoY))
      ? Number(record.SalesYoY)
      : null,
  SalesContributionPct:
    record.SalesContributionPct != null && Number.isFinite(Number(record.SalesContributionPct))
      ? Number(record.SalesContributionPct)
      : null,
});

export const normalizeKpiRow = (row) => {
  const toNumber = (value) => {
    if (value == null || value === "") return null;
    const cleaned = typeof value === "string" ? value.replace(/%/g, "") : value;
    const numeric = Number(cleaned);
    return Number.isFinite(numeric) ? numeric : null;
  };

  return {
    ...row,
    TotalSales: toNumber(row.TotalSales),
    AvgHeadcount: toNumber(row.AvgHeadcount),
    SalesPerEmployee: toNumber(row.SalesPerEmployee),
    HeadcountGrowthPct: toNumber(row.HeadcountGrowthPct),
    Turnover: toNumber(row.Turnover),
    ChainTotalSales: toNumber(row.ChainTotalSales),
    ChainAvgSales: toNumber(row.ChainAvgSales),
    ChainAvgSalesPerEmployee: toNumber(row.ChainAvgSalesPerEmployee),
    ChainAvgHeadcount: toNumber(row.ChainAvgHeadcount),
    ChainAvgGrowth: toNumber(row.ChainAvgGrowth),
    ChainAvgTurnover: toNumber(row.ChainAvgTurnover),
    ChainStoreCount: toNumber(row.ChainStoreCount),
    PrevYearTotalSales: toNumber(row.PrevYearTotalSales),
    PrevYearSalesPerEmployee: toNumber(row.PrevYearSalesPerEmployee),
    PrevYearHeadcountGrowth: toNumber(row.PrevYearHeadcountGrowth),
    PrevYearTurnover: toNumber(row.PrevYearTurnover),
  };
};

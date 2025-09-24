import express from "express";
import cors from "cors";
import { queryDatabase } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

// Get aggregated list of stores
app.get("/api/kpis/stores", async (req, res) => {
  try {
    const { year = 2025 } = req.query;
    const currentYear = Number(year) || 2025;
    const previousYear = currentYear - 1;

    const query = `
   WITH CurrentYear AS (
  SELECT
    StoreID,
    SUM(TotalSales) AS TotalSalesYear,
    ROUND(AVG(TRY_CAST(SalesPerEmployee AS FLOAT)), 0) AS AvgSalesPerEmployee,
    ROUND(AVG(TRY_CAST(HeadcountGrowthPct AS FLOAT)), 0) AS AvgGrowth
  FROM dbo.vw_Employee_KPI_All
  WHERE [Year] = @year       -- ✅ escape reserved word
  GROUP BY StoreID
),
PreviousYear AS (
  SELECT
    StoreID,
    SUM(TotalSales) AS TotalSalesYear
  FROM dbo.vw_Employee_KPI_All
  WHERE [Year] = @previousYear
  GROUP BY StoreID
),
ChainTotals AS (
  SELECT SUM(TotalSalesYear) AS ChainSales FROM CurrentYear
)
SELECT
  c.StoreID,
  ROUND(c.TotalSalesYear, 0) AS TotalSalesYear,
  c.AvgSalesPerEmployee,
  c.AvgGrowth,
  ROUND(p.TotalSalesYear, 0) AS PrevYearSales,
  ROUND(
    CASE
      WHEN p.TotalSalesYear IS NULL OR p.TotalSalesYear = 0 THEN NULL
      ELSE ((c.TotalSalesYear - p.TotalSalesYear) / p.TotalSalesYear) * 100
    END, 0
  ) AS SalesYoY,
  ROUND(
    CASE
      WHEN totals.ChainSales IS NULL OR totals.ChainSales = 0 THEN NULL
      ELSE (c.TotalSalesYear / totals.ChainSales) * 100
    END, 0
  ) AS SalesContributionPct
FROM CurrentYear c
LEFT JOIN PreviousYear p ON p.StoreID = c.StoreID
CROSS JOIN ChainTotals totals
ORDER BY c.TotalSalesYear DESC;


       `;

    const data = await queryDatabase(query, {
      year: currentYear,
      previousYear,
    });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database query failed" });
  }
});

// Get monthly KPIs for a single store
app.get("/api/kpis/store/:id", async (req, res) => {
  try {
    const { year = 2025 } = req.query;
    const { id } = req.params;
    const currentYear = Number(year) || 2025;
    const previousYear = currentYear - 1;

    const query = `
WITH StoreData AS (
  SELECT
    [Year],
    MonthNumber,
    StoreID,
    TotalSales,
    TRY_CAST(AvgHeadcount AS FLOAT) AS AvgHeadcount,
    TRY_CAST(SalesPerEmployee AS FLOAT) AS SalesPerEmployee,
    TRY_CAST(HeadcountGrowthPct AS FLOAT) AS HeadcountGrowthPct,
    TRY_CAST(TurnoverPct AS FLOAT) AS Turnover  -- ✅ use TurnoverPct from the view
  FROM dbo.vw_Employee_KPI_All
  WHERE [Year] = @year AND StoreID = @storeId
)
SELECT
  sd.[Year],
  sd.MonthNumber,
  sd.StoreID,
  ROUND(sd.TotalSales, 0) AS TotalSales,
  ROUND(sd.AvgHeadcount, 0) AS AvgHeadcount,
  ROUND(sd.SalesPerEmployee, 0) AS SalesPerEmployee,
  ROUND(sd.HeadcountGrowthPct, 0) AS HeadcountGrowthPct,
  ROUND(sd.Turnover, 0) AS Turnover,
  ROUND(totals.ChainTotalSales, 0) AS ChainTotalSales,
  ROUND(totals.ChainAvgSales, 0) AS ChainAvgSales,
  ROUND(totals.ChainAvgSalesPerEmployee, 0) AS ChainAvgSalesPerEmployee,
  ROUND(totals.ChainAvgHeadcount, 0) AS ChainAvgHeadcount,
  ROUND(totals.ChainAvgGrowth, 0) AS ChainAvgGrowth,
  ROUND(totals.ChainAvgTurnover, 0) AS ChainAvgTurnover,
  totals.ChainStoreCount,
  ROUND(prev.PrevYearTotalSales, 0) AS PrevYearTotalSales,
  ROUND(prev.PrevYearSalesPerEmployee, 0) AS PrevYearSalesPerEmployee,
  ROUND(prev.PrevYearHeadcountGrowth, 0) AS PrevYearHeadcountGrowth,
  ROUND(prev.PrevYearTurnover, 0) AS PrevYearTurnover
FROM StoreData sd
CROSS APPLY (
  SELECT
    SUM(v.TotalSales) AS ChainTotalSales,
    CASE WHEN COUNT(*) = 0 THEN NULL ELSE SUM(v.TotalSales) / COUNT(*) END AS ChainAvgSales,
    AVG(TRY_CAST(v.SalesPerEmployee AS FLOAT)) AS ChainAvgSalesPerEmployee,
    AVG(TRY_CAST(v.AvgHeadcount AS FLOAT)) AS ChainAvgHeadcount,
    AVG(TRY_CAST(v.HeadcountGrowthPct AS FLOAT)) AS ChainAvgGrowth,
    AVG(TRY_CAST(v.TurnoverPct AS FLOAT)) AS ChainAvgTurnover,  -- ✅ use TurnoverPct
    COUNT(*) AS ChainStoreCount
  FROM dbo.vw_Employee_KPI_All v
  WHERE v.[Year] = sd.[Year] AND v.MonthNumber = sd.MonthNumber
) totals
OUTER APPLY (
  SELECT TOP 1
    v.TotalSales AS PrevYearTotalSales,
    TRY_CAST(v.SalesPerEmployee AS FLOAT) AS PrevYearSalesPerEmployee,
    TRY_CAST(v.HeadcountGrowthPct AS FLOAT) AS PrevYearHeadcountGrowth,
    TRY_CAST(v.TurnoverPct AS FLOAT) AS PrevYearTurnover  -- ✅ use TurnoverPct
  FROM dbo.vw_Employee_KPI_All v
  WHERE v.[Year] = @previousYear
    AND v.MonthNumber = sd.MonthNumber
    AND v.StoreID = sd.StoreID
  ORDER BY v.[Year] DESC
) prev
ORDER BY sd.MonthNumber;


      `;

    const data = await queryDatabase(query, {
      year: currentYear,
      storeId: id,
      previousYear,
    });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database query failed" });
  }
});

app.get("/api/kpis/store/:id/turnover", async (req, res) => {
  try {
    const { year = 2025, month } = req.query;
    const { id } = req.params;
    const currentYear = Number(year) || 2025;
    const monthNumber = month != null ? Number(month) : null;
    const hasMonthFilter = monthNumber != null && Number.isFinite(monthNumber);

    let query = `
      SELECT
  Year,
  Month,
  MonthNumber,
  CAST('VFS' + CAST(StoreID AS VARCHAR(10)) AS VARCHAR(50)) AS StoreID,  -- always VFS##
  JobTitle,
  Gender,
  Start_Headcount,
  End_Headcount,
  Terminations,
  TurnoverPct
FROM dbo.vw_Employee_Turnover_ByJobTitle
WHERE StoreID = @storeId AND Year = @year

    `;

    if (hasMonthFilter) {
      query += " AND MonthNumber = @monthNumber";
    }

    query += " ORDER BY MonthNumber, JobTitle, Gender;";

    const params = {
      storeId: id,
      year: currentYear,
    };

    if (hasMonthFilter) {
      params.monthNumber = monthNumber;
    }

    const data = await queryDatabase(query, params);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database query failed" });
  }
});

// Health check
app.get("/", (req, res) => res.send("KPI API is running..."));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

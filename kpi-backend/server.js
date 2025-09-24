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
    AVG(TRY_CAST(SalesPerEmployee AS FLOAT)) AS AvgSalesPerEmployee,
    AVG(TRY_CAST(HeadcountGrowthPct AS FLOAT)) AS AvgGrowth
  FROM dbo.vw_Employee_KPI_All
  WHERE Year = @year
  GROUP BY StoreID
),
PreviousYear AS (
  SELECT
    StoreID,
    SUM(TotalSales) AS TotalSalesYear
  FROM dbo.vw_Employee_KPI_All
  WHERE Year = @previousYear
  GROUP BY StoreID
),
ChainTotals AS (
  SELECT SUM(TotalSalesYear) AS ChainSales FROM CurrentYear
)
SELECT
  c.StoreID,
  c.TotalSalesYear,
  c.AvgSalesPerEmployee,
  c.AvgGrowth,
  p.TotalSalesYear AS PrevYearSales,
  CASE
    WHEN p.TotalSalesYear IS NULL OR p.TotalSalesYear = 0 THEN NULL
    ELSE ((c.TotalSalesYear - p.TotalSalesYear) / p.TotalSalesYear) * 100
  END AS SalesYoY,
  CASE
    WHEN totals.ChainSales IS NULL OR totals.ChainSales = 0 THEN NULL
    ELSE (c.TotalSalesYear / totals.ChainSales) * 100
  END AS SalesContributionPct
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
    Year,
    MonthNumber,
    StoreID,
    TotalSales,
    TRY_CAST(AvgHeadcount AS FLOAT) AS AvgHeadcount,
    TRY_CAST(SalesPerEmployee AS FLOAT) AS SalesPerEmployee,
    TRY_CAST(HeadcountGrowthPct AS FLOAT) AS HeadcountGrowthPct,
    TRY_CAST(Turnover AS FLOAT) AS Turnover
  FROM dbo.vw_Employee_KPI_All
  WHERE Year = @year AND StoreID = @storeId
)
SELECT
  sd.Year,
  sd.MonthNumber,
  sd.StoreID,
  sd.TotalSales,
  sd.AvgHeadcount,
  sd.SalesPerEmployee,
  sd.HeadcountGrowthPct,
  sd.Turnover,
  totals.ChainTotalSales,
  totals.ChainAvgSales,
  totals.ChainAvgSalesPerEmployee,
  totals.ChainAvgHeadcount,
  totals.ChainAvgGrowth,
  totals.ChainAvgTurnover,
  totals.ChainStoreCount,
  prev.PrevYearTotalSales,
  prev.PrevYearSalesPerEmployee,
  prev.PrevYearHeadcountGrowth,
  prev.PrevYearTurnover
FROM StoreData sd
CROSS APPLY (
  SELECT
    SUM(v.TotalSales) AS ChainTotalSales,
    CASE WHEN COUNT(*) = 0 THEN NULL ELSE SUM(v.TotalSales) / COUNT(*) END AS ChainAvgSales,
    AVG(TRY_CAST(v.SalesPerEmployee AS FLOAT)) AS ChainAvgSalesPerEmployee,
    AVG(TRY_CAST(v.AvgHeadcount AS FLOAT)) AS ChainAvgHeadcount,
    AVG(TRY_CAST(v.HeadcountGrowthPct AS FLOAT)) AS ChainAvgGrowth,
    AVG(TRY_CAST(v.Turnover AS FLOAT)) AS ChainAvgTurnover,
    COUNT(*) AS ChainStoreCount
  FROM dbo.vw_Employee_KPI_All v
  WHERE v.Year = sd.Year AND v.MonthNumber = sd.MonthNumber
) totals
OUTER APPLY (
  SELECT TOP 1
    v.TotalSales AS PrevYearTotalSales,
    TRY_CAST(v.SalesPerEmployee AS FLOAT) AS PrevYearSalesPerEmployee,
    TRY_CAST(v.HeadcountGrowthPct AS FLOAT) AS PrevYearHeadcountGrowth,
    TRY_CAST(v.Turnover AS FLOAT) AS PrevYearTurnover
  FROM dbo.vw_Employee_KPI_All v
  WHERE v.Year = @previousYear
    AND v.MonthNumber = sd.MonthNumber
    AND v.StoreID = sd.StoreID
  ORDER BY v.Year DESC
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

// Health check
app.get("/", (req, res) => res.send("KPI API is running..."));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

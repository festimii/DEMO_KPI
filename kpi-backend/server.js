import express from "express";
import cors from "cors";
import { queryDatabase } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

// Get aggregated list of stores
app.get("/api/kpis/stores", async (req, res) => {
  try {
    const year = Number(req.query.year ?? 2025);
    const compareYear = Number(req.query.compareYear ?? year - 1);

    const query = `
        WITH StoreAggregates AS (
          SELECT
            StoreID,
            Year,
            SUM(TotalSales) AS TotalSales,
            AVG(SalesPerEmployee) AS AvgSalesPerEmployee,
          AVG(CAST(HeadcountGrowthPct AS FLOAT)) AS AvgGrowth
          FROM dbo.vw_Employee_KPI_All
          WHERE Year IN (@year, @compareYear)
          GROUP BY StoreID, Year
        )
        SELECT
          current.StoreID,
          current.TotalSales AS TotalSalesYear,
          previous.TotalSales AS TotalSalesCompareYear,
          current.AvgSalesPerEmployee,
          previous.AvgSalesPerEmployee AS AvgSalesPerEmployeeCompareYear,
          current.AvgGrowth,
          previous.AvgGrowth AS AvgGrowthCompareYear,
          CASE
            WHEN previous.TotalSales IS NULL OR previous.TotalSales = 0 THEN NULL
            ELSE ((current.TotalSales - previous.TotalSales) / previous.TotalSales) * 100
          END AS SalesYoYPct,
          CASE
            WHEN previous.AvgSalesPerEmployee IS NULL OR previous.AvgSalesPerEmployee = 0 THEN NULL
            ELSE ((current.AvgSalesPerEmployee - previous.AvgSalesPerEmployee) / previous.AvgSalesPerEmployee) * 100
          END AS SalesPerEmployeeYoYPct,
          CASE
            WHEN previous.AvgGrowth IS NULL OR previous.AvgGrowth = 0 THEN NULL
            ELSE ((current.AvgGrowth - previous.AvgGrowth) / NULLIF(previous.AvgGrowth, 0)) * 100
          END AS GrowthYoYPct
        FROM StoreAggregates current
        LEFT JOIN StoreAggregates previous
          ON previous.StoreID = current.StoreID AND previous.Year = @compareYear
        WHERE current.Year = @year
        ORDER BY current.TotalSales DESC;
      `;

    const data = await queryDatabase(query, { year, compareYear });
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

    const query = `
        SELECT 
          Year,
          MonthNumber,
          StoreID,
          TotalSales,
          AvgHeadcount,
          SalesPerEmployee,
          HeadcountGrowthPct,
          Turnover
        FROM dbo.vw_Employee_KPI_All
        WHERE Year = @year AND StoreID = @storeId
        ORDER BY MonthNumber;
      `;

    const data = await queryDatabase(query, { year, storeId: id });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database query failed" });
  }
});

// Get benchmarks and comparison data for a single store
app.get("/api/kpis/store/:id/comparison", async (req, res) => {
  try {
    const year = Number(req.query.year ?? 2025);
    const compareYear = Number(req.query.compareYear ?? year - 1);
    const { id } = req.params;

    const storeSummaryQuery = `
      SELECT
        current.TotalSalesYear,
        previous.TotalSalesYear AS TotalSalesCompareYear,
        current.AvgSalesPerEmployee,
        previous.AvgSalesPerEmployee AS AvgSalesPerEmployeeCompareYear,
        current.AvgHeadcount,
        previous.AvgHeadcount AS AvgHeadcountCompareYear,
        current.AvgTurnover,
        previous.AvgTurnover AS AvgTurnoverCompareYear,
        current.AvgHeadcountGrowth,
        previous.AvgHeadcountGrowth AS AvgHeadcountGrowthCompareYear,
        CASE
          WHEN previous.TotalSalesYear IS NULL OR previous.TotalSalesYear = 0 THEN NULL
          ELSE ((current.TotalSalesYear - previous.TotalSalesYear) / previous.TotalSalesYear) * 100
        END AS SalesYoYPct,
        CASE
          WHEN previous.AvgSalesPerEmployee IS NULL OR previous.AvgSalesPerEmployee = 0 THEN NULL
          ELSE ((current.AvgSalesPerEmployee - previous.AvgSalesPerEmployee) / previous.AvgSalesPerEmployee) * 100
        END AS SalesPerEmployeeYoYPct,
        CASE
          WHEN previous.AvgTurnover IS NULL OR previous.AvgTurnover = 0 THEN NULL
          ELSE ((current.AvgTurnover - previous.AvgTurnover) / previous.AvgTurnover) * 100
        END AS TurnoverYoYPct,
        CASE
          WHEN previous.AvgHeadcountGrowth IS NULL OR previous.AvgHeadcountGrowth = 0 THEN NULL
          ELSE ((current.AvgHeadcountGrowth - previous.AvgHeadcountGrowth) / NULLIF(previous.AvgHeadcountGrowth, 0)) * 100
        END AS HeadcountGrowthYoYPct,
        CASE
          WHEN previous.AvgHeadcount IS NULL OR previous.AvgHeadcount = 0 THEN NULL
          ELSE ((current.AvgHeadcount - previous.AvgHeadcount) / previous.AvgHeadcount) * 100
        END AS HeadcountYoYPct
      FROM (
        SELECT
          SUM(TotalSales) AS TotalSalesYear,
          AVG(SalesPerEmployee) AS AvgSalesPerEmployee,
          AVG(AvgHeadcount) AS AvgHeadcount,
          AVG(Turnover) AS AvgTurnover,
          AVG(CAST(HeadcountGrowthPct AS FLOAT)) AS AvgHeadcountGrowth
        FROM dbo.vw_Employee_KPI_All
        WHERE StoreID = @storeId AND Year = @year
      ) current
      CROSS JOIN (
        SELECT
          SUM(TotalSales) AS TotalSalesYear,
          AVG(SalesPerEmployee) AS AvgSalesPerEmployee,
          AVG(AvgHeadcount) AS AvgHeadcount,
          AVG(CAST(Turnover AS FLOAT)) AS AvgTurnover,
          AVG(CAST(HeadcountGrowthPct AS FLOAT)) AS AvgHeadcountGrowth
        FROM dbo.vw_Employee_KPI_All
        WHERE StoreID = @storeId AND Year = @compareYear
      ) previous;
    `;

    const peerSummaryQuery = `
      SELECT
        current.TotalSales AS TotalSalesYear,
        previous.TotalSales AS TotalSalesCompareYear,
        current.AvgSalesPerEmployee,
        previous.AvgSalesPerEmployee AS AvgSalesPerEmployeeCompareYear,
        current.AvgHeadcount,
        previous.AvgHeadcount AS AvgHeadcountCompareYear,
        current.AvgTurnover,
        previous.AvgTurnover AS AvgTurnoverCompareYear,
        current.AvgHeadcountGrowth,
        previous.AvgHeadcountGrowth AS AvgHeadcountGrowthCompareYear,
        current.StoreCount,
        CASE
          WHEN previous.TotalSales IS NULL OR previous.TotalSales = 0 THEN NULL
          ELSE ((current.TotalSales - previous.TotalSales) / previous.TotalSales) * 100
        END AS SalesYoYPct,
        CASE
          WHEN previous.AvgSalesPerEmployee IS NULL OR previous.AvgSalesPerEmployee = 0 THEN NULL
          ELSE ((current.AvgSalesPerEmployee - previous.AvgSalesPerEmployee) / previous.AvgSalesPerEmployee) * 100
        END AS SalesPerEmployeeYoYPct,
        CASE
          WHEN previous.AvgTurnover IS NULL OR previous.AvgTurnover = 0 THEN NULL
          ELSE ((current.AvgTurnover - previous.AvgTurnover) / previous.AvgTurnover) * 100
        END AS TurnoverYoYPct,
        CASE
          WHEN previous.AvgHeadcountGrowth IS NULL OR previous.AvgHeadcountGrowth = 0 THEN NULL
          ELSE ((current.AvgHeadcountGrowth - previous.AvgHeadcountGrowth) / NULLIF(previous.AvgHeadcountGrowth, 0)) * 100
        END AS HeadcountGrowthYoYPct,
        CASE
          WHEN previous.AvgHeadcount IS NULL OR previous.AvgHeadcount = 0 THEN NULL
          ELSE ((current.AvgHeadcount - previous.AvgHeadcount) / previous.AvgHeadcount) * 100
        END AS HeadcountYoYPct
      FROM (
        SELECT
          SUM(TotalSales) AS TotalSales,
          AVG(SalesPerEmployee) AS AvgSalesPerEmployee,
          AVG(AvgHeadcount) AS AvgHeadcount,
          AVG(Turnover) AS AvgTurnover,
          AVG(HeadcountGrowthPct) AS AvgHeadcountGrowth,
          COUNT(DISTINCT CASE WHEN TotalSales IS NOT NULL THEN StoreID END) AS StoreCount
        FROM dbo.vw_Employee_KPI_All
        WHERE Year = @year
      ) current
      CROSS JOIN (
        SELECT
          SUM(TotalSales) AS TotalSales,
          AVG(SalesPerEmployee) AS AvgSalesPerEmployee,
          AVG(AvgHeadcount) AS AvgHeadcount,
          AVG(CAST(Turnover AS FLOAT)) AS AvgTurnover,
          AVG(CAST(HeadcountGrowthPct AS FLOAT)) AS AvgHeadcountGrowth
        FROM dbo.vw_Employee_KPI_All
        WHERE Year = @compareYear
      ) previous;
    `;

    const monthlyComparisonQuery = `
      WITH StoreMonthly AS (
        SELECT
          MonthNumber,
          SUM(TotalSales) AS StoreSales,
          AVG(SalesPerEmployee) AS StoreSalesPerEmployee,
          AVG(AvgHeadcount) AS StoreAvgHeadcount,
          AVG(CAST(HeadcountGrowthPct AS FLOAT)) AS StoreHeadcountGrowthPct,
          AVG(CAST(Turnover AS FLOAT)) AS StoreTurnover
        FROM dbo.vw_Employee_KPI_All
        WHERE StoreID = @storeId AND Year = @year
        GROUP BY MonthNumber
      ),
      PeerMonthly AS (
        SELECT
          MonthNumber,
          AVG(TotalSales) AS AvgPeerSales,
          AVG(SalesPerEmployee) AS AvgPeerSalesPerEmployee,
          AVG(AvgHeadcount) AS AvgPeerHeadcount,
          AVG(CAST(HeadcountGrowthPct AS FLOAT)) AS AvgPeerHeadcountPct,
          AVG(CAST(Turnover AS FLOAT)) AS AvgPeerTurnover
        FROM dbo.vw_Employee_KPI_All
        WHERE Year = @year
        GROUP BY MonthNumber
      )
      SELECT
        p.MonthNumber,
        p.AvgPeerSales,
        p.AvgPeerSalesPerEmployee,
        p.AvgPeerHeadcount,
        p.AvgPeerHeadcountPct,
        p.AvgPeerTurnover,
        s.StoreSales,
        s.StoreSalesPerEmployee,
        s.StoreAvgHeadcount,
        s.StoreHeadcountGrowthPct,
        s.StoreTurnover
      FROM PeerMonthly p
      LEFT JOIN StoreMonthly s ON s.MonthNumber = p.MonthNumber
      ORDER BY p.MonthNumber;
    `;

    const [storeSummary] = await queryDatabase(storeSummaryQuery, {
      storeId: id,
      year,
      compareYear,
    });
    const [peerSummary] = await queryDatabase(peerSummaryQuery, {
      year,
      compareYear,
    });
    const monthlyComparison = await queryDatabase(monthlyComparisonQuery, {
      storeId: id,
      year,
    });

    res.json({ storeSummary, peerSummary, monthlyComparison });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database query failed" });
  }
});

// Network level overview for dashboards
app.get("/api/kpis/overview", async (req, res) => {
  try {
    const year = Number(req.query.year ?? 2025);
    const compareYear = Number(req.query.compareYear ?? year - 1);

    const summaryQuery = `
      SELECT
        current.TotalSales AS TotalSalesYear,
        previous.TotalSales AS TotalSalesCompareYear,
        current.AvgSalesPerEmployee,
        previous.AvgSalesPerEmployee AS AvgSalesPerEmployeeCompareYear,
        current.AvgHeadcount,
        previous.AvgHeadcount AS AvgHeadcountCompareYear,
        current.AvgTurnover,
        previous.AvgTurnover AS AvgTurnoverCompareYear,
        current.AvgHeadcountGrowth,
        previous.AvgHeadcountGrowth AS AvgHeadcountGrowthCompareYear,
        current.StoreCount,
        CASE
          WHEN previous.TotalSales IS NULL OR previous.TotalSales = 0 THEN NULL
          ELSE ((current.TotalSales - previous.TotalSales) / previous.TotalSales) * 100
        END AS SalesYoYPct,
        CASE
          WHEN previous.AvgSalesPerEmployee IS NULL OR previous.AvgSalesPerEmployee = 0 THEN NULL
          ELSE ((current.AvgSalesPerEmployee - previous.AvgSalesPerEmployee) / previous.AvgSalesPerEmployee) * 100
        END AS SalesPerEmployeeYoYPct,
        CASE
          WHEN previous.AvgTurnover IS NULL OR previous.AvgTurnover = 0 THEN NULL
          ELSE ((current.AvgTurnover - previous.AvgTurnover) / previous.AvgTurnover) * 100
        END AS TurnoverYoYPct,
        CASE
          WHEN previous.AvgHeadcountGrowth IS NULL OR previous.AvgHeadcountGrowth = 0 THEN NULL
          ELSE ((current.AvgHeadcountGrowth - previous.AvgHeadcountGrowth) / NULLIF(previous.AvgHeadcountGrowth, 0)) * 100
        END AS HeadcountGrowthYoYPct,
        CASE
          WHEN previous.AvgHeadcount IS NULL OR previous.AvgHeadcount = 0 THEN NULL
          ELSE ((current.AvgHeadcount - previous.AvgHeadcount) / previous.AvgHeadcount) * 100
        END AS HeadcountYoYPct
      FROM (
        SELECT
          SUM(TotalSales) AS TotalSales,
          AVG(SalesPerEmployee) AS AvgSalesPerEmployee,
          AVG(AvgHeadcount) AS AvgHeadcount,
          AVG(CAST(Turnover AS FLOAT)) AS AvgTurnover,
          AVG(CAST(HeadcountGrowthPct AS FLOAT)) AS AvgHeadcountGrowth,
          COUNT(DISTINCT CASE WHEN TotalSales IS NOT NULL THEN StoreID END) AS StoreCount
        FROM dbo.vw_Employee_KPI_All
        WHERE Year = @year
      ) current
      CROSS JOIN (
        SELECT
          SUM(TotalSales) AS TotalSales,
          AVG(SalesPerEmployee) AS AvgSalesPerEmployee,
          AVG(AvgHeadcount) AS AvgHeadcount,
          AVG(CAST(Turnover AS FLOAT)) AS AvgTurnover,
          AVG(CAST(HeadcountGrowthPct AS FLOAT)) AS AvgHeadcountGrowth
        FROM dbo.vw_Employee_KPI_All
        WHERE Year = @compareYear
      ) previous;
    `;

    const monthlyTotalsQuery = `
      SELECT
        MonthNumber,
        SUM(TotalSales) AS TotalSales,
        AVG(SalesPerEmployee) AS AvgSalesPerEmployee,
        AVG(CAST(HeadcountGrowthPct AS FLOAT)) AS AvgHeadcountGrowth,
        AVG(CAST(Turnover AS FLOAT)) AS AvgTurnover
      FROM dbo.vw_Employee_KPI_All
      WHERE Year = @year
      GROUP BY MonthNumber
      ORDER BY MonthNumber;
    `;

    const topStoresQuery = `
      SELECT TOP (5)
        StoreID,
        SUM(CASE WHEN Year = @year THEN TotalSales ELSE 0 END) AS TotalSalesYear,
        SUM(CASE WHEN Year = @compareYear THEN TotalSales ELSE 0 END) AS TotalSalesCompareYear,
        AVG(CASE WHEN Year = @year THEN SalesPerEmployee END) AS AvgSalesPerEmployee,
        CASE
          WHEN SUM(CASE WHEN Year = @compareYear THEN TotalSales ELSE 0 END) = 0 THEN NULL
          ELSE (
            (SUM(CASE WHEN Year = @year THEN TotalSales ELSE 0 END) -
             SUM(CASE WHEN Year = @compareYear THEN TotalSales ELSE 0 END)) /
            NULLIF(SUM(CASE WHEN Year = @compareYear THEN TotalSales ELSE 0 END), 0)
          ) * 100
        END AS SalesYoYPct
      FROM dbo.vw_Employee_KPI_All
      WHERE Year IN (@year, @compareYear)
      GROUP BY StoreID
      ORDER BY TotalSalesYear DESC;
    `;

    const [summary] = await queryDatabase(summaryQuery, { year, compareYear });
    const monthlyTotals = await queryDatabase(monthlyTotalsQuery, { year });
    const topStores = await queryDatabase(topStoresQuery, { year, compareYear });

    res.json({ summary, monthlyTotals, topStores });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database query failed" });
  }
});

// Health check
app.get("/", (req, res) => res.send("KPI API is running..."));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

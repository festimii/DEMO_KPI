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

    const query = `
        SELECT 
          StoreID,
          SUM(TotalSales) AS TotalSalesYear,
          AVG(SalesPerEmployee) AS AvgSalesPerEmployee,
          AVG(HeadcountGrowthPct) AS AvgGrowth
        FROM dbo.vw_Employee_KPI_All
        WHERE Year = @year
        GROUP BY StoreID
        ORDER BY TotalSalesYear DESC;
      `;

    const data = await queryDatabase(query, { year });
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

// Health check
app.get("/", (req, res) => res.send("KPI API is running..."));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

import express from "express";
import cors from "cors";
import { queryDatabase } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

// Sample KPI endpoint
app.get("/api/kpis", async (req, res) => {
  try {
    const { storeId, year = 2025 } = req.query;

    let query = `
        SELECT 
          Year,
          MonthNumber,
          StoreID,
          TotalSales,
          Start_Headcount,
          End_Headcount,
          Terminations,
          Turnover,
          AvgHeadcount,
          SalesPerEmployee,
          HeadcountGrowthPct
        FROM dbo.vw_Employee_KPI_All
        WHERE Year = @year
      `;

    // filter if storeId is provided
    if (storeId) {
      query += " AND StoreID = @storeId";
    }
    query += " ORDER BY StoreID, MonthNumber;";

    const params = { year };
    if (storeId) params.storeId = storeId;

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

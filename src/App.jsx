import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "./components/Layout";
import SalesTrend from "./components/Charts/SalesTrend";
import { Grid, CircularProgress } from "@mui/material";

export default function App() {
  const [kpiData, setKpiData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:4000/api/kpis?year=2025")
      .then((res) => {
        const raw = res.data;

        // Pivot by MonthNumber
        const grouped = {};
        raw.forEach((row) => {
          const key = row.MonthNumber;
          if (!grouped[key]) grouped[key] = { MonthNumber: key };
          grouped[key][row.StoreID] = row.TotalSales;
        });

        setKpiData(
          Object.values(grouped).sort((a, b) => a.MonthNumber - b.MonthNumber)
        );
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <SalesTrend data={kpiData} />
          </Grid>
        </Grid>
      )}
    </Layout>
  );
}

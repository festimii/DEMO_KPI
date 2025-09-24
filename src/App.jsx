import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "./components/Layout";
import SalesTrend from "./components/Charts/SalesTrend";
import {
  Grid,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

export default function App() {
  const [stores, setStores] = useState([]);
  const [selected, setSelected] = useState("VFS1");
  const [kpiData, setKpiData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load all stores
  useEffect(() => {
    axios
      .get("http://localhost:4000/api/kpis/stores?year=2025")
      .then((res) => setStores(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Load KPIs for selected store
  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    axios
      .get(`http://localhost:4000/api/kpis/store/${selected}?year=2025`)
      .then((res) => setKpiData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selected]);

  return (
    <Layout>
      <FormControl sx={{ minWidth: 200, mb: 3 }}>
        <InputLabel>Store</InputLabel>
        <Select value={selected} onChange={(e) => setSelected(e.target.value)}>
          {stores.map((s) => (
            <MenuItem key={s.StoreID} value={s.StoreID}>
              {s.StoreID} – {s.TotalSalesYear.toLocaleString()}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <SalesTrend data={kpiData} storeId={selected} />
          </Grid>
        </Grid>
      )}
    </Layout>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Layout from "./components/Layout";
import SalesTrend from "./components/Charts/SalesTrend";
import EfficiencyTrend from "./components/Charts/EfficiencyTrend";
import PeopleHealth from "./components/Charts/PeopleHealth";
import KpiOverview from "./components/KpiOverview";
import {
  Grid,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Typography,
  Alert,
  Box,
  Skeleton,
} from "@mui/material";

const YEAR_OPTIONS = [2025, 2024, 2023];

const formatCurrency = (value) =>
  value?.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [year, setYear] = useState(YEAR_OPTIONS[0]);
  const [stores, setStores] = useState([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const [selectedStore, setSelectedStore] = useState("");
  const [kpiData, setKpiData] = useState([]);
  const [loadingKpis, setLoadingKpis] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoadingStores(true);
    setError("");
    axios
      .get(`http://localhost:4000/api/kpis/stores`, { params: { year } })
      .then((res) => {
        setStores(res.data);
        setSelectedStore((previous) => {
          if (previous && res.data.some((store) => store.StoreID === previous)) {
            return previous;
          }
          return res.data[0]?.StoreID ?? "";
        });
      })
      .catch(() => setError("Unable to load stores from the API."))
      .finally(() => setLoadingStores(false));
  }, [year]);

  useEffect(() => {
    if (!selectedStore) {
      setKpiData([]);
      return;
    }

    setLoadingKpis(true);
    setError("");
    axios
      .get(`http://localhost:4000/api/kpis/store/${selectedStore}`, {
        params: { year },
      })
      .then((res) => setKpiData(res.data))
      .catch(() => setError("Unable to load KPI data for the selected filters."))
      .finally(() => setLoadingKpis(false));
  }, [selectedStore, year]);

  const hasData = useMemo(() => kpiData && kpiData.length > 0, [kpiData]);

  return (
    <Layout darkMode={darkMode} onToggleDarkMode={() => setDarkMode((prev) => !prev)}>
      <Stack spacing={4}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }} gutterBottom>
            Store KPI Performance
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Explore how each store is performing month over month and keep an eye on sales,
            efficiency and people metrics in one place.
          </Typography>
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <FormControl sx={{ minWidth: 160 }} disabled={loadingStores}>
            <InputLabel>Year</InputLabel>
            <Select value={year} label="Year" onChange={(event) => setYear(event.target.value)}>
              {YEAR_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 220 }} disabled={loadingStores || stores.length === 0}>
            <InputLabel>Store</InputLabel>
            <Select
              value={selectedStore}
              label="Store"
              onChange={(event) => setSelectedStore(event.target.value)}
            >
              {stores.map((store) => (
                <MenuItem key={store.StoreID} value={store.StoreID}>
                  <Stack direction="row" justifyContent="space-between" sx={{ width: "100%" }}>
                    <span>{store.StoreID}</span>
                    <Typography component="span" variant="body2" color="text.secondary">
                      {formatCurrency(store.TotalSalesYear)}
                    </Typography>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {error && <Alert severity="error">{error}</Alert>}

        {loadingKpis ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress />
          </Box>
        ) : !hasData ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            {loadingStores ? (
              <Skeleton variant="rounded" width={320} height={160} />
            ) : (
              <Typography variant="body1" color="text.secondary">
                Select a store to view KPIs.
              </Typography>
            )}
          </Box>
        ) : (
          <Stack spacing={4}>
            <KpiOverview data={kpiData} />
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <SalesTrend data={kpiData} storeId={selectedStore} />
              </Grid>
              <Grid item xs={12} lg={6}>
                <EfficiencyTrend data={kpiData} />
              </Grid>
              <Grid item xs={12} lg={6}>
                <PeopleHealth data={kpiData} />
              </Grid>
            </Grid>
          </Stack>
        )}
      </Stack>
    </Layout>
  );
}

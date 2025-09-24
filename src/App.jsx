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

const formatPercent = (value) => {
  if (value == null || Number.isNaN(value)) return "—";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "—";
  return `${numeric >= 0 ? "+" : ""}${numeric.toFixed(1)}%`;
};

const normalizeStoreRecord = (record) => ({
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

const normalizeKpiRow = (row) => {
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
        const normalized = Array.isArray(res.data)
          ? res.data.map((store) => normalizeStoreRecord(store))
          : [];
        setStores(normalized);
        setSelectedStore((previous) => {
          if (previous && normalized.some((store) => store.StoreID === previous)) {
            return previous;
          }
          return normalized[0]?.StoreID ?? "";
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
      .then((res) =>
        setKpiData(Array.isArray(res.data) ? res.data.map((row) => normalizeKpiRow(row)) : [])
      )
      .catch(() => setError("Unable to load KPI data for the selected filters."))
      .finally(() => setLoadingKpis(false));
  }, [selectedStore, year]);

  const hasData = useMemo(() => kpiData && kpiData.length > 0, [kpiData]);
  const selectedStoreRecord = useMemo(
    () => stores.find((store) => store.StoreID === selectedStore),
    [selectedStore, stores]
  );

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
              {stores.map((store) => {
                const yoy = store.SalesYoY;
                const contribution = store.SalesContributionPct;
                return (
                  <MenuItem key={store.StoreID} value={store.StoreID}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ width: "100%" }}
                    >
                      <Stack spacing={0.5}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {store.StoreID}
                        </Typography>
                        {contribution != null && (
                          <Typography variant="caption" color="text.secondary">
                            {formatPercent(contribution)} of chain sales
                          </Typography>
                        )}
                      </Stack>
                      <Stack spacing={0.5} alignItems="flex-end">
                        <Typography component="span" variant="body2" color="text.secondary">
                          {formatCurrency(store.TotalSalesYear)}
                        </Typography>
                        {yoy != null && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: yoy >= 0 ? "success.main" : "error.main",
                              fontWeight: 600,
                            }}
                          >
                            {`${yoy >= 0 ? "+" : ""}${yoy.toFixed(1)}% vs LY`}
                          </Typography>
                        )}
                      </Stack>
                    </Stack>
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Stack>

        {selectedStoreRecord && (
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", md: "center" }}
            sx={{ bgcolor: "action.hover", p: 2, borderRadius: 3 }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              {selectedStoreRecord.StoreID} contribution
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} useFlexGap flexWrap="wrap">
              <Typography variant="body2" color="text.primary">
                <strong>{formatPercent(selectedStoreRecord.SalesContributionPct)}</strong> of annual
                sales
              </Typography>
              {selectedStoreRecord.SalesYoY != null && (
                <Typography
                  variant="body2"
                  color={selectedStoreRecord.SalesYoY >= 0 ? "success.main" : "error.main"}
                >
                  {`${selectedStoreRecord.SalesYoY >= 0 ? "+" : ""}${selectedStoreRecord.SalesYoY.toFixed(
                    1
                  )}% vs previous year`}
                </Typography>
              )}
              {selectedStoreRecord.AvgSalesPerEmployee != null && (
                <Typography variant="body2" color="text.secondary">
                  {`Avg. sales per employee: $${selectedStoreRecord.AvgSalesPerEmployee.toFixed(0)}`}
                </Typography>
              )}
            </Stack>
          </Stack>
        )}

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

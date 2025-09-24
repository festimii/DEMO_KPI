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
  Paper,
} from "@mui/material";
const YEAR_OPTIONS = [2025, 2024, 2023];

const formatCurrency = (value) =>
  value?.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

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
  const storeHighlights = useMemo(() => {
    if (!selectedStoreRecord) return [];

    const safeNumber = (value) => {
      const numeric = Number(value);
      return Number.isFinite(numeric) ? numeric : null;
    };

    const highlights = [];

    const totalSales = safeNumber(selectedStoreRecord.TotalSalesYear);
    if (totalSales != null) {
      highlights.push({
        label: "Annual sales",
        value: formatCurrency(totalSales),
        helper: `FY ${year}`,
      });
    }

    const contribution = safeNumber(selectedStoreRecord.SalesContributionPct);
    if (contribution != null) {
      highlights.push({
        label: "Share of chain sales",
        value: `${contribution.toFixed(1)}%`,
      });
    }

    const yoy = safeNumber(selectedStoreRecord.SalesYoY);
    if (yoy != null) {
      highlights.push({
        label: "Year over year",
        value: `${yoy >= 0 ? "+" : ""}${yoy.toFixed(1)}%`,
      });
    }

    const productivity = safeNumber(selectedStoreRecord.AvgSalesPerEmployee);
    if (productivity != null) {
      highlights.push({
        label: "Sales per employee",
        value: formatCurrency(productivity),
      });
    }

    return highlights;
  }, [selectedStoreRecord, year]);

  return (
    <Layout darkMode={darkMode} onToggleDarkMode={() => setDarkMode((prev) => !prev)}>
      <Stack spacing={4}>
        <Stack spacing={0.5}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Store KPI performance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Simple snapshot of the metrics currently available.
          </Typography>
        </Stack>

        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            p: { xs: 2, md: 3 },
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 2, md: 3 },
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            useFlexGap
            flexWrap="wrap"
            sx={{ flexShrink: 0 }}
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
                        <Stack spacing={0.25}>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {store.StoreID}
                          </Typography>
                          {contribution != null && (
                            <Typography variant="caption" color="text.secondary">
                              {`${Number(contribution).toFixed(1)}% of chain sales`}
                            </Typography>
                          )}
                        </Stack>
                        <Stack spacing={0.5} alignItems="flex-end">
                          <Typography component="span" variant="body2" color="text.secondary">
                            {formatCurrency(store.TotalSalesYear) ?? "—"}
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
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                {selectedStoreRecord.StoreID} details
              </Typography>
              {storeHighlights.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No additional metrics available for this store.
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {storeHighlights.map((metric) => (
                    <Grid key={metric.label} item xs={12} sm={6} md={3}>
                      <Paper
                        elevation={0}
                        sx={{
                          borderRadius: 3,
                          p: 2,
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.5,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {metric.label}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {metric.value}
                        </Typography>
                        {metric.helper && (
                          <Typography variant="caption" color="text.secondary">
                            {metric.helper}
                          </Typography>
                        )}
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}
        </Paper>

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

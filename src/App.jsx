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
  Chip,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

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

const formatAbsolutePercent = (value) => {
  if (value == null || Number.isNaN(value)) return "—";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "—";
  return `${numeric.toFixed(1)}%`;
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
  const storeHighlights = useMemo(() => {
    if (!selectedStoreRecord) return [];
    const yoy =
      selectedStoreRecord.SalesYoY != null && Number.isFinite(Number(selectedStoreRecord.SalesYoY))
        ? Number(selectedStoreRecord.SalesYoY)
        : null;

    return [
      {
        label: "Chain Contribution",
        value:
          selectedStoreRecord.SalesContributionPct != null &&
          Number.isFinite(Number(selectedStoreRecord.SalesContributionPct))
            ? formatAbsolutePercent(selectedStoreRecord.SalesContributionPct)
            : "—",
        caption: "of annual revenue",
      },
      {
        label: "Annual Sales",
        value: formatCurrency(selectedStoreRecord.TotalSalesYear) ?? "—",
        caption: `Fiscal year ${year}`,
      },
      {
        label: "YoY Growth",
        value: yoy != null ? `${yoy >= 0 ? "+" : ""}${yoy.toFixed(1)}%` : "—",
        caption: "vs previous year",
        valueColor: yoy != null ? (yoy >= 0 ? "success.light" : "error.light") : undefined,
      },
      {
        label: "Sales per Employee",
        value:
          selectedStoreRecord.AvgSalesPerEmployee != null &&
          Number.isFinite(Number(selectedStoreRecord.AvgSalesPerEmployee))
            ? formatCurrency(selectedStoreRecord.AvgSalesPerEmployee)
            : "—",
        caption: "productivity snapshot",
      },
    ];
  }, [selectedStoreRecord, year]);

  return (
    <Layout darkMode={darkMode} onToggleDarkMode={() => setDarkMode((prev) => !prev)}>
      <Stack spacing={5}>
        <Box
          sx={(theme) => ({
            position: "relative",
            overflow: "hidden",
            borderRadius: 4,
            px: { xs: 3, md: 6 },
            py: { xs: 5, md: 6 },
            color:
              theme.palette.mode === "dark"
                ? theme.palette.primary.contrastText
                : theme.palette.text.primary,
            background:
              theme.palette.mode === "dark"
                ? `radial-gradient(circle at 15% 0%, ${alpha(theme.palette.primary.main, 0.6)} 0%, transparent 55%), linear-gradient(140deg, ${alpha(
                    theme.palette.background.paper,
                    0.95
                  )} 0%, ${alpha(theme.palette.background.paper, 0.7)} 55%, ${alpha(
                    theme.palette.primary.dark,
                    0.4
                  )} 100%)`
                : `radial-gradient(circle at -10% 0%, ${alpha(theme.palette.primary.light, 0.55)} 0%, transparent 60%), linear-gradient(135deg, ${alpha(
                    theme.palette.primary.main,
                    0.15
                  )} 0%, #ffffff 55%, ${alpha(theme.palette.primary.main, 0.08)} 100%)`,
            boxShadow:
              theme.palette.mode === "dark"
                ? "0 32px 90px rgba(15, 23, 42, 0.85)"
                : "0 24px 60px rgba(37, 99, 235, 0.18)",
          })}
        >
          <Stack spacing={3} sx={{ position: "relative", zIndex: 1 }}>
            <Chip
              label="Crowdt Intelligence"
              color="primary"
              sx={{
                alignSelf: "flex-start",
                fontWeight: 600,
                letterSpacing: 0.4,
                textTransform: "uppercase",
              }}
            />
            <Stack spacing={1.5}>
              <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                Store KPI Performance
              </Typography>
              <Typography
                variant="body1"
                sx={{ maxWidth: 520, color: (theme) => alpha(theme.palette.text.primary, 0.75) }}
              >
                Keep every Crowdt location on pace with a single dashboard that merges sales,
                efficiency, and people signals into one decisive view.
              </Typography>
            </Stack>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              useFlexGap
              flexWrap="wrap"
            >
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Updated automatically from live store telemetry
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Highlighting <strong>{YEAR_OPTIONS.length}</strong> fiscal years of history
              </Typography>
            </Stack>
          </Stack>
        </Box>

        <Paper
          elevation={0}
          sx={(theme) => ({
            borderRadius: 4,
            p: { xs: 3, md: 4 },
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 3, md: 4 },
            alignItems: { xs: "stretch", md: "center" },
            border: `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.35 : 0.18)}`,
            background:
              theme.palette.mode === "dark"
                ? alpha(theme.palette.background.paper, 0.9)
                : "#ffffff",
            boxShadow:
              theme.palette.mode === "dark"
                ? "0 20px 50px rgba(15, 23, 42, 0.6)"
                : "0 18px 45px rgba(15, 23, 42, 0.08)",
            backdropFilter: "blur(16px)",
          })}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", sm: "center" }}
            sx={{ flexShrink: 0, minWidth: { md: 420 } }}
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
                              {formatAbsolutePercent(contribution)} of chain sales
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
            <Box
              sx={(theme) => ({
                flex: 1,
                borderLeft: {
                  md: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
                },
                borderTop: {
                  xs: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
                  md: "none",
                },
                pl: { md: 4 },
                pt: { xs: 3, md: 0 },
              })}
            >
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                {selectedStoreRecord.StoreID} spotlight
              </Typography>
              <Grid container spacing={2}>
                {storeHighlights.map((metric) => (
                  <Grid key={metric.label} item xs={12} sm={6} md={3}>
                    <Box
                      sx={(theme) => ({
                        borderRadius: 3,
                        p: 2,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        background:
                          theme.palette.mode === "dark"
                            ? alpha(theme.palette.primary.main, 0.12)
                            : alpha(theme.palette.primary.main, 0.08),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                      })}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: 0.4 }}>
                        {metric.label}
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: metric.valueColor ?? "text.primary",
                        }}
                      >
                        {metric.value}
                      </Typography>
                      {metric.caption && (
                        <Typography variant="caption" color="text.secondary">
                          {metric.caption}
                        </Typography>
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
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

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { alpha } from "@mui/material/styles";
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
import SalesTrend from "../components/Charts/SalesTrend";
import EfficiencyTrend from "../components/Charts/EfficiencyTrend";
import PeopleHealth from "../components/Charts/PeopleHealth";
import KpiOverview from "../components/KpiOverview";
import {
  YEAR_OPTIONS,
  formatCurrency,
  formatAbsolutePercent,
  normalizeStoreRecord,
  normalizeKpiRow,
} from "../utils/kpiUtils";

export default function DashboardPage() {
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

    const metrics = [];

    if (
      selectedStoreRecord.TotalSalesYear != null &&
      Number.isFinite(Number(selectedStoreRecord.TotalSalesYear))
    ) {
      metrics.push({
        label: "Annual sales",
        value: formatCurrency(Number(selectedStoreRecord.TotalSalesYear)),
      });
    }

    if (
      selectedStoreRecord.SalesYoY != null &&
      Number.isFinite(Number(selectedStoreRecord.SalesYoY))
    ) {
      const yoy = Number(selectedStoreRecord.SalesYoY);
      metrics.push({
        label: "YoY change",
        value: `${yoy >= 0 ? "+" : ""}${yoy.toFixed(1)}%`,
        tone: yoy >= 0 ? "success.main" : "error.main",
      });
    }

    if (
      selectedStoreRecord.AvgSalesPerEmployee != null &&
      Number.isFinite(Number(selectedStoreRecord.AvgSalesPerEmployee))
    ) {
      metrics.push({
        label: "Sales per employee",
        value: formatCurrency(Number(selectedStoreRecord.AvgSalesPerEmployee)),
      });
    }

    if (
      selectedStoreRecord.SalesContributionPct != null &&
      Number.isFinite(Number(selectedStoreRecord.SalesContributionPct))
    ) {
      metrics.push({
        label: "Chain contribution",
        value: formatAbsolutePercent(Number(selectedStoreRecord.SalesContributionPct)),
      });
    }

    return metrics;
  }, [selectedStoreRecord]);

  return (
    <Stack spacing={5}>
      <Paper
        elevation={0}
        sx={(theme) => ({
          borderRadius: 3,
          p: { xs: 3, md: 4 },
          border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
          backgroundColor: theme.palette.background.paper,
        })}
      >
        <Stack spacing={3}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
          >
            <Stack spacing={0.5}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Store KPI snapshot
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {year} · {selectedStoreRecord?.StoreID ?? "Select a store"}
              </Typography>
            </Stack>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              <FormControl fullWidth size="small" disabled={loadingStores}>
                <InputLabel>Year</InputLabel>
                <Select value={year} label="Year" onChange={(event) => setYear(event.target.value)}>
                  {YEAR_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl
                fullWidth
                size="small"
                disabled={loadingStores || stores.length === 0}
              >
                <InputLabel>Store</InputLabel>
                <Select
                  value={selectedStore}
                  label="Store"
                  onChange={(event) => setSelectedStore(event.target.value)}
                >
                  {stores.map((store) => {
                    const yoy =
                      store.SalesYoY != null && Number.isFinite(Number(store.SalesYoY))
                        ? Number(store.SalesYoY)
                        : null;
                    return (
                      <MenuItem key={store.StoreID} value={store.StoreID}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{ width: "100%" }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {store.StoreID}
                          </Typography>
                          <Stack spacing={0.5} alignItems="flex-end">
                            {store.TotalSalesYear != null && (
                              <Typography variant="body2" color="text.secondary">
                                {formatCurrency(store.TotalSalesYear)}
                              </Typography>
                            )}
                            {yoy != null && (
                              <Typography
                                variant="caption"
                                sx={{ color: yoy >= 0 ? "success.main" : "error.main" }}
                              >
                                {`${yoy >= 0 ? "+" : ""}${yoy.toFixed(1)}%`}
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
          </Stack>

          {storeHighlights.length > 0 && (
            <Grid container spacing={2}>
              {storeHighlights.map((metric) => (
                <Grid key={metric.label} item xs={12} sm={6} md={3}>
                  <Box
                    sx={(theme) => ({
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                      p: 2.5,
                    })}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
                    >
                      {metric.label}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ mt: 1, fontWeight: 700, color: metric.tone ?? "text.primary" }}
                    >
                      {metric.value}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </Stack>
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
  );
}

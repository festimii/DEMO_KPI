import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Alert,
  Box,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  YEAR_OPTIONS,
  formatPercent,
  normalizeStoreRecord,
} from "../utils/kpiUtils";

const monthFormatter = (value) =>
  new Date(0, Number(value) - 1).toLocaleString("default", { month: "short" });

const parseNumeric = (value) => {
  if (value == null || value === "") return null;
  const cleaned = typeof value === "string" ? value.replace(/%/g, "") : value;
  const numeric = Number(cleaned);
  return Number.isFinite(numeric) ? numeric : null;
};

export default function TurnoverPage() {
  const [year, setYear] = useState(YEAR_OPTIONS[0]);
  const [stores, setStores] = useState([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const [selectedStore, setSelectedStore] = useState("");
  const [turnoverData, setTurnoverData] = useState([]);
  const [loadingTurnover, setLoadingTurnover] = useState(false);
  const [error, setError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("ALL");

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
    setSelectedMonth("ALL");
  }, [selectedStore, year]);

  useEffect(() => {
    if (!selectedStore) {
      setTurnoverData([]);
      return;
    }

    setLoadingTurnover(true);
    setError("");
    axios
      .get(`http://localhost:4000/api/kpis/store/${selectedStore}/turnover`, {
        params: { year },
      })
      .then((res) => {
        const rows = Array.isArray(res.data) ? res.data : [];
        setTurnoverData(rows);
        if (rows.length > 0) {
          const months = Array.from(new Set(rows.map((row) => Number(row.MonthNumber)))).filter(
            (value) => Number.isFinite(value)
          );
          months.sort((a, b) => a - b);
          if (months.length > 0) {
            setSelectedMonth((previous) => (previous === "ALL" ? months[months.length - 1] : previous));
          }
        }
      })
      .catch(() => setError("Unable to load turnover details for the selected filters."))
      .finally(() => setLoadingTurnover(false));
  }, [selectedStore, year]);

  const availableMonths = useMemo(() => {
    const months = Array.from(new Set(turnoverData.map((row) => Number(row.MonthNumber)))).filter(
      (value) => Number.isFinite(value)
    );
    return months.sort((a, b) => a - b);
  }, [turnoverData]);

  const filteredData = useMemo(() => {
    if (selectedMonth === "ALL") {
      return turnoverData;
    }
    return turnoverData.filter((row) => Number(row.MonthNumber) === Number(selectedMonth));
  }, [turnoverData, selectedMonth]);

  const jobTitleSummary = useMemo(() => {
    const accumulator = new Map();
    filteredData.forEach((row) => {
      const jobTitle = row.JobTitle ?? "Unknown";
      const turnoverPct = parseNumeric(row.TurnoverPct);
      const terminations = parseNumeric(row.Terminations) ?? 0;
      const startHeadcount = parseNumeric(row.Start_Headcount) ?? 0;
      const endHeadcount = parseNumeric(row.End_Headcount) ?? 0;

      if (!accumulator.has(jobTitle)) {
        accumulator.set(jobTitle, {
          jobTitle,
          totalPct: 0,
          totalEntries: 0,
          totalTerminations: 0,
          totalStart: 0,
          totalEnd: 0,
        });
      }

      const entry = accumulator.get(jobTitle);
      if (turnoverPct != null) {
        entry.totalPct += turnoverPct;
        entry.totalEntries += 1;
      }
      entry.totalTerminations += terminations;
      entry.totalStart += startHeadcount;
      entry.totalEnd += endHeadcount;
    });

    return Array.from(accumulator.values())
      .map((entry) => ({
        jobTitle: entry.jobTitle,
        avgTurnover: entry.totalEntries ? entry.totalPct / entry.totalEntries : 0,
        terminations: entry.totalTerminations,
        startHeadcount: entry.totalStart,
        endHeadcount: entry.totalEnd,
      }))
      .sort((a, b) => b.avgTurnover - a.avgTurnover);
  }, [filteredData]);

  const summaryMetrics = useMemo(() => {
    if (filteredData.length === 0) {
      return [];
    }

    const totals = filteredData.reduce(
      (acc, row) => {
        const turnoverPct = parseNumeric(row.TurnoverPct);
        const terminations = parseNumeric(row.Terminations) ?? 0;
        const startHeadcount = parseNumeric(row.Start_Headcount) ?? 0;
        const endHeadcount = parseNumeric(row.End_Headcount) ?? 0;

        if (turnoverPct != null) {
          acc.totalTurnover += turnoverPct;
          acc.count += 1;
        }
        acc.terminations += terminations;
        acc.startHeadcount += startHeadcount;
        acc.endHeadcount += endHeadcount;
        return acc;
      },
      { totalTurnover: 0, count: 0, terminations: 0, startHeadcount: 0, endHeadcount: 0 }
    );

    const averageTurnover = totals.count ? totals.totalTurnover / totals.count : null;
    const headcountChange = totals.endHeadcount - totals.startHeadcount;

    return [
      {
        label: "Avg turnover",
        value: averageTurnover != null ? formatPercent(averageTurnover) : "—",
      },
      {
        label: "Terminations",
        value: totals.terminations.toLocaleString(),
      },
      {
        label: "Headcount change",
        value: `${headcountChange >= 0 ? "+" : ""}${headcountChange.toLocaleString()}`,
      },
    ];
  }, [filteredData]);

  const hasData = turnoverData.length > 0;

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
                Turnover by job title
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {year} · {selectedStore || "Select a store"}
              </Typography>
            </Stack>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              sx={{ width: { xs: "100%", md: "auto" } }}
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
                  {stores.map((store) => (
                    <MenuItem key={store.StoreID} value={store.StoreID}>
                      {store.StoreID}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small" disabled={availableMonths.length === 0}>
                <InputLabel>Month</InputLabel>
                <Select
                  value={selectedMonth}
                  label="Month"
                  onChange={(event) => setSelectedMonth(event.target.value)}
                >
                  <MenuItem value="ALL">All months</MenuItem>
                  {availableMonths.map((month) => (
                    <MenuItem key={month} value={month}>
                      {monthFormatter(month)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Stack>

          {summaryMetrics.length > 0 && (
            <Grid container spacing={2}>
              {summaryMetrics.map((metric) => (
                <Grid key={metric.label} item xs={12} sm={4}>
                  <Box
                    sx={(theme) => ({
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                      p: 2.5,
                      height: "100%",
                    })}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
                    >
                      {metric.label}
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 1, fontWeight: 700 }}>
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

      {loadingTurnover ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress />
        </Box>
      ) : !hasData ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          {loadingStores ? (
            <Skeleton variant="rounded" width={320} height={160} />
          ) : (
            <Typography variant="body1" color="text.secondary">
              Select a store to view turnover trends.
            </Typography>
          )}
        </Box>
      ) : (
        <Stack spacing={4}>
          <Paper
            elevation={0}
            sx={(theme) => ({
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
              backgroundColor: theme.palette.background.paper,
              p: { xs: 3, md: 4 },
            })}
          >
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Turnover distribution
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedMonth === "ALL"
                    ? "Average turnover across months"
                    : `${monthFormatter(selectedMonth)} turnover`}
                </Typography>
              </Stack>
              <Box sx={{ width: "100%", height: { xs: 340, md: 400 } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={jobTitleSummary}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="jobTitle" tick={{ fontSize: 12 }} interval={0} angle={-30} dy={10} />
                    <YAxis yAxisId="left" tickFormatter={(value) => `${value.toFixed(1)}%`} />
                    <YAxis yAxisId="right" orientation="right" allowDecimals={false} />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === "avgTurnover") {
                          return [`${Number(value).toFixed(1)}%`, "Avg turnover %"];
                        }
                        if (name === "terminations") {
                          return [Number(value).toLocaleString(), "Terminations"];
                        }
                        return [value, name];
                      }}
                      labelFormatter={(label) => label}
                    />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="avgTurnover"
                      name="Avg turnover %"
                      fill="#8b5cf6"
                      radius={[8, 8, 0, 0]}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="terminations"
                      name="Terminations"
                      stroke="#f97316"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </Box>
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={(theme) => ({
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
              backgroundColor: theme.palette.background.paper,
              p: { xs: 2, md: 3 },
            })}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Detailed turnover records
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Month</TableCell>
                    <TableCell>Job title</TableCell>
                    <TableCell>Gender</TableCell>
                    <TableCell align="right">Start headcount</TableCell>
                    <TableCell align="right">End headcount</TableCell>
                    <TableCell align="right">Terminations</TableCell>
                    <TableCell align="right">Turnover %</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.map((row, index) => (
                    <TableRow key={`${row.JobTitle}-${row.Gender}-${row.MonthNumber}-${index}`}>
                      <TableCell>{monthFormatter(row.MonthNumber)}</TableCell>
                      <TableCell>{row.JobTitle}</TableCell>
                      <TableCell>{row.Gender}</TableCell>
                      <TableCell align="right">
                        {parseNumeric(row.Start_Headcount)?.toLocaleString() ?? "—"}
                      </TableCell>
                      <TableCell align="right">
                        {parseNumeric(row.End_Headcount)?.toLocaleString() ?? "—"}
                      </TableCell>
                      <TableCell align="right">
                        {parseNumeric(row.Terminations)?.toLocaleString() ?? "—"}
                      </TableCell>
                      <TableCell align="right">
                        {(() => {
                          const numeric = parseNumeric(row.TurnoverPct);
                          return numeric != null ? `${numeric.toFixed(1)}%` : "—";
                        })()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Stack>
      )}
    </Stack>
  );
}

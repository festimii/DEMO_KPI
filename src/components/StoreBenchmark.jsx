import React, { useMemo } from "react";
import { Card, CardContent, Grid, Stack, Typography, Chip } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

const formatCurrency = (value) =>
  value != null
    ? value.toLocaleString(undefined, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      })
    : "-";

const formatPercent = (value) =>
  value != null ? `${Number(value).toFixed(1)}%` : "-";

const formatNumber = (value, options) =>
  value != null ? Number(value).toLocaleString(undefined, options) : "-";

function DeltaChip({ delta, label, invert = false, formatter }) {
  if (delta == null || Number.isNaN(delta)) {
    return null;
  }

  const adjustedDelta = invert ? -delta : delta;
  const positive = adjustedDelta >= 0;
  const Icon = positive ? TrendingUpIcon : TrendingDownIcon;
  const absolute = Math.abs(delta);
  const valueText = formatter
    ? formatter(absolute)
    : `${absolute.toFixed(1)}%`;
  const prefix = delta >= 0 ? "+" : "-";

  return (
    <Chip
      size="small"
      icon={<Icon fontSize="small" />}
      color={positive ? "success" : "error"}
      label={`${prefix}${valueText} ${label}`}
      sx={{ fontWeight: 600 }}
    />
  );
}

export default function StoreBenchmark({ storeId, comparison }) {
  const { storeSummary, peerSummary } = comparison ?? {};

  const metrics = useMemo(() => {
    if (!storeSummary || !peerSummary) {
      return [];
    }

    const salesGrowthDelta =
      storeSummary.SalesYoYPct != null && peerSummary.SalesYoYPct != null
        ? storeSummary.SalesYoYPct - peerSummary.SalesYoYPct
        : null;

    const salesPerEmployeeDelta =
      storeSummary.AvgSalesPerEmployee != null && peerSummary.AvgSalesPerEmployee != null
        ? storeSummary.AvgSalesPerEmployee - peerSummary.AvgSalesPerEmployee
        : null;

    const turnoverDelta =
      storeSummary.AvgTurnover != null && peerSummary.AvgTurnover != null
        ? storeSummary.AvgTurnover - peerSummary.AvgTurnover
        : null;

    const headcountGrowthDelta =
      storeSummary.AvgHeadcountGrowth != null && peerSummary.AvgHeadcountGrowth != null
        ? storeSummary.AvgHeadcountGrowth - peerSummary.AvgHeadcountGrowth
        : null;

    return [
      {
        title: "YoY Sales Growth",
        primary: formatPercent(storeSummary.SalesYoYPct),
        secondary:
          peerSummary.SalesYoYPct != null
            ? `Network: ${formatPercent(peerSummary.SalesYoYPct)}`
            : "Network: -",
        delta: salesGrowthDelta,
        invert: false,
        formatter: (value) => `${value.toFixed(1)}%`,
      },
      {
        title: "Sales per Employee",
        primary: formatCurrency(storeSummary.AvgSalesPerEmployee),
        secondary:
          peerSummary.AvgSalesPerEmployee != null
            ? `Network: ${formatCurrency(peerSummary.AvgSalesPerEmployee)}`
            : "Network: -",
        delta: salesPerEmployeeDelta,
        invert: false,
        formatter: (value) =>
          value.toLocaleString(undefined, {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          }),
      },
      {
        title: "Turnover Rate",
        primary: formatPercent(storeSummary.AvgTurnover),
        secondary:
          peerSummary.AvgTurnover != null
            ? `Network: ${formatPercent(peerSummary.AvgTurnover)}`
            : "Network: -",
        delta: turnoverDelta,
        invert: true,
        formatter: (value) => `${value.toFixed(1)}%`,
      },
      {
        title: "Headcount Growth",
        primary: formatPercent(storeSummary.AvgHeadcountGrowth),
        secondary:
          peerSummary.AvgHeadcountGrowth != null
            ? `Network: ${formatPercent(peerSummary.AvgHeadcountGrowth)}`
            : "Network: -",
        delta: headcountGrowthDelta,
        invert: false,
        formatter: (value) => `${value.toFixed(1)}%`,
      },
      {
        title: "Average Headcount",
        primary: formatNumber(storeSummary.AvgHeadcount, {
          maximumFractionDigits: 1,
          minimumFractionDigits: 1,
        }),
        secondary:
          peerSummary.AvgHeadcount != null
            ? `Network: ${formatNumber(peerSummary.AvgHeadcount, {
                maximumFractionDigits: 1,
                minimumFractionDigits: 1,
              })}`
            : "Network: -",
        delta:
          storeSummary.AvgHeadcount != null && peerSummary.AvgHeadcount != null
            ? storeSummary.AvgHeadcount - peerSummary.AvgHeadcount
            : null,
        invert: false,
        formatter: (value) =>
          value.toLocaleString(undefined, {
            maximumFractionDigits: 1,
            minimumFractionDigits: 1,
          }),
      },
    ];
  }, [storeSummary, peerSummary]);

  if (!storeSummary || !peerSummary) {
    return null;
  }

  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: "0 20px 45px rgba(15, 23, 42, 0.12)",
        border: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <CardContent>
        <Stack spacing={0.5} mb={3}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Store Benchmarks – {storeId}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Benchmark this store against network averages and last year's performance.
          </Typography>
        </Stack>
        <Grid container spacing={3}>
          {metrics.map((metric) => (
            <Grid item xs={12} md={6} key={metric.title}>
              <Stack
                spacing={1}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  background: (theme) => theme.palette.background.paper,
                }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  {metric.title}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {metric.primary}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {metric.secondary}
                </Typography>
                <DeltaChip
                  delta={metric.delta}
                  label="vs network"
                  invert={metric.invert}
                  formatter={metric.formatter}
                />
              </Stack>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}

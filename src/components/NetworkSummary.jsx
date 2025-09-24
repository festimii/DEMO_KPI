import React from "react";
import {
  Grid,
  Stack,
  Typography,
  Skeleton,
  Card,
  CardContent,
} from "@mui/material";
import KpiCard from "./KpiCard";

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

const formatNumber = (value) =>
  value != null ? Number(value).toLocaleString() : "-";

export default function NetworkSummary({ summary, loading }) {
  if (loading && !summary) {
    return (
      <Grid container spacing={3}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <Skeleton variant="rounded" height={140} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!summary) {
    return null;
  }

  const cards = [
    {
      title: "Total Network Sales",
      value: formatCurrency(summary.TotalSalesYear),
      change: typeof summary.SalesYoYPct === "number" ? summary.SalesYoYPct : null,
    },
    {
      title: "Sales per Employee",
      value: formatCurrency(summary.AvgSalesPerEmployee),
      change:
        typeof summary.SalesPerEmployeeYoYPct === "number"
          ? summary.SalesPerEmployeeYoYPct
          : null,
    },
    {
      title: "Average Headcount",
      value:
        summary.AvgHeadcount != null
          ? Number(summary.AvgHeadcount).toLocaleString(undefined, {
              maximumFractionDigits: 1,
              minimumFractionDigits: 1,
            })
          : "-",
      change:
        typeof summary.HeadcountYoYPct === "number" ? summary.HeadcountYoYPct : null,
    },
    {
      title: "Average Turnover",
      value: formatPercent(summary.AvgTurnover),
      change:
        typeof summary.TurnoverYoYPct === "number" ? summary.TurnoverYoYPct : null,
    },
    {
      title: "Headcount Growth",
      value: formatPercent(summary.AvgHeadcountGrowth),
      change:
        typeof summary.HeadcountGrowthYoYPct === "number"
          ? summary.HeadcountGrowthYoYPct
          : null,
    },
  ];

  return (
    <Stack spacing={2}>
      <Stack spacing={0.5}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Network Snapshot
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Aggregated performance across all stores compared year over year.
        </Typography>
      </Stack>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: "0 18px 40px rgba(15,23,42,0.08)",
              border: (theme) => `1px solid ${theme.palette.divider}`,
              height: "100%",
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Active Stores
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                {formatNumber(summary.StoreCount)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        {cards.map((card) => (
          <Grid item xs={12} sm={6} lg={3} key={card.title}>
            <KpiCard {...card} />
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}

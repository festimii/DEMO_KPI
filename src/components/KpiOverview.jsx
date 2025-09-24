import React from "react";
import { Grid, Typography, Box } from "@mui/material";
import KpiCard from "./KpiCard";

const formatCurrency = (value) =>
  value?.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const toNumber = (value) => {
  if (value == null) return null;
  const numeric =
    typeof value === "string" ? Number.parseFloat(value.replace("%", "")) : Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const formatPercent = (value) => {
  const numeric = toNumber(value);
  return numeric != null ? `${numeric.toFixed(1)}%` : null;
};

const formatPeopleMetric = (value) => {
  const numeric = toNumber(value);
  if (numeric == null) return null;
  return numeric.toFixed(1);
};

export default function KpiOverview({ data }) {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <Typography variant="body1" color="text.secondary">
          No KPI data available for the selected filters.
        </Typography>
      </Box>
    );
  }

  const latest = data[data.length - 1];
  const previous = data.length > 1 ? data[data.length - 2] : null;

  const latestTotalSales = toNumber(latest.TotalSales);
  const prevTotalSales = previous ? toNumber(previous.TotalSales) : null;
  const prevYearTotalSales = toNumber(latest.PrevYearTotalSales);
  const chainAvgSales = toNumber(latest.ChainAvgSales);

  const latestAvgHeadcount = toNumber(latest.AvgHeadcount);
  const prevAvgHeadcount = previous ? toNumber(previous.AvgHeadcount) : null;
  const chainAvgHeadcount = toNumber(latest.ChainAvgHeadcount);

  const latestSalesPerEmployee = toNumber(latest.SalesPerEmployee);
  const prevSalesPerEmployee = previous ? toNumber(previous.SalesPerEmployee) : null;
  const prevYearSalesPerEmployee = toNumber(latest.PrevYearSalesPerEmployee);
  const chainAvgSalesPerEmployee = toNumber(latest.ChainAvgSalesPerEmployee);

  const latestTurnover = toNumber(latest.Turnover);
  const prevTurnover = previous ? toNumber(previous.Turnover) : null;
  const prevYearTurnover = toNumber(latest.PrevYearTurnover);
  const chainAvgTurnover = toNumber(latest.ChainAvgTurnover);

  const cards = [
    {
      title: "Total sales",
      value: latestTotalSales != null ? formatCurrency(latestTotalSales) : "—",
      details: [
        prevTotalSales != null ? `Prev. month: ${formatCurrency(prevTotalSales)}` : null,
        prevYearTotalSales != null ? `Last year: ${formatCurrency(prevYearTotalSales)}` : null,
        chainAvgSales != null ? `Chain avg: ${formatCurrency(chainAvgSales)}` : null,
      ],
    },
    {
      title: "Avg headcount",
      value: latestAvgHeadcount != null ? formatPeopleMetric(latestAvgHeadcount) : null,
      details: [
        prevAvgHeadcount != null ? `Prev. month: ${formatPeopleMetric(prevAvgHeadcount)}` : null,
        chainAvgHeadcount != null ? `Chain avg: ${formatPeopleMetric(chainAvgHeadcount)}` : null,
      ],
    },
    {
      title: "Sales per employee",
      value:
        latestSalesPerEmployee != null ? `$${latestSalesPerEmployee.toFixed(0)}` : null,
      details: [
        prevSalesPerEmployee != null
          ? `Prev. month: $${prevSalesPerEmployee.toFixed(0)}`
          : null,
        prevYearSalesPerEmployee != null
          ? `Last year: $${prevYearSalesPerEmployee.toFixed(0)}`
          : null,
        chainAvgSalesPerEmployee != null
          ? `Chain avg: $${chainAvgSalesPerEmployee.toFixed(0)}`
          : null,
      ],
    },
    {
      title: "Turnover",
      value: latestTurnover != null ? formatPercent(latestTurnover) : null,
      details: [
        prevTurnover != null ? `Prev. month: ${formatPercent(prevTurnover)}` : null,
        prevYearTurnover != null ? `Last year: ${formatPercent(prevYearTurnover)}` : null,
        chainAvgTurnover != null ? `Chain avg: ${formatPercent(chainAvgTurnover)}` : null,
      ],
    },
  ];

  return (
    <Grid container spacing={2.5}>
      {cards.map((card) => (
        <Grid item xs={12} sm={6} lg={3} key={card.title}>
          <KpiCard {...card} />
        </Grid>
      ))}
    </Grid>
  );
}

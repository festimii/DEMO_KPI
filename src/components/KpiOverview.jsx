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

function calculateChange(current, previous) {
  const currentValue = toNumber(current);
  const previousValue = toNumber(previous);

  if (
    currentValue == null ||
    previousValue == null ||
    previousValue === 0 ||
    Number.isNaN(currentValue) ||
    Number.isNaN(previousValue)
  ) {
    return null;
  }

  const percentage = ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
  return Number.isFinite(percentage) ? Number(percentage.toFixed(1)) : null;
}

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

  // Latest and previous records
  const latest = data[data.length - 1];
  const previous = data.length > 1 ? data[data.length - 2] : null;

  const totalSales = toNumber(latest.TotalSales);
  const prevSales = previous ? toNumber(previous.TotalSales) : null;
  const chainAvgSales = toNumber(latest.ChainAvgSales);
  const prevYearSales = toNumber(latest.PrevYearTotalSales);

  const avgHeadcount = toNumber(latest.AvgHeadcount);
  const prevHeadcount = previous ? toNumber(previous.AvgHeadcount) : null;
  const chainAvgHeadcount = toNumber(latest.ChainAvgHeadcount);

  const salesPerEmp = toNumber(latest.SalesPerEmployee);
  const prevSalesPerEmp = previous ? toNumber(previous.SalesPerEmployee) : null;
  const chainAvgSalesPerEmp = toNumber(latest.ChainAvgSalesPerEmployee);
  const prevYearSalesPerEmp = toNumber(latest.PrevYearSalesPerEmployee);

  const turnover = toNumber(latest.Turnover);
  const prevTurnover = previous ? toNumber(previous.Turnover) : null;
  const chainAvgTurnover = toNumber(latest.ChainAvgTurnover);
  const prevYearTurnover = toNumber(latest.PrevYearTurnover);

  const cards = [
    {
      title: "Total Sales",
      value: totalSales != null ? formatCurrency(totalSales) : "-",
      change: calculateChange(totalSales, prevSales),
      secondary: [
        prevYearSales != null
          ? { label: "vs last year", value: calculateChange(totalSales, prevYearSales) }
          : null,
        chainAvgSales != null
          ? { label: "vs chain avg", value: calculateChange(totalSales, chainAvgSales) }
          : null,
      ].filter(Boolean),
    },
    {
      title: "Avg Headcount",
      value: avgHeadcount != null ? avgHeadcount.toFixed(1) : "-",
      change: calculateChange(avgHeadcount, prevHeadcount),
      secondary: [
        chainAvgHeadcount != null
          ? { label: "vs chain avg", value: calculateChange(avgHeadcount, chainAvgHeadcount) }
          : null,
      ].filter(Boolean),
    },
    {
      title: "Sales per Employee",
      value: salesPerEmp != null ? `$${salesPerEmp.toFixed(2)}` : "-",
      change: calculateChange(salesPerEmp, prevSalesPerEmp),
      secondary: [
        prevYearSalesPerEmp != null
          ? { label: "vs last year", value: calculateChange(salesPerEmp, prevYearSalesPerEmp) }
          : null,
        chainAvgSalesPerEmp != null
          ? { label: "vs chain avg", value: calculateChange(salesPerEmp, chainAvgSalesPerEmp) }
          : null,
      ].filter(Boolean),
    },
    {
      title: "Turnover",
      value: turnover != null ? turnover.toFixed(1) + "%" : "-",
      change: calculateChange(turnover, prevTurnover),
      secondary: [
        prevYearTurnover != null
          ? { label: "vs last year", value: calculateChange(turnover, prevYearTurnover) }
          : null,
        chainAvgTurnover != null
          ? { label: "vs chain avg", value: calculateChange(turnover, chainAvgTurnover) }
          : null,
      ].filter(Boolean),
    },
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((card) => (
        <Grid item xs={12} sm={6} lg={3} key={card.title}>
          <KpiCard {...card} />
        </Grid>
      ))}
    </Grid>
  );
}

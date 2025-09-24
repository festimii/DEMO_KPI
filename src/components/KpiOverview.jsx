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
  const avgHeadcount = toNumber(latest.AvgHeadcount);
  const prevHeadcount = previous ? toNumber(previous.AvgHeadcount) : null;

  const salesPerEmp = toNumber(latest.SalesPerEmployee);
  const prevSalesPerEmp = previous ? toNumber(previous.SalesPerEmployee) : null;

  const turnover = toNumber(latest.Turnover);
  const prevTurnover = previous ? toNumber(previous.Turnover) : null;

  const cards = [
    totalSales != null && {
      title: "Total sales",
      value: formatCurrency(totalSales),
      change: prevSales != null ? calculateChange(totalSales, prevSales) : null,
    },
    avgHeadcount != null && {
      title: "Avg headcount",
      value: avgHeadcount.toFixed(1),
      change: prevHeadcount != null ? calculateChange(avgHeadcount, prevHeadcount) : null,
    },
    salesPerEmp != null && {
      title: "Sales per employee",
      value: `$${salesPerEmp.toFixed(0)}`,
      change: prevSalesPerEmp != null ? calculateChange(salesPerEmp, prevSalesPerEmp) : null,
    },
    turnover != null && {
      title: "Turnover",
      value: `${turnover.toFixed(1)}%`,
      change: prevTurnover != null ? calculateChange(turnover, prevTurnover) : null,
    },
  ].filter(Boolean);

  if (cards.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <Typography variant="body1" color="text.secondary">
          No KPI values available yet.
        </Typography>
      </Box>
    );
  }

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

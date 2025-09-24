import React from "react";
import { Grid, Typography, Box } from "@mui/material";
import KpiCard from "./KpiCard";

// Helper: calculate change between two numbers
function calculateChange(current, previous) {
  if (
    current == null ||
    previous == null ||
    previous === 0 ||
    isNaN(current) ||
    isNaN(previous)
  ) {
    return null;
  }
  return (((current - previous) / Math.abs(previous)) * 100).toFixed(1);
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

  // Parse values safely
  const totalSales = latest.TotalSales ?? null;
  const prevSales = previous ? previous.TotalSales : null;

  const avgHeadcount = latest.AvgHeadcount ?? null;
  const prevHeadcount = previous ? previous.AvgHeadcount : null;

  const salesPerEmp = latest.SalesPerEmployee ?? null;
  const prevSalesPerEmp = previous ? previous.SalesPerEmployee : null;

  const turnover = parseFloat(latest.Turnover); // handles "9.09%" → 9.09
  const prevTurnover = previous ? parseFloat(previous.Turnover) : null;

  const cards = [
    {
      title: "Total Sales",
      value: totalSales != null ? `$${totalSales.toLocaleString()}` : "-",
      change: calculateChange(totalSales, prevSales),
    },
    {
      title: "Avg Headcount",
      value: avgHeadcount != null ? avgHeadcount.toFixed(1) : "-",
      change: calculateChange(avgHeadcount, prevHeadcount),
    },
    {
      title: "Sales per Employee",
      value: salesPerEmp != null ? `$${salesPerEmp.toFixed(2)}` : "-",
      change: calculateChange(salesPerEmp, prevSalesPerEmp),
    },
    {
      title: "Turnover",
      value: !isNaN(turnover) ? turnover.toFixed(1) + "%" : "-",
      change: calculateChange(turnover, prevTurnover),
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

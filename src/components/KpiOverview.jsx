import React from "react";
import { Grid, Typography, Box } from "@mui/material";
import KpiCard from "./KpiCard";

function calculateChange(current, previous) {
  if (previous === 0 || previous === undefined || previous === null) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
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

  const latest = data[data.length - 1];
  const previous = data.length > 1 ? data[data.length - 2] : null;

  const cards = [
    {
      title: "Total Sales",
      value: `$${latest.TotalSales.toLocaleString()}`,
      change: previous ? calculateChange(latest.TotalSales, previous.TotalSales) : null,
    },
    {
      title: "Avg Headcount",
      value: latest.AvgHeadcount.toFixed(1),
      change: previous
        ? calculateChange(latest.AvgHeadcount, previous.AvgHeadcount)
        : null,
    },
    {
      title: "Sales per Employee",
      value: `$${latest.SalesPerEmployee.toFixed(2)}`,
      change: previous
        ? calculateChange(latest.SalesPerEmployee, previous.SalesPerEmployee)
        : null,
    },
    {
      title: "Turnover",
      value: `${latest.Turnover.toFixed(1)}%`,
      change: previous ? calculateChange(latest.Turnover, previous.Turnover) : null,
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

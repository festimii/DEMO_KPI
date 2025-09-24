import React from "react";
import { Grid } from "@mui/material";
import KpiCard from "./KpiCard";

export default function KpiOverview({ data }) {
  const latest = data[data.length - 1];

  const cards = [
    { title: "Total Sales", value: `$${latest.TotalSales.toLocaleString()}` },
    { title: "Avg Headcount", value: latest.AvgHeadcount.toFixed(2) },
    {
      title: "Sales per Employee",
      value: `$${latest.SalesPerEmployee.toFixed(2)}`,
    },
    { title: "Turnover", value: `${latest.Turnover}%` },
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((c, i) => (
        <Grid item xs={12} md={3} key={i}>
          <KpiCard {...c} change={0} />
        </Grid>
      ))}
    </Grid>
  );
}

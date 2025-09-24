import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Area,
  Bar,
  Line,
} from "recharts";
import { Card, CardContent, Typography, Chip, Stack } from "@mui/material";

const monthFormatter = (value) =>
  new Date(0, Number(value) - 1).toLocaleString("default", { month: "short" });

export default function EfficiencyTrend({ data }) {
  if (!data || data.length === 0) return null;

  const parseValue = (value) => {
    if (value == null || value === "") return null;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  };

  const enhancedData = data.map((item) => ({
    ...item,
    SalesPerEmployee: parseValue(item.SalesPerEmployee),
    ChainAvgSalesPerEmployee: parseValue(item.ChainAvgSalesPerEmployee),
    AvgHeadcount: parseValue(item.AvgHeadcount),
    ChainAvgHeadcount: parseValue(item.ChainAvgHeadcount),
  }));

  return (
    <Card
      sx={{ borderRadius: 4, boxShadow: "0 18px 40px rgba(15,23,42,0.08)" }}
    >
      <CardContent>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems="flex-start"
          mb={3}
        >
          <div>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              Workforce Efficiency
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Compare sales productivity with average headcount across the year.
            </Typography>
          </div>
          <Chip label="Higher is better" color="success" variant="outlined" />
        </Stack>
        <ResponsiveContainer width="100%" height={360}>
          <ComposedChart data={enhancedData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
            <XAxis dataKey="MonthNumber" tickFormatter={monthFormatter} />
            <YAxis
              yAxisId="left"
              stroke="#0ea5e9"
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#22c55e"
              tickFormatter={(value) => value.toFixed(0)}
            />
            <Tooltip
              labelFormatter={(label) => monthFormatter(label)}
              formatter={(value, name) => {
                if (name === "SalesPerEmployee") {
                  return [`$${Number(value).toFixed(0)}`, "Sales per Employee"];
                }
                if (name === "ChainAvgSalesPerEmployee") {
                  return [
                    `$${Number(value).toFixed(0)}`,
                    "Chain Avg Sales per Employee",
                  ];
                }
                if (name === "AvgHeadcount") {
                  return [Number(value).toFixed(0), "Avg Headcount"];
                }
                if (name === "ChainAvgHeadcount") {
                  return [Number(value).toFixed(0), "Chain Avg Headcount"];
                }
                return [value, name];
              }}
            />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="SalesPerEmployee"
              name="Store Sales per Employee"
              stroke="#0ea5e9"
              fill="#0ea5e933"
              strokeWidth={3}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="ChainAvgSalesPerEmployee"
              name="Chain Avg Sales per Employee"
              stroke="#38bdf8"
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={false}
            />
            <Bar
              yAxisId="right"
              dataKey="AvgHeadcount"
              name="Store Avg Headcount"
              fill="#22c55e"
              radius={[12, 12, 0, 0]}
              barSize={28}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="ChainAvgHeadcount"
              name="Chain Avg Headcount"
              stroke="#4ade80"
              strokeWidth={3}
              strokeDasharray="3 6"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

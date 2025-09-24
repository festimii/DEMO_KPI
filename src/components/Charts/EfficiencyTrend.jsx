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
} from "recharts";
import { Card, CardContent, Typography, Chip, Stack } from "@mui/material";

const monthFormatter = (value) =>
  new Date(0, Number(value) - 1).toLocaleString("default", { month: "short" });

export default function EfficiencyTrend({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <Card sx={{ borderRadius: 4, boxShadow: "0 18px 40px rgba(15,23,42,0.08)" }}>
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
          <ComposedChart data={data}>
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
                if (name === "AvgHeadcount") {
                  return [Number(value).toFixed(0), "Avg Headcount"];
                }
                return [value, name];
              }}
            />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="SalesPerEmployee"
              stroke="#0ea5e9"
              fill="#0ea5e933"
              strokeWidth={3}
              activeDot={{ r: 6 }}
            />
            <Bar
              yAxisId="right"
              dataKey="AvgHeadcount"
              fill="#22c55e"
              radius={[12, 12, 0, 0]}
              barSize={28}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

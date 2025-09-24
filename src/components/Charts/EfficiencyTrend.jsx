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
import { Card, CardContent, Typography, Stack } from "@mui/material";

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

  const hasSalesPerEmployee = enhancedData.some((item) => item.SalesPerEmployee != null);
  const hasChainSalesPerEmployee = enhancedData.some(
    (item) => item.ChainAvgSalesPerEmployee != null
  );
  const hasAvgHeadcount = enhancedData.some((item) => item.AvgHeadcount != null);
  const hasChainAvgHeadcount = enhancedData.some((item) => item.ChainAvgHeadcount != null);

  const hasLeftSeries = hasSalesPerEmployee || hasChainSalesPerEmployee;
  const hasRightSeries = hasAvgHeadcount || hasChainAvgHeadcount;

  if (!hasLeftSeries && !hasRightSeries) {
    return null;
  }

  const year = data[0]?.Year;

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: "none",
        border: (theme) => `1px solid ${theme.palette.divider}`,
        backgroundColor: (theme) => theme.palette.background.paper,
      }}
    >
      <CardContent>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1.5}
          mb={2}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Efficiency trend
          </Typography>
          {year && (
            <Typography variant="body2" color="text.secondary">
              FY {year}
            </Typography>
          )}
        </Stack>
        <ResponsiveContainer width="100%" height={360}>
          <ComposedChart data={enhancedData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
            <XAxis dataKey="MonthNumber" tickFormatter={monthFormatter} />
            {hasLeftSeries && (
              <YAxis
                yAxisId="left"
                stroke="#0ea5e9"
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
            )}
            {hasRightSeries && (
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#22c55e"
                tickFormatter={(value) => value.toFixed(0)}
              />
            )}
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
            {hasSalesPerEmployee && (
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
            )}
            {hasChainSalesPerEmployee && (
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
            )}
            {hasAvgHeadcount && (
              <Bar
                yAxisId="right"
                dataKey="AvgHeadcount"
                name="Store Avg Headcount"
                fill="#22c55e"
                radius={[12, 12, 0, 0]}
                barSize={28}
              />
            )}
            {hasChainAvgHeadcount && (
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
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

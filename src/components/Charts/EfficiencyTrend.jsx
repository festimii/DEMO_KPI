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
import { Card, CardContent, Typography, Stack, Divider } from "@mui/material";

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
        borderRadius: 4,
        boxShadow: "0 10px 36px rgba(15, 23, 42, 0.09)",
        border: "none",
        background: (theme) =>
          theme.palette.mode === "dark"
            ? `linear-gradient(140deg, ${theme.palette.grey[900]}, ${theme.palette.grey[800]})`
            : "linear-gradient(140deg, #ecfdf5, #f0fdf4)",
      }}
    >
      <CardContent sx={{ px: { xs: 3, md: 4 }, py: { xs: 3, md: 4 } }}>
        <Stack spacing={2.5} mb={3}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1.5}
          >
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 0.3 }}>
              Efficiency trend
            </Typography>
            {year && (
              <Typography variant="body2" color="text.secondary">
                FY {year}
              </Typography>
            )}
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Visualize productivity alongside staffing changes to spot months where
            efficiency gains or losses align with headcount shifts.
          </Typography>
        </Stack>
        <Divider sx={{ opacity: 0.2, mb: 3 }} />
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart
            data={enhancedData}
            margin={{ top: 10, right: 24, left: 8, bottom: 0 }}
          >
            <defs>
              <linearGradient id="salesPerEmployeeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 8" stroke="rgba(15, 23, 42, 0.08)" />
            <XAxis
              dataKey="MonthNumber"
              tickFormatter={monthFormatter}
              tickLine={false}
              axisLine={false}
            />
            {hasLeftSeries && (
              <YAxis
                yAxisId="left"
                stroke="#0284c7"
                tickFormatter={(value) => `$${value.toFixed(0)}`}
                axisLine={false}
                tickLine={false}
                label={{
                  value: "Sales per employee",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
            )}
            {hasRightSeries && (
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#16a34a"
                tickFormatter={(value) => value.toFixed(0)}
                axisLine={false}
                tickLine={false}
                label={{ value: "Headcount", angle: 90, position: "insideRight" }}
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
              contentStyle={{
                borderRadius: 12,
                border: "1px solid rgba(148, 163, 184, 0.35)",
                boxShadow: "0 8px 20px rgba(15, 23, 42, 0.1)",
              }}
            />
            <Legend wrapperStyle={{ paddingTop: 12 }} iconType="circle" />
            {hasSalesPerEmployee && (
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="SalesPerEmployee"
                name="Store sales per employee"
                stroke="#0284c7"
                fill="url(#salesPerEmployeeGradient)"
                strokeWidth={3}
                activeDot={{ r: 7 }}
              />
            )}
            {hasChainSalesPerEmployee && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="ChainAvgSalesPerEmployee"
                name="Chain avg sales per employee"
                stroke="#38bdf8"
                strokeWidth={3}
                strokeDasharray="10 6"
                dot={false}
              />
            )}
            {hasAvgHeadcount && (
              <Bar
                yAxisId="right"
                dataKey="AvgHeadcount"
                name="Store avg headcount"
                fill="#22c55e"
                radius={[16, 16, 0, 0]}
                barSize={32}
              />
            )}
            {hasChainAvgHeadcount && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="ChainAvgHeadcount"
                name="Chain avg headcount"
                stroke="#4ade80"
                strokeWidth={3}
                strokeDasharray="6 6"
                dot={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

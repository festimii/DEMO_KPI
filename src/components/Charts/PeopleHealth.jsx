import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
} from "recharts";
import { Card, CardContent, Typography, Stack, Divider } from "@mui/material";

const monthFormatter = (value) =>
  new Date(0, Number(value) - 1).toLocaleString("default", { month: "short" });

export default function PeopleHealth({ data }) {
  if (!data || data.length === 0) return null;

  const parseValue = (value) => {
    if (value == null || value === "") return null;
    const numeric = Number.parseFloat(value);
    return Number.isFinite(numeric) ? numeric : null;
  };

  const normalizedData = data.map((item) => ({
    ...item,
    HeadcountGrowthPct: parseValue(item.HeadcountGrowthPct),
    Turnover: parseValue(item.Turnover),
    ChainAvgGrowth: parseValue(item.ChainAvgGrowth),
    ChainAvgTurnover: parseValue(item.ChainAvgTurnover),
  }));

  const hasHeadcountGrowth = normalizedData.some((item) => item.HeadcountGrowthPct != null);
  const hasChainGrowth = normalizedData.some((item) => item.ChainAvgGrowth != null);
  const hasTurnover = normalizedData.some((item) => item.Turnover != null);
  const hasChainTurnover = normalizedData.some((item) => item.ChainAvgTurnover != null);

  const hasLeftSeries = hasHeadcountGrowth || hasChainGrowth;
  const hasRightSeries = hasTurnover || hasChainTurnover;

  if (!hasLeftSeries && !hasRightSeries) {
    return null;
  }

  const year = data[0]?.Year;

  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: "0 10px 36px rgba(15, 23, 42, 0.08)",
        border: "none",
        background: (theme) =>
          theme.palette.mode === "dark"
            ? `linear-gradient(135deg, ${theme.palette.grey[900]}, ${theme.palette.grey[800]})`
            : "linear-gradient(135deg, #fdf2f8, #fce7f3)",
      }}
    >
      <CardContent sx={{ px: { xs: 3, md: 4 }, py: { xs: 3, md: 4 } }}>
        <Stack spacing={2} mb={3}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1.5}
          >
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 0.3 }}>
              People health
            </Typography>
            {year && (
              <Typography variant="body2" color="text.secondary">
                FY {year}
              </Typography>
            )}
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Monitor retention and growth rates side-by-side to quickly identify
            people risks or standout improvements.
          </Typography>
        </Stack>
        <Divider sx={{ opacity: 0.2, mb: 3 }} />
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={normalizedData}
            margin={{ top: 10, right: 24, left: 8, bottom: 0 }}
          >
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
                stroke="#7c3aed"
                tickFormatter={(value) => `${value.toFixed(1)}%`}
                axisLine={false}
                tickLine={false}
                label={{ value: "Headcount growth", angle: -90, position: "insideLeft" }}
              />
            )}
            {hasRightSeries && (
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#f97316"
                tickFormatter={(value) => `${value.toFixed(1)}%`}
                axisLine={false}
                tickLine={false}
                label={{ value: "Turnover", angle: 90, position: "insideRight" }}
              />
            )}
            <Tooltip
              labelFormatter={(label) => monthFormatter(label)}
              formatter={(value, name) => {
                const formattedValue = `${Number(value).toFixed(1)}%`;
                switch (name) {
                  case "HeadcountGrowthPct":
                    return [formattedValue, "Headcount Growth"];
                  case "ChainAvgGrowth":
                    return [formattedValue, "Chain Avg Headcount Growth"];
                  case "Turnover":
                    return [formattedValue, "Turnover"];
                  case "ChainAvgTurnover":
                    return [formattedValue, "Chain Avg Turnover"];
                  default:
                    return [formattedValue, name];
                }
              }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid rgba(148, 163, 184, 0.35)",
                boxShadow: "0 8px 20px rgba(15, 23, 42, 0.1)",
              }}
            />
            <Legend wrapperStyle={{ paddingTop: 12 }} iconType="circle" />
            {hasHeadcountGrowth && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="HeadcountGrowthPct"
                name="Store headcount growth"
                stroke="#7c3aed"
                strokeWidth={3.2}
                dot={{ r: 4 }}
                activeDot={{ r: 7 }}
              />
            )}
            {hasChainGrowth && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="ChainAvgGrowth"
                name="Chain avg headcount growth"
                stroke="#c084fc"
                strokeWidth={3}
                strokeDasharray="10 6"
                dot={false}
              />
            )}
            {hasTurnover && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="Turnover"
                name="Store turnover"
                stroke="#f97316"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 7 }}
              />
            )}
            {hasChainTurnover && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="ChainAvgTurnover"
                name="Chain avg turnover"
                stroke="#fbbf24"
                strokeWidth={3}
                strokeDasharray="6 6"
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

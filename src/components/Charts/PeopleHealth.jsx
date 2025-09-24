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
import { Card, CardContent, Typography, Stack } from "@mui/material";

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

  const hasGrowth = normalizedData.some((item) => item.HeadcountGrowthPct != null);
  const hasChainGrowth = normalizedData.some((item) => item.ChainAvgGrowth != null);
  const hasTurnover = normalizedData.some((item) => item.Turnover != null);
  const hasChainTurnover = normalizedData.some((item) => item.ChainAvgTurnover != null);

  const showChart = hasGrowth || hasChainGrowth || hasTurnover || hasChainTurnover;

  return (
    <Card
      elevation={0}
      sx={{ borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}` }}
    >
      <CardContent>
        <Stack spacing={0.5} mb={3}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            People health
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Growth and turnover trends.
          </Typography>
        </Stack>
        {!showChart ? (
          <Typography variant="body2" color="text.secondary">
            No headcount growth or turnover data is available yet.
          </Typography>
        ) : (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={normalizedData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
            <XAxis dataKey="MonthNumber" tickFormatter={monthFormatter} />
            <YAxis
              yAxisId="left"
              stroke="#8b5cf6"
              tickFormatter={(value) => `${value.toFixed(1)}%`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#f97316"
              tickFormatter={(value) => `${value.toFixed(1)}%`}
            />
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
            />
            <Legend />
            {hasGrowth && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="HeadcountGrowthPct"
                name="Store Headcount Growth"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ r: 3 }}
              />
            )}
            {hasChainGrowth && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="ChainAvgGrowth"
                name="Chain Avg Headcount Growth"
                stroke="#c084fc"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={false}
              />
            )}
            {hasTurnover && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="Turnover"
                name="Store Turnover"
                stroke="#f97316"
                strokeWidth={3}
                dot={{ r: 3 }}
              />
            )}
            {hasChainTurnover && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="ChainAvgTurnover"
                name="Chain Avg Turnover"
                stroke="#fbbf24"
                strokeWidth={3}
                strokeDasharray="3 6"
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

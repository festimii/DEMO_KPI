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

  return (
    <Card sx={{ borderRadius: 4, boxShadow: "0 18px 40px rgba(15,23,42,0.08)" }}>
      <CardContent>
        <Stack spacing={1} mb={3}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            People Health
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor headcount growth and turnover to stay ahead of retention risks.
          </Typography>
        </Stack>
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
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="HeadcountGrowthPct"
              name="Store Headcount Growth"
              stroke="#8b5cf6"
              strokeWidth={3}
              dot={{ r: 3 }}
            />
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
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="Turnover"
              name="Store Turnover"
              stroke="#f97316"
              strokeWidth={3}
              dot={{ r: 3 }}
            />
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
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

import React, { useMemo } from "react";
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

export default function PeopleHealth({ data, comparison }) {
  const chartData = useMemo(() => {
    const merged = new Map();

    if (Array.isArray(data)) {
      data.forEach((item) => {
        merged.set(item.MonthNumber, {
          ...item,
          PeerHeadcountGrowthPct: null,
          PeerTurnover: null,
        });
      });
    }

    if (Array.isArray(comparison)) {
      comparison.forEach((peer) => {
        const existing = merged.get(peer.MonthNumber) ?? {
          MonthNumber: peer.MonthNumber,
          HeadcountGrowthPct: peer.StoreHeadcountGrowthPct ?? null,
          Turnover: peer.StoreTurnover ?? null,
        };
        merged.set(peer.MonthNumber, {
          ...existing,
          PeerHeadcountGrowthPct: peer.AvgPeerHeadcountPct ?? null,
          PeerTurnover: peer.AvgPeerTurnover ?? null,
        });
      });
    }

    return Array.from(merged.values()).sort((a, b) => a.MonthNumber - b.MonthNumber);
  }, [data, comparison]);

  if (!chartData || chartData.length === 0) return null;

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
          <LineChart data={chartData}>
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
              formatter={(value, _name, entry) => {
                const key = entry?.dataKey;
                const formatted = `${Number(value).toFixed(1)}%`;
                if (key === "HeadcountGrowthPct") {
                  return [formatted, "Store Headcount Growth"];
                }
                if (key === "Turnover") {
                  return [formatted, "Store Turnover"];
                }
                if (key === "PeerHeadcountGrowthPct") {
                  return [formatted, "Network Headcount Growth"];
                }
                if (key === "PeerTurnover") {
                  return [formatted, "Network Turnover"];
                }
                return [formatted, key];
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="HeadcountGrowthPct"
              stroke="#8b5cf6"
              strokeWidth={3}
              dot={{ r: 3 }}
              name="Store Headcount Growth"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="Turnover"
              stroke="#f97316"
              strokeWidth={3}
              dot={{ r: 3 }}
              name="Store Turnover"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="PeerHeadcountGrowthPct"
              stroke="#c4b5fd"
              strokeWidth={3}
              strokeDasharray="4 4"
              dot={false}
              name="Network Headcount Growth"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="PeerTurnover"
              stroke="#fb923c"
              strokeWidth={3}
              strokeDasharray="4 4"
              dot={false}
              name="Network Turnover"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

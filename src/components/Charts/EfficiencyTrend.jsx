import React, { useMemo } from "react";
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

export default function EfficiencyTrend({ data, comparison }) {
  const chartData = useMemo(() => {
    const merged = new Map();

    if (Array.isArray(data)) {
      data.forEach((item) => {
        merged.set(item.MonthNumber, {
          ...item,
          PeerSalesPerEmployee: null,
          PeerAvgHeadcount: null,
        });
      });
    }

    if (Array.isArray(comparison)) {
      comparison.forEach((peer) => {
        const existing = merged.get(peer.MonthNumber) ?? {
          MonthNumber: peer.MonthNumber,
          SalesPerEmployee: peer.StoreSalesPerEmployee ?? null,
          AvgHeadcount: peer.StoreAvgHeadcount ?? null,
        };
        merged.set(peer.MonthNumber, {
          ...existing,
          PeerSalesPerEmployee: peer.AvgPeerSalesPerEmployee ?? null,
          PeerAvgHeadcount: peer.AvgPeerHeadcount ?? null,
        });
      });
    }

    return Array.from(merged.values()).sort((a, b) => a.MonthNumber - b.MonthNumber);
  }, [data, comparison]);

  if (!chartData || chartData.length === 0) return null;

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
          <ComposedChart data={chartData}>
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
              formatter={(value, _name, entry) => {
                const key = entry?.dataKey;
                if (key === "SalesPerEmployee") {
                  return [`$${Number(value).toFixed(0)}`, "Store Sales per Employee"];
                }
                if (key === "PeerSalesPerEmployee") {
                  return [`$${Number(value).toFixed(0)}`, "Network Sales per Employee"];
                }
                if (key === "AvgHeadcount") {
                  return [Number(value).toFixed(0), "Store Avg Headcount"];
                }
                if (key === "PeerAvgHeadcount") {
                  return [Number(value).toFixed(0), "Network Avg Headcount"];
                }
                return [value, key];
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
              name="Store Sales per Employee"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="PeerSalesPerEmployee"
              stroke="#38bdf8"
              strokeWidth={3}
              strokeDasharray="4 4"
              dot={false}
              name="Network Sales per Employee"
            />
            <Bar
              yAxisId="right"
              dataKey="AvgHeadcount"
              fill="#22c55e"
              radius={[12, 12, 0, 0]}
              barSize={28}
              name="Store Avg Headcount"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="PeerAvgHeadcount"
              stroke="#4ade80"
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={false}
              name="Network Avg Headcount"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

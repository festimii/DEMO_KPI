import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, Typography, Stack, Chip } from "@mui/material";

const monthFormatter = (value) =>
  new Date(0, Number(value) - 1).toLocaleString("default", { month: "short" });

const currencyFormatter = (value) =>
  value?.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

export default function SalesTrend({ data, storeId, comparison }) {
  const chartData = useMemo(() => {
    const merged = new Map();
    const baseYear = data?.[0]?.Year ?? null;

    if (Array.isArray(data)) {
      data.forEach((item) => {
        merged.set(item.MonthNumber, {
          ...item,
          PeerSales: null,
          PeerSalesPerEmployee: null,
        });
      });
    }

    if (Array.isArray(comparison)) {
      comparison.forEach((peer) => {
        const existing = merged.get(peer.MonthNumber) ?? {
          MonthNumber: peer.MonthNumber,
          Year: baseYear,
          TotalSales: null,
          SalesPerEmployee: null,
        };
        merged.set(peer.MonthNumber, {
          ...existing,
          PeerSales: peer.AvgPeerSales ?? null,
          PeerSalesPerEmployee: peer.AvgPeerSalesPerEmployee ?? null,
        });
      });
    }

    return Array.from(merged.values()).sort((a, b) => a.MonthNumber - b.MonthNumber);
  }, [data, comparison]);

  if (!chartData || chartData.length === 0) return null;

  const year = chartData[0]?.Year ?? data?.[0]?.Year;

  return (
    <Card sx={{ borderRadius: 4, boxShadow: "0 18px 40px rgba(15,23,42,0.1)" }}>
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
              Revenue & Efficiency Trend
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tracking monthly performance for store {storeId} in {year}.
            </Typography>
          </div>
          <Chip label="Store vs. Network" color="primary" variant="outlined" />
        </Stack>
        <ResponsiveContainer width="100%" height={380}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="MonthNumber" tickFormatter={monthFormatter} />
            <YAxis
              yAxisId="left"
              tickFormatter={(value) =>
                value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value
              }
              stroke="#2563eb"
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={(value) => `$${value.toFixed(0)}`}
              stroke="#f59e0b"
            />
            <Tooltip
              formatter={(val, _name, entry) => {
                const key = entry?.dataKey;
                if (key === "TotalSales") return [currencyFormatter(val), "Store Sales"];
                if (key === "SalesPerEmployee")
                  return [`$${Number(val).toFixed(0)}`, "Store Sales per Employee"];
                if (key === "PeerSales")
                  return [currencyFormatter(val), "Network Avg Sales"];
                if (key === "PeerSalesPerEmployee")
                  return [`$${Number(val).toFixed(0)}`, "Network Avg Sales per Employee"];
                return [val, key];
              }}
              labelFormatter={(label) => monthFormatter(label)}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="TotalSales"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
              name="Store Sales"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="SalesPerEmployee"
              stroke="#f59e0b"
              strokeWidth={3}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
              name="Store Sales per Employee"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="PeerSales"
              stroke="#60a5fa"
              strokeWidth={3}
              strokeDasharray="4 4"
              dot={false}
              name="Network Avg Sales"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="PeerSalesPerEmployee"
              stroke="#facc15"
              strokeWidth={3}
              strokeDasharray="4 4"
              dot={false}
              name="Network Avg Sales per Employee"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

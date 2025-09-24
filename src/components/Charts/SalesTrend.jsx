import React from "react";
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
import { Card, CardContent, Typography, Stack } from "@mui/material";

const monthFormatter = (value) =>
  new Date(0, Number(value) - 1).toLocaleString("default", { month: "short" });

const currencyFormatter = (value) =>
  value?.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

export default function SalesTrend({ data, storeId }) {
  if (!data || data.length === 0) return null;

  const parseValue = (value) => {
    if (value == null || value === "") return null;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  };

  const year = data[0]?.Year;
  const enrichedData = data.map((item) => {
    const chainAvgSales =
      item.ChainAvgSales ??
      (item.ChainTotalSales && item.ChainStoreCount
        ? item.ChainTotalSales / item.ChainStoreCount
        : null);

    return {
      ...item,
      TotalSales: parseValue(item.TotalSales),
      ChainAvgSales: parseValue(chainAvgSales),
      SalesPerEmployee: parseValue(item.SalesPerEmployee),
      ChainAvgSalesPerEmployee: parseValue(item.ChainAvgSalesPerEmployee),
    };
  });

  const hasTotalSales = enrichedData.some((item) => item.TotalSales != null);
  const hasChainAvgSales = enrichedData.some((item) => item.ChainAvgSales != null);
  const hasSalesPerEmployee = enrichedData.some((item) => item.SalesPerEmployee != null);
  const hasChainAvgSalesPerEmployee = enrichedData.some(
    (item) => item.ChainAvgSalesPerEmployee != null
  );

  const showChart =
    hasTotalSales || hasChainAvgSales || hasSalesPerEmployee || hasChainAvgSalesPerEmployee;

  return (
    <Card elevation={0} sx={{ borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}` }}>
      <CardContent>
        <Stack spacing={0.5} mb={3}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Revenue trend
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monthly results for store {storeId} in {year}.
          </Typography>
        </Stack>
        {!showChart ? (
          <Typography variant="body2" color="text.secondary">
            No sales or productivity data is available yet.
          </Typography>
        ) : (
        <ResponsiveContainer width="100%" height={380}>
          <LineChart data={enrichedData}>
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
              formatter={(val, name) => {
                if (name === "TotalSales") return [currencyFormatter(val), "Total Sales"];
                if (name === "ChainAvgSales")
                  return [currencyFormatter(val), "Chain Avg Sales"];
                if (name === "SalesPerEmployee")
                  return [
                    `$${Number(val).toFixed(0)}`,
                    "Sales per Employee",
                  ];
                if (name === "ChainAvgSalesPerEmployee")
                  return [
                    `$${Number(val).toFixed(0)}`,
                    "Chain Avg Sales per Employee",
                  ];
                return [val, name];
              }}
              labelFormatter={(label) => monthFormatter(label)}
            />
            <Legend />
            {hasTotalSales && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="TotalSales"
                name="Store Total Sales"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
            )}
            {hasChainAvgSales && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="ChainAvgSales"
                name="Chain Avg Sales"
                stroke="#60a5fa"
                strokeWidth={3}
                strokeDasharray="6 6"
                dot={false}
              />
            )}
            {hasSalesPerEmployee && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="SalesPerEmployee"
                name="Store Sales per Employee"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
            )}
            {hasChainAvgSalesPerEmployee && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="ChainAvgSalesPerEmployee"
                name="Chain Avg Sales per Employee"
                stroke="#facc15"
                strokeWidth={3}
                strokeDasharray="4 4"
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

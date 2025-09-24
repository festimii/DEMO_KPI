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
import { Card, CardContent, Typography, Stack, Divider } from "@mui/material";

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
  const hasChainSales = enrichedData.some((item) => item.ChainAvgSales != null);
  const hasSalesPerEmployee = enrichedData.some((item) => item.SalesPerEmployee != null);
  const hasChainSalesPerEmployee = enrichedData.some(
    (item) => item.ChainAvgSalesPerEmployee != null
  );

  const hasLeftSeries = hasTotalSales || hasChainSales;
  const hasRightSeries = hasSalesPerEmployee || hasChainSalesPerEmployee;

  if (!hasLeftSeries && !hasRightSeries) {
    return null;
  }

  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: "0 12px 40px rgba(15, 23, 42, 0.08)",
        border: "none",
        background: (theme) =>
          theme.palette.mode === "dark"
            ? `linear-gradient(135deg, ${theme.palette.grey[900]}, ${theme.palette.grey[800]})`
            : "linear-gradient(135deg, #eff6ff, #eef2ff)",
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
              Revenue trend
            </Typography>
            {(storeId || year) && (
              <Typography variant="body2" color="text.secondary">
                {[storeId && `Store ${storeId}`, year && `FY ${year}`]
                  .filter(Boolean)
                  .join(" · ")}
              </Typography>
            )}
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Track how your store compares to the chain average across revenue and
            productivity metrics each month.
          </Typography>
        </Stack>
        <Divider sx={{ opacity: 0.25, mb: 3 }} />
        <ResponsiveContainer width="100%" height={440}>
          <LineChart
            data={enrichedData}
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
                tickFormatter={(value) =>
                  value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value
                }
                stroke="#1d4ed8"
                axisLine={false}
                tickLine={false}
                label={{ value: "Revenue", angle: -90, position: "insideLeft" }}
              />
            )}
            {hasRightSeries && (
              <YAxis
                yAxisId="right"
                orientation="right"
                tickFormatter={(value) => `$${value.toFixed(0)}`}
                stroke="#ea580c"
                axisLine={false}
                tickLine={false}
                label={{
                  value: "Sales per employee",
                  angle: 90,
                  position: "insideRight",
                }}
              />
            )}
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
              contentStyle={{
                borderRadius: 12,
                border: "1px solid rgba(148, 163, 184, 0.35)",
                boxShadow: "0 8px 20px rgba(15, 23, 42, 0.1)",
              }}
            />
            <Legend wrapperStyle={{ paddingTop: 12 }} iconType="circle" />
            {hasTotalSales && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="TotalSales"
                name="Store total sales"
                stroke="#1d4ed8"
                strokeWidth={3.2}
                dot={{ r: 4 }}
                activeDot={{ r: 7 }}
              />
            )}
            {hasChainSales && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="ChainAvgSales"
                name="Chain avg sales"
                stroke="#60a5fa"
                strokeWidth={3}
                strokeDasharray="10 6"
                dot={false}
              />
            )}
            {hasSalesPerEmployee && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="SalesPerEmployee"
                name="Store sales per employee"
                stroke="#ea580c"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 7 }}
              />
            )}
            {hasChainSalesPerEmployee && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="ChainAvgSalesPerEmployee"
                name="Chain avg sales per employee"
                stroke="#fb923c"
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

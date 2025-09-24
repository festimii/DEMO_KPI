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
import { Card, CardContent, Typography } from "@mui/material";

export default function SalesTrend({ data }) {
  if (!data || data.length === 0) return null;

  // Extract all store IDs (keys except MonthNumber)
  const stores = Object.keys(data[0]).filter((k) => k !== "MonthNumber");
  const colors = [
    "#42a5f5",
    "#66bb6a",
    "#ef5350",
    "#ff9800",
    "#ab47bc",
    "#26c6da",
  ];

  return (
    <Card sx={{ borderRadius: 4, boxShadow: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Sales Trend by Store
        </Typography>
        <ResponsiveContainer width="100%" height={500}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="MonthNumber" />
            <YAxis />
            <Tooltip />
            <Legend />
            {stores.map((store, idx) => (
              <Line
                key={store}
                type="monotone"
                dataKey={store}
                name={store}
                stroke={colors[idx % colors.length]}
                strokeWidth={3}
                dot={{ r: 3 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

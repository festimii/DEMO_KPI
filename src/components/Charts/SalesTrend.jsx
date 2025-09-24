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

export default function SalesTrend({ data, storeId }) {
  if (!data || data.length === 0) return null;

  return (
    <Card sx={{ borderRadius: 4, boxShadow: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Monthly Sales – {storeId}
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="MonthNumber" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="TotalSales"
              stroke="#42a5f5"
              strokeWidth={3}
              dot
            />
            <Line
              type="monotone"
              dataKey="SalesPerEmployee"
              stroke="#ef5350"
              strokeWidth={3}
              dot
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

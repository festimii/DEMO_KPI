import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Stack,
  Skeleton,
  Chip,
} from "@mui/material";

const formatCurrency = (value) =>
  value != null
    ? value.toLocaleString(undefined, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      })
    : "-";

const formatPercentChip = (value) => {
  if (value == null || Number.isNaN(value)) {
    return <span>-</span>;
  }
  const positive = value >= 0;
  return (
    <Chip
      size="small"
      color={positive ? "success" : "error"}
      label={`${positive ? "+" : ""}${value.toFixed(1)}%`}
      sx={{ fontWeight: 600 }}
    />
  );
};

export default function TopStoresTable({ data, loading }) {
  const showSkeleton = loading && (!data || data.length === 0);

  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: "0 20px 45px rgba(15, 23, 42, 0.12)",
        border: (theme) => `1px solid ${theme.palette.divider}`,
        height: "100%",
      }}
    >
      <CardContent>
        <Stack spacing={1.5}>
          <div>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Top Performing Stores
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ranking by total sales with year-over-year change.
            </Typography>
          </div>
          {showSkeleton ? (
            <Stack spacing={1}>
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} variant="rounded" height={40} />
              ))}
            </Stack>
          ) : data && data.length > 0 ? (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Store</TableCell>
                  <TableCell align="right">Total Sales</TableCell>
                  <TableCell align="right">YoY</TableCell>
                  <TableCell align="right">Sales per Employee</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row) => (
                  <TableRow key={row.StoreID} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{row.StoreID}</TableCell>
                    <TableCell align="right">{formatCurrency(row.TotalSalesYear)}</TableCell>
                    <TableCell align="right">{formatPercentChip(row.SalesYoYPct)}</TableCell>
                    <TableCell align="right">
                      {formatCurrency(row.AvgSalesPerEmployee)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No ranking data available for the selected year.
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

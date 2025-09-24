import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

export default function KpiCard({ title, value, change }) {
  const positive = change >= 0;
  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: 4,
        background: "linear-gradient(135deg, #1976d2 30%, #42a5f5 90%)",
        color: "white",
      }}
    >
      <CardContent>
        <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          {value}
        </Typography>
        <Box display="flex" alignItems="center" mt={1}>
          {positive ? (
            <TrendingUpIcon sx={{ color: "#00e676" }} />
          ) : (
            <TrendingDownIcon sx={{ color: "#ff1744" }} />
          )}
          <Typography
            variant="body2"
            sx={{ ml: 1, color: positive ? "#00e676" : "#ff1744" }}
          >
            {positive ? "+" : "-"}
            {Math.abs(change)}%
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

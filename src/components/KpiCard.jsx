import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

export default function KpiCard({ title, value, change }) {
  const showChange = Number.isFinite(change);

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: "none",
        border: (theme) => `1px solid ${theme.palette.divider}`,
        backgroundColor: (theme) => theme.palette.background.paper,
      }}
    >
      <CardContent>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
        >
          {title}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
          {value}
        </Typography>
        {showChange && (
          <Typography
            variant="body2"
            sx={{
              mt: 1,
              fontWeight: 600,
              color: change >= 0 ? "success.main" : "error.main",
            }}
          >
            {`${change >= 0 ? "+" : ""}${change.toFixed(1)}% vs previous`}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

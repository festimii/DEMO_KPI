import React from "react";
import { Card, CardContent, Typography, Stack } from "@mui/material";

export default function KpiCard({ title, value, details = [] }) {
  const extraDetails = Array.isArray(details) ? details.filter(Boolean) : [];

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        backgroundColor: (theme) => theme.palette.background.paper,
        height: "100%",
      }}
    >
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {value ?? "—"}
        </Typography>
        <Stack spacing={0.5}>
          {extraDetails.length > 0 ? (
            extraDetails.map((item) => (
              <Typography key={item} variant="body2" color="text.secondary">
                {item}
              </Typography>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No comparison data.
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

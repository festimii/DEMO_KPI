import React from "react";
import { Card, CardContent, Typography, Box, Chip, Stack } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

export default function KpiCard({ title, value, change, secondary = [] }) {
  const showChange = Number.isFinite(change);
  const positive = showChange && change >= 0;

  const renderSecondaryChip = (chip) => {
    if (!chip || !Number.isFinite(chip.value)) return null;
    const isPositive = chip.value >= 0;
    return (
      <Chip
        key={chip.label}
        size="small"
        variant="outlined"
        color={isPositive ? "success" : "error"}
        label={`${isPositive ? "+" : ""}${chip.value.toFixed(1)}% ${chip.label}`}
        sx={{ fontWeight: 600 }}
      />
    );
  };
  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: "0 20px 45px rgba(15, 23, 42, 0.12)",
        background: (theme) => theme.palette.background.paper,
        color: (theme) => theme.palette.text.primary,
        border: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <CardContent>
        <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
          {value}
        </Typography>
        <Stack
          direction="row"
          flexWrap="wrap"
          spacing={1}
          useFlexGap
          sx={{ mt: 2 }}
          alignItems="center"
        >
          {showChange ? (
            <Box display="flex" alignItems="center" gap={1}>
              {positive ? (
                <TrendingUpIcon sx={{ color: "#16a34a" }} />
              ) : (
                <TrendingDownIcon sx={{ color: "#dc2626" }} />
              )}
              <Chip
                size="small"
                color={positive ? "success" : "error"}
                label={`${positive ? "+" : ""}${change.toFixed(1)}% vs prev.`}
                sx={{ fontWeight: 600 }}
              />
            </Box>
          ) : (
            <Chip
              size="small"
              label="No previous month"
              sx={{ fontWeight: 600, color: "text.secondary" }}
              variant="outlined"
            />
          )}
          {secondary.map((chip) => renderSecondaryChip(chip))}
        </Stack>
      </CardContent>
    </Card>
  );
}

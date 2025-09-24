import React from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Stack,
  Chip,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import GroupsIcon from "@mui/icons-material/Groups";
import { alpha } from "@mui/material/styles";

const drawerWidth = 220;

export default function Sidebar({ open }) {
  const items = [
    { text: "Dashboard", icon: <DashboardIcon />, active: true },
    { text: "Revenue Pulse", icon: <BarChartIcon /> },
    { text: "Efficiency", icon: <TrendingUpIcon /> },
    { text: "People Pulse", icon: <GroupsIcon /> },
    { text: "Workspace", icon: <SettingsIcon /> },
  ];

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          border: "none",
          background: (theme) =>
            theme.palette.mode === "dark"
              ? alpha(theme.palette.background.paper, 0.95)
              : "rgba(255,255,255,0.9)",
          color: (theme) => theme.palette.text.primary,
          pt: 10,
          backdropFilter: "blur(12px)",
        },
      }}
    >
      <Stack spacing={4} sx={{ height: "100%", px: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Crowdt Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Navigate between high-impact KPI collections for the network.
          </Typography>
        </Box>

        <List sx={{ p: 0, display: "grid", gap: 0.5 }}>
          {items.map((item) => (
            <ListItemButton
              key={item.text}
              sx={{
                borderRadius: 2,
                color: "inherit",
                gap: 2,
                px: 2,
                py: 1.5,
                border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                backgroundColor: (theme) =>
                  item.active
                    ? alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.32 : 0.16)
                    : "transparent",
                boxShadow: item.active ? "0 12px 24px rgba(79, 70, 229, 0.18)" : "none",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.12),
                  transform: "translateY(-1px)",
                },
                "& .MuiListItemIcon-root": {
                  color: item.active ? "primary.contrastText" : "inherit",
                },
                "&.Mui-selected": {
                  backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.25),
                  color: (theme) => theme.palette.primary.contrastText,
                  boxShadow: "0 12px 24px rgba(79, 70, 229, 0.2)",
                  "& .MuiListItemIcon-root": {
                    color: "inherit",
                  },
                },
              }}
              selected={item.active}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 0 }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{ fontWeight: 600, variant: "body1" }}
              />
            </ListItemButton>
          ))}
        </List>

        <Box sx={{ mt: "auto", pb: 4 }}>
          <Stack
            spacing={1}
            sx={(theme) => ({
              p: 2,
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
              background: alpha(theme.palette.primary.main, 0.08),
            })}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Need alignment?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Share a briefing with Crowdt leadership and bring every store on the same page.
            </Typography>
            <Chip
              label="Create briefing"
              color="primary"
              variant="outlined"
              sx={{ alignSelf: "flex-start", fontWeight: 600, textTransform: "uppercase" }}
            />
          </Stack>
        </Box>
      </Stack>
    </Drawer>
  );
}

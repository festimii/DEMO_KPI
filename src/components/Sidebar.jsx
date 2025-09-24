import React from "react";
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";

const drawerWidth = 220;

export default function Sidebar({ open }) {
  const items = [
    { text: "Dashboard", icon: <DashboardIcon /> },
    { text: "Reports", icon: <BarChartIcon /> },
    { text: "Settings", icon: <SettingsIcon /> },
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
          background: (theme) => theme.palette.background.paper,
          color: (theme) => theme.palette.text.primary,
          pt: 10,
        },
      }}
    >
      <List sx={{ px: 2, display: "grid", gap: 1 }}>
        {items.map((item) => (
          <ListItemButton
            key={item.text}
            sx={{
              borderRadius: 2,
              color: "inherit",
              gap: 2,
              "&.Mui-selected": {
                backgroundColor: (theme) => theme.palette.primary.main,
                color: "#fff",
                "& .MuiListItemIcon-root": {
                  color: "#fff",
                },
              },
            }}
            selected={item.text === "Dashboard"}
          >
            <ListItemIcon sx={{ color: "inherit", minWidth: 0 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 600 }} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}

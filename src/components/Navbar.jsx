import React from "react";
import { AppBar, Toolbar, IconButton, Typography, alpha } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

export default function Navbar({ toggleSidebar, darkMode, onToggleDarkMode }) {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: 1201,
        backdropFilter: "blur(12px)",
        backgroundColor: (theme) =>
          alpha(theme.palette.background.paper, darkMode ? 0.8 : 0.9),
        borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.4)}`,
      }}
    >
      <Toolbar>
        <IconButton edge="start" color="inherit" onClick={toggleSidebar}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          KPI Dashboard
        </Typography>
        <IconButton color="inherit" onClick={onToggleDarkMode}>
          {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

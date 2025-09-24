import React from "react";
import { AppBar, Toolbar, IconButton, Typography, alpha, Box } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

export default function Navbar({ darkMode, onToggleDarkMode }) {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: 1201,
        backdropFilter: "blur(12px)",
        backgroundColor: (theme) =>
          alpha(theme.palette.background.paper, darkMode ? 0.9 : 0.95),
        borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.2)}`,
      }}
    >
      <Toolbar sx={{ gap: { xs: 2, md: 3 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexShrink: 0,
          }}
        >
          <Box
            sx={(theme) => ({
              width: 40,
              height: 40,
              borderRadius: 12,
              display: "grid",
              placeItems: "center",
              fontWeight: 700,
              letterSpacing: 1.2,
              background: alpha(theme.palette.primary.main, 0.12),
              color: theme.palette.mode === "dark"
                ? theme.palette.primary.light
                : theme.palette.primary.main,
            })}
          >
            CT
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Store KPIs
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.65 }}>
              Focused view of the data you have today
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <IconButton
          color="inherit"
          onClick={onToggleDarkMode}
          sx={{
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
            borderRadius: 2,
            transition: "all 0.2s ease",
            "&:hover": {
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.22),
            },
          }}
        >
          {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

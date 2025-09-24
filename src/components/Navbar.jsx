import React from "react";
import { AppBar, Toolbar, IconButton, Typography, alpha, Box, Button, Stack, Chip } from "@mui/material";
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
        backdropFilter: "blur(18px)",
        backgroundColor: (theme) =>
          alpha(theme.palette.background.paper, darkMode ? 0.72 : 0.85),
        borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.25)}`,
      }}
    >
      <Toolbar sx={{ gap: { xs: 1, md: 2 } }}>
        <IconButton
          edge="start"
          color="inherit"
          onClick={toggleSidebar}
          sx={{
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
            borderRadius: 2,
            transition: "all 0.2s ease",
            "&:hover": {
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2),
            },
          }}
        >
          <MenuIcon />
        </IconButton>

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
              background: alpha(theme.palette.primary.main, 0.2),
              color: theme.palette.mode === "dark"
                ? theme.palette.primary.light
                : theme.palette.primary.main,
            })}
          >
            CT
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: 0.4 }}>
              Crowdt
            </Typography>
            <Typography
              variant="caption"
              sx={{ textTransform: "uppercase", letterSpacing: 1, opacity: 0.65 }}
            >
              KPI Command Center
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Stack direction="row" spacing={{ xs: 1, sm: 1.5 }} alignItems="center">
          <Chip
            label="Live sync"
            color="primary"
            variant={darkMode ? "outlined" : "filled"}
            sx={{
              fontWeight: 600,
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          />
          <Button
            variant="contained"
            color="primary"
            sx={{
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "none",
            }}
          >
            Share snapshot
          </Button>
          <IconButton
            color="inherit"
            onClick={onToggleDarkMode}
            sx={{
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
              borderRadius: 2,
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2),
              },
            }}
          >
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

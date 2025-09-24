import React, { useMemo, useState } from "react";
import { Box, CssBaseline } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function Layout({ children, darkMode, onToggleDarkMode }) {
  const [open, setOpen] = useState(true);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
          primary: {
            main: "#2563eb",
          },
          background: {
            default: darkMode ? "#0f172a" : "#f8fafc",
            paper: darkMode ? "#1e293b" : "#ffffff",
          },
        },
        shape: {
          borderRadius: 16,
        },
        typography: {
          fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif",
        },
      }),
    [darkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
        <Navbar
          toggleSidebar={() => setOpen(!open)}
          darkMode={darkMode}
          onToggleDarkMode={onToggleDarkMode}
        />
        <Sidebar open={open} />
        <Box
          component="main"
          sx={{ flexGrow: 1, p: { xs: 3, md: 5 }, mt: { xs: 8, md: 10 }, transition: "padding 0.3s ease" }}
        >
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

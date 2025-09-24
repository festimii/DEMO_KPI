import React, { useMemo } from "react";
import { Box, CssBaseline } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Navbar from "./Navbar";

export default function Layout({ children, darkMode, onToggleDarkMode }) {
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
          primary: {
            main: "#4f46e5",
            light: "#818cf8",
            dark: "#312e81",
          },
          background: {
            default: darkMode ? "#0f172a" : "#f3f4f6",
            paper: darkMode ? "#111827" : "#ffffff",
          },
        },
        shape: {
          borderRadius: 16,
        },
        typography: {
          fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif",
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                backgroundColor: darkMode ? "#0f172a" : "#f3f4f6",
              },
            },
          },
        },
      }),
    [darkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        <Navbar darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} />
        <Box
          component="main"
          sx={{
            px: { xs: 2, md: 4 },
            py: { xs: 10, md: 12 },
            width: "100%",
            maxWidth: "1080px",
            mx: "auto",
          }}
        >
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

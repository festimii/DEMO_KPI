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
            main: "#4f46e5",
            light: "#818cf8",
            dark: "#312e81",
          },
          background: {
            default: darkMode ? "#0b1220" : "#f5f7fb",
            paper: darkMode ? "#141c2c" : "#ffffff",
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
                backgroundColor: darkMode ? "#0b1220" : "#eef2ff",
                backgroundImage: darkMode
                  ? "radial-gradient(circle at 0% 0%, rgba(79, 70, 229, 0.15), transparent 45%), radial-gradient(circle at 100% 0%, rgba(129, 140, 248, 0.12), transparent 50%)"
                  : "linear-gradient(180deg, rgba(224, 231, 255, 0.65) 0%, rgba(249, 250, 251, 0.9) 100%)",
              },
            },
          },
          MuiPaper: {
            defaultProps: {
              elevation: 0,
            },
          },
        },
      }),
    [darkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          bgcolor: "transparent",
        }}
      >
        <Navbar
          toggleSidebar={() => setOpen(!open)}
          darkMode={darkMode}
          onToggleDarkMode={onToggleDarkMode}
        />
        <Sidebar open={open} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 3, md: 6 },
            mt: { xs: 10, md: 12 },
            width: "100%",
            maxWidth: "1320px",
            mx: "auto",
            transition: "padding 0.3s ease",
          }}
        >
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

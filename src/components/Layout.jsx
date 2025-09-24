import React, { useMemo, useState } from "react";
import { Box, CssBaseline, Grid, Container } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function Layout({ children, darkMode, onToggleDarkMode }) {
  const [open, setOpen] = useState(true);

  // Theme configuration
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
        shape: { borderRadius: 16 },
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
          MuiPaper: { defaultProps: { elevation: 0 } },
        },
      }),
    [darkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "transparent" }}>
        {/* Navbar & Sidebar */}
        <Navbar
          toggleSidebar={() => setOpen(!open)}
          darkMode={darkMode}
          onToggleDarkMode={onToggleDarkMode}
        />
        <Sidebar open={open} />

        {/* Main content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            mt: { xs: 10, md: 12 },
            transition: "padding 0.3s ease",
          }}
        >
          <Container maxWidth="xl" sx={{ py: 4 }}>
            <Grid container spacing={4}>
              {React.Children.map(children, (child, index) => (
                <Grid item xs={12} key={index}>
                  <Box
                    sx={{
                      width: "100%",
                      minHeight: 500, // ✅ ensures charts are tall enough
                      bgcolor: "background.paper",
                      borderRadius: 2,
                      p: 3,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {child}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

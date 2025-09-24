import React, { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import DashboardPage from "./pages/Dashboard";
import TurnoverPage from "./pages/Turnover";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <BrowserRouter>
      <Layout darkMode={darkMode} onToggleDarkMode={() => setDarkMode((prev) => !prev)}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/turnover" element={<TurnoverPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

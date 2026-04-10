import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Marketplace from "./pages/Marketplace";

function MarketplaceDetailPlaceholder() {
  return (
    <div style={{ padding: 24 }}>
      Marketplace detail page placeholder
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/marketplace" replace />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route
          path="/marketplace/:id"
          element={<MarketplaceDetailPlaceholder />}
        />
      </Routes>
    </BrowserRouter>
  );
}
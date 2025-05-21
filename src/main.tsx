import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import { AuthProvider } from "./contexts/AuthContext.tsx"; // Added AuthProvider import
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider> {/* Added AuthProvider wrap */}
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);

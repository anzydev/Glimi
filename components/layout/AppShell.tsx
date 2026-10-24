import React from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <Navbar />
      <main style={{ flex: "1 0 auto", display: "flex", flexDirection: "column" }}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "./Layout.css";

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="layout">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div className="layout__main">
        <Header sidebarCollapsed={collapsed} />
        <main className="layout__content">
          {children}
        </main>
      </div>
    </div>
  );
}
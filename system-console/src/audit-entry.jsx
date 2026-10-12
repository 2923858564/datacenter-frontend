import React from "react";
import { createRoot } from "react-dom/client";
import SystemAudit from "./pages/SystemAudit.jsx";

export function mount(element) {
  const root = createRoot(element);
  root.render(<SystemAudit />);
  return () => root.unmount();
}

import React from "react";
import { createRoot } from "react-dom/client";
import SystemDictionary from "./pages/SystemDictionary.jsx";

export function mount(element) {
  const root = createRoot(element);
  root.render(<SystemDictionary />);
  return () => root.unmount();
}

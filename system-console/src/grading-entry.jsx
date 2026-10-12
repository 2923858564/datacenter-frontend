import React from "react";
import { createRoot } from "react-dom/client";
import WorkOrderGrading from "./pages/WorkOrderGrading.jsx";

export function mount(element) {
  const root = createRoot(element);
  root.render(<WorkOrderGrading />);
  return () => root.unmount();
}

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PlatformSelection } from "./screens/PlatformSelection/PlatformSelection";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <PlatformSelection />
  </StrictMode>,
);

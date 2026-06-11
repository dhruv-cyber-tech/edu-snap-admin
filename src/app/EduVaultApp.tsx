import { useEffect, useState } from "react";
import App from "@/app/App";

// Client-only mount: the EduVault app uses BrowserRouter, localStorage and
// axios which all require the browser. We avoid rendering it during SSR.
export default function EduVaultApp() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <App />;
}

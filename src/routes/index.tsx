import { createFileRoute } from "@tanstack/react-router";
import EduVaultApp from "@/app/EduVaultApp";

export const Route = createFileRoute("/")({
  ssr: false,
  component: EduVaultApp,
});

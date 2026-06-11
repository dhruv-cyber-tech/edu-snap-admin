import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorState({ error, onRetry, label = "Failed to load data" }) {
  const message =
    error?.response?.data?.message || error?.message || "Something went wrong.";
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="h-6 w-6" />
      </div>
      <p className="mt-4 text-base font-semibold">{label}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" className="mt-4 touch-target" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" />
          <span className="ml-2">Try again</span>
        </Button>
      )}
    </div>
  );
}

import { Lock, Sparkles, CheckCircle2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

export default function ComingSoon({ title, description, icon: Icon, message, features = [] }) {
  return (
    <div className="animate-fade-in">
      <PageHeader title={title} description={description} icon={Icon} />

      <Card className="overflow-hidden">
        <CardContent className="flex flex-col items-center px-5 py-12 text-center sm:py-16">
          {/* Illustration placeholder */}
          <div className="relative mb-6">
            <div className="grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg">
              {Icon ? (
                <Icon className="h-11 w-11" aria-hidden="true" />
              ) : (
                <Lock className="h-11 w-11" aria-hidden="true" />
              )}
            </div>
            <span className="absolute -right-2 -top-2 grid h-9 w-9 place-items-center rounded-full bg-accent text-accent-foreground shadow-md">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </span>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-secondary-foreground">
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
            Coming Soon
          </span>

          <p className="mt-4 max-w-md text-balance text-lg font-semibold">
            {message ?? `The ${title} module is under development.`}
          </p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            We're building this feature to make managing your tuition center even easier.
          </p>

          {features.length > 0 && (
            <div className="mt-8 w-full max-w-sm text-left">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Planned features
              </p>
              <ul className="space-y-2">
                {features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium"
                  >
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

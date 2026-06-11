import { Lock } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

export default function ComingSoon({ title, description, icon }) {
  return (
    <div>
      <PageHeader title={title} description={description} icon={icon} />
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-muted-foreground">
            <Lock className="h-6 w-6" />
          </div>
          <p className="mt-4 text-lg font-semibold">Coming Soon</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            The {title} module is under development and will be available in a
            future release.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

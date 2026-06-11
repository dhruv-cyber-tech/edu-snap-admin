import { useQuery } from "@tanstack/react-query";
import { FolderOpen, FileText, Download } from "lucide-react";
import client from "@/api/client";
import PageHeader from "@/components/PageHeader";
import ErrorState from "@/components/ErrorState";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

async function fetchResources() {
  const { data } = await client.get("/resources");
  return data;
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="flex items-center gap-3 p-4">
            <Skeleton className="h-11 w-11 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-10 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function Resources() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["resources"],
    queryFn: fetchResources,
  });

  const resources = Array.isArray(data) ? data : (data?.content ?? []);

  return (
    <div>
      <PageHeader
        title="Resources"
        description="Study materials and class files"
        icon={FolderOpen}
      />

      {isLoading && <ListSkeleton />}
      {isError && <ErrorState error={error} onRetry={refetch} />}

      {data && resources.length === 0 && (
        <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
          No resources yet.
        </div>
      )}

      {data && resources.length > 0 && (
        <div className="space-y-3">
          {resources.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{r.title ?? r.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {r.subject && <Badge variant="secondary">{r.subject}</Badge>}
                    {r.type && <span className="uppercase">{r.type}</span>}
                    {typeof r.downloads === "number" && (
                      <span className="inline-flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {r.downloads}
                      </span>
                    )}
                  </div>
                </div>
                {r.url && (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="shrink-0 touch-target"
                  >
                    <a href={r.url} target="_blank" rel="noreferrer">
                      <Download className="h-4 w-4" />
                      <span className="ml-1 hidden sm:inline">Open</span>
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FolderOpen,
  Search,
  Eye,
  Download,
  Pencil,
  Trash2,
  Loader2,
  X,
  ArrowUp,
} from "lucide-react";
import client from "@/api/client";
import { standardGroups, subjects, chapters, RESOURCE_TYPES } from "@/api/mockData";
import PageHeader from "@/components/PageHeader";
import ErrorState from "@/components/ErrorState";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ALL = "all";

const TYPE_BADGE = {
  Worksheet: "bg-chart-1/15 text-chart-1 border-chart-1/30",
  Notes: "bg-chart-2/15 text-chart-2 border-chart-2/30",
  "Test Paper": "bg-chart-4/15 text-chart-4 border-chart-4/30",
  Solution: "bg-chart-3/15 text-chart-3 border-chart-3/30",
};

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function buildQuery(filters) {
  const params = new URLSearchParams({ page: "0", size: "20" });
  if (filters.standard) params.set("standard", filters.standard);
  if (filters.subject) params.set("subject", filters.subject);
  if (filters.chapter) params.set("chapter", filters.chapter);
  if (filters.type) params.set("type", filters.type);
  if (filters.search) params.set("search", filters.search);
  return params.toString();
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-lg" />
      ))}
    </div>
  );
}

export default function Resources() {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    standard: "",
    subject: "",
    chapter: "",
    type: "",
    search: "",
  });

  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const queryString = buildQuery(filters);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["resources", queryString],
    queryFn: async () => {
      const { data } = await client.get(`/resources?${queryString}`);
      return data;
    },
  });

  const resources = Array.isArray(data) ? data : (data?.content ?? []);

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }) => {
      const { data } = await client.put(`/resources/${id}`, values);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await client.delete(`/resources/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setDeleting(null);
    },
  });

  const setFilter = (key, value) =>
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      // Reset chapter when subject changes.
      ...(key === "subject" ? { chapter: "" } : {}),
    }));

  const chapterOptions = filters.subject
    ? (chapters[filters.subject] ?? [])
    : Object.values(chapters).flat();

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div>
      <PageHeader
        title="Resources"
        description="Study materials and class files"
        icon={FolderOpen}
      />

      {/* Filter bar */}
      <Card className="mb-4">
        <CardContent className="space-y-3 p-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filters.search}
              onChange={(e) => setFilter("search", e.target.value)}
              placeholder="Search resources…"
              className="h-11 pl-9 text-base"
              aria-label="Search resources"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Select
              value={filters.standard || ALL}
              onValueChange={(v) => setFilter("standard", v === ALL ? "" : v)}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All Classes</SelectItem>
                {standardGroups.map((g) => (
                  <SelectGroup key={g.group}>
                    <SelectLabel>{g.group}</SelectLabel>
                    {g.standards.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.subject || ALL}
              onValueChange={(v) => setFilter("subject", v === ALL ? "" : v)}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All Subjects</SelectItem>
                {subjects.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.chapter || ALL}
              onValueChange={(v) => setFilter("chapter", v === ALL ? "" : v)}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Chapter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All Chapters</SelectItem>
                {chapterOptions.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.type || ALL}
              onValueChange={(v) => setFilter("type", v === ALL ? "" : v)}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All Types</SelectItem>
                {RESOURCE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="touch-target"
              onClick={() =>
                setFilters({
                  standard: "",
                  subject: "",
                  chapter: "",
                  type: "",
                  search: "",
                })
              }
            >
              <X className="h-4 w-4" />
              <span className="ml-1">Clear filters</span>
            </Button>
          )}
        </CardContent>
      </Card>

      {isLoading && <ListSkeleton />}
      {isError && <ErrorState error={error} onRetry={refetch} />}

      {data && resources.length === 0 && (
        <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
          No resources match your filters.
        </div>
      )}

      {data && resources.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Chapter</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Tags</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resources.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">{r.title}</TableCell>
                          <TableCell className="whitespace-nowrap">{r.standard?.name}</TableCell>
<TableCell>{r.subject?.name}</TableCell>
<TableCell className="max-w-[180px] truncate">{r.chapter?.name}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={TYPE_BADGE[r.resourceType] ?? ""}
                            >
                              {r.resourceType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {(r.tags ?? []).map((t) => {
  const tagName = typeof t === "object" ? t.name : t;
  return (
    <Badge key={tagName} variant="secondary" className="text-xs">
      {tagName}
    </Badge>
  );
})}
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-muted-foreground">
                            {formatDate(r.createdAt)}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              <Button
                                asChild
                                variant="ghost"
                                size="icon"
                                title="View"
                              >
                                <a href={r.url || "#"} target="_blank" rel="noreferrer">
                                  <Eye className="h-4 w-4" />
                                </a>
                              </Button>
                              <Button
                                asChild
                                variant="ghost"
                                size="icon"
                                title="Download"
                              >
                                <a href={r.url || "#"} download>
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Edit"
                                onClick={() => setEditing(r)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Delete"
                                className="text-destructive"
                                onClick={() => setDeleting(r)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {resources.map((r) => (
              <Card key={r.id} className="overflow-hidden animate-fade-in">
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold text-base leading-tight">{r.title}</h3>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {r.subject?.name}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {r.standard?.name}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={TYPE_BADGE[r.resourceType] ?? ""}
                    >
                      {r.resourceType}
                    </Badge>
                    <span className="text-sm text-muted-foreground truncate">
                      {r.chapter?.name}
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-1 pt-2 border-t border-border">
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10"
                      title="View"
                      aria-label="View resource"
                    >
                      <a href={r.url || "#"} target="_blank" rel="noreferrer">
                        <Eye className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10"
                      title="Download"
                      aria-label="Download resource"
                    >
                      <a href={r.url || "#"} download>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-destructive"
                      title="Delete"
                      aria-label="Delete resource"
                      onClick={() => setDeleting(r)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Edit metadata modal */}
      <EditDialog
        resource={editing}
        onClose={() => setEditing(null)}
        onSave={(values) =>
          updateMutation.mutate({ id: editing.id, values })
        }
        saving={updateMutation.isPending}
      />

      {/* Delete confirm dialog */}
      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete resource?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove “{deleting?.title}”. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                deleteMutation.mutate(deleting.id);
              }}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2">Deleting…</span>
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mobile floating search */}
      <div className="md:hidden">
        {mobileSearchOpen ? (
          <div className="fixed inset-x-3 bottom-24 z-40 flex items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-xl animate-scale-in">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                autoFocus
                value={filters.search}
                onChange={(e) => setFilter("search", e.target.value)}
                placeholder="Search resources…"
                className="h-11 pl-9 text-base"
                aria-label="Search resources"
              />
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-11 w-11 shrink-0"
              aria-label="Close search"
              onClick={() => setMobileSearchOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <Button
            size="icon"
            className="fixed bottom-24 right-4 z-40 h-14 w-14 rounded-full shadow-xl animate-fade-in"
            aria-label="Search resources"
            onClick={() => setMobileSearchOpen(true)}
          >
            <Search className="h-6 w-6" />
          </Button>
        )}
      </div>

      {/* Back to top */}
      {showBackToTop && (
        <Button
          size="icon"
          variant="secondary"
          className="fixed bottom-44 right-4 z-40 h-12 w-12 rounded-full border border-border shadow-lg animate-fade-in md:bottom-6"
          aria-label="Back to top"
          onClick={scrollToTop}
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}

function EditDialog({ resource, onClose, onSave, saving }) {
  const [form, setForm] = useState({});

  // Sync local form when a new resource opens.
  const open = Boolean(resource);
  const current = {
    title: form.title ?? resource?.title ?? "",
    subject: form.subject ?? resource?.subject ?? "",
    standard: form.standard ?? resource?.standard ?? "",
    chapter: form.chapter ?? resource?.chapter ?? "",
    type: form.type ?? resource?.type ?? "",
  };

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleClose = () => {
    setForm({});
    onClose();
  };

  const chapterOptions = current.subject
    ? (chapters[current.subject] ?? [])
    : Object.values(chapters).flat();

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit resource</DialogTitle>
          <DialogDescription>Update the metadata for this resource.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              className="h-11"
              value={current.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={current.standard} onValueChange={(v) => set("standard", v)}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Class" />
                </SelectTrigger>
                <SelectContent>
                  {standardGroups.map((g) => (
                    <SelectGroup key={g.group}>
                      <SelectLabel>{g.group}</SelectLabel>
                      {g.standards.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Subject</Label>
              <Select
                value={current.subject}
                onValueChange={(v) => {
                  set("subject", v);
                  set("chapter", "");
                }}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Chapter</Label>
              <Select value={current.chapter} onValueChange={(v) => set("chapter", v)}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Chapter" />
                </SelectTrigger>
                <SelectContent>
                  {chapterOptions.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={current.type} onValueChange={(v) => set("type", v)}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {RESOURCE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(current)} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2">Saving…</span>
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

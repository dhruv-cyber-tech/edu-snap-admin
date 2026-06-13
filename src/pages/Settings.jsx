import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Settings as SettingsIcon,
  Plus,
  Trash2,
  Loader2,
  BookOpen,
  Layers,
  ListOrdered,
} from "lucide-react";
import client from "@/api/client";
import PageHeader from "@/components/PageHeader";
import ErrorState from "@/components/ErrorState";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
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

function Fab({ onClick, label }) {
  return (
    <Button
      onClick={onClick}
      aria-label={label}
      className="fixed bottom-24 right-5 z-30 h-14 w-14 rounded-full shadow-lg md:bottom-8 touch-target"
      size="icon"
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  );
}

function DeleteDialog({ open, onOpenChange, onConfirm, name, pending }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{name}”?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Related items will also be removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={pending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* ----------------------------- Standards tab ----------------------------- */

function StandardsTab() {
  const queryClient = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["standards"],
    queryFn: async () => (await client.get("/standards")).data,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { name: "", sortOrder: "" },
  });

  const createMutation = useMutation({
    mutationFn: async (values) =>
      (await client.post("/standards", {
        name: values.name,
        sortOrder: Number(values.sortOrder) || 0,
      })).data,
    onSuccess: () => {
      toast.success("Standard added");
      queryClient.invalidateQueries({ queryKey: ["standards"] });
      reset();
      setSheetOpen(false);
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Could not add standard"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => (await client.delete(`/standards/${id}`)).data,
    onSuccess: () => {
      toast.success("Standard deleted");
      queryClient.invalidateQueries({ queryKey: ["standards"] });
      setToDelete(null);
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Could not delete standard"),
  });

  if (isLoading) return <ListSkeleton />;
  if (isError)
    return <ErrorState message="Failed to load standards" onRetry={refetch} />;

  return (
    <>
      <div className="space-y-3">
        {(data ?? []).length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No standards yet. Tap + to add one.
          </p>
        )}
        {(data ?? []).map((s) => (
          <Card key={s.id}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Layers className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{s.name}</p>
                <p className="text-xs text-muted-foreground">
                  {s.subjectCount ?? 0} subject
                  {(s.subjectCount ?? 0) === 1 ? "" : "s"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive touch-target"
                onClick={() => setToDelete(s)}
                aria-label={`Delete ${s.name}`}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Fab onClick={() => setSheetOpen(true)} label="Add standard" />

      <Drawer open={sheetOpen} onOpenChange={setSheetOpen}>
        <DrawerContent>
          <form onSubmit={handleSubmit((v) => createMutation.mutate(v))}>
            <DrawerHeader>
              <DrawerTitle>Add Standard</DrawerTitle>
            </DrawerHeader>
            <div className="space-y-4 px-4">
              <div className="space-y-2">
                <Label htmlFor="std-name" className="text-base">Name</Label>
                <Input
                  id="std-name"
                  className="h-12 text-base"
                  placeholder="e.g. Class 10"
                  {...register("name", { required: "Name is required" })}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="std-order" className="text-base">Sort Order</Label>
                <Input
                  id="std-order"
                  type="number"
                  className="h-12 text-base"
                  placeholder="e.g. 3"
                  {...register("sortOrder")}
                />
              </div>
            </div>
            <DrawerFooter>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="h-12 text-base touch-target"
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline" className="h-12 text-base touch-target">
                  Cancel
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>

      <DeleteDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        name={toDelete?.name}
        pending={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(toDelete.id)}
      />
    </>
  );
}

/* ----------------------------- Subjects tab ------------------------------ */

function SubjectsTab() {
  const queryClient = useQueryClient();
  const [standardId, setStandardId] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const standardsQuery = useQuery({
    queryKey: ["standards"],
    queryFn: async () => (await client.get("/standards")).data,
  });

  const subjectsQuery = useQuery({
    queryKey: ["subjects", standardId],
    enabled: !!standardId,
    queryFn: async () =>
      (await client.get(`/standards/${standardId}/subjects`)).data,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { name: "" },
  });

  const createMutation = useMutation({
    mutationFn: async (values) =>
      (await client.post("/subjects", {
        name: values.name,
        standardId: Number(standardId),
      })).data,
    onSuccess: () => {
      toast.success("Subject added");
      queryClient.invalidateQueries({ queryKey: ["subjects", standardId] });
      reset();
      setSheetOpen(false);
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Could not add subject"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => (await client.delete(`/subjects/${id}`)).data,
    onSuccess: () => {
      toast.success("Subject deleted");
      queryClient.invalidateQueries({ queryKey: ["subjects", standardId] });
      setToDelete(null);
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Could not delete subject"),
  });

  const standards = standardsQuery.data ?? [];
  const selectedName = standards.find((s) => String(s.id) === standardId)?.name;

  return (
    <>
      <div className="mb-4 space-y-2">
        <Label className="text-base">Standard</Label>
        <Select value={standardId} onValueChange={setStandardId}>
          <SelectTrigger className="h-12 text-base">
            <SelectValue placeholder="Select a standard" />
          </SelectTrigger>
          <SelectContent>
            {standards.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!standardId ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Select a standard to view its subjects.
        </p>
      ) : subjectsQuery.isLoading ? (
        <ListSkeleton />
      ) : subjectsQuery.isError ? (
        <ErrorState message="Failed to load subjects" onRetry={subjectsQuery.refetch} />
      ) : (
        <div className="space-y-3">
          {(subjectsQuery.data ?? []).length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No subjects yet. Tap + to add one.
            </p>
          )}
          {(subjectsQuery.data ?? []).map((s) => (
            <Card key={s.id}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.chapterCount ?? 0} chapter
                    {(s.chapterCount ?? 0) === 1 ? "" : "s"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive touch-target"
                  onClick={() => setToDelete(s)}
                  aria-label={`Delete ${s.name}`}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {standardId && <Fab onClick={() => setSheetOpen(true)} label="Add subject" />}

      <Drawer open={sheetOpen} onOpenChange={setSheetOpen}>
        <DrawerContent>
          <form onSubmit={handleSubmit((v) => createMutation.mutate(v))}>
            <DrawerHeader>
              <DrawerTitle>Add Subject</DrawerTitle>
            </DrawerHeader>
            <div className="space-y-4 px-4">
              <div className="space-y-2">
                <Label className="text-base">Standard</Label>
                <Input
                  className="h-12 text-base"
                  value={selectedName ?? ""}
                  readOnly
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subj-name" className="text-base">Name</Label>
                <Input
                  id="subj-name"
                  className="h-12 text-base"
                  placeholder="e.g. Physics"
                  {...register("name", { required: "Name is required" })}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
            </div>
            <DrawerFooter>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="h-12 text-base touch-target"
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline" className="h-12 text-base touch-target">
                  Cancel
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>

      <DeleteDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        name={toDelete?.name}
        pending={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(toDelete.id)}
      />
    </>
  );
}

/* ----------------------------- Chapters tab ------------------------------ */

function ChaptersTab() {
  const queryClient = useQueryClient();
  const [standardId, setStandardId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const standardsQuery = useQuery({
    queryKey: ["standards"],
    queryFn: async () => (await client.get("/standards")).data,
  });

  const subjectsQuery = useQuery({
    queryKey: ["subjects", standardId],
    enabled: !!standardId,
    queryFn: async () =>
      (await client.get(`/standards/${standardId}/subjects`)).data,
  });

  const chaptersQuery = useQuery({
    queryKey: ["chapters", subjectId],
    enabled: !!subjectId,
    queryFn: async () =>
      (await client.get(`/subjects/${subjectId}/chapters`)).data,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { number: "", name: "" },
  });

  const createMutation = useMutation({
    mutationFn: async (values) =>
      (await client.post("/chapters", {
        number: Number(values.number),
        name: values.name,
        subjectId: Number(subjectId),
      })).data,
    onSuccess: () => {
      toast.success("Chapter added");
      queryClient.invalidateQueries({ queryKey: ["chapters", subjectId] });
      reset();
      setSheetOpen(false);
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Could not add chapter"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => (await client.delete(`/chapters/${id}`)).data,
    onSuccess: () => {
      toast.success("Chapter deleted");
      queryClient.invalidateQueries({ queryKey: ["chapters", subjectId] });
      setToDelete(null);
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Could not delete chapter"),
  });

  const standards = standardsQuery.data ?? [];
  const subjects = subjectsQuery.data ?? [];
  const selectedSubjectName = subjects.find((s) => String(s.id) === subjectId)?.name;

  return (
    <>
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-base">Standard</Label>
          <Select
            value={standardId}
            onValueChange={(v) => {
              setStandardId(v);
              setSubjectId("");
            }}
          >
            <SelectTrigger className="h-12 text-base">
              <SelectValue placeholder="Select a standard" />
            </SelectTrigger>
            <SelectContent>
              {standards.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-base">Subject</Label>
          <Select
            value={subjectId}
            onValueChange={setSubjectId}
            disabled={!standardId}
          >
            <SelectTrigger className="h-12 text-base">
              <SelectValue
                placeholder={
                  standardId ? "Select a subject" : "Select a standard first"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!subjectId ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Select a standard and subject to view chapters.
        </p>
      ) : chaptersQuery.isLoading ? (
        <ListSkeleton />
      ) : chaptersQuery.isError ? (
        <ErrorState message="Failed to load chapters" onRetry={chaptersQuery.refetch} />
      ) : (
        <div className="space-y-3">
          {(chaptersQuery.data ?? []).length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No chapters yet. Tap + to add one.
            </p>
          )}
          {(chaptersQuery.data ?? []).map((c) => (
            <Card key={c.id}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                  {c.number}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{c.name}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive touch-target"
                  onClick={() => setToDelete(c)}
                  aria-label={`Delete ${c.name}`}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {subjectId && <Fab onClick={() => setSheetOpen(true)} label="Add chapter" />}

      <Drawer open={sheetOpen} onOpenChange={setSheetOpen}>
        <DrawerContent>
          <form onSubmit={handleSubmit((v) => createMutation.mutate(v))}>
            <DrawerHeader>
              <DrawerTitle>Add Chapter</DrawerTitle>
            </DrawerHeader>
            <div className="space-y-4 px-4">
              <div className="space-y-2">
                <Label className="text-base">Subject</Label>
                <Input
                  className="h-12 text-base"
                  value={selectedSubjectName ?? ""}
                  readOnly
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chap-number" className="text-base">
                  Chapter Number
                </Label>
                <Input
                  id="chap-number"
                  type="number"
                  className="h-12 text-base"
                  placeholder="e.g. 1"
                  {...register("number", { required: "Number is required" })}
                />
                {errors.number && (
                  <p className="text-sm text-destructive">{errors.number.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="chap-name" className="text-base">
                  Chapter Name
                </Label>
                <Input
                  id="chap-name"
                  className="h-12 text-base"
                  placeholder="e.g. Real Numbers"
                  {...register("name", { required: "Name is required" })}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
            </div>
            <DrawerFooter>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="h-12 text-base touch-target"
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline" className="h-12 text-base touch-target">
                  Cancel
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>

      <DeleteDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        name={toDelete?.name}
        pending={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(toDelete.id)}
      />
    </>
  );
}

export default function Settings() {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage standards, subjects and chapters"
        icon={SettingsIcon}
      />

      <Tabs defaultValue="standards">
        <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          <TabsList className="w-max">
            <TabsTrigger value="standards" className="gap-1.5">
              <Layers className="h-4 w-4" /> Standards
            </TabsTrigger>
            <TabsTrigger value="subjects" className="gap-1.5">
              <BookOpen className="h-4 w-4" /> Subjects
            </TabsTrigger>
            <TabsTrigger value="chapters" className="gap-1.5">
              <ListOrdered className="h-4 w-4" /> Chapters
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="standards" className="mt-4">
          <StandardsTab />
        </TabsContent>
        <TabsContent value="subjects" className="mt-4">
          <SubjectsTab />
        </TabsContent>
        <TabsContent value="chapters" className="mt-4">
          <ChaptersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

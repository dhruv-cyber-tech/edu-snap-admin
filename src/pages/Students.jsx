import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  UserPlus,
} from "lucide-react";
import client from "@/api/client";
import PageHeader from "@/components/PageHeader";
import ErrorState from "@/components/ErrorState";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

function groupStandards(standards) {
  return Object.entries(
    (standards ?? []).reduce((acc, s) => {
      const key = s.group ?? "Other";
      (acc[key] = acc[key] ?? []).push(s);
      return acc;
    }, {}),
  );
}

function fullName(s) {
  return `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim();
}

function standardName(s) {
  return s.standard?.name ?? s.standardName ?? "—";
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  );
}

const emptyForm = {
  firstName: "",
  lastName: "",
  standardId: "",
  parentName: "",
  parentContact: "",
  address: "",
};

export default function Students() {
  const queryClient = useQueryClient();
  const [classFilter, setClassFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: emptyForm });

  const standardsQuery = useQuery({
    queryKey: ["standards"],
    queryFn: async () => (await client.get("/standards")).data,
  });

  const countQuery = useQuery({
    queryKey: ["students-count"],
    queryFn: async () => (await client.get("/students/count")).data,
  });

  const studentsQuery = useQuery({
    queryKey: ["students", classFilter],
    queryFn: async () => {
      const url = classFilter
        ? `/students/by-standard/${classFilter}`
        : "/students";
      return (await client.get(url)).data;
    },
  });

  const students = Array.isArray(studentsQuery.data)
    ? studentsQuery.data
    : (studentsQuery.data?.content ?? []);

  const openCreate = () => {
    setEditing(null);
    reset(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    reset({
      firstName: s.firstName ?? "",
      lastName: s.lastName ?? "",
      standardId: String(s.standard?.id ?? s.standardId ?? ""),
      parentName: s.parentName ?? "",
      parentContact: s.parentContact ?? "",
      address: s.address ?? "",
    });
    setFormOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (values) => {
      const body = {
        firstName: values.firstName,
        lastName: values.lastName,
        standardId: Number(values.standardId),
        parentName: values.parentName,
        parentContact: values.parentContact,
        address: values.address,
      };
      if (editing) {
        return (await client.put(`/students/${editing.id}`, body)).data;
      }
      return (await client.post("/students", body)).data;
    },
    onSuccess: () => {
      toast.success(editing ? "Student updated" : "Student added");
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["students-count"] });
      setFormOpen(false);
      setEditing(null);
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || "Could not save student. Try again.",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await client.delete(`/students/${id}`);
    },
    onSuccess: () => {
      toast.success("Student removed");
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["students-count"] });
      setDeleting(null);
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || "Could not remove student. Try again.",
      );
    },
  });

  const standardGroups = groupStandards(standardsQuery.data);

  return (
    <div className="pb-24">
      <PageHeader
        title="Students"
        description={
          countQuery.data != null
            ? `${countQuery.data} active student${countQuery.data === 1 ? "" : "s"}`
            : "Manage your students"
        }
        icon={Users}
      />

      {/* Class filter */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <Label className="mb-2 block text-sm">Filter by Class</Label>
          <Select
            value={classFilter || ALL}
            onValueChange={(v) => setClassFilter(v === ALL ? "" : v)}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All Classes</SelectItem>
              {standardGroups.map(([group, items]) => (
                <SelectGroup key={group}>
                  <SelectLabel>{group}</SelectLabel>
                  {items.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {studentsQuery.isLoading && <ListSkeleton />}
      {studentsQuery.isError && (
        <ErrorState
          error={studentsQuery.error}
          onRetry={studentsQuery.refetch}
        />
      )}

      {studentsQuery.data && students.length === 0 && (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border py-16 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-primary">
            <UserPlus className="h-6 w-6" />
          </div>
          <p className="mt-4 text-base font-semibold">No students added yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add your first student to get started.
          </p>
          <Button className="mt-4 touch-target" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            <span className="ml-2">Add Student</span>
          </Button>
        </div>
      )}

      {studentsQuery.data && students.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Parent Name</TableHead>
                        <TableHead>Parent Contact</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">
                            {fullName(s)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant="secondary" className="text-xs">
                              {standardName(s)}
                            </Badge>
                          </TableCell>
                          <TableCell>{s.parentName ?? "—"}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            {s.parentContact ?? "—"}
                          </TableCell>
                          <TableCell className="max-w-[220px] truncate">
                            {s.address ?? "—"}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Edit"
                                onClick={() => openEdit(s)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Delete"
                                className="text-destructive"
                                onClick={() => setDeleting(s)}
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
            {students.map((s) => (
              <Card key={s.id} className="overflow-hidden animate-fade-in">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-base leading-tight">
                      {fullName(s)}
                    </h3>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {standardName(s)}
                    </Badge>
                  </div>
                  <dl className="space-y-1 text-sm">
                    <div className="flex gap-2">
                      <dt className="text-muted-foreground">Parent:</dt>
                      <dd>{s.parentName ?? "—"}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-muted-foreground">Contact:</dt>
                      <dd>{s.parentContact ?? "—"}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-muted-foreground">Address:</dt>
                      <dd className="min-w-0">{s.address ?? "—"}</dd>
                    </div>
                  </dl>
                  <div className="flex items-center justify-end gap-1 pt-2 border-t border-border">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10"
                      title="Edit"
                      aria-label="Edit student"
                      onClick={() => openEdit(s)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-destructive"
                      title="Delete"
                      aria-label="Delete student"
                      onClick={() => setDeleting(s)}
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

      {/* FAB */}
      <Button
        onClick={openCreate}
        className="fixed bottom-24 right-4 z-40 h-14 w-14 rounded-full shadow-lg md:bottom-8"
        size="icon"
        aria-label="Add student"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Add / Edit form dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Student" : "Add Student"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Update the student's details."
                : "Enter the new student's details."}
            </DialogDescription>
          </DialogHeader>

          <form
            id="student-form"
            onSubmit={handleSubmit((v) => saveMutation.mutate(v))}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  className="h-11"
                  {...register("firstName", {
                    required: "First name is required",
                  })}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  className="h-11"
                  {...register("lastName", {
                    required: "Last name is required",
                  })}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Standard / Class</Label>
              <Controller
                control={control}
                name="standardId"
                rules={{ required: "Please select a class" }}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {standardGroups.map(([group, items]) => (
                        <SelectGroup key={group}>
                          <SelectLabel>{group}</SelectLabel>
                          {items.map((s) => (
                            <SelectItem key={s.id} value={String(s.id)}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.standardId && (
                <p className="text-sm text-destructive">
                  {errors.standardId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentName">Parent Name</Label>
              <Input
                id="parentName"
                className="h-11"
                {...register("parentName", {
                  required: "Parent name is required",
                })}
              />
              {errors.parentName && (
                <p className="text-sm text-destructive">
                  {errors.parentName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentContact">Parent Contact</Label>
              <Input
                id="parentContact"
                type="tel"
                className="h-11"
                {...register("parentContact", {
                  required: "Parent contact is required",
                })}
              />
              {errors.parentContact && (
                <p className="text-sm text-destructive">
                  {errors.parentContact.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" rows={2} {...register("address")} />
            </div>
          </form>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="student-form"
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              <span className={saveMutation.isPending ? "ml-2" : ""}>
                {editing ? "Save Changes" : "Add Student"}
              </span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this student?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting && `${fullName(deleting)} will be deactivated. `}
              You can add them again later.
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
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              <span className={deleteMutation.isPending ? "ml-2" : ""}>
                Remove
              </span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

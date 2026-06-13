import { useState, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Upload as UploadIcon,
  Loader2,
  CheckCircle2,
  FileText,
  Notebook,
  ClipboardList,
  Lightbulb,
  X,
  UploadCloud,
  Plus,
} from "lucide-react";
import client from "@/api/client";
import PageHeader from "@/components/PageHeader";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const RESOURCE_TYPE_OPTIONS = [
  { value: "Worksheet", label: "Worksheet", icon: FileText },
  { value: "Notes", label: "Notes", icon: Notebook },
  { value: "Test Paper", label: "Test Paper", icon: ClipboardList },
  { value: "Solution", label: "Solution", icon: Lightbulb },
];

const MAX_SIZE = 20 * 1024 * 1024; // 20MB

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function Upload() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      type: "Worksheet",
      standardId: "",
      subjectId: "",
      chapterId: "",
      title: "",
      description: "",
    },
  });

  const standardId = watch("standardId");
  const subjectId = watch("subjectId");

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

  const tagsQuery = useQuery({
    queryKey: ["tags"],
    queryFn: async () => (await client.get("/tags")).data,
  });

  const tagSuggestions = (tagsQuery.data ?? []).filter(
    (t) =>
      !tags.includes(t) &&
      (!tagInput || t.toLowerCase().includes(tagInput.toLowerCase())),
  );

  function handleFile(selected) {
    setFileError("");
    if (!selected) return;
    if (selected.type !== "application/pdf") {
      setFileError("Only PDF files are allowed.");
      return;
    }
    if (selected.size > MAX_SIZE) {
      setFileError("File is too large. Maximum size is 20MB.");
      return;
    }
    setFile(selected);
  }

  function addTag(value) {
    const t = value.trim().replace(/,$/, "");
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput("");
  }

  function handleTagKeyDown(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === "Backspace" && !tagInput && tags.length) {
      setTags((prev) => prev.slice(0, -1));
    }
  }

  const mutation = useMutation({
    mutationFn: async (values) => {
      const standards = standardsQuery.data ?? [];
      const subjects = subjectsQuery.data ?? [];
      const chapters = chaptersQuery.data ?? [];
      const stdName = standards.find((s) => String(s.id) === values.standardId)?.name;
      const subjName = subjects.find((s) => String(s.id) === values.subjectId)?.name;
      const chapName = chapters.find((c) => String(c.id) === values.chapterId)?.name;

      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description ?? "");
      formData.append("type", values.type);
      formData.append("standardId", values.standardId);
      formData.append("subjectId", values.subjectId);
      formData.append("chapterId", values.chapterId);
      formData.append("standard", stdName ?? "");
      formData.append("subject", subjName ?? "");
      formData.append("chapter", chapName ?? "");
      formData.append("tags", JSON.stringify(tags));
      if (file) formData.append("file", file);

      setProgress(0);
      const { data } = await client.post("/resources", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
        },
      });
      // Mock layer has no real progress events — simulate completion.
      setProgress(100);
      return data;
    },
    onSuccess: () => {
      setSuccess(true);
      setServerError("");
      toast.success("Resource uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.message || "Upload failed. Please try again.";
      setServerError(msg);
      toast.error(msg);
    },
  });

  function onSubmit(values) {
    if (!file) {
      setFileError("Please select a PDF file to upload.");
      return;
    }
    mutation.mutate(values);
  }

  function resetForm() {
    reset();
    setFile(null);
    setFileError("");
    setTags([]);
    setTagInput("");
    setProgress(0);
    setSuccess(false);
    setServerError("");
  }

  if (success) {
    return (
      <div>
        <PageHeader
          title="Upload Resource"
          description="Add new study material for your classes"
          icon={UploadIcon}
        />
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Upload complete</h2>
              <p className="text-sm text-muted-foreground">
                Your resource has been added successfully.
              </p>
            </div>
            <div className="grid w-full gap-3 sm:grid-cols-2">
              <Button
                onClick={resetForm}
                className="h-12 text-base touch-target"
              >
                <Plus className="h-5 w-5" />
                <span className="ml-2">Upload Another</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/resources")}
                className="h-12 text-base touch-target"
              >
                View Resources
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <PageHeader
        title="Upload Resource"
        description="Add new study material for your classes"
        icon={UploadIcon}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {serverError && (
          <div className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
            {serverError}
          </div>
        )}

        {/* Resource Type */}
        <div className="space-y-2">
          <Label className="text-base">Resource Type</Label>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-3">
                {RESOURCE_TYPE_OPTIONS.map(({ value, label, icon: Icon }) => {
                  const active = field.value === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => field.onChange(value)}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-medium transition-colors touch-target",
                        active
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border bg-card text-muted-foreground hover:border-primary/40",
                      )}
                      aria-pressed={active}
                    >
                      <Icon className="h-6 w-6" />
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
          />
        </div>

        {/* Standard */}
        <div className="space-y-2">
          <Label className="text-base">Standard / Class</Label>
          <Controller
            control={control}
            name="standardId"
            rules={{ required: "Please select a standard" }}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(v) => {
                  field.onChange(v);
                  setValue("subjectId", "");
                  setValue("chapterId", "");
                }}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue
                    placeholder={
                      standardsQuery.isLoading ? "Loading…" : "Select a standard"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {(standardsQuery.data ?? []).map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
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

        {/* Subject */}
        <div className="space-y-2">
          <Label className="text-base">Subject</Label>
          <Controller
            control={control}
            name="subjectId"
            rules={{ required: "Please select a subject" }}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(v) => {
                  field.onChange(v);
                  setValue("chapterId", "");
                }}
                disabled={!standardId || subjectsQuery.isLoading}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue
                    placeholder={
                      !standardId
                        ? "Select a standard first"
                        : subjectsQuery.isLoading
                          ? "Loading…"
                          : "Select a subject"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {(subjectsQuery.data ?? []).map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.subjectId && (
            <p className="text-sm text-destructive">
              {errors.subjectId.message}
            </p>
          )}
        </div>

        {/* Chapter */}
        <div className="space-y-2">
          <Label className="text-base">Chapter</Label>
          <Controller
            control={control}
            name="chapterId"
            rules={{ required: "Please select a chapter" }}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!subjectId || chaptersQuery.isLoading}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue
                    placeholder={
                      !subjectId
                        ? "Select a subject first"
                        : chaptersQuery.isLoading
                          ? "Loading…"
                          : "Select a chapter"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {(chaptersQuery.data ?? []).map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.number}. {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.chapterId && (
            <p className="text-sm text-destructive">
              {errors.chapterId.message}
            </p>
          )}
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-base">
            Title
          </Label>
          <Input
            id="title"
            className="h-12 text-base"
            placeholder="e.g. Real Numbers — Practice Worksheet"
            {...register("title", { required: "Title is required" })}
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-base">
            Description{" "}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Textarea
            id="description"
            rows={3}
            className="text-base"
            placeholder="Optional notes about this resource"
            {...register("description")}
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label htmlFor="tags" className="text-base">
            Tags
          </Label>
          <div className="rounded-lg border border-input bg-background p-2">
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <Badge key={t} variant="secondary" className="gap-1 text-sm">
                  {t}
                  <button
                    type="button"
                    onClick={() => setTags((p) => p.filter((x) => x !== t))}
                    aria-label={`Remove ${t}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              ))}
              <input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder={tags.length ? "" : "Type and press Enter…"}
                className="min-w-[120px] flex-1 bg-transparent px-1 py-1.5 text-base outline-none"
              />
            </div>
          </div>
          {tagInput && tagSuggestions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tagSuggestions.slice(0, 6).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => addTag(t)}
                  className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground hover:border-primary hover:text-primary"
                >
                  + {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* File */}
        <div className="space-y-2">
          <Label className="text-base">PDF File</Label>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          {!file ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-input bg-secondary/30 px-4 py-8 text-center transition-colors hover:border-primary touch-target"
            >
              <UploadCloud className="h-8 w-8 text-muted-foreground" />
              <span className="text-base font-medium">Tap to choose a PDF</span>
              <span className="text-xs text-muted-foreground">
                PDF only · max 20MB
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-input bg-card p-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatSize(file.size)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="touch-target"
                onClick={() => {
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                aria-label="Remove file"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          )}
          {fileError && (
            <p className="text-sm text-destructive">{fileError}</p>
          )}
        </div>

        {mutation.isPending && (
          <div className="space-y-1">
            <Progress value={progress} />
            <p className="text-xs text-muted-foreground">
              Uploading… {progress}%
            </p>
          </div>
        )}

        {/* Sticky submit button (mobile) */}
        <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-card/95 p-3 backdrop-blur md:static md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
          <div className="mx-auto w-full max-w-5xl">
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="h-12 w-full text-base touch-target"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="ml-2">Uploading…</span>
                </>
              ) : (
                <>
                  <UploadIcon className="h-5 w-5" />
                  <span className="ml-2">Upload Resource</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

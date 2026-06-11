import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload as UploadIcon, Loader2, CheckCircle2 } from "lucide-react";
import client from "@/api/client";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Upload() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState(null);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { title: "", subject: "", description: "" } });

  const mutation = useMutation({
    mutationFn: async (values) => {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("subject", values.subject);
      formData.append("description", values.description ?? "");
      if (file) formData.append("file", file);
      const { data } = await client.post("/resources", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: () => {
      setSuccess(true);
      setServerError("");
      reset();
      setFile(null);
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      setTimeout(() => setSuccess(false), 4000);
    },
    onError: (err) => {
      setServerError(
        err?.response?.data?.message || "Upload failed. Please try again.",
      );
    },
  });

  return (
    <div>
      <PageHeader
        title="Upload Resource"
        description="Add new study material for your classes"
        icon={UploadIcon}
      />

      <Card>
        <CardContent className="pt-6">
          {success && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2.5 text-sm text-primary">
              <CheckCircle2 className="h-4 w-4" />
              Resource uploaded successfully.
            </div>
          )}
          {serverError && (
            <div className="mb-4 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              {serverError}
            </div>
          )}

          <form
            onSubmit={handleSubmit((v) => mutation.mutate(v))}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base">
                Title
              </Label>
              <Input
                id="title"
                className="h-12 text-base"
                placeholder="e.g. Algebra — Chapter 5 Notes"
                {...register("title", { required: "Title is required" })}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject" className="text-base">
                Subject
              </Label>
              <Input
                id="subject"
                className="h-12 text-base"
                placeholder="e.g. Mathematics"
                {...register("subject", { required: "Subject is required" })}
              />
              {errors.subject && (
                <p className="text-sm text-destructive">{errors.subject.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-base">
                Description
              </Label>
              <Textarea
                id="description"
                className="min-h-24 text-base"
                placeholder="Optional notes about this resource"
                {...register("description")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file" className="text-base">
                File
              </Label>
              <Input
                id="file"
                type="file"
                className="h-12 text-base file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {file && (
                <p className="text-sm text-muted-foreground truncate">{file.name}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={mutation.isPending}
              className="w-full h-12 text-base touch-target"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="ml-2">Uploading…</span>
                </>
              ) : (
                "Upload Resource"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

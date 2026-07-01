import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Wallet,
  Plus,
  Loader2,
  CheckCircle2,
  CalendarIcon,
  Check,
  ChevronsUpDown,
  IndianRupee,
} from "lucide-react";
import client from "@/api/client";
import { cn } from "@/lib/utils";
import PageHeader from "@/components/PageHeader";
import ErrorState from "@/components/ErrorState";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PERIOD_TYPES = [
  { value: "MONTHLY", label: "Monthly", months: 1 },
  { value: "QUARTERLY", label: "Quarterly", months: 3 },
  { value: "YEARLY", label: "Yearly", months: 12 },
];

const PERIOD_LABEL = {
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  YEARLY: "Yearly",
};

const PERIOD_BADGE = {
  MONTHLY: "bg-chart-1/15 text-chart-1 border-chart-1/30",
  QUARTERLY: "bg-chart-2/15 text-chart-2 border-chart-2/30",
  YEARLY: "bg-chart-4/15 text-chart-4 border-chart-4/30",
};

const PAYMENT_METHODS = ["Cash", "Online", "Cheque"];

function formatMoney(v) {
  if (v == null) return "₹0";
  return `₹${Number(v).toLocaleString("en-IN")}`;
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function studentName(s) {
  return `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim();
}

function feeStudentName(fee, studentsById) {
  if (fee.studentName) return fee.studentName;
  if (fee.student) return studentName(fee.student);
  const s = studentsById?.[fee.studentId];
  return s ? studentName(s) : "Student";
}

function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  d.setDate(d.getDate() - 1);
  return d;
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-lg" />
      ))}
    </div>
  );
}

const currentYear = new Date().getFullYear();
const YEAR_START = `${currentYear}-01-01`;
const YEAR_END = `${currentYear}-12-31`;

export default function Fees() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("unpaid");
  const [formOpen, setFormOpen] = useState(false);
  const [markPaidFee, setMarkPaidFee] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [studentPickerOpen, setStudentPickerOpen] = useState(false);
  const [historyStudentId, setHistoryStudentId] = useState("");

  const summaryQuery = useQuery({
    queryKey: ["fees-summary", YEAR_START, YEAR_END],
    queryFn: async () =>
      (
        await client.get(
          `/fees/summary?start=${YEAR_START}&end=${YEAR_END}`,
        )
      ).data,
  });

  const unpaidQuery = useQuery({
    queryKey: ["fees-unpaid"],
    queryFn: async () => (await client.get("/fees/unpaid")).data,
  });

  const studentsQuery = useQuery({
    queryKey: ["students"],
    queryFn: async () => (await client.get("/students")).data,
  });

  const students = Array.isArray(studentsQuery.data)
    ? studentsQuery.data
    : (studentsQuery.data?.content ?? []);

  const studentsById = useMemo(
    () => Object.fromEntries(students.map((s) => [s.id, s])),
    [students],
  );

  const unpaid = Array.isArray(unpaidQuery.data)
    ? unpaidQuery.data
    : (unpaidQuery.data?.content ?? []);

  const historyQuery = useQuery({
    queryKey: ["fees-student", historyStudentId],
    enabled: !!historyStudentId,
    queryFn: async () =>
      (await client.get(`/fees/student/${historyStudentId}`)).data,
  });

  const history = Array.isArray(historyQuery.data)
    ? historyQuery.data
    : (historyQuery.data?.content ?? []);

  // ---- Record fee form ----
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
      studentId: "",
      amount: "",
      periodType: "MONTHLY",
      periodStart: undefined,
      periodEnd: undefined,
      notes: "",
    },
  });

  const selectedStudentId = watch("studentId");
  const periodStart = watch("periodStart");
  const periodEnd = watch("periodEnd");
  const periodType = watch("periodType");

  const openCreate = () => {
    reset({
      studentId: "",
      amount: "",
      periodType: "MONTHLY",
      periodStart: undefined,
      periodEnd: undefined,
      notes: "",
    });
    setFormOpen(true);
  };

  const recalcEnd = (start, type) => {
    if (!start) return;
    const months = PERIOD_TYPES.find((p) => p.value === type)?.months ?? 1;
    setValue("periodEnd", addMonths(start, months));
  };

  const createMutation = useMutation({
    mutationFn: async (values) => {
      const body = {
        studentId: Number(values.studentId),
        amount: Number(values.amount),
        periodType: values.periodType,
        periodStart: format(values.periodStart, "yyyy-MM-dd"),
        periodEnd: format(values.periodEnd, "yyyy-MM-dd"),
        notes: values.notes || undefined,
      };
      return (await client.post("/fees", body)).data;
    },
    onSuccess: () => {
      toast.success("Fee recorded");
      queryClient.invalidateQueries({ queryKey: ["fees-unpaid"] });
      queryClient.invalidateQueries({ queryKey: ["fees-summary"] });
      queryClient.invalidateQueries({ queryKey: ["fees-student"] });
      setFormOpen(false);
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || "Could not record fee. Try again.",
      );
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: async ({ id, method }) => {
      return (
        await client.put(`/fees/${id}/mark-paid`, { paymentMethod: method })
      ).data;
    },
    onSuccess: () => {
      toast.success("Fee marked as paid");
      queryClient.invalidateQueries({ queryKey: ["fees-unpaid"] });
      queryClient.invalidateQueries({ queryKey: ["fees-summary"] });
      queryClient.invalidateQueries({ queryKey: ["fees-student"] });
      setMarkPaidFee(null);
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || "Could not mark as paid. Try again.",
      );
    },
  });

  return (
    <div className="pb-24">
      <PageHeader
        title="Fees"
        description="Track fee collection and pending payments"
        icon={Wallet}
      />

      {/* Summary card */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Collected</p>
            {summaryQuery.isLoading ? (
              <Skeleton className="mt-2 h-7 w-24" />
            ) : (
              <p className="mt-1 text-2xl font-bold text-chart-2">
                {formatMoney(
                  summaryQuery.data?.totalCollected ??
                    summaryQuery.data?.collected,
                )}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Pending</p>
            {summaryQuery.isLoading ? (
              <Skeleton className="mt-2 h-7 w-24" />
            ) : (
              <p className="mt-1 text-2xl font-bold text-chart-4">
                {formatMoney(
                  summaryQuery.data?.totalPending ??
                    summaryQuery.data?.pending,
                )}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
          <TabsTrigger value="history">Student History</TabsTrigger>
        </TabsList>

        {/* Unpaid list */}
        <TabsContent value="unpaid" className="mt-4">
          {unpaidQuery.isLoading && <ListSkeleton />}
          {unpaidQuery.isError && (
            <ErrorState error={unpaidQuery.error} onRetry={unpaidQuery.refetch} />
          )}

          {unpaidQuery.data && unpaid.length === 0 && (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-border py-16 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-chart-2">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <p className="mt-4 text-base font-semibold">
                No unpaid fees
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Everything is settled. Record a new fee with the + button.
              </p>
            </div>
          )}

          {unpaidQuery.data && unpaid.length > 0 && (
            <div className="space-y-3">
              {unpaid.map((fee) => (
                <Card key={fee.id} className="animate-fade-in">
                  <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">
                          {feeStudentName(fee, studentsById)}
                        </h3>
                        <Badge
                          variant="outline"
                          className={PERIOD_BADGE[fee.periodType] ?? ""}
                        >
                          {PERIOD_LABEL[fee.periodType] ?? fee.periodType}
                        </Badge>
                      </div>
                      <p className="text-lg font-bold">
                        {formatMoney(fee.amount)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(fee.periodStart)} –{" "}
                        {formatDate(fee.periodEnd)}
                      </p>
                    </div>
                    <Button
                      className="shrink-0 touch-target"
                      onClick={() => {
                        setPaymentMethod("Cash");
                        setMarkPaidFee(fee);
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="ml-2">Mark as Paid</span>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Student history */}
        <TabsContent value="history" className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-4">
              <Label className="mb-2 block text-sm">Select Student</Label>
              <Select
                value={historyStudentId}
                onValueChange={setHistoryStudentId}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Choose a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {studentName(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {!historyStudentId && (
            <div className="rounded-xl border border-dashed border-border py-12 text-center text-muted-foreground">
              Select a student to view their fee history.
            </div>
          )}

          {historyStudentId && historyQuery.isLoading && <ListSkeleton />}
          {historyStudentId && historyQuery.isError && (
            <ErrorState
              error={historyQuery.error}
              onRetry={historyQuery.refetch}
            />
          )}

          {historyStudentId &&
            historyQuery.data &&
            history.length === 0 && (
              <div className="rounded-xl border border-dashed border-border py-12 text-center text-muted-foreground">
                No fee records for this student yet.
              </div>
            )}

          {historyStudentId && history.length > 0 && (
            <div className="space-y-3">
              {history.map((fee) => (
                <Card key={fee.id} className="animate-fade-in">
                  <CardContent className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-lg font-bold">
                          {formatMoney(fee.amount)}
                        </span>
                        <Badge
                          variant="outline"
                          className={PERIOD_BADGE[fee.periodType] ?? ""}
                        >
                          {PERIOD_LABEL[fee.periodType] ?? fee.periodType}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(fee.periodStart)} –{" "}
                        {formatDate(fee.periodEnd)}
                      </p>
                    </div>
                    {fee.paid ? (
                      <Badge className="shrink-0 border-chart-2/30 bg-chart-2/15 text-chart-2">
                        Paid{fee.paymentMethod ? ` · ${fee.paymentMethod}` : ""}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="shrink-0 border-chart-4/30 bg-chart-4/15 text-chart-4"
                      >
                        Unpaid
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* FAB */}
      <Button
        onClick={openCreate}
        className="fixed bottom-24 right-4 z-40 h-14 w-14 rounded-full shadow-lg md:bottom-8"
        size="icon"
        aria-label="Record fee"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Record fee dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Fee</DialogTitle>
            <DialogDescription>
              Create a new fee record for a student.
            </DialogDescription>
          </DialogHeader>

          <form
            id="fee-form"
            onSubmit={handleSubmit((v) => createMutation.mutate(v))}
            className="space-y-4"
          >
            {/* Student searchable dropdown */}
            <div className="space-y-2">
              <Label>Student</Label>
              <Controller
                control={control}
                name="studentId"
                rules={{ required: "Please select a student" }}
                render={({ field }) => (
                  <Popover
                    open={studentPickerOpen}
                    onOpenChange={setStudentPickerOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        className="h-11 w-full justify-between font-normal"
                      >
                        {field.value
                          ? studentName(studentsById[Number(field.value)] ?? {})
                          : "Select a student"}
                        <ChevronsUpDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[--radix-popover-trigger-width] p-0 pointer-events-auto"
                      align="start"
                    >
                      <Command>
                        <CommandInput placeholder="Search students…" />
                        <CommandList>
                          <CommandEmpty>No students found.</CommandEmpty>
                          <CommandGroup>
                            {students.map((s) => (
                              <CommandItem
                                key={s.id}
                                value={studentName(s)}
                                onSelect={() => {
                                  field.onChange(String(s.id));
                                  setStudentPickerOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    String(s.id) === field.value
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                {studentName(s)}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.studentId && (
                <p className="text-sm text-destructive">
                  {errors.studentId.message}
                </p>
              )}
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  inputMode="numeric"
                  className="h-11 pl-9"
                  placeholder="0"
                  {...register("amount", {
                    required: "Amount is required",
                    min: { value: 1, message: "Amount must be greater than 0" },
                  })}
                />
              </div>
              {errors.amount && (
                <p className="text-sm text-destructive">
                  {errors.amount.message}
                </p>
              )}
            </div>

            {/* Period type */}
            <div className="space-y-2">
              <Label>Period Type</Label>
              <Controller
                control={control}
                name="periodType"
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={(v) => {
                      field.onChange(v);
                      recalcEnd(periodStart, v);
                    }}
                    className="grid grid-cols-3 gap-3"
                  >
                    {PERIOD_TYPES.map((p) => (
                      <Label
                        key={p.value}
                        htmlFor={`period-${p.value}`}
                        className={cn(
                          "flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 p-3 text-sm font-medium transition-colors touch-target",
                          field.value === p.value
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border text-muted-foreground",
                        )}
                      >
                        <RadioGroupItem
                          id={`period-${p.value}`}
                          value={p.value}
                          className="sr-only"
                        />
                        {p.label}
                      </Label>
                    ))}
                  </RadioGroup>
                )}
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Period Start</Label>
                <Controller
                  control={control}
                  name="periodStart"
                  rules={{ required: "Start date is required" }}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "h-11 w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value
                            ? format(field.value, "dd MMM yyyy")
                            : "Pick date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(d) => {
                            field.onChange(d);
                            recalcEnd(d, periodType);
                          }}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.periodStart && (
                  <p className="text-sm text-destructive">
                    {errors.periodStart.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Period End</Label>
                <Controller
                  control={control}
                  name="periodEnd"
                  rules={{ required: "End date is required" }}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "h-11 w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value
                            ? format(field.value, "dd MMM yyyy")
                            : "Pick date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.periodEnd && (
                  <p className="text-sm text-destructive">
                    {errors.periodEnd.message}
                  </p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">
                Notes{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Textarea id="notes" rows={2} {...register("notes")} />
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
              form="fee-form"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              <span className={createMutation.isPending ? "ml-2" : ""}>
                Record Fee
              </span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark as paid dialog */}
      <Dialog
        open={!!markPaidFee}
        onOpenChange={(o) => !o && setMarkPaidFee(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Paid</DialogTitle>
            <DialogDescription>
              {markPaidFee &&
                `${feeStudentName(markPaidFee, studentsById)} · ${formatMoney(markPaidFee.amount)}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setMarkPaidFee(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                markPaidMutation.mutate({
                  id: markPaidFee.id,
                  method: paymentMethod,
                })
              }
              disabled={markPaidMutation.isPending}
            >
              {markPaidMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              <span className={markPaidMutation.isPending ? "ml-2" : ""}>
                Confirm Payment
              </span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

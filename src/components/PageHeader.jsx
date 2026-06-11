export default function PageHeader({ title, description, icon: Icon, action }) {
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 mb-6">
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {action}
    </header>
  );
}

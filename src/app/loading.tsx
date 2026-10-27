export default function RootLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="size-2 animate-pulse rounded-full bg-accent" />
        <span className="size-2 animate-pulse rounded-full bg-accent [animation-delay:150ms]" />
        <span className="size-2 animate-pulse rounded-full bg-accent [animation-delay:300ms]" />
      </div>
    </div>
  );
}

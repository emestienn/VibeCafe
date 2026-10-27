import { Skeleton } from "@/components/ui/skeleton";

export default function DiscoverLoading() {
  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="mt-3 h-5 w-48" />

      <div className="mt-6 flex gap-3">
        <Skeleton className="h-11 flex-1" />
        <Skeleton className="h-11 w-40" />
        <Skeleton className="h-11 w-44" />
        <Skeleton className="h-11 w-28" />
      </div>

      <div className="mt-4 flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-28 shrink-0 rounded-full" />
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="hidden h-[calc(100vh-7rem)] rounded-3xl lg:block" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] rounded-3xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

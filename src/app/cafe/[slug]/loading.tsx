import { Skeleton } from "@/components/ui/skeleton";

export default function CafeLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="h-[320px] w-full rounded-3xl sm:h-[460px]" />

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        <div>
          <Skeleton className="h-9 w-72" />
          <Skeleton className="mt-3 h-5 w-48" />
          <Skeleton className="mt-6 h-24 w-full rounded-2xl" />
          <Skeleton className="mt-10 h-6 w-48" />
          <div className="mt-4 grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        </div>
        <Skeleton className="hidden h-64 rounded-2xl lg:block" />
      </div>
    </div>
  );
}

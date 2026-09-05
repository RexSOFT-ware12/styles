import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Skeleton className="h-4 w-64 mb-8" />

      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="w-full max-w-[500px] mx-auto flex flex-col items-center px-4">
            <Skeleton className="mb-4 w-full aspect-square rounded-xl" />
            <div className="flex items-center justify-center gap-3 w-full">
              <Skeleton className="h-16 w-16 shrink-0 rounded-lg" />
              <Skeleton className="h-16 w-16 shrink-0 rounded-lg" />
              <Skeleton className="h-16 w-16 shrink-0 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Info panel */}
        <div className="space-y-6">
          <Skeleton className="h-9 w-3/4" />

          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-24" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>

          <Skeleton className="h-9 w-32" />

          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          <Skeleton className="h-10 w-56 rounded-lg" />

          <div className="h-px w-full bg-border" />

          <div className="space-y-4">
            <div>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-10 w-32 rounded-lg" />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Skeleton className="h-11 flex-1 rounded-md" />
              <Skeleton className="h-11 flex-1 rounded-md" />
            </div>

            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-32 rounded-md" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

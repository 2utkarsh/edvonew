import { cn } from "@/lib/utils"
import Card from './Card'

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-primary/10 animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

function CardSkeleton() {
  return (
    <div className="relative group rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
      {/* Banner Area */}
      <div className="relative h-44 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-800 animate-pulse">
        <div className="absolute top-3 left-3">
          <Skeleton className="h-6 w-20 rounded-md" />
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 space-y-4">
        {/* Title */}
        <Skeleton className="h-5 w-full rounded-md" />
        <Skeleton className="h-5 w-3/4 rounded-md" />

        {/* Rating + Enrolled row */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-16 rounded-md" />
          <Skeleton className="h-4 w-20 rounded-md" />
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <Skeleton className="h-8 rounded-md" />
          <Skeleton className="h-8 rounded-md" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-800">
          <Skeleton className="h-6 w-24 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </div>
    </div>
  );
}

function JobCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40 rounded-md" />
            <Skeleton className="h-4 w-24 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-32 rounded-md" />
          <Skeleton className="h-4 w-24 rounded-md" />
          <Skeleton className="h-4 w-20 rounded-md" />
        </div>
        <Skeleton className="h-4 w-full rounded-md" />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-800">
        <Skeleton className="h-4 w-28 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>
    </Card>
  );
}

export { Skeleton, CardSkeleton, JobCardSkeleton }

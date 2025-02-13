import { Skeleton } from "@/components/ui/skeleton"

export function ChartSkeleton() {
  return (
    <div className="h-[350px] flex items-center justify-center">
      <Skeleton className="w-full h-full" />
    </div>
  )
}
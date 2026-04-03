import { Skeleton } from '@/components/Skeleton';

export default function ProfileLoading() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
        <Skeleton className="size-28 shrink-0 rounded-full" />
        <div className="min-w-0 space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-32" />
        </div>
      </div>
      <div className="mb-8 flex gap-2">
        <Skeleton className="h-12 flex-1" />
        <Skeleton className="h-12 flex-1" />
      </div>
      <div className="nb-card space-y-4 p-6">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </div>
    </main>
  );
}

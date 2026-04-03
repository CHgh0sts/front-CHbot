import { Skeleton } from '@/components/Skeleton';

export default function ConfigsLoading() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Skeleton className="mb-6 h-4 w-16" />
      <Skeleton className="mb-4 h-10 w-64" />
      <Skeleton className="mb-8 h-16 w-full" />
      <Skeleton className="mb-6 h-12 w-48" />
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    </main>
  );
}

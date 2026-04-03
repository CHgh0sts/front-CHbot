import { Skeleton } from '@/components/Skeleton';

export default function AdminLoading() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <Skeleton className="mb-6 h-10 w-56" />
      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
    </main>
  );
}

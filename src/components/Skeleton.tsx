export function Skeleton({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse border-[3px] border-[var(--nb-black)] bg-[var(--bw-muted-bg)] ${className}`}
      {...props}
    />
  );
}

export function SkeletonLine({ className = '' }: { className?: string }) {
  return <Skeleton className={`h-4 w-full ${className}`} />;
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`nb-card space-y-4 p-5 ${className}`}>
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-10 w-1/3" />
    </div>
  );
}

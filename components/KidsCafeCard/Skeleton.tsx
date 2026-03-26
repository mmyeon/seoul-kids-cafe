export default function KidsCafeCardSkeleton() {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden animate-pulse">
      <div className="w-full h-40 bg-gray-200" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
        <div className="h-3 bg-gray-200 rounded w-1/3" />
      </div>
    </article>
  );
}

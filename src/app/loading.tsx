import KidsCafeCardSkeleton from '../../components/KidsCafeCard/Skeleton'

export default function Loading() {
  return (
    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <KidsCafeCardSkeleton key={i} />
      ))}
    </div>
  )
}

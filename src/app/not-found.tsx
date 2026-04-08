import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <p className="text-gray-500">페이지를 찾을 수 없습니다.</p>
      <Link
        href="/"
        className="bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-blue-600 transition-colors"
      >
        홈으로 돌아가기
      </Link>
    </div>
  )
}

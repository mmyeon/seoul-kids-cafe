'use client'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <p className="text-red-500">{error.message || '오류가 발생했습니다.'}</p>
      <button
        onClick={reset}
        className="bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-blue-600 transition-colors"
      >
        다시 시도
      </button>
    </div>
  )
}

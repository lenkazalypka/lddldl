'use client'

export default function GlobalError() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Произошла ошибка</h1>
        <p className="mt-2 text-gray-600">Попробуйте обновить страницу.</p>
      </div>
    </div>
  )
}
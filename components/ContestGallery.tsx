'use client'

import { useState } from 'react'
import { Trophy, X } from 'lucide-react'

interface Photo {
  id: string
  image_url: string
  category: 'winner' | 'participant'
  name: string
  surname_initial: string
  age: number
  city: string
  work_title?: string | null
  place?: number | null
  nomination?: string | null
}

interface ContestGalleryProps {
  resultsPublished?: boolean
  contestId: string
  winners: Photo[]
  participants: Photo[]
  status: string
}

export default function ContestGallery({ winners, participants, status, resultsPublished }: ContestGalleryProps) {
  const canShowWinners = Boolean(resultsPublished) || status === 'finished'
  const [activeTab, setActiveTab] = useState<'winners' | 'all'>(canShowWinners ? 'winners' : 'all')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const allPhotos = [...winners, ...participants]
  const shown = activeTab === 'winners' ? winners : allPhotos

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display text-xl font-bold" style={{ color: '#0D1B40' }}>Галерея работ</h2>
        <div className="flex rounded-xl overflow-hidden" style={{ border: '1.5px solid #E8EBF5' }}>
          {(canShowWinners ? (['winners','all'] as const) : (['all'] as const)).map((tab) => (
            <button key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2 text-sm font-semibold transition-all"
              style={{
                background: activeTab === tab ? '#3D5AFE' : '#fff',
                color:      activeTab === tab ? '#fff'    : '#5A6480',
              }}>
              {tab === 'winners' ? 'Победители' : 'Все работы'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {shown.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {shown.map((photo) => (
            <div key={photo.id} className="cursor-pointer group" onClick={() => setSelectedImage(photo.image_url)}>
              <div className="relative aspect-square rounded-xl overflow-hidden" style={{ background: '#F5F7FF' }}>
                <img src={photo.image_url} alt={`Работа ${photo.name}`}
                     className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                {photo.category === 'winner' && (
                  <div className="absolute top-2 right-2 h-7 w-7 rounded-full flex items-center justify-center"
                       style={{ background: '#F59E0B' }}>
                    <Trophy className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
              </div>
              <div className="mt-2 px-0.5">
                <p className="text-sm font-semibold truncate" style={{ color: '#0D1B40' }}>{photo.name} {photo.surname_initial}.</p>
                <p className="text-xs" style={{ color: '#5A6480' }}>{photo.age} лет, {photo.city}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-14 rounded-2xl" style={{ background: '#F8F9FF' }}>
          <div className="text-4xl mb-3">🎨</div>
          <p className="font-semibold" style={{ color: '#0D1B40' }}>Работ пока нет</p>
          <p className="text-sm mt-1" style={{ color: '#5A6480' }}>Станьте первым участником!</p>
        </div>
      )}

      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ background: 'rgba(0,0,0,0.85)' }}
             onClick={() => setSelectedImage(null)}>
          <button className="absolute top-5 right-5 h-10 w-10 rounded-full flex items-center justify-center transition-all"
                  style={{ background: 'rgba(255,255,255,0.15)' }}
                  onClick={() => setSelectedImage(null)}>
            <X className="h-5 w-5 text-white" />
          </button>
          <img src={selectedImage} alt="Увеличенное изображение"
               className="max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl"
               onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}

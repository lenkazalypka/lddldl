'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toaster'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

interface FAQItem {
  id: string
  question: string
  answer: string
  order: number
}

export default function AdminFAQPage() {
  const [faq, setFaq] = useState<FAQItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [newItem, setNewItem] = useState({ question: '', answer: '' })
  const [showForm, setShowForm] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    loadFAQ()
  }, [])

  const loadFAQ = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('faq')
      .select('*')
      .order('order', { ascending: true })

    setFaq(data || [])
    setLoading(false)
  }

  const handleAdd = async () => {
    if (!newItem.question || !newItem.answer) {
      toast({ title: 'Заполните все поля', variant: 'info' })
      return
    }

    try {
      const maxOrder = Math.max(...faq.map(item => item.order), 0)
      
      const { error } = await supabase
        .from('faq')
        .insert({
          question: newItem.question,
          answer: newItem.answer,
          order: maxOrder + 1,
        })

      if (error) throw error

      setNewItem({ question: '', answer: '' })
      setShowForm(false)
      loadFAQ()
    } catch (error) {
      console.error('Error adding FAQ:', error)
      toast({ title: 'Ошибка при добавлении вопроса', variant: 'error' })
    }
  }

  const handleUpdate = async (id: string, updates: Partial<FAQItem>) => {
    try {
      const { error } = await supabase
        .from('faq')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      loadFAQ()
    } catch (error) {
      console.error('Error updating FAQ:', error)
      toast({ title: 'Ошибка при обновлении вопроса', variant: 'error' })
    }
  }

  const handleDelete = async (id: string) => {
    setConfirmId(id)
    setConfirmOpen(true)
  }

  const deleteNow = async () => {
    if (!confirmId) return
    const id = confirmId
    setDeletingId(id)
    try {
      const { error } = await supabase
        .from('faq')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setFaq(faq.filter(item => item.id !== id))
      toast({ title: 'Вопрос удалён', variant: 'success' })
    } catch (error) {
      console.error('Error deleting FAQ:', error)
      toast({ title: 'Ошибка при удалении вопроса', variant: 'error' })
    } finally {
      setDeletingId(null)
      setConfirmOpen(false)
      setConfirmId(null)
    }
  }

  const handleReorder = async (dragIndex: number, hoverIndex: number) => {
    const items = [...faq]
    const [draggedItem] = items.splice(dragIndex, 1)
    items.splice(hoverIndex, 0, draggedItem)

    // Обновляем порядок
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index + 1,
    }))

    setFaq(updatedItems)

    // Сохраняем в базу
    try {
      for (const item of updatedItems) {
        await supabase
          .from('faq')
          .update({ order: item.order })
          .eq('id', item.id)
      }
    } catch (error) {
      console.error('Error reordering FAQ:', error)
      toast({ title: 'Ошибка при изменении порядка', variant: 'error' })
    }
  }


  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vector-electric-blue"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">FAQ (Частые вопросы)</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Добавить вопрос
        </button>
      </div>

      {/* Форма добавления */}
      {showForm && (
        <div className="card mb-6">
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Вопрос *
              </label>
              <input
                type="text"
                className="input-field"
                value={newItem.question}
                onChange={(e) => setNewItem({ ...newItem, question: e.target.value })}
                placeholder="Введите вопрос..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ответ *
              </label>
              <textarea
                rows={4}
                className="input-field"
                value={newItem.answer}
                onChange={(e) => setNewItem({ ...newItem, answer: e.target.value })}
                placeholder="Введите ответ..."
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={handleAdd}
                className="btn-primary px-4 py-2"
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Список вопросов */}
      <div className="space-y-4">
        {faq.map((item, index) => (
          <div key={item.id} className="card">
            {editingId === item.id ? (
              <div className="p-6 space-y-4">
                <input
                  type="text"
                  className="input-field"
                  value={item.question}
                  onChange={(e) => handleUpdate(item.id, { question: e.target.value })}
                />
                <textarea
                  rows={4}
                  className="input-field"
                  value={item.answer}
                  onChange={(e) => handleUpdate(item.id, { answer: e.target.value })}
                />
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="btn-primary px-4 py-2"
                  >
                    Сохранить
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start">
                      <span className="text-gray-400 mr-3 mt-1">
                        <GripVertical size={20} />
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.question}</h3>
                        <p className="text-gray-600">{item.answer}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setEditingId(item.id)}
                      className="p-1 text-blue-400 hover:text-blue-600"
                      title="Редактировать"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="p-1 text-red-400 hover:text-red-600 disabled:opacity-50"
                      title="Удалить"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {faq.length === 0 && !showForm && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">Вопросов нет</div>
          <p className="text-gray-500 mt-2">Добавьте первый вопрос</p>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Удалить вопрос?"
        description="Вопрос будет удалён без возможности восстановления."
        confirmText="Удалить"
        variant="danger"
        onCancel={() => {
          setConfirmOpen(false)
          setConfirmId(null)
        }}
        onConfirm={deleteNow}
      />
    </div>
  )
}
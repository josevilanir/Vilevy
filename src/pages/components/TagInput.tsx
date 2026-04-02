import { useState, useEffect, KeyboardEvent } from 'react'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import type { Tag } from '@/services/tagService'

interface TagInputProps {
  photoId: number
  currentTags: Tag[]
  allTags: Tag[]
  onAdd: (name: string) => Promise<void>
  onRemove: (tagId: number) => Promise<void>
}

export default function TagInput({ currentTags, allTags, onAdd, onRemove }: TagInputProps) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const suggestions = allTags.filter(
    t => t.name.includes(input.toLowerCase().trim()) &&
         !currentTags.some(ct => ct.id === t.id)
  )

  const handleAdd = async (name: string) => {
    const trimmed = name.trim().toLowerCase()
    if (!trimmed || currentTags.some(t => t.name === trimmed)) return
    setLoading(true)
    try {
      await onAdd(trimmed)
      setInput('')
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd(input)
    }
  }

  return (
    <div className="space-y-2">
      {/* Tags atuais */}
      <div className="flex flex-wrap gap-1 min-h-[28px]">
        {currentTags.map(tag => (
          <Badge key={tag.id} variant="secondary" className="gap-1 pr-1">
            {tag.name}
            <button
              onClick={() => onRemove(tag.id)}
              className="ml-1 hover:text-red-500 transition-colors"
              title="Remover tag"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
        {currentTags.length === 0 && (
          <span className="text-xs text-gray-400">Sem tags ainda</span>
        )}
      </div>

      {/* Input */}
      <input
        className="w-full border rounded px-3 py-1.5 text-sm"
        placeholder="Adicionar tag (Enter para confirmar)"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKey}
        disabled={loading}
      />

      {/* Sugestões */}
      {input.trim() && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {suggestions.slice(0, 8).map(tag => (
            <button
              key={tag.id}
              onClick={() => handleAdd(tag.name)}
              className="text-xs bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-full px-2 py-0.5 transition-colors"
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

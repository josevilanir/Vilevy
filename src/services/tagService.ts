import { apiFetch } from './api'
import type { Tag } from './photoService'

export type { Tag }

export async function fetchAllTags(): Promise<Tag[]> {
  const res = await apiFetch('/tags')
  if (!res.ok) throw new Error('Erro ao buscar tags')
  return res.json()
}

export async function fetchPhotoTags(photoId: number): Promise<Tag[]> {
  const res = await apiFetch(`/photos/${photoId}/tags`)
  if (!res.ok) throw new Error('Erro ao buscar tags da foto')
  return res.json()
}

export async function addTagToPhoto(photoId: number, name: string): Promise<Tag> {
  const res = await apiFetch(`/photos/${photoId}/tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error('Erro ao adicionar tag')
  return res.json()
}

export async function removeTagFromPhoto(photoId: number, tagId: number): Promise<void> {
  const res = await apiFetch(`/photos/${photoId}/tags/${tagId}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Erro ao remover tag')
}

export async function fetchPhotosByTag(tag: string): Promise<import('./photoService').Photo[]> {
  const params = new URLSearchParams({ tag })
  const res = await apiFetch(`/tags/search?${params}`)
  if (!res.ok) throw new Error('Erro ao buscar fotos por tag')
  return res.json()
}

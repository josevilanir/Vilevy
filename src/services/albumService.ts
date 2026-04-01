import type { Photo } from './photoService'
import { apiFetch } from './api'

export interface Album {
  id: number
  name: string
  description: string
  created_at: string
  cover_photo_id?: number | null;
  cover_photo_file_path?: string | null;
}

export interface AlbumPhotoMeta {
  id: number
  name: string
}

export interface PaginatedPhotos {
  photos: Photo[]
  page: number
  totalPages: number
  total: number
}

export async function fetchAlbums(): Promise<Album[]> {
  const res = await apiFetch('/albums')
  if (!res.ok) throw new Error('Erro ao buscar álbuns')
  return res.json()
}

export async function createAlbum(name: string, description: string) {
  const res = await apiFetch('/albums', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description }),
  })
  if (!res.ok) throw new Error('Erro ao criar álbum')
  return res.json() as Promise<Album>
}

export async function deleteAlbum(id: number) {
  const res = await apiFetch(`/albums/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Erro ao deletar álbum')
}

export async function fetchAlbumPhotos(
  albumId: number,
  page = 1,
  limit = 5
): Promise<PaginatedPhotos> {
  const res = await apiFetch(`/albums/${albumId}/photos?page=${page}&limit=${limit}`)
  if (!res.ok) throw new Error('Erro ao buscar fotos do álbum')
  return res.json()
}

export async function addPhotoToAlbum(albumId: number, photoId: number) {
  const res = await apiFetch(`/albums/${albumId}/photos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ photo_id: photoId }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => null)
    throw new Error(err?.error || 'Erro ao adicionar foto ao álbum')
  }
}

export async function fetchAlbum(albumId: number): Promise<Album> {
  const res = await apiFetch(`/albums/${albumId}`)
  if (!res.ok) throw new Error('Erro ao buscar dados do álbum')
  return res.json()
}

export async function setAlbumCover(albumId: number, photoId: number) {
  const res = await apiFetch(`/albums/${albumId}/cover`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ photoId }),
  })
  if (!res.ok) throw new Error('Erro ao definir capa')
  return res.json()
}

import { apiFetch } from './api'

export interface Tag {
  id: number
  name: string
}

export interface Photo {
  id: number
  name: string
  description?: string
  file_path: string
  taken_date?: string
  upload_date?: string
}

export interface PaginatedPhotos {
  photos: Photo[]
  page: number
  totalPages: number
  total: number
}

export async function fetchPhotos(query = '', page = 1, limit = 12): Promise<PaginatedPhotos> {
  const params = new URLSearchParams()
  if (query) params.set('q', query)
  params.set('page', String(page))
  params.set('limit', String(limit))
  const res = await apiFetch(`/photos?${params}`)
  if (!res.ok) throw new Error('Erro ao buscar fotos')
  return res.json()
}

// Retorna todas as fotos sem paginação (para seleção em álbuns, etc.)
export async function fetchAllPhotos(): Promise<Photo[]> {
  const data = await fetchPhotos('', 1, 1000)
  return data.photos
}

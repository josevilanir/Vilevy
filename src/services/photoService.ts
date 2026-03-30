// src/services/photoService.ts
import { API_URL } from '@/config'

export interface Photo {
  id: number
  name: string
  description?: string
  file_path: string
  taken_date?: string
  upload_date?: string
}

export async function fetchPhotos(): Promise<Photo[]> {
  const res = await fetch(`${API_URL}/photos`)
  if (!res.ok) throw new Error('Erro ao buscar fotos')
  return res.json()
}

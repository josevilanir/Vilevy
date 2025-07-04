// src/services/photoService.ts
const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:4000`

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

// src/services/albumService.ts
import type { Photo } from './photoService'
const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:4000`

// representa um álbum completo
export interface Album {
  id: number
  name: string
  description: string
  created_at: string
  cover_photo_id?: number | null;
  cover_photo_file_path?: string | null;
}

// metadados de fotos dentro de um álbum (o que o backend retorna em GET /albums/:id/photos)
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

// busca todos os álbuns
export async function fetchAlbums(): Promise<Album[]> {
  const res = await fetch(`${API_URL}/albums`)
  if (!res.ok) throw new Error('Erro ao buscar álbuns')
  return res.json()
}

// cria um novo álbum
export async function createAlbum(name: string, description: string) {
  const res = await fetch(`${API_URL}/albums`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description }),
  })
  if (!res.ok) throw new Error('Erro ao criar álbum')
  return res.json() as Promise<Album>
}

// deleta um álbum pelo id
export async function deleteAlbum(id: number) {
  const res = await fetch(`${API_URL}/albums/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Erro ao deletar álbum')
}

// busca as fotos de um álbum (metadados)
export async function fetchAlbumPhotos(
  albumId: number,
  page = 1,
  limit = 5
): Promise<PaginatedPhotos> {
  const res = await fetch(
    `${API_URL}/albums/${albumId}/photos?page=${page}&limit=${limit}`
  )
  if (!res.ok) throw new Error('Erro ao buscar fotos do álbum')
  return res.json()
}

// adiciona uma foto a um álbum
export async function addPhotoToAlbum(albumId: number, photoId: number) {
  const res = await fetch(`${API_URL}/albums/${albumId}/photos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // envia photo_id (underscore), que é o que o backend lê
    body: JSON.stringify({ photo_id: photoId }),
  })
  if (!res.ok) {
    // pega mensagem de erro vinda do servidor (opcional)
    const err = await res.json().catch(() => null)
    throw new Error(err?.error || 'Erro ao adicionar foto ao álbum')
  }
}

export async function fetchAlbum(albumId: number): Promise<Album> {
  const res = await fetch(`${API_URL}/albums/${albumId}`)
  if (!res.ok) throw new Error('Erro ao buscar dados do álbum')
  return res.json()
}

export async function setAlbumCover(albumId: number, photoId: number) {
  const res = await fetch(`${API_URL}/albums/${albumId}/cover`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ photoId })
  });
  if (!res.ok) throw new Error('Erro ao definir capa');
  return res.json();
}

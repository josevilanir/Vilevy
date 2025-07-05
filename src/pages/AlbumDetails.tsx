import './styles/albumDetails.css'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'

import { fetchPhotos } from '@/services/photoService'
import {
  fetchAlbum,
  fetchAlbumPhotos,
  type Album,
  type PaginatedPhotos
} from '@/services/albumService'

import AlbumHeader from './components/AlbumHeader'
import AlbumPhotoGrid from './components/AlbumPhotoGrid'
import AlbumPagination from './components/AlbumPagination'

export default function AlbumDetails() {
  const { albumId } = useParams<{ albumId: string }>()
  const [album, setAlbum] = useState<Album | null>(null)
  const [albumData, setAlbumData] = useState<PaginatedPhotos>({
    photos: [],
    page: 1,
    totalPages: 1,
    total: 0,
  })
  const { toast } = useToast()

  const loadPage = async (page: number) => {
    if (!albumId) return
    try {
      const info = await fetchAlbum(+albumId)
      const paged = await fetchAlbumPhotos(+albumId, page, 5)
      setAlbum(info)
      setAlbumData(paged)
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  useEffect(() => {
    loadPage(albumData.page)
  }, [albumData.page, albumId])

  if (!album) return null

  const { photos, page, totalPages } = albumData

  return (
    <div className="album-container mt-12">
      <AlbumHeader name={album.name} />
      <section className="album-section">
        <h2 className="album-section-title">
          Fotos do Álbum (Página {page} de {totalPages})
        </h2>
        <AlbumPhotoGrid photos={photos} />
        <AlbumPagination
          page={page}
          totalPages={totalPages}
          setPage={p => setAlbumData(d => ({ ...d, page: Math.max(1, Math.min(totalPages, p)) }))}
        />
      </section>
    </div>
  )
}

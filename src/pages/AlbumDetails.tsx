// src/pages/AlbumDetails.tsx
import './styles/albumDetails.css'
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Dialog, DialogTrigger, DialogContent, DialogClose } from '@/components/ui/dialog'


import { fetchPhotos, type Photo } from '@/services/photoService'
import {
  fetchAlbum,
  fetchAlbumPhotos,
  type Album,
  type PaginatedPhotos
} from '@/services/albumService'

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

  // carrega a página inicial e sempre que page mudar
  useEffect(() => {
    loadPage(albumData.page)
  }, [albumData.page, albumId])

  if (!album) return null

  const { photos, page, totalPages } = albumData

return (
  <div className="album-container mt-12">
    <Link to="/albums" className="album-back">
      <ArrowLeft /> Voltar aos álbuns
    </Link>

    <h1 className="album-header">
      <span className="emoji">📸🐨</span>
      {album.name}
      <span className="emoji">💜</span>
    </h1>

    <section className="album-section">
      <h2 className="album-section-title">
        Fotos do Álbum (Página {page} de {totalPages})
      </h2>

      <div className="album-photos-shell">
        <div className="album-photos-grid">
          {photos.map(photo => (
            <Dialog key={photo.id}>
              <DialogTrigger asChild>
                <div className="album-card cursor-pointer">
                  <img
                    src={`http://${window.location.hostname}:4000/uploads/${photo.file_path}`}
                    alt={photo.name}
                    className="album-card-img"
                  />
                  <div className="album-card-caption">{photo.name}</div>
                </div>
              </DialogTrigger>
              <DialogContent className="p-0 bg-transparent flex justify-center items-center">
                <DialogClose className="absolute top-4 right-4 text-white text-2xl">×</DialogClose>
                <img
                  src={`http://${window.location.hostname}:4000/uploads/${photo.file_path}`}
                  alt={photo.name}
                  className="max-w-full max-h-[90vh] rounded-lg shadow-xl"
                />
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </div>

      <div className="flex justify-center space-x-4 mt-6">
        <button
          onClick={() => setAlbumData(d => ({ ...d, page: Math.max(1, d.page - 1) }))}
          disabled={page <= 1}
          className="px-4 py-2 rounded bg-purple-200 hover:bg-purple-300 disabled:opacity-50"
        >
          Anterior
        </button>
        <button
          onClick={() => setAlbumData(d => ({ ...d, page: Math.min(d.totalPages, d.page + 1) }))}
          disabled={page >= totalPages}
          className="px-4 py-2 rounded bg-purple-200 hover:bg-purple-300 disabled:opacity-50"
        >
          Próxima
        </button>
      </div>
    </section>
  </div>
  )
}

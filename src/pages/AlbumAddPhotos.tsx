// src/pages/AlbumAddPhotos.tsx
import './styles/albumDetails.css'
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { fetchPhotos, type Photo } from '@/services/photoService'
import {
  fetchAlbumPhotos,
  addPhotoToAlbum,
  type AlbumPhotoMeta
} from '@/services/albumService'

export default function AlbumAddPhotos() {
  const { albumId } = useParams<{ albumId: string }>()
  const [allPhotos, setAllPhotos] = useState<Photo[]>([])
  const [albumMeta, setAlbumMeta] = useState<AlbumPhotoMeta[]>([])
  const { toast } = useToast()

  const load = async () => {
    if (!albumId) return
    try {
      const [photos, meta] = await Promise.all([
        fetchPhotos(),
        fetchAlbumPhotos(+albumId),
      ])
      setAllPhotos(photos)
      setAlbumMeta(meta)
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  useEffect(() => { load() }, [albumId])

  const albumIds = new Set(albumMeta.map((m) => m.id))
  const available = allPhotos.filter((p) => !albumIds.has(p.id))

  const handleAdd = async (photoId: number) => {
    if (!albumId) return
    try {
      await addPhotoToAlbum(+albumId, photoId)
      toast({ title: 'Sucesso', description: 'Foto adicionada!' })
      load()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <div className="album-container">
      <Link to="/albums" className="album-back">
        <ArrowLeft /> Voltar aos álbuns
      </Link>

      <h1 className="album-header">Adicionar fotos ao álbum #{albumId}</h1>

      <section className="album-section">
        <h2 className="album-section-title">Fotos Disponíveis</h2>
        {available.length === 0 ? (
          <p className="album-empty">Não há fotos disponíveis.</p>
        ) : (
          <div className="album-grid">
            {available.map((photo) => (
              <div key={photo.id} className="album-card">
                <img
                  src={`http://${window.location.hostname}:4000/uploads/${photo.file_path}`}
                  alt={photo.name}
                  className="album-card-img"
                />
                <div className="album-card-caption">
                  <p className="text-sm">{photo.name}</p>
                  <Button size="sm" variant="outline" onClick={() => handleAdd(photo.id)}>
                    Adicionar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="mt-6">
        <Button asChild>
          <Link to={`/albums/${albumId}`}>Ver Album (Somente Visualização)</Link>
        </Button>
      </div>
    </div>
  )
}

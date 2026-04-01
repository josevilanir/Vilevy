import './styles/albumDetails.css'
import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft } from 'lucide-react'

import { fetchAllPhotos, type Photo } from '@/services/photoService'
import {
  fetchAlbumPhotos,
  addPhotoToAlbum,
  type PaginatedPhotos
} from '@/services/albumService'
import { useAuth } from '@/contexts/AuthContext'

import BackButton from './components/BackButton'
import AvailablePhotosGrid from './components/AvailablePhotosGrid'

export default function AlbumAddPhotos() {
  const { albumId } = useParams<{ albumId: string }>()
  const [allPhotos, setAllPhotos] = useState<Photo[]>([])
  const [albumPhotos, setAlbumPhotos] = useState<Photo[]>([])
  const { toast } = useToast()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) navigate('/login')
  }, [isAuthenticated])

  const load = async () => {
    if (!albumId) return
    try {
      const [photos, paged] = await Promise.all([
        fetchAllPhotos(),
        fetchAlbumPhotos(+albumId, 1, 1000)
      ])
      setAllPhotos(photos)
      setAlbumPhotos(paged.photos)
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  useEffect(() => { load() }, [albumId])

  const albumIds = new Set(albumPhotos.map(p => p.id))
  const available = allPhotos.filter(p => !albumIds.has(p.id))

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
    <div className="album-container mt-12">
      <Link to="/albums" className="album-back">
        <ArrowLeft /> Voltar aos álbuns
      </Link>

      <h1 className="album-header">
        <span className="emoji">📸🐨</span>
        Adicionar fotos ao álbum #{albumId}
        <span className="emoji">💜</span>
      </h1>

      <section className="album-section">
        <h2 className="album-section-title">Fotos Disponíveis</h2>
        {available.length === 0 ? (
          <p className="album-empty">Não há fotos disponíveis.</p>
        ) : (
          <AvailablePhotosGrid photos={available} onAdd={handleAdd} />
        )}
      </section>

      <div className="mt-6">
        <Button asChild>
          <Link to={`/albums/${albumId}`}>Ver Álbum (Somente Visualização)</Link>
        </Button>
      </div>
    </div>
  )
}

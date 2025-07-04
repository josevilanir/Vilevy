// src/pages/AlbumDetails.tsx
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

import { fetchPhotos, type Photo } from '@/services/photoService'
import {
  fetchAlbumPhotos,
  addPhotoToAlbum,
  type AlbumPhotoMeta
} from '@/services/albumService'

export default function AlbumDetails() {
  const { albumId } = useParams<{ albumId: string }>()
  const [allPhotos, setAllPhotos] = useState<Photo[]>([])
  const [albumMeta, setAlbumMeta] = useState<AlbumPhotoMeta[]>([])
  const { toast } = useToast()

  // carrega todas as fotos e os metadados do álbum
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

  useEffect(() => {
    load()
  }, [albumId])

  // monta conjuntos de IDs para filtrar
  const albumIds = new Set(albumMeta.map((p) => p.id))
  const available = allPhotos.filter((p) => !albumIds.has(p.id))
  const albumPhotos = allPhotos.filter((p) => albumIds.has(p.id))

  // associa foto ao álbum
  const handleAdd = async (photoId: number) => {
    if (!albumId) return
    try {
      await addPhotoToAlbum(+albumId, photoId)
      toast({ title: 'Sucesso', description: 'Foto adicionada ao álbum!' })
      load()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <div className="p-4 space-y-8">
      <Button asChild variant="link">
        <Link to="/albums">
          <ArrowLeft className="inline mr-1" /> Voltar aos álbuns
        </Link>
      </Button>

      <h1 className="text-2xl font-bold">Álbum #{albumId}</h1>

      {/* Fotos disponíveis para adicionar */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Adicionar fotos</h2>
        {available.length === 0 ? (
          <p className="text-zinc-600">Não há fotos disponíveis.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {available.map((photo) => (
              <Card key={photo.id} className="p-2">
                <img
                  src={`http://${window.location.hostname}:4000/uploads/${photo.file_path}`}
                  alt={photo.name}
                  className="w-full h-40 object-cover rounded"
                />
                <div className="mt-2 flex justify-between items-center">
                  <p className="text-sm">{photo.name}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAdd(photo.id)}
                  >
                    Adicionar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Fotos já no álbum */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Fotos do álbum</h2>
        {albumPhotos.length === 0 ? (
          <p className="text-zinc-600">Nenhuma foto associada ainda.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {albumPhotos.map((photo) => (
              <Card key={photo.id} className="p-2">
                <img
                  src={`http://${window.location.hostname}:4000/uploads/${photo.file_path}`}
                  alt={photo.name}
                  className="w-full h-40 object-cover rounded"
                />
                <p className="mt-2 text-sm">{photo.name}</p>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
)
}

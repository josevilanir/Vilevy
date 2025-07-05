// src/pages/AlbumDetails.tsx
import './styles/albumDetails.css'
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Dialog, DialogTrigger, DialogContent, DialogClose } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

import { fetchPhotos, type Photo } from '@/services/photoService'
import {
  fetchAlbum,
  fetchAlbumPhotos,
  type Album,
  type AlbumPhotoMeta
} from '@/services/albumService'

export default function AlbumDetails() {
  const { albumId } = useParams<{ albumId: string }>()
  const [album, setAlbum] = useState<Album | null>(null)
  const [allPhotos, setAllPhotos] = useState<Photo[]>([])
  const [albumMeta, setAlbumMeta] = useState<AlbumPhotoMeta[]>([])
  const { toast } = useToast()

  // Carrega dados do álbum e fotos
  const load = async () => {
    if (!albumId) return
    try {
      const [info, photos, meta] = await Promise.all([
        fetchAlbum(+albumId),
        fetchPhotos(),
        fetchAlbumPhotos(+albumId),
      ])
      setAlbum(info)
      setAllPhotos(photos)
      setAlbumMeta(meta)
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  useEffect(() => { load() }, [albumId])
  if (!album) return null

  // Filtra apenas fotos associadas
  const ids = new Set(albumMeta.map(m => m.id))
  const albumPhotos = allPhotos.filter(p => ids.has(p.id))

  // Divide em duas linhas (3 + 2) para efeito de álbum físico
  const firstRow = albumPhotos.slice(0, 3)
  const secondRow = albumPhotos.slice(3, 5)

  return (
    <div className="album-container">
      <Link to="/albums" className="album-back">
        <ArrowLeft /> Voltar aos álbuns
      </Link>

      <h1 className="album-header">
        <span className="emoji">📸🐨</span>
        {album.name}
        <span className="emoji">💜</span>
      </h1>

      <section className="album-section">
        <h2 className="album-section-title">Fotos do Álbum</h2>

        {albumPhotos.length === 0 ? (
          <p className="album-empty">Nenhuma foto associada ainda.</p>
        ) : (
          <div className="album-photos-shell">
            <div className="grid grid-cols-3 gap-8 justify-items-center">
              {firstRow.map(photo => (
                <Dialog key={photo.id}>
                  <DialogTrigger asChild>
                    <div className="album-card">
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
                      className="max-w-full max-h-[90vh] rounded-lg"
                    />
                  </DialogContent>
                </Dialog>
              ))}
            </div>
            {secondRow.length > 0 && (
              <div className="grid grid-cols-5 gap-8 mt-6 justify-items-center">
                <div className="col-start-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="album-card">
                        <img
                          src={`http://${window.location.hostname}:4000/uploads/${secondRow[0].file_path}`}
                          alt={secondRow[0].name}
                          className="album-card-img"
                        />
                        <div className="album-card-caption">{secondRow[0].name}</div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="p-0 bg-transparent flex justify-center items-center">
                      <DialogClose className="absolute top-4 right-4 text-white text-2xl">×</DialogClose>
                      <img
                        src={`http://${window.location.hostname}:4000/uploads/${secondRow[0].file_path}`}
                        alt={secondRow[0].name}
                        className="max-w-full max-h-[90vh] rounded-lg"
                      />
                    </DialogContent>
                  </Dialog>
                </div>
                {secondRow[1] && (
                  <div className="col-start-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <div className="album-card">
                          <img
                            src={`http://${window.location.hostname}:4000/uploads/${secondRow[1].file_path}`}
                            alt={secondRow[1].name}
                            className="album-card-img"
                          />
                          <div className="album-card-caption">{secondRow[1].name}</div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="p-0 bg-transparent flex justify-center items-center">
                        <DialogClose className="absolute top-4 right-4 text-white text-2xl">×</DialogClose>
                        <img
                          src={`http://${window.location.hostname}:4000/uploads/${secondRow[1].file_path}`}
                          alt={secondRow[1].name}
                          className="max-w-full max-h-[90vh] rounded-lg"
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}

import './styles/albumDetails.css'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import { setAlbumCover } from '@/services/albumService'
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Star, ArrowUpCircle } from "lucide-react"; // Ou qualquer ícone de sua preferência
import { fetchAlbum, fetchAlbumPhotos, type Album, type PaginatedPhotos } from '@/services/albumService'
import AlbumHeader from './components/AlbumHeader'
import AlbumPagination from './components/AlbumPagination'
import { Button } from '@/components/ui/button'
import { API_URL } from '@/config'

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
  const [isSettingCover, setIsSettingCover] = useState<number | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<null | typeof photos[0]>(null);

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
    // eslint-disable-next-line
  }, [albumData.page, albumId])

  const handleSetCover = async (photoId: number) => {
    if (!albumId) return
    setIsSettingCover(photoId)
    try {
      await setAlbumCover(+albumId, photoId)
      toast({ title: 'Sucesso', description: 'Capa do álbum atualizada!' })
      loadPage(albumData.page)
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setIsSettingCover(null)
    }
  }

  if (!album) return null

  const { photos, page, totalPages } = albumData

  return (
    <div className="album-container mt-12">
      <AlbumHeader name={album.name} />

      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent
          className="p-0 bg-purple-50 flex flex-col items-center max-w-md rounded-2xl border-4 border-purple-200"
          style={{ boxShadow: "0 0 24px #e9d5ff" }}
        >
          {selectedPhoto && (
            <>
              <img
                src={`${API_URL}/uploads/${selectedPhoto.file_path}`}
                alt={selectedPhoto.name}
                className="rounded-xl border-4 border-purple-200 mb-2"
                style={{ maxWidth: 420, maxHeight: 420, background: "#f5ecff" }}
              />
              <div className="w-full text-center text-lg font-bold text-purple-800 mb-1">{selectedPhoto.name}</div>
              {selectedPhoto.description && (
                <div className="w-full text-center text-purple-500 text-base mb-2">{selectedPhoto.description}</div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <section className="album-section">
        <h2 className="album-section-title">
          Fotos do Álbum (Página {page} de {totalPages})
        </h2>
        <div className="album-photos-grid">
          {photos.length === 0 ? (
            <p className="album-empty">Nenhuma foto associada ainda.</p>
          ) : (
            photos.map(photo => (
              <div
                key={photo.id}
                className={`album-photo-card ${album.cover_photo_id === photo.id ? 'album-photo-cover' : ''}`}
                style={{
                border: album.cover_photo_id === photo.id
                  ? '3px solid #b794f4'
                  : '1.5px dashed #e2e8f0',
                cursor: 'pointer'
              }}
              onClick={() => setSelectedPhoto(photo)}
            >
              <img
              src={`${API_URL}/uploads/${photo.file_path}`}
              alt={photo.name}
              className="album-photo-img"
              style={{ objectFit: "cover", width: "100%", height: 200 }}
            />
            <div className="album-photo-caption flex items-center">
              <span>{photo.name}</span>
              {album.cover_photo_id === photo.id && (
                <Star className="ml-2 text-yellow-400" fill="#facc15" size={20} />
              )}
            </div>
            <div className="flex justify-end mt-2">
            <Button
              size="icon"
              variant={album.cover_photo_id === photo.id ? "secondary" : "outline"}
              disabled={album.cover_photo_id === photo.id || isSettingCover === photo.id}
              onClick={e => {
                e.stopPropagation();
                handleSetCover(photo.id);
              }}
              className="ml-1"
              title="Definir como capa"
            >
              {album.cover_photo_id === photo.id
                ? <Star size={18} className="text-yellow-400" fill="#facc15" />
                : <ArrowUpCircle size={18} className="text-purple-500" />}
              </Button>
            </div>
          </div>
        ))
          )}
        </div>
        <AlbumPagination
          page={page}
          totalPages={totalPages}
          setPage={p => setAlbumData(d => ({ ...d, page: Math.max(1, Math.min(totalPages, p)) }))}
        />
      </section>
    </div>
  )
}

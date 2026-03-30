import './styles/albumDetails.css'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from "framer-motion";
import { useToast } from '@/hooks/use-toast'
import { useState, useRef } from "react";
import { setAlbumCover } from '@/services/albumService'
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Star, ArrowUpCircle } from "lucide-react"; // Ou qualquer ícone de sua preferência
import { fetchAlbum, fetchAlbumPhotos, type Album, type PaginatedPhotos } from '@/services/albumService'
import AlbumHeader from './components/AlbumHeader'
import AlbumPagination from './components/AlbumPagination'
import { Button } from '@/components/ui/button'
import { API_URL, STORAGE_URL } from '@/config'
import PhotoDialog from "./components/photoDialog";

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
  const [hoveredPhoto, setHoveredPhoto] = useState(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [photoDialogIdx, setPhotoDialogIdx] = useState<number | null>(null);
  const previewRef = useRef(null);
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

  const handleRemovePhoto = async (photoId: number) => {
  if (!confirm("Tem certeza que deseja remover esta foto do álbum?")) return;
  try {
    await fetch(`${API_URL}/albums/${album.id}/photos/${photoId}`, {
      method: "DELETE"
    });
    // Remove a foto do array do estado (para sumir da tela sem F5)
    setAlbumData((data) => ({
      ...data,
      photos: data.photos.filter((p: any) => p.id !== photoId)
    }));
  } catch (err) {
    alert("Erro ao remover a foto do álbum.");
  }
};

  const handleMouseMove = e => {
    setMouse({ x: e.clientX, y: e.clientY });
  };

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
              src={`${STORAGE_URL}/${selectedPhoto.file_path}`}
              alt={selectedPhoto.name}
              className="rounded-xl border-4 border-purple-200 mb-2"
              style={{ maxWidth: 420, maxHeight: 420, background: "#f5ecff" }}
            />
            <div className="w-full text-center text-lg font-bold text-purple-800 mb-1">
              {selectedPhoto.name}
            </div>
            {selectedPhoto.description && (
              <div className="w-full flex items-center justify-center gap-2 text-purple-500 text-base mb-2">
                <span role="img" aria-label="álbum">📸</span>
                <span className="text-center">{selectedPhoto.description}</span>
                <span role="img" aria-label="álbum">📸</span>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>

    <section className="album-section">
      <h2 className="album-section-title">
        Fotos do Álbum (Página {page} de {totalPages})
      </h2>
      <div
        className="
          grid grid-cols-1 
          sm:grid-cols-2 
          md:grid-cols-3 
          lg:grid-cols-4 
          gap-5 album-photos-grid"
      >
        {photos.length === 0 ? (
          <p className="album-empty">Nenhuma foto associada ainda.</p>
        ) : (
          photos.map((photo, idx) => (
            <motion.div
              key={photo.id}
              className={`
                album-photo-card flex flex-col overflow-hidden rounded-2xl
                ${album.cover_photo_id === photo.id ? 'album-photo-cover' : ''}
                h-80 bg-white shadow
              `}
              style={{
                border: album.cover_photo_id === photo.id
                  ? '3px solid #b794f4'
                  : '1.5px dashed #e2e8f0',
                cursor: 'pointer',
                background: "#f8f7fc",
                boxShadow: "0 2px 12px #e9d5ff44"
              }}
              whileHover={{
                scale: 1.045,
                boxShadow: "0 8px 36px #a78bfa77",
                zIndex: 4
              }}
              transition={{ type: "spring", stiffness: 420, damping: 22 }}
              onClick={() => setPhotoDialogIdx(idx)} 
            >
              {/* Área da imagem: ocupa metade do card e nunca deforma */}
              <div className="w-full h-1/2 flex items-center justify-center bg-purple-50 overflow-hidden">
                <img
                  src={`${STORAGE_URL}/${photo.file_path}`}
                  alt={photo.name}
                  className="w-full h-full object-cover"
                  style={{ aspectRatio: '4/5', maxHeight: "100%" }}
                />
              </div>
              {/* Área do título/descritivo */}
              <div className="album-photo-caption flex flex-col items-center justify-center w-full mt-2 px-2 flex-1">
                <div className="flex items-center gap-2 justify-center w-full">
                  <span role="img" aria-label="coala">🐨</span>
                  <span className="truncate">{photo.name}</span>
                  <span role="img" aria-label="coala">🐨</span>
                  {album.cover_photo_id === photo.id && (
                    <Star className="ml-2 text-yellow-400" fill="#facc15" size={20} />
                  )}
                </div>
                {photo.description && (
                  <span className="text-xs text-purple-500 mt-1 text-center w-full line-clamp-2">{photo.description}</span>
                )}
              </div>
              <div className="flex justify-end gap-1 mt-2 px-2 pb-2">
                {/* Botão de definir capa */}
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

                {/* Botão de remover/desassociar */}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={e => {
                    e.stopPropagation();
                    handleRemovePhoto(photo.id);
                  }}
                  title="Remover do álbum"
                  className="ml-1"
              >
                  <span role="img" aria-label="Remover do álbum">❌</span>
                </Button>
              </div>
          </motion.div>
        ))
        )}
      </div>
      <AlbumPagination
        page={page}
        totalPages={totalPages}
        setPage={p => setAlbumData(d => ({ ...d, page: Math.max(1, Math.min(totalPages, p)) }))}
      />
    </section>

    {photoDialogIdx !== null && (
      <PhotoDialog
        photos={photos}
        selectedIndex={photoDialogIdx}
        onClose={() => setPhotoDialogIdx(null)}
      />
    )}
  </div>
)
}

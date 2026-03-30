import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'

import AlbumMainHeader from './components/AlbumMainHeader'
import PhotoUploader from './components/PhotoUploader'
import PhotoGrid from './components/PhotoGrid'
import Lightbox from './components/Lightbox'
import PhotoEditModal from './components/PhotoEditModal'

import { API_URL, STORAGE_URL } from '@/config'

type Photo = {
  id: number
  name: string
  file_path: string
  upload_date?: string
  description?: string
}

type Comment = { id: number; content: string }

export default function Index() {
  // Dados principais
  const [photos, setPhotos] = useState<Photo[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')

  // Upload
  const [uploadingFiles, setUploadingFiles] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Busca
  const [search, setSearch] = useState('')

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  // Edição
  const [editOpen, setEditOpen] = useState(false)
  const [editPhoto, setEditPhoto] = useState<Photo | null>(null)

  const { toast } = useToast()

  // -----------------------------
  // Fotos
  // -----------------------------
  const fetchPhotos = async (query = '') => {
    try {
      const res = await fetch(`${API_URL}/photos${query ? `?q=${encodeURIComponent(query)}` : ''}`)
      if (!res.ok) throw new Error('Erro ao buscar fotos')
      setPhotos(await res.json())
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  useEffect(() => { fetchPhotos('') }, [])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearch(value)
    fetchPhotos(value)
  }

  // -----------------------------
  // Upload
  // -----------------------------
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const mapped = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      customName: '',
      customDescription: '',
      customDate: '',
      isUploading: false,
      progress: 0,
    }))

    setUploadingFiles(prev => [...prev, ...mapped])
    e.target.value = ''
  }

  const startUpload = async (fileObj: any) => {
    const formData = new FormData()
    formData.append('photo', fileObj.file)
    if (fileObj.customName) formData.append('name', fileObj.customName)
    if (fileObj.customDescription) formData.append('description', fileObj.customDescription)
    if (fileObj.customDate) formData.append('taken_date', fileObj.customDate)

    setUploadingFiles(prev => prev.map(f => (f === fileObj ? { ...f, isUploading: true } : f)))

    try {
      const res = await fetch(`${API_URL}/photos`, { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Erro ao fazer upload')
      toast({ title: 'Sucesso', description: 'Foto enviada!' })
      setUploadingFiles(prev => prev.filter(f => f.file !== fileObj.file))
      fetchPhotos()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
      setUploadingFiles(prev => prev.map(f => (f === fileObj ? { ...f, isUploading: false } : f)))
    }
  }

  // -----------------------------
  // Exclusão de foto
  // -----------------------------
  const deletePhoto = async (photoId: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta foto?')) return
    try {
      const res = await fetch(`${API_URL}/photos/${photoId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erro ao excluir foto')
      toast({ title: 'Sucesso', description: 'Foto excluída!' })
      fetchPhotos()
      if (lightboxOpen) {
        const idx = photos.findIndex(p => p.id === photoId)
        if (idx === lightboxIndex) setLightboxOpen(false)
      }
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  // -----------------------------
  // Comentários
  // -----------------------------
  const currentPhotoId = photos[lightboxIndex]?.id

  const fetchComments = async (photoId: number) => {
    try {
      const res = await fetch(`${API_URL}/photos/${photoId}/comments`)
      if (!res.ok) throw new Error('Erro ao buscar comentários')
      setComments(await res.json())
    } catch {
      setComments([])
    }
  }

  const addComment = async () => {
    if (!currentPhotoId || !newComment.trim()) return
    try {
      const res = await fetch(`${API_URL}/photos/${currentPhotoId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      })
      if (!res.ok) throw new Error('Erro ao comentar')
      setNewComment('')
      fetchComments(currentPhotoId)
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const deleteComment = async (commentId: number) => {
    if (!currentPhotoId) return
    try {
      const res = await fetch(`${API_URL}/photos/${currentPhotoId}/comments/${commentId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erro ao excluir comentário')
      fetchComments(currentPhotoId)
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  // -----------------------------
  // Lightbox
  // -----------------------------
  const openLightboxFor = (photo: Photo) => {
    const idx = photos.findIndex(p => p.id === photo.id)
    const nextIndex = idx >= 0 ? idx : 0
    setLightboxIndex(nextIndex)
    setLightboxOpen(true)
    fetchComments(photos[nextIndex].id)
  }

  const goNext = () => {
    setLightboxIndex(prev => {
      const next = (prev + 1) % photos.length
      fetchComments(photos[next].id)
      return next
    })
  }

  const goPrev = () => {
    setLightboxIndex(prev => {
      const next = (prev - 1 + photos.length) % photos.length
      fetchComments(photos[next].id)
      return next
    })
  }

  // -----------------------------
  // Editar (título/descrição) & Download
  // -----------------------------
  const onEditPhoto = (p: Photo) => {
    setEditPhoto(p)
    setEditOpen(true)
  }

  const onEditSave = async (values: { name: string; description: string }) => {
    if (!editPhoto) return
    try {
      const res = await fetch(`${API_URL}/photos/${editPhoto.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error('Erro ao salvar alterações')
      toast({ title: 'Sucesso', description: 'Foto atualizada!' })
      setEditOpen(false)
      setEditPhoto(null)
      await fetchPhotos(search)
      if (lightboxOpen) {
        // Atualizar comentários/estado se ainda estiver no mesmo índice
        fetchComments(photos[lightboxIndex]?.id)
      }
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const onDownloadPhoto = (p: Photo) => {
    const url = `${STORAGE_URL}/${p.file_path}`
    window.open(url, '_blank')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-violet-100 p-4 overflow-auto">
      <AlbumMainHeader />

      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold">Fotos</h1>
        <Button asChild variant="outline">
          <Link to="/albums">Álbuns</Link>
        </Button>
      </div>

      {/* Barra de busca */}
      <div className="max-w-6xl mx-auto mb-6">
        <input
          type="text"
          placeholder="Buscar fotos por nome ou descrição..."
          value={search}
          onChange={handleSearch}
          className="border p-2 rounded w-full"
        />
      </div>

      {/* Uploader */}
      <PhotoUploader
        uploadingFiles={uploadingFiles}
        setUploadingFiles={setUploadingFiles}
        startUpload={startUpload}
        handleFileInput={handleFileInput}
        fileInputRef={fileInputRef}
      />

      {/* Grid */}
      {photos.length > 0 ? (
        <PhotoGrid
          photos={photos}
          onPhotoClick={openLightboxFor}
          onDeletePhoto={deletePhoto}
          onEditPhoto={onEditPhoto}
          onDownloadPhoto={onDownloadPhoto}
        />
      ) : (
        <div className="text-center text-gray-500 mt-16">
          <p className="mb-4 text-xl">Nenhuma foto encontrada 😔</p>
          <img
            src="/koala-animated.gif"
            alt="koala triste"
            className="mx-auto w-36 h-36 opacity-70"
          />
        </div>
      )}

      {/* Lightbox fofinho */}
      <Lightbox
        photos={photos}
        index={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNext={goNext}
        onPrev={goPrev}
        onDelete={(idx) => deletePhoto(photos[idx].id)}
        // comentários
        comments={comments}
        newComment={newComment}
        setNewComment={setNewComment}
        onAddComment={addComment}
        onDeleteComment={deleteComment}
        // opcional: também dá pra passar onEdit/onDownload aqui se quiser no header direito
        // onEdit={(idx) => onEditPhoto(photos[idx])}
        // onDownload={(idx) => onDownloadPhoto(photos[idx])}
      />

      {/* Modal de edição */}
      <PhotoEditModal
        open={editOpen}
        photo={editPhoto}
        onClose={() => { setEditOpen(false); setEditPhoto(null) }}
        onSave={onEditSave}
      />
    </div>
  )
}

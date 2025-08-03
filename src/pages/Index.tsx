import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'

import AlbumMainHeader from './components/AlbumMainHeader'
import PhotoUploader from './components/PhotoUploader'
import PhotoGrid from './components/PhotoGrid'
import PhotoModal from './components/PhotoModal'

const API_URL = import.meta.env.VITE_API_URL

export default function Index() {
  const [photos, setPhotos] = useState<any[]>([])
  const [selectedImage, setSelectedImage] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [uploadingFiles, setUploadingFiles] = useState<any[]>([])
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [search, setSearch] = useState('');

  // BUSCA FOTOS
  const fetchPhotos = async (query = '') => {
    try {
      const res = await fetch(`${API_URL}/photos${query ? `?q=${encodeURIComponent(query)}` : ''}`)
      if (!res.ok) throw new Error('Erro ao buscar fotos')
      const data = await res.json()
      setPhotos(data)
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    fetchPhotos(value);
  };

  useEffect(() => { fetchPhotos('') }, [])

  // UPLOAD HANDLER
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const mapped = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      customName: '',
      customDescription: '',
      customDate: '',
      isUploading: false,
      progress: 0
    }))
    setUploadingFiles(prev => [...prev, ...mapped])
    e.target.value = ''
  }

  // INICIA UPLOAD DE UM ARQUIVO
  const startUpload = async (fileObj: any) => {
    const formData = new FormData()
    formData.append('photo', fileObj.file)
    if (fileObj.customName) formData.append('name', fileObj.customName)
    if (fileObj.customDescription) formData.append('description', fileObj.customDescription)
    if (fileObj.customDate) formData.append('taken_date', fileObj.customDate)

    setUploadingFiles(prev =>
      prev.map(f => f === fileObj ? { ...f, isUploading: true } : f)
    )

    try {
      const res = await fetch(`${API_URL}/photos`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error('Erro ao fazer upload')
      toast({ title: 'Sucesso', description: 'Foto enviada!' })
      setUploadingFiles(prev => prev.filter(f => f.file !== fileObj.file))
      fetchPhotos()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
      setUploadingFiles(prev =>
        prev.map(f => f === fileObj ? { ...f, isUploading: false } : f)
      )
    }
  }

  // EXCLUI FOTO
  const deletePhoto = async (photoId: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta foto?')) return
    try {
      const res = await fetch(`${API_URL}/photos/${photoId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erro ao excluir foto')
      toast({ title: 'Sucesso', description: 'Foto excluída!' })
      fetchPhotos()
      setSelectedImage(null)
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  // COMENTÁRIOS
  const fetchComments = async (photoId: number) => {
    try {
      const res = await fetch(`${API_URL}/photos/${photoId}/comments`)
      if (!res.ok) throw new Error('Erro ao buscar comentários')
      setComments(await res.json())
    } catch (err: any) {
      setComments([])
    }
  }

  const addComment = async () => {
    if (!selectedImage || !newComment.trim()) return
    try {
      const res = await fetch(`${API_URL}/photos/${selectedImage.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment })
      })
      if (!res.ok) throw new Error('Erro ao comentar')
      setNewComment('')
      fetchComments(selectedImage.id)
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const deleteComment = async (commentId: number) => {
    if (!selectedImage) return
    try {
      const res = await fetch(`${API_URL}/photos/${selectedImage.id}/comments/${commentId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erro ao excluir comentário')
      fetchComments(selectedImage.id)
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-violet-100 p-4 overflow-auto">
      <AlbumMainHeader />
  
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
  
      <PhotoUploader
        uploadingFiles={uploadingFiles}
        setUploadingFiles={setUploadingFiles}
        startUpload={startUpload}
        handleFileInput={handleFileInput}
      />
  
      {photos.length > 0 ? (
        <PhotoGrid
          photos={photos}
          onPhotoClick={(photo: any) => {
            setSelectedImage(photo)
            fetchComments(photo.id)
          }}
        />
      ) : (
        <div className="text-center text-gray-500 mt-16">
          <p className="mb-4 text-xl">Nenhuma foto encontrada 😔</p>
          <img src="/koala-animated.gif" alt="koala triste" className="mx-auto w-36 h-36 opacity-70" />
        </div>
      )}
  
      <PhotoModal
        open={!!selectedImage}
        photo={selectedImage}
        comments={comments}
        newComment={newComment}
        setNewComment={setNewComment}
        onClose={() => setSelectedImage(null)}
        onAddComment={addComment}
        onDeleteComment={deleteComment}
        onDeletePhoto={deletePhoto}
      />
    </div>
  )
}

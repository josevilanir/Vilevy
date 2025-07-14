import { Dialog, DialogTrigger, DialogContent, DialogClose } from '@/components/ui/dialog'

interface Photo {
  id: number
  name: string
  file_path: string
}

export default function AlbumPhotoGrid({ photos }: { photos: Photo[] }) {
  return (
    <div className="album-photos-shell">
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
    {photos.map(photo => (
      <Dialog key={photo.id}>
        <DialogTrigger asChild>
          <div className="bg-white rounded-2xl shadow-md overflow-hidden h-80 w-full cursor-pointer transition hover:shadow-xl flex flex-col">
            {/* Área da imagem */}
            <div className="w-full h-48 flex items-center justify-center bg-gray-100 overflow-hidden">
              <img
                src={`${import.meta.env.VITE_API_URL}/uploads/${photo.file_path}`}
                alt={photo.name}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Área do título */}
            <div className="px-4 py-2 border-t text-center text-sm font-medium text-purple-900 bg-purple-50 truncate">
              {photo.name}
            </div>
          </div>
        </DialogTrigger>
        <DialogContent className="p-0 bg-transparent flex justify-center items-center">
          <DialogClose className="absolute top-4 right-4 text-white text-2xl">×</DialogClose>
          <img
            src={`${import.meta.env.VITE_API_URL}/uploads/${photo.file_path}`}
            alt={photo.name}
            className="max-w-full max-h-[90vh] rounded-lg shadow-xl"
          />
        </DialogContent>
      </Dialog>
    ))}
  </div>
</div>
  )
}

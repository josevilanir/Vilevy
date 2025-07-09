import { Dialog, DialogTrigger, DialogContent, DialogClose } from '@/components/ui/dialog'

interface Photo {
  id: number
  name: string
  file_path: string
}

export default function AlbumPhotoGrid({ photos }: { photos: Photo[] }) {
  return (
    <div className="album-photos-shell">
      <div className="album-photos-grid">
        {photos.map(photo => (
          <Dialog key={photo.id}>
            <DialogTrigger asChild>
              <div className="album-card cursor-pointer">
                <img
                  src={`${import.meta.env.VITE_API_URL}/uploads/${photo.file_path}`}
                  alt={photo.name}
                  className="album-card-img"
                />
                <div className="album-card-caption">{photo.name}</div>
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

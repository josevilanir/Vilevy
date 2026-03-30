import PhotoCard from './PhotoCard'

type Photo = {
  id: number
  file_path: string
  name: string
  description?: string
}

export default function PhotoGrid({
  photos,
  onPhotoClick,
  onDeletePhoto,
  onEditPhoto,      // opcional
  onDownloadPhoto,  // opcional
}: {
  photos: Photo[]
  onPhotoClick: (photo: Photo) => void
  onDeletePhoto: (id: number) => void
  onEditPhoto?: (photo: Photo) => void
  onDownloadPhoto?: (photo: Photo) => void
}) {

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {photos.map((photo, i) => (
        <PhotoCard
          key={photo.id ?? `${photo.file_path}-${i}`}
          photo={photo}
          onClick={() => onPhotoClick(photo)}
          onDelete={() => onDeletePhoto(photo.id)}
          onEdit={onEditPhoto ? () => onEditPhoto(photo) : undefined}
          onDownload={onDownloadPhoto ? () => onDownloadPhoto(photo) : undefined}
        />
      ))}
    </div>
  )
}

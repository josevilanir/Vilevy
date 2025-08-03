import PhotoCard from './PhotoCard'

export default function PhotoGrid({
  photos,
  onPhotoClick
}: any) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {photos.map((photo: any) => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          onClick={() => onPhotoClick(photo)}
        />
      ))}
    </div>
  )
}

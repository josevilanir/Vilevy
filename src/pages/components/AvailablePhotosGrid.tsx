import PhotoAddCard from "./PhotoAddCard";

export default function AvailablePhotosGrid({
  photos,
  onAdd
}: {
  photos: any[];
  onAdd: (id: number) => void;
}) {
  return (
    <div className="album-photos-grid">
      {photos.map((photo) => (
        <PhotoAddCard key={photo.id} photo={photo} onAdd={onAdd} />
      ))}
    </div>
  );
}

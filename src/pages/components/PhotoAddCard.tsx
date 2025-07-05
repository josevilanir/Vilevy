import { Button } from "@/components/ui/button";

export default function PhotoAddCard({
  photo,
  onAdd
}: {
  photo: any;
  onAdd: (id: number) => void;
}) {
  return (
    <div className="album-card">
      <img
        src={`http://${window.location.hostname}:4000/uploads/${photo.file_path}`}
        alt={photo.name}
        className="album-card-img"
      />
      <div className="album-card-caption">
        <p className="text-sm">{photo.name}</p>
        <Button size="sm" variant="outline" onClick={() => onAdd(photo.id)}>
          Adicionar
        </Button>
      </div>
    </div>
  );
}

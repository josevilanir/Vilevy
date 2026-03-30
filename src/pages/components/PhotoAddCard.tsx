import { Button } from "@/components/ui/button";
import { STORAGE_URL } from '@/config';

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
        src={`${STORAGE_URL}/${photo.file_path}`}
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

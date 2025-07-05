import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

export default function AlbumCard({
  album,
  onDelete
}: {
  album: any;
  onDelete: (id: number) => void;
}) {
  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold">{album.name}</h2>
      <p className="text-sm text-zinc-600 mb-2">{album.description}</p>
      <div className="flex justify-between">
        <Button variant="outline" asChild size="sm">
          <Link to={`/albums/${album.id}`}>Ver Álbum</Link>
        </Button>
        <Button variant="secondary" asChild size="sm">
          <Link to={`/albums/${album.id}/add`}>Adicionar Fotos</Link>
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(album.id)}
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </Card>
  );
}

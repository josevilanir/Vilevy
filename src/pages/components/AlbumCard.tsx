import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL

export default function AlbumCard({
  album,
  onDelete
}: {
  album: any;
  onDelete: (id: number) => void;
}) {
  return (
    <Card className="album-card p-4 flex flex-col items-center" style={{ width: 'fit-content', minWidth: 220, maxWidth: 380 }}>
        {/* Thumbnail/capa */}
        {album.cover_photo_file_path ? (
            <img
            src={`${API_URL}/uploads/${album.cover_photo_file_path}`}
            alt={`Capa do álbum ${album.name}`}
            className="rounded-xl border-4 border-purple-200 mb-2"
            style={{
                background: "#f5ecff",
                maxWidth: 320,
                maxHeight: 220,
                objectFit: "contain",
                display: "block"
            }}
            />
        ) : (
            <div className="flex items-center justify-center bg-purple-100 rounded-xl mb-2 text-5xl"
                style={{ width: 220, height: 180 }}>📸</div>
        )}

        <h2 className="text-lg font-semibold text-center text-purple-900">{album.name}</h2>
        <p className="text-sm text-purple-500 mb-2 text-center">{album.description}</p>
        <div className="flex justify-between w-full mt-auto gap-2">
            <Button variant="outline" asChild size="sm" className="flex-1">
            <Link to={`/albums/${album.id}`}>Ver Álbum</Link>
            </Button>
            <Button variant="secondary" asChild size="sm" className="flex-1">
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

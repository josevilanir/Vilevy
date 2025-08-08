import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface PhotoCardProps {
  photo: {
    id: number;
    file_path: string;
    name: string;
    description?: string;
  };
  API_URL: string;
  onClick: () => void;
  onDelete?: () => void;
}

export default function PhotoCard({ photo, API_URL, onClick, onDelete }: PhotoCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <Card
      className="
        relative overflow-hidden rounded-xl
        bg-white dark:bg-gray-900
        border-4 border-pink-200 hover:border-purple-300
        shadow-md hover:shadow-xl transition-all duration-300
        cursor-pointer
      "
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Imagem */}
      <div className="aspect-square w-full h-full flex items-center justify-center overflow-hidden" onClick={onClick}>
        <img
          src={`${API_URL}/uploads/${photo.file_path}`}
          alt={photo.name}
          className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Botão de deletar — só aparece no hover */}
      {hovered && onDelete && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 z-10"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}

      {/* Nome da foto */}
      <div className="p-2" onClick={onClick}>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
          {photo.name}
        </h3>
        {photo.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {photo.description}
          </p>
        )}
      </div>
    </Card>
  );
}

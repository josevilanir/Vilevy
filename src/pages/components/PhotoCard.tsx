import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function PhotoCard({
  photo,
  onClick,
  onDelete,
}: {
  photo: any;
  onClick: () => void;
  onDelete: () => void;
}) {
  const API_URL = import.meta.env.VITE_API_URL;
  const [hovered, setHovered] = useState(false);

  return (
    <Card
      className="relative bg-white border-4 border-pink-200 overflow-hidden hover:border-purple-300 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="aspect-square overflow-hidden relative">
        <img
          src={`${API_URL}/uploads/${photo.file_path}`}
          alt={photo.name}
          className="w-full h-full object-cover cursor-pointer transition-transform duration-500 hover:scale-105"
          onClick={onClick}
        />

        {hovered && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded-full shadow transition-opacity duration-200"
          >
            Delete 🗑️
          </Button>
        )}
      </div>

      <div className="p-4">
        <h4 className="font-bold text-gray-800 mb-2 truncate">
          {photo.name}
        </h4>
        <p className="text-sm text-gray-600 mb-2">📅 {photo.upload_date}</p>
        {photo.description && (
          <p className="text-sm text-gray-700 mb-3 bg-purple-50 p-2 rounded border-2 border-purple-200">
            🌿 {photo.description}
          </p>
        )}
      </div>
    </Card>
  );
}

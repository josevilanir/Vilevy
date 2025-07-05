import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PhotoCard({
  photo,
  onClick,
  onDelete
}: {
  photo: any,
  onClick: () => void,
  onDelete: () => void
}) {
  const API_URL = `http://${window.location.hostname}:4000`;
  return (
    <Card className="bg-white border-4 border-pink-200 overflow-hidden hover:border-purple-300 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl">
      <div className="aspect-square overflow-hidden">
        <img
          src={`${API_URL}/uploads/${photo.file_path}`}
          alt={photo.name}
          className="w-full h-full object-cover cursor-pointer transition-transform duration-500 hover:scale-105"
          onClick={onClick}
        />
      </div>
      <div className="p-4">
        <h4 className="font-bold text-gray-800 mb-2 truncate">{photo.name}</h4>
        <p className="text-sm text-gray-600 mb-2">📅 {photo.upload_date}</p>
        {photo.description && (
          <p className="text-sm text-gray-700 mb-3 bg-purple-50 p-2 rounded border-2 border-purple-200">
            🌿 {photo.description}
          </p>
        )}
        <Button
          onClick={onDelete}
          className="w-full bg-red-500 hover:bg-red-600 text-white rounded-full mt-2 transition-colors duration-300"
        >
          Delete 🗑️
        </Button>
      </div>
    </Card>
  )
}

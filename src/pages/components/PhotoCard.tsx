import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical, Trash2, Edit, Download } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function PhotoCard({
  photo,
  onClick,
  onDelete,
  onEdit,
  onDownload,
  delay = 0,
}: {
  photo: any;
  onClick: () => void;
  onDelete: () => void;
  onEdit?: () => void;
  onDownload?: () => void;
  delay?: number; // para animar em cascata
}) {
  const API_URL = import.meta.env.VITE_API_URL;
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut", delay }}
    >
      <Card
        className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Imagem */}
        <div className="aspect-square overflow-hidden relative cursor-pointer">
          <img
            src={`${API_URL}/uploads/${photo.file_path}`}
            alt={photo.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            onClick={onClick}
          />

          {/* Menu de ações (hover) */}
          {hovered && (
            <div className="absolute top-2 right-2 flex flex-col gap-2 bg-white/90 dark:bg-gray-800/90 p-2 rounded-lg shadow-lg">
              <Button
                size="icon"
                variant="ghost"
                className="hover:bg-red-100 dark:hover:bg-red-900"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                title="Excluir"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>

              {onEdit && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  title="Editar"
                >
                  <Edit className="w-4 h-4 text-blue-500" />
                </Button>
              )}

              {onDownload && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload();
                  }}
                  title="Baixar"
                >
                  <Download className="w-4 h-4 text-green-500" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
              {photo.name}
            </h4>
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            📅 {photo.upload_date}
          </p>

          {photo.description && (
            <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded-md border border-gray-200 dark:border-gray-700 mt-2">
              🌿 {photo.description}
            </p>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

import { useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Trash2, Download, Edit } from "lucide-react";

export interface LightboxProps {
  photos: any[];
  index: number;               // índice da foto aberta
  open: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onDelete?: (idx: number) => void;
  onEdit?: (idx: number) => void;
  onDownload?: (idx: number) => void;
}

export default function Lightbox({
  photos,
  index,
  open,
  onClose,
  onNext,
  onPrev,
  onDelete,
  onEdit,
  onDownload,
}: LightboxProps) {
  const API_URL = import.meta.env.VITE_API_URL;
  const photo = photos[index];

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    },
    [onClose, onNext, onPrev]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, handleKey]);

  if (!photo) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[95vw] w-[95vw] h-[92vh] p-0 bg-black/95 border-none text-white">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="text-sm opacity-80 truncate">{photo.name}</div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                onClick={() => onEdit(index)}
                title="Editar"
                className="text-white hover:bg-white/10"
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
            {onDownload && (
              <Button
                variant="ghost"
                onClick={() => onDownload(index)}
                title="Baixar"
                className="text-white hover:bg-white/10"
              >
                <Download className="w-4 h-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                onClick={() => onDelete(index)}
                title="Excluir"
                className="text-red-400 hover:bg-white/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" onClick={onClose} title="Fechar" className="text-white hover:bg-white/10">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Main image + nav */}
        <div className="relative w-full h-[calc(92vh-48px)] flex items-center justify-center select-none">
          <button
            className="absolute left-2 md:left-4 p-2 rounded-full hover:bg-white/10"
            onClick={onPrev}
            title="Anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <img
            src={`${API_URL}/uploads/${photo.file_path}`}
            alt={photo.name}
            className="max-h-full max-w-full object-contain"
            draggable={false}
          />

          <button
            className="absolute right-2 md:right-4 p-2 rounded-full hover:bg-white/10"
            onClick={onNext}
            title="Próxima"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Footer info */}
        <div className="px-4 pb-4 text-xs opacity-70">
          📅 {photo.upload_date}
          {photo.description ? <> • 🌿 {photo.description}</> : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useEffect, useState } from "react";

import { STORAGE_URL } from '@/config'

export default function PhotoDialog({
  photos,
  selectedIndex,
  onClose,
}: {
  photos: any[];
  selectedIndex: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(selectedIndex);

  useEffect(() => {
    setIdx(selectedIndex);
  }, [selectedIndex]);

  const photo = photos[idx];
  if (!photo) return null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent
        className="p-0 bg-purple-50 flex flex-col items-center max-w-md rounded-2xl border-4 border-purple-200"
        style={{ boxShadow: "0 0 24px #e9d5ff" }}
      >
        {/* Fechar */}
        <div className="w-full flex justify-end pr-2 pt-2">
          <button
            className="text-purple-500 hover:text-purple-800 text-2xl"
            onClick={onClose}
            aria-label="Fechar"
            tabIndex={0}
          >
            <X />
          </button>
        </div>

        {/* Setas laterais + Imagem */}
        <div className="flex w-full items-center justify-center" style={{ minHeight: 220, minWidth: 220 }}>
          <button
            className="text-purple-500 hover:text-purple-800 disabled:opacity-40 text-3xl mr-3"
            onClick={e => { e.stopPropagation(); setIdx(idx - 1); }}
            disabled={idx === 0}
            aria-label="Anterior"
            tabIndex={0}
            style={{ height: 48 }}
          >
            <ArrowLeft />
          </button>

          <img
            src={`${STORAGE_URL}/${photo.file_path}`}
            alt={photo.name}
            className="rounded-xl border-4 border-purple-200 mx-1"
            style={{ maxWidth: 420, maxHeight: 420, background: "#f5ecff" }}
          />

          <button
            className="text-purple-500 hover:text-purple-800 disabled:opacity-40 text-3xl ml-3"
            onClick={e => { e.stopPropagation(); setIdx(idx + 1); }}
            disabled={idx === photos.length - 1}
            aria-label="Próxima"
            tabIndex={0}
            style={{ height: 48 }}
          >
            <ArrowRight />
          </button>
        </div>

        {/* Nome e descrição */}
        <div className="w-full text-center text-lg font-bold text-purple-800 mb-1">{photo.name}</div>
        {photo.description && (
          <div className="w-full flex items-center justify-center gap-2 text-purple-500 text-base mb-2">
            <span role="img" aria-label="álbum">📸</span>
            <span className="text-center">{photo.description}</span>
            <span role="img" aria-label="álbum">📸</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Trash2, Download, Edit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Photo { id: number; file_path: string; name: string; upload_date?: string; description?: string; }

export interface LightboxProps {
  photos: Photo[];
  index: number;
  open: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  // ações
  onDelete?: (idx: number) => void;
  onEdit?: (idx: number) => void;
  onDownload?: (idx: number) => void;
  // comentários (novo)
  comments?: { id: number; content: string }[];
  newComment?: string;
  setNewComment?: (v: string) => void;
  onAddComment?: () => void;
  onDeleteComment?: (commentId: number) => void;
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
  comments = [],
  newComment = "",
  setNewComment,
  onAddComment,
  onDeleteComment,
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
      <DialogContent
        className="
          max-w-[96vw] w-[96vw] md:w-[88vw] lg:w-[80vw]
          max-h-[94vh] p-0 border-none bg-transparent
        "
      >
        {/* Overlay com degradê suave */}
        <div className="relative w-full h-full">
          {/* Painel central fofinho */}
          <AnimatePresence mode="wait">
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="
                mx-auto bg-gradient-to-br from-purple-50 via-pink-50 to-violet-50
                dark:from-gray-900 dark:via-gray-900 dark:to-gray-900
                rounded-2xl shadow-xl border-2 border-purple-200/60
                overflow-hidden grid grid-cols-1 lg:grid-cols-2
                max-h-[90vh]
              "
            >
              {/* Coluna da imagem */}
              <div className="relative flex items-center justify-center bg-white dark:bg-gray-950">
                <button
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-white shadow"
                  onClick={onPrev} title="Anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <img
                  src={`${API_URL}/uploads/${photo.file_path}`}
                  alt={photo.name}
                  className="max-h-[90vh] lg:max-h-[88vh] w-auto object-contain"
                  draggable={false}
                />

                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-white shadow"
                  onClick={onNext} title="Próxima"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Fechar + ações no topo direito */}
                <div className="absolute right-2 top-2 flex items-center gap-1">
                  {onDownload && (
                    <Button variant="ghost" size="icon" onClick={() => onDownload(index)} title="Baixar"
                      className="bg-white/70 hover:bg-white text-gray-700 dark:bg-gray-800/70 dark:text-gray-200">
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                  {onEdit && (
                    <Button variant="ghost" size="icon" onClick={() => onEdit(index)} title="Editar"
                      className="bg-white/70 hover:bg-white text-blue-600 dark:bg-gray-800/70">
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button variant="ghost" size="icon" onClick={() => onDelete(index)} title="Excluir"
                      className="bg-white/70 hover:bg-white text-red-600 dark:bg-gray-800/70">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={onClose} title="Fechar"
                    className="bg-white/70 hover:bg-white text-gray-700 dark:bg-gray-800/70">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Coluna de detalhes (“o 2º print”) */}
              <div className="flex flex-col max-h-[90vh]">
                <div className="p-4 md:p-6 overflow-auto space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {photo.name}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      📅 {photo.upload_date || "--/--/----"}
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Description 🌿</h3>
                    <div className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-2 border-purple-200/60 dark:border-gray-700 rounded-lg p-3">
                      {photo.description || "Sem descrição."}
                    </div>
                  </div>

                  {/* Comments */}
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Comments 💬</h3>
                    <div className="space-y-2">
                      {comments?.length ? comments.map((c) => (
                        <div key={c.id}
                          className="flex items-start justify-between gap-3 bg-white dark:bg-gray-800 border rounded-lg p-2">
                          <p className="text-sm text-gray-800 dark:text-gray-200">{c.content}</p>
                          {onDeleteComment && (
                            <Button variant="ghost" size="icon" onClick={() => onDeleteComment(c.id)}
                              className="text-red-600 hover:bg-red-50 dark:hover:bg-gray-700">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      )) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Sem comentários…</p>
                      )}
                    </div>

                    {/* Novo comentário */}
                    {setNewComment && onAddComment && (
                      <div className="mt-3">
                        <textarea
                          placeholder="Write a comment…"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="w-full min-h-[70px] rounded-lg border-2 border-purple-200/60 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-sm"
                        />
                        <Button className="mt-2 w-full bg-purple-500 hover:bg-purple-600 text-white rounded-full"
                          onClick={onAddComment}>
                          Add Comment
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

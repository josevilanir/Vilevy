// src/pages/components/Lightbox.tsx
import { useEffect, useCallback } from "react";
import { STORAGE_URL } from "@/config";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Download, Edit } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Photo {
  id: number;
  file_path: string;
  name: string;
  upload_date?: string;
  description?: string;
}

export interface LightboxProps {
  photos: Photo[];
  index: number;
  open: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onEdit?: (idx: number) => void;
  onDownload?: (idx: number) => void;
  onDelete?: (idx: number) => void;
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
  onEdit,
  onDownload,
  comments = [],
  newComment = "",
  setNewComment,
  onAddComment,
  onDeleteComment,
}: LightboxProps) {
  const photo = photos[index];

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowRight") onNext();
    if (e.key === "ArrowLeft") onPrev();
  }, [onClose, onNext, onPrev]);

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
          /* mobile/tablet responsivo */
          w-[98vw] sm:w-[96vw] md:w-[94vw]
          /* desktop conforme métricas combinadas */
          lg:w-[2000px] xl:w-[1000px] 2xl:w-[1400px]
          /* remove max-width padrão do shadcn em telas grandes */
          sm:max-w-[96vw] lg:max-w-none
          /* altura */
          lg:h-[94vh] max-h-[100svh]
          p-0 border-none bg-transparent
        "
      >
        <div className="relative w-full h-[100svh] lg:h-auto overflow-y-auto lg:overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="
                mx-auto rounded-2xl shadow-xl border-2
                bg-gradient-to-br from-purple-50 via-pink-50 to-violet-50
                dark:from-gray-900 dark:via-gray-900 dark:to-gray-900
                border-purple-200/60 overflow-hidden
                grid grid-cols-1 lg:grid-cols-2
                lg:[grid-template-columns:64%_36%]
                lg:max-h-[90vh]
              "
            >
              {/* Coluna da imagem — centralizada, sem zoom forçado */}
              <div className="relative flex items-center justify-center bg-transparent min-h-[60vh] lg:min-h-[84vh]">
                {/* Anterior */}
                <button
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full
                             bg-white/80 dark:bg-gray-900/80 shadow-md hover:bg-white transition"
                  onClick={onPrev}
                  title="Anterior"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-900 dark:text-gray-100" />
                </button>

                <img
                  src={`${STORAGE_URL}/${photo.file_path}`}
                  alt={photo.name}
                  className="
                    object-contain
                    w-auto h-auto
                    max-w-full
                    max-h-[70svh] lg:max-h-[90vh]
                  "
                  draggable={false}
                />

                {/* Próxima */}
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full
                             bg-white/80 dark:bg-gray-900/80 shadow-md hover:bg-white transition"
                  onClick={onNext}
                  title="Próxima"
                >
                  <ChevronRight className="w-6 h-6 text-gray-900 dark:text-gray-100" />
                </button>
              </div>

              {/* Coluna de detalhes */}
              <div className="flex flex-col">
                {/* Header direita — único botão de fechar */}
                <div className="flex items-center justify-between px-4 sm:px-6 pt-4">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {photo.name}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      📅 {photo.upload_date || '--/--/----'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {onDownload && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDownload(index)}
                        title="Baixar"
                        className="text-gray-700 hover:bg-white/60 dark:text-gray-200 dark:hover:bg-gray-800/60"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(index)}
                        title="Editar"
                        className="text-blue-600 hover:bg-white/60 dark:text-blue-400 dark:hover:bg-gray-800/60"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onClose}
                      title="Fechar"
                      className="text-gray-700 hover:bg-white/60 dark:text-gray-200 dark:hover:bg-gray-800/60"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Conteúdo rolável */}
                <div className="p-4 sm:p-6 space-y-4">
                  {/* Description */}
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Description 🌿</h3>
                    <div className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-2 border-purple-200/60 dark:border-gray-700 rounded-lg p-3">
                      {photo.description || 'Sem descrição.'}
                    </div>
                  </div>

                  {/* Comments */}
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Comments 💬</h3>
                    <div className="space-y-2">
                      {comments?.length ? (
                        comments.map((c) => (
                          <div key={c.id} className="flex items-start justify-between gap-3 bg-white dark:bg-gray-800 border rounded-lg p-2">
                            <p className="text-sm text-gray-800 dark:text-gray-200">{c.content}</p>
                            {onDeleteComment && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onDeleteComment(c.id)}
                                className="text-red-600 hover:bg-red-50 dark:hover:bg-gray-700"
                              >
                                ✖
                              </Button>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Sem comentários…</p>
                      )}
                    </div>

                    {setNewComment && onAddComment && (
                      <div className="mt-3">
                        <textarea
                          placeholder="Write a comment…"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="w-full min-h-[100px] rounded-lg border-2 border-purple-200/60 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-sm"
                        />
                        <Button className="mt-2 w-full bg-purple-500 hover:bg-purple-600 text-white rounded-full" onClick={onAddComment}>
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

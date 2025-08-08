import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Photo = {
  id: number;
  name: string;
  description?: string;
}

export default function PhotoEditModal({
  open,
  photo,
  onClose,
  onSave,
}: {
  open: boolean;
  photo: Photo | null;
  onClose: () => void;
  onSave: (values: { name: string; description: string }) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (photo) {
      setName(photo.name || "");
      setDescription(photo.description || "");
    }
  }, [photo]);

  const submit = () => {
    onSave({ name: name.trim(), description: description.trim() });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md w-full">
        <h2 className="text-lg font-semibold mb-2">Editar foto</h2>

        <label className="text-sm text-gray-600 mb-1">Título</label>
        <input
          className="w-full border rounded px-3 py-2 mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Título da foto"
        />

        <label className="text-sm text-gray-600 mb-1">Descrição</label>
        <textarea
          className="w-full border rounded px-3 py-2 min-h-[100px]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição da foto"
        />

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={submit}>Salvar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

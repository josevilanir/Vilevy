import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AlbumCreateModalProps {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  name: string;
  setName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  onCreate: () => void;
}

export default function AlbumCreateModal({
  open,
  onOpenChange,
  name,
  setName,
  description,
  setDescription,
  onCreate,
}: AlbumCreateModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white rounded-xl p-8 w-full max-w-md border-4 border-purple-100 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold text-purple-700">Criar novo álbum</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onCreate();
          }}
        >
          <input
            className="w-full border rounded-lg px-4 py-2 mb-4 text-lg"
            placeholder="Nome do álbum"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
          <textarea
            className="w-full border rounded-lg px-4 py-2 mb-4"
            placeholder="Descrição (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button variant="default" type="submit">
              Criar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

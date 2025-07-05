import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AlbumForm({
  name,
  description,
  setName,
  setDescription,
  handleCreate
}: {
  name: string;
  description: string;
  setName: (val: string) => void;
  setDescription: (val: string) => void;
  handleCreate: () => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-6">
      <Input
        placeholder="Nome do álbum"
        value={name}
        onChange={e => setName(e.currentTarget.value)}
      />
      <Textarea
        placeholder="Descrição (opcional)"
        value={description}
        onChange={e => setDescription(e.currentTarget.value)}
      />
      <Button onClick={handleCreate} className="whitespace-nowrap">
        Criar e Adicionar Fotos
      </Button>
    </div>
  );
}

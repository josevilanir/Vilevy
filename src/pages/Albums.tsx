import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { fetchAlbums, createAlbum, deleteAlbum, type Album } from "@/services/albumService";

import BackButton from "./components/BackButton";
import AlbumForm from "./components/AlbumForm";
import AlbumCard from "./components/AlbumCard";

export default function Albums() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const load = async () => {
    try {
      const data = await fetchAlbums();
      setAlbums(data);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    try {
      const alb = await createAlbum(name, description);
      setAlbums([alb, ...albums]);
      setName("");
      setDescription("");
      toast({ title: "Sucesso", description: "Álbum criado!" });
      navigate(`/albums/${alb.id}/add`);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Deletar este álbum?")) return;
    try {
      await deleteAlbum(id);
      setAlbums(albums.filter((a) => a.id !== id));
      toast({ title: "Sucesso", description: "Álbum deletado." });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="p-4">
      <BackButton />

      <h1 className="text-2xl font-bold mb-4">Álbuns</h1>

      <AlbumForm
        name={name}
        description={description}
        setName={setName}
        setDescription={setDescription}
        handleCreate={handleCreate}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {albums.map((album) => (
          <AlbumCard key={album.id} album={album} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}

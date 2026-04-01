import './styles/album.css';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { fetchAlbums, createAlbum, deleteAlbum, type Album } from "@/services/albumService";
import AlbumCreateModal from "./components/AlbumCreateModal";
import { useAuth } from "@/contexts/AuthContext";

import BackButton from "./components/BackButton";
import AlbumCard from "./components/AlbumCard";

export default function Albums() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [showAlbumForm, setShowAlbumForm] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

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
      setShowAlbumForm(false);
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
    <div className="albums-container min-h-screen py-8">
      <BackButton />

      <h1 className="albums-title">
        <span role="img" aria-label="álbum">📚</span>
        Álbuns
        <span role="img" aria-label="câmera">📸</span>
      </h1>

      {isAuthenticated && (
        <div className="mb-8 flex justify-center">
          <button
            className="font-bold text-lg px-5 py-2 mb-6 flex items-center gap-2 bg-purple-600 text-white rounded-xl hover:bg-purple-800 transition"
            onClick={() => setShowAlbumForm(true)}
          >
            <span className="text-2xl mr-2">➕</span>
            Novo Álbum
          </button>
        </div>
      )}

      <AlbumCreateModal
        open={showAlbumForm}
        onOpenChange={setShowAlbumForm}
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
        onCreate={handleCreate}
      />

      <div className="albums-grid">
        {albums.map((album) => (
          <AlbumCard
            key={album.id}
            album={album}
            onDelete={isAuthenticated ? handleDelete : undefined}
          />
        ))}
      </div>
    </div>
  );
}

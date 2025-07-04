// src/pages/Albums.tsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  fetchAlbums,
  createAlbum,
  deleteAlbum,
  type Album
} from '@/services/albumService'

export default function Albums() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const { toast } = useToast()

  const load = async () => {
    try {
      const data = await fetchAlbums()
      setAlbums(data)
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    try {
      const alb = await createAlbum(name, description)
      setAlbums([alb, ...albums])
      setName('')
      setDescription('')
      toast({ title: 'Sucesso', description: 'Álbum criado!' })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Deletar este álbum?')) return
    try {
      await deleteAlbum(id)
      setAlbums(albums.filter(a => a.id !== id))
      toast({ title: 'Sucesso', description: 'Álbum deletado.' })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Álbuns</h1>

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
          Criar
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {albums.map(album => (
          <Card key={album.id} className="p-4">
            <h2 className="text-lg font-semibold">{album.name}</h2>
            <p className="text-sm text-zinc-600 mb-2">{album.description}</p>
            <p className="text-xs text-zinc-500 mb-4">
              Criado em: {new Date(album.created_at).toLocaleDateString()}
            </p>
            <div className="flex justify-between">
              <Button variant="outline" asChild size="sm">
                <Link to={`/albums/${album.id}`}>Ver Fotos</Link>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(album.id)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
)
}

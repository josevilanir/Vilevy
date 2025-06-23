import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Heart, Image as ImageIcon } from 'lucide-react';

interface Photo {
  id: number;
  file_path: string;
  description: string;
  name: string;
  upload_date: string;
}

const API_URL = 'http://192.168.0.6:4000';

const Index = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [newDescription, setNewDescription] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function loadPhotos() {
      try {
        const res = await fetch(`${API_URL}/photos`);
        const data = await res.json();
        setPhotos(data);
      } catch (err) {
        toast({ title: 'Error loading photos', description: (err as Error).message });
      }
    }
    loadPhotos();
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    files.forEach(async (file) => {
      if (file.type.startsWith('image/')) {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('description', '');

        try {
          const res = await fetch(`${API_URL}/photos`, {
            method: 'POST',
            body: formData,
          });

          const newPhoto = await res.json();
          setPhotos(prev => [newPhoto, ...prev]);
          toast({ title: 'Photo uploaded! 🐨', description: 'Your precious memory has been saved!' });
        } catch (err) {
          toast({ title: 'Upload failed!', description: (err as Error).message });
        }
      }
    });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const updateDescription = async () => {
    if (selectedPhoto) {
      try {
        await fetch(`${API_URL}/photos/${selectedPhoto.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ description: newDescription }),
        });
        setPhotos(prev => prev.map(photo => photo.id === selectedPhoto.id ? { ...photo, description: newDescription } : photo));
        setSelectedPhoto(null);
        setNewDescription('');
        toast({ title: 'Description saved! 🌿', description: 'Your memory now has a story!' });
      } catch (err) {
        toast({ title: 'Error updating description', description: (err as Error).message });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-violet-100 p-4">
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-white rounded-lg shadow-lg border-4 border-purple-200 p-6 relative overflow-hidden">
          <div className="absolute top-2 right-2">
            <div className="relative">
              <div className="w-10 h-12 bg-gray-400 rounded-sm pixel-art"></div>
              <div className="absolute -top-2 left-1 w-3 h-3 bg-gray-400 rounded-full pixel-art"></div>
              <div className="absolute -top-2 right-1 w-3 h-3 bg-gray-400 rounded-full pixel-art"></div>
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-black rounded-sm"></div>
              <div className="absolute top-1 left-2 w-1 h-1 bg-black rounded-sm"></div>
              <div className="absolute top-1 right-2 w-1 h-1 bg-black rounded-sm"></div>
            </div>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <Heart className="text-purple-500 w-8 h-8" />
            <h1 className="text-4xl font-bold text-purple-600 font-mono">
              🐨💜 Our Koala Photo Album 💜🐨
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            A cute eucalyptus-scented place to store all your precious memories together! 🐨🌿
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <Card className={`mb-8 border-4 transition-all duration-300 ${
          dragActive ? 'border-purple-400 bg-purple-50' : 'border-violet-200 bg-white'
        }`}>
          <div
            className="p-12 text-center cursor-pointer"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <ImageIcon className="mx-auto w-16 h-16 text-violet-400 mb-4" />
            <h3 className="text-2xl font-bold text-violet-600 mb-2">
              Drop your photos here! 📸
            </h3>
            <p className="text-gray-600 mb-6">
              Drag and drop your cute photos or click to browse
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
              id="photo-upload"
            />
            <label htmlFor="photo-upload">
              <Button className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-full cursor-pointer">
                Choose Photos 🌿
              </Button>
            </label>
          </div>
        </Card>

        {photos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo) => (
              <Card key={photo.id} className="bg-white border-4 border-pink-200 overflow-hidden hover:border-purple-300 transition-all duration-300 hover:scale-105">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={`${API_URL}/uploads/${photo.file_path}`}
                    alt={photo.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-gray-800 mb-2 truncate">{photo.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">📅 {photo.upload_date}</p>
                  {photo.description && (
                    <p className="text-sm text-gray-700 mb-3 bg-purple-50 p-2 rounded border-2 border-purple-200">
                      🌿 {photo.description}
                    </p>
                  )}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full bg-violet-400 hover:bg-violet-500 text-white rounded-full"
                        onClick={() => {
                          setSelectedPhoto(photo);
                          setNewDescription(photo.description);
                        }}
                      >
                        {photo.description ? 'Edit Story 📝' : 'Add Story 🌿'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white border-4 border-purple-200">
                      <DialogHeader>
                        <DialogTitle className="text-purple-600 text-xl">
                          Tell the story of this memory! 🐨
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="aspect-video overflow-hidden rounded-lg border-2 border-gray-200">
                          <img
                            src={`${API_URL}/uploads/${photo.file_path}`}
                            alt={photo.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Textarea
                          placeholder="What makes this photo special? 🐨💜"
                          value={newDescription}
                          onChange={(e) => setNewDescription(e.target.value)}
                          className="border-2 border-violet-200 focus:border-purple-400"
                          rows={4}
                        />
                        <Button
                          onClick={updateDescription}
                          className="w-full bg-purple-500 hover:bg-purple-600 text-white rounded-full py-3"
                        >
                          Save Story 🐨💜
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </Card>
            ))}
          </div>
        )}

        {photos.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🐨</div>
            <h3 className="text-2xl font-bold text-gray-600 mb-2">
              No photos yet!
            </h3>
            <p className="text-gray-500">
              Upload your first cute photo to get started! 📸🌿
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;

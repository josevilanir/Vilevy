
import { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Heart, Image as ImageIcon, Trash2, UploadCloud } from 'lucide-react';

interface Photo {
  id: number;
  file_path: string;
  description: string;
  name: string;
  taken_date: string;
  upload_date: string;
}

interface Comment {
  id: number;
  photo_id: number;
  content: string;
  created_at: string;
}

interface UploadingFile {
  file: File;
  preview: string;
  progress: number;
  customName: string;
  customDate: string;
  customDescription: string;
  isUploading: boolean;
}

const API_URL = `http://${window.location.hostname}:4000`;

const Index = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedImage, setSelectedImage] = useState<Photo | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPhotos = async () => {
    try {
      const res = await fetch(`${API_URL}/photos`);
      const data = await res.json();
      setPhotos(data);
    } catch (err) {
      toast({ title: 'Error loading photos', description: (err as Error).message });
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchComments = async (photoId: number) => {
    try {
      const res = await fetch(`${API_URL}/photos/${photoId}/comments`);
      const data = await res.json();
      setComments(data);
    } catch (err) {
      toast({ title: 'Error loading comments', description: (err as Error).message });
    }
  };

  const addComment = async () => {
    if (!selectedImage || !newComment.trim()) return;
    try {
      await fetch(`${API_URL}/photos/${selectedImage.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      });
      setNewComment('');
      fetchComments(selectedImage.id);
      toast({ title: 'Comment added! 💬' });
    } catch (err) {
      toast({ title: 'Error adding comment', description: (err as Error).message });
    }
  };

  const deleteComment = async (commentId: number) => {
    if (!selectedImage) return;
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      await fetch(`${API_URL}/photos/${selectedImage.id}/comments/${commentId}`, {
        method: 'DELETE'
      });
      fetchComments(selectedImage.id);
      toast({ title: 'Comment deleted!' });
    } catch (err) {
      toast({ title: 'Error deleting comment', description: (err as Error).message });
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      prepareFilesForUpload(files);
    }
  };

  const prepareFilesForUpload = (files: File[]) => {
    const uploading = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      customName: '',
      customDate: '',
      customDescription: '',
      isUploading: false
    }));
    setUploadingFiles(prev => [...prev, ...uploading]);
  };

  const startUpload = async (uploadingFile: UploadingFile) => {
    if (!uploadingFile.customName || !uploadingFile.customDate) {
      toast({ title: 'Please fill in name, date and description before uploading!' });
      return;
    }

    setUploadingFiles(prev => prev.map(f =>
      f.file === uploadingFile.file ? { ...f, isUploading: true } : f
    ));

    const formData = new FormData();
    formData.append('image', uploadingFile.file);
    formData.append('description', uploadingFile.customDescription);
    formData.append('name', uploadingFile.customName);
    formData.append('date', uploadingFile.customDate);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_URL}/photos`);

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setUploadingFiles(prev => prev.map(f =>
            f.file === uploadingFile.file ? { ...f, progress: percent } : f
          ));
        }
      });

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          fetchPhotos();
          setUploadingFiles(prev => prev.filter(f => f.file !== uploadingFile.file));
          toast({ title: 'Upload complete! 🐨' });
        } else {
          throw new Error("Upload failed");
        }
      };

      xhr.onerror = () => {
        toast({ title: 'Upload failed!', description: 'Network error.' });
      };

      xhr.send(formData);
    } catch (err) {
      toast({ title: 'Upload failed!', description: (err as Error).message });
    }
  };

  const deletePhoto = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar esta foto?")) {
      try {
        await fetch(`${API_URL}/photos/${id}`, { method: 'DELETE' });
        await fetchPhotos();
        toast({ title: 'Foto deletada com sucesso 🗑️' });
      } catch (err) {
        toast({ title: 'Erro ao deletar', description: (err as Error).message });
      }
    }
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-violet-100 p-4 overflow-auto">
      <div className="max-w-6xl mx-auto mb-6 sm:mb-8">
        <div className="bg-white rounded-lg shadow-lg border-4 border-purple-200 p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-4">
            <Heart className="text-purple-500 w-6 h-6 sm:w-8 sm:h-8" />
            <h1 className="text-2xl sm:text-4xl font-bold text-purple-600 font-mono">
              🐨💜 Our Koala Photo Album 💜🐨
            </h1>
          </div>
          <p className="text-gray-600 text-base sm:text-lg">
            A cute eucalyptus-scented place to store all your precious memories together! 🐨🌿
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mb-8 sm:mb-10">
        <div className="border-4 border-dashed border-purple-300 rounded-lg p-4 sm:p-8 bg-white shadow-lg text-center">
          <input
            type="file"
            multiple
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileInput}
          />
          <Button className="bg-purple-500 text-white mb-4" onClick={() => fileInputRef.current?.click()}>
            <UploadCloud className="w-5 h-5 mr-2" /> Upload Photos
          </Button>

          {uploadingFiles.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {uploadingFiles.map(file => (
                <div key={file.preview} className="border p-4 rounded bg-purple-50">
                  <img src={file.preview} alt="preview" className="w-full rounded-lg mb-4 max-h-[60vh] object-contain mx-auto" />
                  <input
                    type="text"
                    placeholder="Photo Name"
                    value={file.customName}
                    onChange={(e) => setUploadingFiles(prev => prev.map(f =>
                      f.file === file.file ? { ...f, customName: e.target.value } : f
                    ))}
                    className="w-full mb-2 border rounded p-2"
                  />
                  <input
                    type="date"
                    value={file.customDate}
                    onChange={(e) => setUploadingFiles(prev => prev.map(f =>
                      f.file === file.file ? { ...f, customDate: e.target.value } : f
                    ))}
                    className="w-full mb-2 border rounded p-2"
                  />
                  <Textarea
                    placeholder="Description"
                    value={file.customDescription}
                    onChange={(e) => setUploadingFiles(prev => prev.map(f =>
                      f.file === file.file ? { ...f, customDescription: e.target.value } : f
                    ))}
                    className="w-full mb-2"
                  />
                  <Button className="w-full" disabled={file.isUploading} onClick={() => startUpload(file)}>
                    {file.isUploading ? `Uploading ${file.progress}%` : 'Start Upload'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {photos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {photos.map((photo) => (
              <Card key={photo.id} className="bg-white border-4 border-pink-200 overflow-hidden hover:border-purple-300 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={`${API_URL}/uploads/${photo.file_path}`}
                    alt={photo.name}
                    className="w-full h-full object-cover cursor-pointer transition-transform duration-500 hover:scale-105"
                    onClick={() => {
                      setSelectedImage(photo);
                      fetchComments(photo.id);
                    }}
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
                  <Button
                    onClick={() => deletePhoto(photo.id)}
                    className="w-full bg-red-500 hover:bg-red-600 text-white rounded-full mt-2 transition-colors duration-300"
                  >
                    Delete 🗑️
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-4xl sm:text-6xl mb-4">🐨</div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-600 mb-2">
              No photos yet!
            </h3>
            <p className="text-gray-500">
              Upload your first cute photo to get started! 📸🌿
            </p>
          </div>
        )}

        <Dialog open={selectedImage !== null} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent   
            className="
              bg-purple-50 border-4 border-purple-300
              w-full h-full
              sm:w-auto sm:h-auto
              max-w-full sm:max-w-[95vw]
              max-h-full sm:max-h-[95vh]
              overflow-auto p-4
            "
          >
            {selectedImage && (
              <div className="relative">
                <div className="max-w-4xl mx-auto">
                  <img
                    src={`${API_URL}/uploads/${selectedImage.file_path}`}
                    alt={selectedImage.name}
                    className="w-full max-h-[60vh] object-contain rounded-lg mb-4"
                  />
                  <img
                    src="/koala-animated.gif"
                    alt="Koala"
                    className="absolute bottom-4 right-4 w-16 h-16 sm:w-24 sm:h-24 opacity-80"
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2">Description 🌿</h3>
                    <p className="bg-white border rounded p-3 text-sm sm:text-base">
                      {selectedImage.description || 'No description'}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-bold mb-2">Comments 💬</h3>
                    <div className="max-h-32 sm:max-h-48 overflow-y-auto mb-4 border rounded p-2 bg-white">
                      {comments.map(comment => (
                        <div key={comment.id} className="p-2 border-b last:border-b-0 flex justify-between items-start gap-2">
                          <p className="flex-1 text-sm sm:text-base">{comment.content}</p>
                          <Trash2 
                            className="text-red-400 cursor-pointer w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transition-colors duration-300 hover:text-red-600" 
                            onClick={() => deleteComment(comment.id)} 
                          />
                        </div>
                      ))}
                      {comments.length === 0 && <p className="text-gray-400 text-sm">No comments yet.</p>}
                    </div>
                    <Textarea
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="mb-2 transition-all duration-300 focus:ring-2 focus:ring-purple-400"
                    />
                    <Button 
                      className="bg-purple-500 text-white w-full transition-all duration-300 hover:bg-purple-600 hover:scale-[1.02]" 
                      onClick={addComment}
                    >
                      Add Comment
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Index;

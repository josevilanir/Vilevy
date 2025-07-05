import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function PhotoModal({
  open,
  photo,
  comments,
  newComment,
  setNewComment,
  onClose,
  onAddComment,
  onDeleteComment
}: any) {
  const API_URL = `http://${window.location.hostname}:4000`;
  if (!photo) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
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
        <div className="relative">
          <div className="max-w-4xl mx-auto">
            <img
              src={`${API_URL}/uploads/${photo.file_path}`}
              alt={photo.name}
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
                {photo.description || 'No description'}
              </p>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">Comments 💬</h3>
              <div className="max-h-32 sm:max-h-48 overflow-y-auto mb-4 border rounded p-2 bg-white">
                {comments.map((comment: any) => (
                  <div key={comment.id} className="p-2 border-b last:border-b-0 flex justify-between items-start gap-2">
                    <p className="flex-1 text-sm sm:text-base">{comment.content}</p>
                    <Trash2 
                      className="text-red-400 cursor-pointer w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transition-colors duration-300 hover:text-red-600" 
                      onClick={() => onDeleteComment(comment.id)} 
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
                onClick={onAddComment}
              >
                Add Comment
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

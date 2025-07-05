import { Heart } from "lucide-react";

export default function AlbumMainHeader() {
  return (
    <div className="bg-white rounded-lg shadow-lg border-4 border-purple-200 p-4 sm:p-6 mb-6 sm:mb-8 max-w-6xl mx-auto">
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
  );
}

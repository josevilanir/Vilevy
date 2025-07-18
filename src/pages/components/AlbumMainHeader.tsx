import { Heart } from "lucide-react";

export default function AlbumMainHeader() {
  return (
    <div className="bg-white rounded-lg shadow-xl border-2 border-purple-200 p-6 sm:p-8 mb-8 max-w-6xl mx-auto transition-shadow duration-300">
      {/* Header com ícones e gradiente */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
        <Heart className="text-purple-400 w-8 h-8 sm:w-10 sm:h-10 drop-shadow-md animate-bounce" />
        <h1
          className="text-3xl sm:text-5xl font-bold font-mono text-center
          bg-gradient-to-r from-purple-400 via-fuchsia-500 to-purple-600 
          text-transparent bg-clip-text flex items-center gap-3 drop-shadow-lg"
        >
          💜🐨 <span className="font-extrabold tracking-wide">Nossa <span className="text-purple-500">Coleção</span> de <span className="text-purple-500">Lembranças</span></span> 🐨💜
        </h1>
        <Heart className="text-purple-400 w-8 h-8 sm:w-10 sm:h-10 drop-shadow-md animate-bounce" />
      </div>

      {/* Linha separadora */}
      <hr className="my-2 border-purple-200 opacity-70" />

      {/* Legenda com fonte manuscrita se disponível */}
      <p className="font-dancing text-lg sm:text-xl text-gray-600 italic text-center mt-2">
        Porque os melhores abraços e memórias merecem um álbum só nosso! 🐨💜
      </p>
    </div>
  );
}

import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function AlbumHeader({ name }: { name: string }) {
  return (
    <>
      <Link to="/albums" className="album-back">
        <ArrowLeft /> Voltar aos álbuns
      </Link>
      <h1 className="album-header">
        <span className="emoji">📸🐨</span>
        {name}
        <span className="emoji">💜</span>
      </h1>
    </>
  )
}

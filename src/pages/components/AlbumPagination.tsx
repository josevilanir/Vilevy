interface Props {
  page: number
  totalPages: number
  setPage: (page: number) => void
}

export default function AlbumPagination({ page, totalPages, setPage }: Props) {
  return (
    <div className="flex justify-center space-x-4 mt-6">
      <button
        onClick={() => setPage(page - 1)}
        disabled={page <= 1}
        className="px-4 py-2 rounded bg-purple-200 hover:bg-purple-300 disabled:opacity-50"
      >
        Anterior
      </button>
      <button
        onClick={() => setPage(page + 1)}
        disabled={page >= totalPages}
        className="px-4 py-2 rounded bg-purple-200 hover:bg-purple-300 disabled:opacity-50"
      >
        Próxima
      </button>
    </div>
  )
}

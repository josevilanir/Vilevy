import { get, set, del, keys } from 'idb-keyval'

// Salva uma foto (key = id, value = dataURL)
export async function savePhoto(id: string, dataURL: string) {
  await set(id, dataURL)
}

// Busca uma foto
export async function getPhoto(id: string): Promise<string | undefined> {
  return await get(id)
}

// Apaga uma foto
export async function deletePhoto(id: string) {
  await del(id)
}

// Lista todas as fotos salvas
export async function listPhotos(): Promise<{ id: string, dataURL: string }[]> {
  const allKeys = await keys()
  const allPhotos = await Promise.all(
    allKeys.map(async (key) => {
      const dataURL = await get(String(key))
      return { id: String(key), dataURL: dataURL! }
    })
  )
  return allPhotos
}

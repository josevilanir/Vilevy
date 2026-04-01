// src/config.ts
// Remove barra final das URLs caso venham configuradas com ela
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '')

export const API_BASE = `${API_URL}/api/v1`

// URL pública do Cloudflare R2 para carregar imagens diretamente (sem passar pelo backend)
// Em dev, usa o backend como proxy. Em prod, usa o R2 diretamente.
export const STORAGE_URL = (import.meta.env.VITE_R2_PUBLIC_URL || API_URL + '/uploads').replace(/\/$/, '')

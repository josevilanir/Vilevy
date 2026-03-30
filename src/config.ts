// src/config.ts
// Remove barra final da URL caso a variável venha configurada com ela
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '')

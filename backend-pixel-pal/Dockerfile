# backend-pixel-pal/Dockerfile
# Multi-stage build: compila TypeScript e gera imagem de produção enxuta

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json tsconfig.json ./
RUN npm ci

COPY src ./src
RUN npm run build

# ---

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY migrations ./migrations

EXPOSE 4000

CMD ["node", "dist/index.js"]

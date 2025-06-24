# backend-pixel-pal/Dockerfile

FROM node:20-bullseye AS build

WORKDIR /app

# 1) Copia só package.json e package-lock.json
COPY package*.json ./

# 2) Instala dependências do sistema necessárias para sqlite3 + build de addons nativos
RUN apt-get update && apt-get install -y \
    python3 \
    build-essential \
    pkg-config \
    libsqlite3-dev \
  && rm -rf /var/lib/apt/lists/* \
  && npm install --production

# 3) Copia o resto do código (sem node_modules do host, graças ao .dockerignore)
COPY . .

# 4) Garante que a pasta de uploads exista (o seu código já faz isso, mas só por segurança)
RUN mkdir -p uploads

# Expõe a porta que o Express vai ouvir
EXPOSE 4000

# 5) Comando de start em exec-form, chamando o index.js
CMD ["node", "index.js"]

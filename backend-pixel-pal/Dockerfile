# backend-pixel-pal/Dockerfile
# Simplificado: sem sqlite3, sem disco local — tudo vai pro Cloudflare R2

FROM node:20-alpine

WORKDIR /app

# Copia manifests de dependências
COPY package*.json ./

# Instala apenas dependências de produção
RUN npm install --production

# Copia o código
COPY . .

# Expõe a porta do Express
EXPOSE 4000

# Inicia o servidor
CMD ["node", "index.js"]

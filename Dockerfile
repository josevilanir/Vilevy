## Build stage
FROM node:20-bullseye AS build

WORKDIR /app

# 1) define o ARG e exporta como ENV antes de copiar qualquer coisa
ARG ENABLE_PWA=false
ENV ENABLE_PWA=${ENABLE_PWA}

# 2) copia package.json e instala libs nativas + Rust + npm deps
COPY package*.json ./
RUN apt-get update && apt-get install -y \
      python3 \
      build-essential \
      pkg-config \
      libssl-dev \
      curl && \
    rm -rf /var/lib/apt/lists/* && \
    curl https://sh.rustup.rs -sSf | sh -s -- -y && \
    npm install

# 3) copia o resto do código
COPY . .

# 4) roda o build (PLUGIN PWA só carregará se ENABLE_PWA=true)
RUN npm run build

## Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

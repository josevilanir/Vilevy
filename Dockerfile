## Build stage
FROM node:20-bullseye AS build

WORKDIR /app

ARG ENABLE_PWA=false
ENV ENABLE_PWA=${ENABLE_PWA}

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

COPY . .

RUN npm run build

## Production stage
FROM nginx:alpine

# Remove config padrão do nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia build do frontend
COPY --from=build /app/dist /usr/share/nginx/html

# Copia seu nginx.conf customizado (certifique-se que ele está junto ao Dockerfile!)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# Pup Pixel Photo Pal - Fullstack Koala Edition 🐨

Projeto fullstack para galeria de fotos pixeladas fofinhas 💜  
Frontend em React (Vite) + Backend Node.js + PostgreSQL, pronto para deploy moderno (Render.com) e uploads persistentes!

---

## ✨ Funcionalidades

- Upload e visualização de fotos (com legenda e descrição)
- Criação e navegação de álbuns
- Definir foto de capa do álbum
- Deletar fotos e remover de álbuns
- Barra de busca (filtra fotos por nome/descrição)
- Upload persistente (Render Starter + Persistent Disk)
- Comentários em fotos
- Sistema de tags nas fotos
- Interface responsiva e fofinha (pixel art/koalas)
- Deploy integrado (Render) — sem Docker Compose!

---

## 🔧 Pré-requisitos para rodar local

- Node.js (v18+)
- PostgreSQL rodando localmente OU use o banco do Render
- (Opcional) Bun ou npm/yarn para o frontend

---

## 🖥 Rodando o Backend (Node.js)

1️⃣ Acesse a pasta do backend:

```bash
cd backend-pixel-pal
```

2️⃣ Instale as dependências:

```bash
npm install
```

3️⃣ Crie o arquivo `.env` com sua configuração do banco:

```
DATABASE_URL=postgres://usuario:senha@host:5432/database
UPLOAD_FOLDER=uploads    # ou /data/uploads no Render
PORT=4000
```

> Se for rodar no Render, use o DATABASE_URL e o caminho `/data/uploads` para persistência dos uploads.

4️⃣ Inicie o servidor:

```bash
node index.js
```

O backend ficará disponível em:

```
http://localhost:4000
```

---

## 🌐 Rodando o Frontend

1️⃣ Acesse a pasta do frontend:

```bash
cd pup-pixel-photo-pal
```

2️⃣ Instale as dependências:

```bash
npm install    # ou bun install
```

3️⃣ Configure o `.env` do frontend (se houver) com a URL do backend:

```
VITE_API_URL=http://localhost:4000
```

Ou, para acessar de outros dispositivos, use o IP da sua máquina:

```
VITE_API_URL=http://SEU-IP-LOCAL:4000
```

4️⃣ Para rodar o frontend local:

```bash
npm run dev    # ou bun run dev
```

Ficará disponível em:

```
http://localhost:5173
```

---

## 🚀 Deploy na Render (produção)

### Backend

- Suba o projeto backend no Render como "Web Service" Node.js.
- Configure as variáveis de ambiente no painel:
  - `DATABASE_URL` (pegue do serviço Postgres da Render)
  - `UPLOAD_FOLDER=/data/uploads` (para usar o Persistent Disk)
- Ative **Persistent Disk** nas configurações (`/data`, 1GB+).
- O backend cuidará dos uploads e banco normalmente!

### Frontend

- Suba o frontend no Render como "Static Site".
- Configure o `VITE_API_URL` para apontar para a URL do backend Render.
- Nas opções do Static Site, adicione a seguinte regra de rewrite:

  ```
  Source: /*
  Destination: /index.html
  Action: Rewrite
  ```

---

## 💾 Uploads Persistentes (Importante)

- Localmente, arquivos são salvos em `/uploads` por padrão.
- No Render, arquivos **persistem** se salvos em `/data/uploads` (Persistent Disk).
- Não há mais risco de perder uploads após deploy/restart!

---

## 🐨 Dúvidas frequentes

- **F5 em rota interna dá 404?**  
  Ative o rewrite `/*` → `/index.html` nas configs do Static Site (Render).
- **Uploads somem no free?**  
  Use Persistent Disk (Render Starter ou superior).

---

> Feito com muito 💜 e um koala programador 🐨

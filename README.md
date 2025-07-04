# Pup Pixel Photo Pal - Fullstack Koala Edition 🐨

Projeto completo com frontend em React (Vite) e backend Node.js + SQLite para armazenar fotos pixeladas de forma fofinha 💜

---

## 🔧 Pré-requisitos

- Node.js (para o backend)
- Bun (ou npm/yarn para o frontend)
- Ambos o backend e o frontend devem rodar na mesma rede local para funcionar em múltiplos dispositivos

---

## 🖥 Rodando o Backend

1️⃣ Acesse a pasta do backend:

```bash
cd backend-pixel-pal
```

2️⃣ Instale as dependências:

```bash
npm install
```

3️⃣ Inicie o servidor:

```bash
node index.js
```

O backend irá rodar em:

```
http://localhost:4000
```

✅ Lembre-se: deixe o backend rodando durante o uso do app.

---

## 🌐 Rodando o Frontend (modo produção local)

1️⃣ Acesse a pasta do frontend:

```bash
cd pup-pixel-photo-pal
```

2️⃣ Instale as dependências:

Se você está usando **Bun**:

```bash
bun install
```

Se está usando **npm**:

```bash
npm install
```

3️⃣ Ajuste o IP do Backend:

No arquivo `Index.tsx` altere o `API_URL` com o IP da máquina que está rodando o backend:

```typescript
const API_URL = 'http://SEU-IP-AQUI:4000';
```

Exemplo com seu IP:

```typescript
const API_URL = 'http://192.168.0.6:4000';
```

Assim outros dispositivos na rede conseguem acessar corretamente.

4️⃣ Gere o build de produção:

Se for Bun:

```bash
bun run build
```

Se for npm:

```bash
npm run build
```

5️⃣ Rode o servidor de preview de produção:

Se for Bun:

```bash
bun run preview
```

Se for npm:

```bash
npm run preview
```

O frontend ficará disponível em:

```
http://localhost:4173
```

✅ Agora você pode acessar via celular apontando para:

```
http://192.168.0.6:4173
```

(ajustando com o IP correto da máquina)

---

## 🚀 Próximos Passos Possíveis

- 🔄 Persistência total de descrições (já implementado)
- 🌎 Preparar deploy completo em servidor online
- 🧹 Adicionar delete de fotos
- 🔐 Autenticação por usuário
- 🐳 Docker fullstack para rodar tudo em uma caixa só
- 📦 Deploy definitivo com CI/CD

---

> Feito com muito 💜 e um koala programador 🐨

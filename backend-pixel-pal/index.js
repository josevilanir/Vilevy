const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

// Pasta de upload
const uploadFolder = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);

// Configuração do multer para upload
const storage = multer.diskStorage({
  destination: uploadFolder,
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Banco SQLite
const db = new sqlite3.Database('./photos.db');

db.run(`
  CREATE TABLE IF NOT EXISTS photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    upload_date TEXT,
    file_path TEXT
  )
`);

// Upload de foto
app.post('/photos', upload.single('image'), (req, res) => {
  const { description } = req.body;
  const { filename } = req.file;
  const name = req.file.originalname;
  const upload_date = new Date().toISOString();

  db.run(
    `INSERT INTO photos (name, description, upload_date, file_path) VALUES (?, ?, ?, ?)`,
    [name, description, upload_date, filename],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({
        id: this.lastID,
        name,
        description,
        upload_date,
        file_path: filename
      });
    }
  );
});

// Listagem de fotos
app.get('/photos', (req, res) => {
  db.all(`SELECT * FROM photos ORDER BY upload_date DESC`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Atualizar descrição
app.put('/photos/:id', (req, res) => {
  const { id } = req.params;
  const { description } = req.body;

  db.run(
    `UPDATE photos SET description = ? WHERE id = ?`,
    [description, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Photo not found' });
      }
      res.json({ success: true });
    }
  );
});

// Servir as imagens
app.use('/uploads', express.static(uploadFolder));

app.listen(port, () => {
  console.log(`Backend rodando em http://localhost:${port}`);
});

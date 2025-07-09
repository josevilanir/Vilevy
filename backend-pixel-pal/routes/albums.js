import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// ── ROTAS DE ÁLBUNS ──

// 1) Listar todos os álbuns
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.*, 
        p.file_path AS cover_photo_file_path
      FROM albums a
      LEFT JOIN photos p ON a.cover_photo_id = p.id
      ORDER BY a.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Erro no GET /albums:', err);
    res.status(500).json({ error: 'Erro ao buscar álbuns' });
  }
});

// 2) Criar um álbum novo
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO albums (name, description)
       VALUES ($1,$2)
       RETURNING *`,
      [name, description || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /albums error:', err);
    res.sendStatus(500);
  }
});

router.get('/:albumId', async (req, res) => {
  const { albumId } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        a.*, 
        p.file_path AS cover_photo_file_path
      FROM albums a
      LEFT JOIN photos p ON a.cover_photo_id = p.id
      WHERE a.id = $1
    `, [albumId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Álbum não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar álbum' });
  }
});

router.put('/:albumId/cover', async (req, res) => {
  const { albumId } = req.params;
  const { photoId } = req.body;
  try {
    await pool.query(
      'UPDATE albums SET cover_photo_id = $1 WHERE id = $2',
      [photoId, albumId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao definir capa do álbum' });
  }
});

// 3) Listar fotos de um álbum
router.get('/:albumId/photos', async (req, res) => {
  const { albumId } = req.params
  const page  = parseInt(req.query.page, 10)  || 1
  const limit = parseInt(req.query.limit, 10) || 5
  const offset = (page - 1) * limit

  try {
    // Conta total
    const cnt = await pool.query(
      'SELECT count(*) FROM photo_albums WHERE album_id = $1',
      [albumId]
    )
    const total = parseInt(cnt.rows[0].count, 10)
    const totalPages = Math.ceil(total / limit)

    // Busca página paginada
    const { rows: photos } = await pool.query(
      `SELECT p.id, p.name, p.description, p.file_path, p.taken_date, p.upload_date
       FROM photos p
       JOIN photo_albums pa ON pa.photo_id = p.id
       WHERE pa.album_id = $1
       ORDER BY p.id DESC        -- Aqui está a correção!
       LIMIT $2 OFFSET $3`,
      [albumId, limit, offset]
    )

    return res.json({ photos, page, totalPages, total })
  } catch (err) {
    console.error('GET /albums/:albumId/photos pagination error:', err)
    return res.status(500).json({ error: err.message })
  }
})

// 4) Deletar um álbum (remove só o álbum, não toca nas fotos)
router.delete('/:albumId', async (req, res) => {
  try {
    const { albumId } = req.params;
    const { rowCount } = await pool.query(
      'DELETE FROM albums WHERE id = $1',
      [albumId]
    );
    if (rowCount === 0) return res.sendStatus(404);
    res.sendStatus(200);
  } catch (err) {
    console.error('DELETE /albums/:albumId error:', err);
    res.sendStatus(500);
  }
});

// 5) Associar uma foto a um álbum
router.post('/:albumId/photos', async (req, res) => {
  try {
    const albumId = parseInt(req.params.albumId, 10);
    const photoId = parseInt(req.body.photo_id, 10);

    if (isNaN(albumId) || isNaN(photoId)) {
      return res.status(400).json({ error: 'albumId e photo_id devem ser números' });
    }

    await pool.query(
      `INSERT INTO photo_albums (album_id, photo_id)
       VALUES ($1, $2)
       ON CONFLICT (album_id, photo_id) DO NOTHING`,  // especifica o target do conflito
      [albumId, photoId]
    );

    // 201 ou 204 funciona bem aqui, já que não estamos retornando o corpo
    return res.sendStatus(201);
  } catch (err) {
    console.error('POST /albums/:albumId/photos error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// 6) Desassociar uma foto de um álbum (não deleta a foto do sistema)
router.delete('/:albumId/photos/:photoId', async (req, res) => {
  try {
    const albumId = parseInt(req.params.albumId, 10);
    const photoId = parseInt(req.params.photoId, 10);

    if (isNaN(albumId) || isNaN(photoId)) {
      return res.status(400).json({ error: 'albumId e photoId devem ser números' });
    }

    // Remove o vínculo
    await pool.query(
      `DELETE FROM photo_albums WHERE album_id = $1 AND photo_id = $2`,
      [albumId, photoId]
    );

    res.sendStatus(204); // sucesso, sem conteúdo
  } catch (err) {
    console.error('DELETE /albums/:albumId/photos/:photoId error:', err);
    res.status(500).json({ error: 'Erro ao desassociar foto do álbum' });
  }
});

export default router;
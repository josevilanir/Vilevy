/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export async function up(pgm) {
  pgm.sql('CREATE EXTENSION IF NOT EXISTS pg_trgm');

  pgm.sql('CREATE INDEX IF NOT EXISTS idx_photos_name_trgm ON photos USING GIN (name gin_trgm_ops)');
  pgm.sql('CREATE INDEX IF NOT EXISTS idx_photos_desc_trgm ON photos USING GIN (description gin_trgm_ops)');
  pgm.sql('CREATE INDEX IF NOT EXISTS idx_photos_upload_date ON photos (upload_date DESC)');
  pgm.sql('CREATE INDEX IF NOT EXISTS idx_photos_taken_date ON photos (taken_date)');
}

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export async function down(pgm) {
  pgm.sql('DROP INDEX IF EXISTS idx_photos_name_trgm');
  pgm.sql('DROP INDEX IF EXISTS idx_photos_desc_trgm');
  pgm.sql('DROP INDEX IF EXISTS idx_photos_upload_date');
  pgm.sql('DROP INDEX IF EXISTS idx_photos_taken_date');
}

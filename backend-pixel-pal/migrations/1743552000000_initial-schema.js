/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export async function up(pgm) {
  pgm.createTable('photos', {
    id: { type: 'serial', primaryKey: true },
    file_path: { type: 'text', notNull: true },
    name: { type: 'text' },
    description: { type: 'text' },
    taken_date: { type: 'timestamptz' },
    upload_date: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });

  pgm.createTable('comments', {
    id: { type: 'serial', primaryKey: true },
    photo_id: {
      type: 'integer',
      references: '"photos"',
      onDelete: 'CASCADE',
    },
    content: { type: 'text', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });

  pgm.createTable('albums', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'text', notNull: true },
    description: { type: 'text' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    cover_photo_id: {
      type: 'integer',
      references: '"photos"',
    },
  });

  pgm.createTable('photo_albums', {
    photo_id: {
      type: 'integer',
      notNull: true,
      references: '"photos"',
      onDelete: 'CASCADE',
    },
    album_id: {
      type: 'integer',
      notNull: true,
      references: '"albums"',
      onDelete: 'CASCADE',
    },
  });
  pgm.addConstraint('photo_albums', 'photo_albums_pkey', 'PRIMARY KEY (photo_id, album_id)');

  pgm.createTable('tags', {
    id: { type: 'serial', primaryKey: true },
    name: { type: 'text', unique: true, notNull: true },
  });

  pgm.createTable('photo_tags', {
    photo_id: {
      type: 'integer',
      notNull: true,
      references: '"photos"',
      onDelete: 'CASCADE',
    },
    tag_id: {
      type: 'integer',
      notNull: true,
      references: '"tags"',
      onDelete: 'CASCADE',
    },
  });
  pgm.addConstraint('photo_tags', 'photo_tags_pkey', 'PRIMARY KEY (photo_id, tag_id)');

  pgm.createTable('users', {
    id: { type: 'serial', primaryKey: true },
    username: { type: 'text', unique: true, notNull: true },
    password_hash: { type: 'text', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });
}

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export async function down(pgm) {
  pgm.dropTable('photo_tags');
  pgm.dropTable('photo_albums');
  pgm.dropTable('tags');
  pgm.dropTable('comments');
  pgm.dropTable('albums');
  pgm.dropTable('users');
  pgm.dropTable('photos');
}

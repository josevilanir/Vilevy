export interface PhotoRow {
  id: number;
  file_path: string;
  name: string | null;
  description: string | null;
  taken_date: Date | null;
  upload_date: Date;
}

export interface CommentRow {
  id: number;
  photo_id: number;
  content: string;
  created_at: Date;
}

export interface AlbumRow {
  id: number;
  name: string;
  description: string | null;
  created_at: Date;
  cover_photo_id: number | null;
  cover_photo_file_path?: string | null;
}

export interface TagRow {
  id: number;
  name: string;
}

export interface UserRow {
  id: number;
  username: string;
  password_hash: string;
  created_at: Date;
}

export interface JwtPayload {
  id: number;
  username: string;
  iat?: number;
  exp?: number;
}

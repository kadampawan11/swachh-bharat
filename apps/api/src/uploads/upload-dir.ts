import { resolve } from 'path';

export const UPLOAD_ROOT = resolve(process.env.UPLOAD_DIR ?? 'uploads');

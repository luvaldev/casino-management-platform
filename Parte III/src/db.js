import { neon } from '@neondatabase/serverless';
import { DATA_BASE_URL } from './config.js';

export const sql = neon(DATA_BASE_URL);

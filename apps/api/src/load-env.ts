import { existsSync } from 'fs';

// Nest doesn't read .env itself; load it before any module reads process.env.
if (existsSync('.env')) process.loadEnvFile('.env');

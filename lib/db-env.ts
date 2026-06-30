// This module MUST be imported before '@prisma/client'.
// In production (Vercel), uses the DATABASE_URL env var (Neon PostgreSQL).
// In local dev, optionally overrides to a local SQLite file if
// USE_LOCAL_SQLITE=true is set in .env.

import path from 'path'
import fs from 'fs'

const USE_LOCAL_SQLITE = process.env.USE_LOCAL_SQLITE === 'true'

if (USE_LOCAL_SQLITE) {
  const dbDir = path.join(process.cwd(), 'db')
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }
  const dbPath = path.join(dbDir, 'apexflow.db')
  process.env.DATABASE_URL = `file:${dbPath}`
}

export const IS_NEON_POSTGRES = !USE_LOCAL_SQLITE
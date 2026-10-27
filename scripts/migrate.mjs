// Applies db/migrations/*.sql in order, once each. Usage: DATABASE_URL=postgres://… pnpm db:migrate
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import pg from 'pg'

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL is not set')
  process.exit(1)
}
const dir = join(import.meta.dirname, '..', 'db', 'migrations')
const client = new pg.Client({ connectionString: url })
await client.connect()
try {
  await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())')
  const applied = new Set((await client.query('SELECT version FROM schema_migrations')).rows.map((r) => r.version))
  for (const file of (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort()) {
    if (applied.has(file)) continue
    await client.query('BEGIN')
    try {
      await client.query(await readFile(join(dir, file), 'utf8'))
      await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [file])
      await client.query('COMMIT')
      console.log(`applied ${file}`)
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    }
  }
} finally {
  await client.end()
}

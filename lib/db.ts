import { Pool, type PoolClient } from 'pg'

/**
 * PostgreSQL (DATABASE_URL). Bookings need it: without a database the booking pages show that
 * online booking is not available. Schema: db/migrations, applied with `pnpm db:migrate`.
 */
const globalDb = globalThis as typeof globalThis & { __seasmatesPool?: Pool }

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL)
}

export function db() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set')
  globalDb.__seasmatesPool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 5 })
  return globalDb.__seasmatesPool
}

/** Runs `fn` in one transaction: everything or nothing. */
export async function transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await db().connect()
  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

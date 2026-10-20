// Lapisan penyimpanan server.
//
// Dua driver didukung:
// - SQLite (node:sqlite, tanpa dependensi native) untuk pengembangan lokal.
// - PostgreSQL (paket `pg`) bila DATABASE_URL diisi, misalnya di Render/Neon.
//
// Bentuk penyimpanan sengaja dibuat sederhana: satu tabel `records` berisi
// dokumen JSON per koleksi. Skema ternormalisasi bisa menyusul tanpa mengubah
// kontrak API karena seluruh akses data melewati modul ini.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = process.env.DATA_DIR || path.join(HERE, 'data')

export const COLLECTIONS = [
  'users',
  'campaigns',
  'landingPages',
  'posts',
  'pages',
  'leads',
  'activities',
  'deals',
  'tasks',
  'notifications',
  'events',
]

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS records (
     collection TEXT NOT NULL,
     id TEXT NOT NULL,
     data TEXT NOT NULL,
     created_at TEXT,
     updated_at TEXT,
     PRIMARY KEY (collection, id)
   )`,
  `CREATE TABLE IF NOT EXISTS app_meta (
     key TEXT PRIMARY KEY,
     value TEXT NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS credentials (
     user_id TEXT PRIMARY KEY,
     password_hash TEXT NOT NULL,
     updated_at TEXT
   )`,
]

let driver = null

// --- Driver SQLite ---------------------------------------------------------
async function createSqliteDriver(file) {
  const { DatabaseSync } = await import('node:sqlite')
  fs.mkdirSync(path.dirname(file), { recursive: true })
  const db = new DatabaseSync(file)
  db.exec('PRAGMA journal_mode = WAL')
  db.exec('PRAGMA foreign_keys = ON')

  const api = {
    kind: 'sqlite',
    async all(sql, params = []) {
      return db.prepare(sql).all(...params)
    },
    async run(sql, params = []) {
      const result = db.prepare(sql).run(...params)
      return { changes: Number(result.changes) }
    },
    async exec(sql) {
      db.exec(sql)
    },
    async transaction(fn) {
      db.exec('BEGIN')
      try {
        const result = await fn(api)
        db.exec('COMMIT')
        return result
      } catch (error) {
        db.exec('ROLLBACK')
        throw error
      }
    },
    async close() {
      db.close()
    },
  }

  return api
}

// --- Driver PostgreSQL -----------------------------------------------------
function toPostgresPlaceholders(sql) {
  let index = 0
  return sql.replace(/\?/g, () => `$${(index += 1)}`)
}

async function createPostgresDriver(connectionString) {
  let pg
  try {
    pg = await import('pg')
  } catch {
    throw new Error('DATABASE_URL berisi PostgreSQL, tetapi paket "pg" belum terpasang. Jalankan pnpm add pg.')
  }

  const Pool = pg.default?.Pool ?? pg.Pool
  const pool = new Pool({
    connectionString,
    ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
    max: Number(process.env.DATABASE_POOL_MAX || 5),
  })

  async function execute(executor, sql, params = []) {
    const result = await executor.query(toPostgresPlaceholders(sql), params)
    return result
  }

  const api = {
    kind: 'postgres',
    async all(sql, params = []) {
      const result = await execute(pool, sql, params)
      return result.rows
    },
    async run(sql, params = []) {
      const result = await execute(pool, sql, params)
      return { changes: result.rowCount }
    },
    async exec(sql) {
      await pool.query(sql)
    },
    async transaction(fn) {
      const client = await pool.connect()
      try {
        await client.query('BEGIN')
        const tx = {
          all: async (sql, params = []) => (await execute(client, sql, params)).rows,
          run: async (sql, params = []) => {
            const result = await execute(client, sql, params)
            return { changes: result.rowCount }
          },
        }
        const result = await fn(tx)
        await client.query('COMMIT')
        return result
      } catch (error) {
        await client.query('ROLLBACK')
        throw error
      } finally {
        client.release()
      }
    },
    async close() {
      await pool.end()
    },
  }

  return api
}

// --- API publik modul ------------------------------------------------------
export async function initStore() {
  if (driver) return driver

  const url = process.env.DATABASE_URL
  driver = url?.startsWith('postgres')
    ? await createPostgresDriver(url)
    : await createSqliteDriver(url?.startsWith('file:') ? url.slice(5) : path.join(DATA_DIR, 'vanguard.db'))

  for (const statement of SCHEMA) {
    await driver.exec(statement)
  }

  await driver.exec('CREATE INDEX IF NOT EXISTS idx_records_collection ON records (collection)')
  return driver
}

export function driverKind() {
  return driver?.kind ?? null
}

export async function closeStore() {
  if (driver) await driver.close()
  driver = null
}

function parseRow(row) {
  try {
    return JSON.parse(row.data)
  } catch {
    return null
  }
}

export async function readAll() {
  if (!driver) await initStore()

  const rows = await driver.all('SELECT collection, id, data FROM records ORDER BY created_at DESC, id DESC')
  const snapshot = {
    users: [],
    campaigns: [],
    landingPages: [],
    posts: [],
    pages: [],
    leads: [],
    activities: [],
    deals: [],
    tasks: [],
    notifications: [],
    events: [],
    settings: {},
    meta: null,
  }

  for (const row of rows) {
    const value = parseRow(row)
    if (!value) continue
    if (row.collection === 'settings') {
      snapshot.settings = value
      continue
    }
    if (snapshot[row.collection]) snapshot[row.collection].push(value)
  }

  const metaRow = await driver.all('SELECT value FROM app_meta WHERE key = ?', ['meta'])
  snapshot.meta = metaRow[0] ? JSON.parse(metaRow[0].value) : null
  return snapshot
}

export async function countRecords() {
  if (!driver) await initStore()
  const rows = await driver.all('SELECT COUNT(*) AS total FROM records')
  return Number(rows[0]?.total ?? 0)
}

function recordValues(collection, item) {
  const now = new Date().toISOString()
  return [
    collection,
    item.id,
    JSON.stringify(item),
    item.createdAt || item.updatedAt || now,
    item.updatedAt || item.createdAt || now,
  ]
}

const UPSERT_SQL = `INSERT INTO records (collection, id, data, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?)
  ON CONFLICT (collection, id)
  DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`

export async function writeRecords(collection, items) {
  if (!driver) await initStore()
  if (!items?.length) return
  await driver.transaction(async (tx) => {
    for (const item of items) {
      await tx.run(UPSERT_SQL, recordValues(collection, item))
    }
  })
}

export async function writeSettings(settings) {
  if (!driver) await initStore()
  const current = await readSettings()
  const merged = { ...current, ...settings }
  await driver.run(UPSERT_SQL, recordValues('settings', { ...merged, id: 'default' }))
  return merged
}

export async function readSettings() {
  if (!driver) await initStore()
  const rows = await driver.all("SELECT data FROM records WHERE collection = 'settings' AND id = 'default'")
  return rows[0] ? parseRow(rows[0]) : {}
}

export async function deleteRecord(collection, id) {
  if (!driver) await initStore()
  await driver.run('DELETE FROM records WHERE collection = ? AND id = ?', [collection, id])
}

export async function deleteMany(collection, ids) {
  if (!driver) await initStore()
  if (!ids?.length) return
  await driver.transaction(async (tx) => {
    for (const id of ids) {
      await tx.run('DELETE FROM records WHERE collection = ? AND id = ?', [collection, id])
    }
  })
}

export async function setMeta(meta) {
  if (!driver) await initStore()
  await driver.run(
    `INSERT INTO app_meta (key, value) VALUES ('meta', ?)
     ON CONFLICT (key) DO UPDATE SET value = excluded.value`,
    [JSON.stringify(meta)],
  )
}

// Ganti seluruh isi database dengan snapshot baru (seed / reset).
export async function replaceAll(snapshot) {
  if (!driver) await initStore()

  await driver.transaction(async (tx) => {
    await tx.run('DELETE FROM records')
    for (const collection of COLLECTIONS) {
      const items = snapshot[collection]
      if (!Array.isArray(items)) continue
      for (const item of items) {
        await tx.run(UPSERT_SQL, recordValues(collection, item))
      }
    }
    if (snapshot.settings) {
      await tx.run(UPSERT_SQL, recordValues('settings', { ...snapshot.settings, id: 'default' }))
    }
  })

  if (snapshot.meta) await setMeta(snapshot.meta)
}

// --- Kredensial ------------------------------------------------------------
export async function readCredential(userId) {
  if (!driver) await initStore()
  const rows = await driver.all('SELECT password_hash FROM credentials WHERE user_id = ?', [userId])
  return rows[0]?.password_hash ?? null
}

export async function setCredential(userId, hash) {
  if (!driver) await initStore()
  await driver.run(
    `INSERT INTO credentials (user_id, password_hash, updated_at) VALUES (?, ?, ?)
     ON CONFLICT (user_id) DO UPDATE SET password_hash = excluded.password_hash, updated_at = excluded.updated_at`,
    [userId, hash, new Date().toISOString()],
  )
}

export async function replaceCredentials(entries) {
  if (!driver) await initStore()
  await driver.transaction(async (tx) => {
    await tx.run('DELETE FROM credentials')
    for (const [userId, hash] of entries) {
      await tx.run(
        `INSERT INTO credentials (user_id, password_hash, updated_at) VALUES (?, ?, ?)`,
        [userId, hash, new Date().toISOString()],
      )
    }
  })
}

export async function deleteCredential(userId) {
  if (!driver) await initStore()
  await driver.run('DELETE FROM credentials WHERE user_id = ?', [userId])
}

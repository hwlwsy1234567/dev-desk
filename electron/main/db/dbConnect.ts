import path from 'path'
import { BetterSQLite3Database, drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from './schema'
import { APP_NAME, DB_CONFIG } from '../utils/constants'
import { generateDirPath, getAppHand } from '../utils'
import log from '../logger'
const DB_PATH = path.join(getAppHand(), APP_NAME, DB_CONFIG.dbFileName)

// 初始化数据库目录
generateDirPath(DB_PATH)
const sqlite = new Database(DB_PATH, {
  timeout: DB_CONFIG.timeout
})

export let db: BetterSQLite3Database<typeof schema>;

const ensureAppTables = () => {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id integer PRIMARY KEY NOT NULL,
      first_name text,
      email text
    );

    CREATE TABLE IF NOT EXISTS tool_history (
      id integer PRIMARY KEY NOT NULL,
      tool_type text NOT NULL,
      input text,
      output text,
      created_at integer NOT NULL,
      favorite integer DEFAULT 0 NOT NULL
    );
  `)
}

/**
 * 连接数据库
 */
export const dbConnect = async () => {
  // 校验数据库目录是否存在
  // generateDbPath(DB_PATH)
  db = drizzle(sqlite, { schema })
  log.info('dbConnect', process.env.NODE_ENV)
  ensureAppTables()
}

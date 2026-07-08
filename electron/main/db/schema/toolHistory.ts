import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const toolHistory = sqliteTable('tool_history', {
  id: integer().primaryKey(),
  tool_type: text().notNull(),
  input: text(),
  output: text(),
  created_at: integer().notNull(),
  favorite: integer().notNull().default(0)
})

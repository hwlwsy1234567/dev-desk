import { desc, eq } from 'drizzle-orm'
import { db } from '../dbConnect'
import { toolHistory } from '../schema/toolHistory'
import { response } from '../../utils/response'

export class toolHistoryServices {
  static getList() {
    const list = db.select().from(toolHistory).orderBy(desc(toolHistory.created_at)).limit(50).all()
    return response.ok({data:list})
  }

  static insertHistory(data: { tool_type: string; input: string; output: string }) {
    const res = db.insert(toolHistory).values({
      ...data,
      created_at: Date.now(),
      favorite: 0
    }).run()
    if (!res.changes) {
      return response.error()
    }
    return response.ok()
  }

  static deleteById(id: number) {
    const res = db.delete(toolHistory).where(eq(toolHistory.id, id)).run()
    if (!res.changes) {
      return response.error()
    }
    return response.ok()
  }

  static clear() {
    db.delete(toolHistory).run()
    return response.ok()
  }
}

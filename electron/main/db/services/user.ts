import { eq } from 'drizzle-orm'
import { db } from '../dbConnect'
import { users } from '../schema/users'
import { response } from '../../utils/response'

export class userServices {
  static getUserById(id: number) {
    const info = db.select().from(users).where(eq(users.id, id)).get()
    if(!info){
      return response.error({msg:'用户不存在'})
    }
    return response.ok({data:info})
  }
  /**根据id更新用户详情 */
  static updateUserById(id: number, data: any) {
    return db.transaction(tx => {
      const user = tx.update(users).set(data).where(eq(users.id, id)).run()
      if (!user.changes) {
        tx.rollback()
        return response.error()
      }
      return response.ok()
    })
  }
  /**新增用户详情 */
  static insertUser(data: any) {
    return db.transaction(tx => {
      const user = tx.insert(users).values(data).run()
      if (!user.changes) {
        tx.rollback()
        return response.error()
      }
      return response.ok()
    })
  }
/**
 * 获取用户列表
 * @returns 
 */
  static getUserList() {
    const list = db.select().from(users).all()
    return response.ok({data:list??[]})
  }

  /**
   * 根据id删除用户
   */
  static deleteUserById(id: number) {
    return db.transaction(tx => {
      const user = tx.delete(users).where(eq(users.id, id)).run()
      if (!user.changes) {
        tx.rollback()
        return response.error()
      }
      return response.ok()
    })
  }
}

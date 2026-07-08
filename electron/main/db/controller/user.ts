import { userServices } from '../services/user'
import { ipcMain } from 'electron'
import { DB_CHANNELS } from '../../../../common/ipcChannels'

/**
 * 获取用户列表
 */
ipcMain.handle(DB_CHANNELS.user.getList, () => {
  return userServices.getUserList()
})

/**
 * 新增或更新用户
 */
ipcMain.handle(DB_CHANNELS.user.addOrUpdate, (_event, arg) => {
  const data = arg
  let res
  if (data.id) {
    res = userServices.updateUserById(data.id, data)
  } else {
    const newData = { ...data }
    delete newData.id
    res = userServices.insertUser(newData)
  }
  return res
})

/**
 * 根据用户id获取用户信息
 */
ipcMain.handle(DB_CHANNELS.user.getInfoById, (_event, { id }) => {
  return userServices.getUserById(id)
})

/**
 * 根据用户id删除
 */
ipcMain.handle(DB_CHANNELS.user.deleteById, (_event, { id }) => {
  return userServices.deleteUserById(id)
})

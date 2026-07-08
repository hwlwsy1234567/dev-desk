import { DB_CHANNELS } from '@common/ipcChannels'

/**
 * 获取用户列表
 * @returns 
 */
export const getUserListDB = async () => {
  return window.electronAPI?.queryDB?.({
    path: DB_CHANNELS.user.getList,
    params:{}
  }) || { code: -1, message: 'Electron API not available' }
}


/**
 * 新增或修改用户
 * @returns 
 */
export const addOrUpdateUserDB = async (data:any) => {
  return window.electronAPI?.queryDB?.({
    path: DB_CHANNELS.user.addOrUpdate,
    params:data
  }) || { code: -1, message: 'Electron API not available' }
}


/**
 * 获取用户详情
 * @returns 
 */
export const getUserInfoByIdDB = async (data:any) => {
  return window.electronAPI?.queryDB?.({
    path: DB_CHANNELS.user.getInfoById,
    params:data
  }) || { code: -1, message: 'Electron API not available' }
}



/**
 * 删除
 * @returns 
 */
export const deleteUserByIdDB = async (data:{id:number}) => {
  return window.electronAPI?.queryDB?.({
    path: DB_CHANNELS.user.deleteById,
    params:data
  }) || { code: -1, message: 'Electron API not available' }
}

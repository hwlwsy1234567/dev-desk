import { DB_CHANNELS } from '@common/ipcChannels'

export const getToolHistoryDB = async () => {
  return window.electronAPI?.queryDB?.({
    path: DB_CHANNELS.toolHistory.getList,
    params:{}
  }) || { code: -1, msg: 'Electron API not available', data: [] }
}

export const addToolHistoryDB = async (data: { tool_type: string; input: string; output: string }) => {
  return window.electronAPI?.queryDB?.({
    path: DB_CHANNELS.toolHistory.add,
    params:data
  }) || { code: -1, msg: 'Electron API not available', data: null }
}

export const deleteToolHistoryDB = async (data:{id:number}) => {
  return window.electronAPI?.queryDB?.({
    path: DB_CHANNELS.toolHistory.deleteById,
    params:data
  }) || { code: -1, msg: 'Electron API not available', data: null }
}

export const clearToolHistoryDB = async () => {
  return window.electronAPI?.queryDB?.({
    path: DB_CHANNELS.toolHistory.clear,
    params:{}
  }) || { code: -1, msg: 'Electron API not available', data: null }
}

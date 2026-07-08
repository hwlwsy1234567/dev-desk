import { ipcMain } from 'electron'
import { DB_CHANNELS } from '../../../../common/ipcChannels'
import { toolHistoryServices } from '../services/toolHistory'

ipcMain.handle(DB_CHANNELS.toolHistory.getList, () => {
  return toolHistoryServices.getList()
})

ipcMain.handle(DB_CHANNELS.toolHistory.add, (_event, arg) => {
  return toolHistoryServices.insertHistory(arg)
})

ipcMain.handle(DB_CHANNELS.toolHistory.deleteById, (_event, { id }) => {
  return toolHistoryServices.deleteById(id)
})

ipcMain.handle(DB_CHANNELS.toolHistory.clear, () => {
  return toolHistoryServices.clear()
})

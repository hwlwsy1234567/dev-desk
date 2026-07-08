export const DB_CHANNELS = {
  user: {
    getList: 'db/user/getList',
    addOrUpdate: 'db/user/addOrUpdate',
    getInfoById: 'db/user/getInfoById',
    deleteById: 'db/user/deleteById'
  },
  toolHistory: {
    getList: 'db/toolHistory/getList',
    add: 'db/toolHistory/add',
    deleteById: 'db/toolHistory/deleteById',
    clear: 'db/toolHistory/clear'
  }
} as const

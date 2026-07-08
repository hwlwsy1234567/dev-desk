export const api = window.electronAPI || {
  queryDB: () => ({ code: -1, message: 'Electron API not available' }),
  logger: {
    info: () => {},
    error: () => {},
    warn: () => {}
  },
  createWindow: () => Promise.resolve(null),
  env: 'development'
}
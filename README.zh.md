# Dev Desk

一个基于 Electron、Vue 3、TypeScript、SQLite、Drizzle 的本地优先开发者工具箱。

这个项目不是后台管理模板，而是一个用于学习 Electron 桌面应用完整链路的开源项目。它会尽量保持代码直接、清楚、可维护，同时覆盖真实桌面应用里常见的主进程、预加载、IPC、本地数据库、日志、打包发布等能力。

## 功能

- JSON 格式化、压缩、校验
- 时间戳转换
- Base64、URL 编解码
- UUID 生成
- SHA 哈希摘要
- JWT Header、Payload 解析
- 正则表达式匹配测试
- SQLite 本地历史记录
- Electron preload + contextBridge + IPC 通信
- electron-builder Windows 打包

## 技术栈

- Electron 34
- electron-vite
- Vue 3
- TypeScript
- Element Plus
- SQLite
- better-sqlite3
- Drizzle ORM
- electron-builder
- electron-log

## 项目结构

```text
assets/                 应用图标和静态资源
common/                 IPC 通道等共享常量
electron/main/          Electron 主进程
electron/preload/       暴露给渲染进程的安全桥接层
electron/main/db/       SQLite schema、service、controller
migrations/             Drizzle 数据库迁移文件
src/                    Vue 渲染进程
src/api/                渲染进程 API 封装
src/layout/             应用外壳布局
src/view/               页面和工具
```

## 本地开发

```bash
npm install
npm run dev
```

如果切换 Electron 或 Node 版本后原生模块报错，可以重新编译 better-sqlite3：

```bash
npx electron-rebuild -f -w better-sqlite3
```

## 打包

```bash
npm run build
```

Windows 安装包会生成在：

```text
release/<version>/
```

## 学习路线

后续适合继续补充：

- 文本 Diff、颜色工具、二维码生成等本地工具
- GitHub Actions 自动打包 Release
- Electron E2E 测试
- 历史记录导入导出
- 基于 GitHub Releases 的自动更新

## License

MIT

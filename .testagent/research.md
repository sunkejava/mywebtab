# 测试研究

## 目标清单

- 自定义股票、基金盯盘配置，默认包含用户指定的 8 只基金。
- 行情文本解析覆盖基金和股票，并能容忍无效响应。
- 快捷方式支持新增、编辑、删除。
- Edge 导出的 Netscape Bookmark HTML 可解析、分类、过滤危险协议并去重导入。

## 现有约定

- 项目使用原生 ES Modules 与 Node `assert/strict` 脚本测试。
- `npm run check` 串行运行各测试脚本与 Manifest/静态资源验证。
- 持久化通过 `chrome.storage.local`，非扩展环境回退至 `localStorage`。

## 目标文件

- `src/market.js`：行情配置、代码归一化、腾讯行情文本解析与请求。
- `src/bookmarks.js`：Edge 收藏夹 HTML 解析、分类与合并。
- `src/app.js` / `newtab.html`：盯盘及快捷方式交互。
- `src/data.js` / `src/storage.js`：默认值与版本迁移。


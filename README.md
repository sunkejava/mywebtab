# MyWebTab

一个适配 Microsoft Edge 与 Google Chrome 的简洁新标签页扩展。默认使用微软必应，内置多种搜索引擎、分类导航、个性化背景以及时钟、日历和天气组件。

## 功能

- 14 个综合及垂直搜索引擎，可在搜索框左侧即时切换
- 常用、开发、设计、AI、影音、办公六个默认板块
- 自定义网站快捷方式、图标文字、颜色与所属板块
- 四套主题、自定义本地背景、模糊度与遮罩调整
- 实时时钟、日期日历、每日短句和免 Key 天气
- 专注模式、配置导入导出、响应式布局
- 所有用户配置仅保存在浏览器本地

详细规划见 [产品规划](docs/PRODUCT_PLAN.md)，页面规范见 [设计说明](docs/DESIGN.md)。

## 安装

### Edge

1. 打开 `edge://extensions/`。
2. 开启左侧的“开发人员模式”。
3. 点击“加载解压缩的扩展”，选择本项目根目录。
4. 新建标签页即可使用。

### Chrome

1. 打开 `chrome://extensions/`。
2. 开启右上角的“开发者模式”。
3. 点击“加载已解压的扩展程序”，选择本项目根目录。
4. 新建标签页即可使用。

> 首次点击天气卡片时，浏览器会询问定位权限；拒绝不会影响其他功能。

## 开发与打包

项目使用原生 HTML、CSS 与 ES Modules，无需安装依赖。

```bash
npm run check
npm run package
```

打包产物位于 `dist/mywebtab-v1.0.0.zip`。开发后在扩展管理页点击“重新加载”即可查看修改。

## 目录

```text
assets/          扩展图标
docs/            产品与页面设计说明
scripts/         校验及打包脚本
src/             页面逻辑、样式、默认数据与天气服务
manifest.json    Chromium Manifest V3 配置
newtab.html      新标签页入口
```

## 隐私

MyWebTab 不收集或上传用户数据。背景图片、快捷方式和设置保存在浏览器本地；天气功能仅在用户主动授权后将经纬度发送给 Open-Meteo 以获取天气数据。

## License

[MIT](LICENSE)

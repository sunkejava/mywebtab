import { readFile, access } from "node:fs/promises";
import { execFileSync } from "node:child_process";

const manifest = JSON.parse(await readFile("manifest.json", "utf8"));
if (manifest.manifest_version !== 3) throw new Error("必须使用 Manifest V3");
if (!manifest.chrome_url_overrides?.newtab) throw new Error("缺少新标签页入口");

const required = [manifest.chrome_url_overrides.newtab, ...Object.values(manifest.icons), "tools.html", "src/app.js", "src/data.js", "src/storage.js", "src/weather.js", "src/wallpapers.js", "src/commands.js", "src/tools.js", "src/styles.css", "src/styles-extra.css", "src/tools.css", "src/tools-extra.css", "src/tools-v22.css"];
await Promise.all(required.map((path) => access(path)));
for (const file of required.filter((path) => path.endsWith(".js"))) execFileSync(process.execPath, ["--check", file], { stdio: "inherit" });

const html = await readFile(manifest.chrome_url_overrides.newtab, "utf8");
if (!html.includes('src/app.js')) throw new Error("页面未引用应用入口");
const toolsHtml = await readFile("tools.html", "utf8");
if (!toolsHtml.includes('src/tools.js')) throw new Error("工具页未引用应用入口");
const navTools = [...toolsHtml.matchAll(/data-tool="([^"]+)"/g)].map(match => match[1]);
const panels = new Set([...toolsHtml.matchAll(/data-panel="([^"]+)"/g)].map(match => match[1]));
for (const tool of navTools) if (!panels.has(tool)) throw new Error(`工具 ${tool} 缺少对应面板`);
const { WALLPAPERS, DEFAULT_LINKS } = await import("../src/data.js");
if (WALLPAPERS.length < 24 || new Set(WALLPAPERS.map(item => item.category)).size < 6) throw new Error("壁纸数量或分类不足");
const { WALLPAPER_SOURCES, map360Wallpapers, searchWallpapers } = await import("../src/wallpapers.js");
if (typeof searchWallpapers !== "function" || WALLPAPER_SOURCES.filter(source => source.id.startsWith("360-")).length < 7) throw new Error("大陆壁纸源或关键词搜索未正确配置");
if (WALLPAPER_SOURCES.some(source => /wallhaven|picsum/i.test(source.id))) throw new Error("仍包含需境外网络访问的壁纸源");
const wallpaperFixture = map360Wallpapers({ data: [{ id: 1, utag: "测试壁纸", url: "http://p0.qhimg.com/example.jpg", url_thumb: "http://p1.qhimg.com/thumb.jpg" }] });
if (wallpaperFixture[0]?.url !== "https://p0.qhimg.com/example.jpg" || wallpaperFixture[0]?.thumbnail !== "https://p1.qhimg.com/thumb.jpg") throw new Error("360 壁纸地址 HTTPS 转换失败");
for (const category of ["shopping", "blog", "dev", "ai"]) if (DEFAULT_LINKS.filter(link => link.category === category).length < 10) throw new Error(`${category} 默认网站不足`);
const { COMMAND_CATALOG } = await import("../src/commands.js");
for (const shell of ["linux", "powershell", "cmd"]) if (COMMAND_CATALOG.filter(item => item[0] === shell).length < 25) throw new Error(`${shell} 命令数量不足`);
if (/https?:\/\/[^"']+\.js/.test(html)) throw new Error("扩展不能引用远程脚本");
console.log(`✓ Manifest V${manifest.manifest_version} 有效`);
console.log(`✓ ${required.length} 个必要文件存在`);
console.log("✓ JavaScript 语法与扩展 CSP 基础检查通过");
console.log(`✓ ${navTools.length} 个工具面板、${WALLPAPERS.length} 张分类壁纸检查通过`);
console.log(`✓ ${WALLPAPER_SOURCES.length} 个大陆可用壁纸入口及关键词搜索检查通过`);
console.log(`✓ ${COMMAND_CATALOG.length} 条跨平台命令及博客分类检查通过`);

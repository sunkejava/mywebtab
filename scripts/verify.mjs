import { readFile, access } from "node:fs/promises";
import { execFileSync } from "node:child_process";

const manifest = JSON.parse(await readFile("manifest.json", "utf8"));
if (manifest.manifest_version !== 3) throw new Error("必须使用 Manifest V3");
if (!manifest.chrome_url_overrides?.newtab) throw new Error("缺少新标签页入口");

const required = [manifest.chrome_url_overrides.newtab, ...Object.values(manifest.icons), "src/app.js", "src/data.js", "src/storage.js", "src/weather.js", "src/styles.css"];
await Promise.all(required.map((path) => access(path)));
for (const file of required.filter((path) => path.endsWith(".js"))) execFileSync(process.execPath, ["--check", file], { stdio: "inherit" });

const html = await readFile(manifest.chrome_url_overrides.newtab, "utf8");
if (!html.includes('src/app.js')) throw new Error("页面未引用应用入口");
if (/https?:\/\/[^"']+\.js/.test(html)) throw new Error("扩展不能引用远程脚本");
console.log(`✓ Manifest V${manifest.manifest_version} 有效`);
console.log(`✓ ${required.length} 个必要文件存在`);
console.log("✓ JavaScript 语法与扩展 CSP 基础检查通过");

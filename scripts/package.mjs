import { mkdir, rm, cp } from "node:fs/promises";
import { execFileSync } from "node:child_process";

await rm("dist", { recursive: true, force: true });
await mkdir("dist/mywebtab", { recursive: true });
for (const item of ["manifest.json", "newtab.html", "tools.html", "src", "assets", "README.md", "LICENSE"]) await cp(item, `dist/mywebtab/${item}`, { recursive: true });
execFileSync("zip", ["-qr", "mywebtab-v2.3.0.zip", "mywebtab"], { cwd: "dist" });
console.log("✓ 已生成 dist/mywebtab-v2.3.0.zip");

const CATEGORY_RULES = [
  ["shopping", /购物|商城|电商|shop|淘宝|京东/i], ["blog", /博客|blog|技术文章|阅读/i],
  ["dev", /开发|编程|代码|developer|github|gitlab|stack|npm|nuget/i], ["design", /设计|素材|design|figma|icon/i],
  ["ai", /人工智能|(^|\W)ai(\W|$)|chatgpt|模型/i], ["media", /影音|视频|音乐|media|video|music/i],
  ["office", /办公|工作|office|文档/i]
];

const decodeHtml = value => String(value || "")
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
  .replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&#39;", "'").replaceAll("&lt;", "<").replaceAll("&gt;", ">");

export function inferBookmarkCategory(folder, name, url) {
  const source = `${folder} ${name} ${url}`;
  return CATEGORY_RULES.find(([, pattern]) => pattern.test(source))?.[0] || "common";
}

function folderCategory(path) {
  let hash = 2166136261;
  for (const char of path) { hash ^= char.codePointAt(0); hash = Math.imul(hash, 16777619); }
  return { id: `folder-${(hash >>> 0).toString(36)}`, name: path, path };
}

export function extractBookmarkCategories(links) {
  const categories = new Map();
  for (const link of links) if (link.categoryMeta) categories.set(link.categoryMeta.id, link.categoryMeta);
  return [...categories.values()];
}

export function parseBookmarksHtml(html) {
  const tokens = String(html).match(/<H3\b[^>]*>[\s\S]*?<\/H3>|<A\b[^>]*>[\s\S]*?<\/A>|<DL\b[^>]*>|<\/DL>/gi) || [];
  const folders = [];
  let pendingFolder = "";
  const links = [];
  for (const token of tokens) {
    if (/^<H3/i.test(token)) { pendingFolder = decodeHtml(token.replace(/^<H3\b[^>]*>|<\/H3>$/gi, "").replace(/<[^>]+>/g, "")).trim(); continue; }
    if (/^<DL/i.test(token)) { if (pendingFolder) folders.push(pendingFolder); pendingFolder = ""; continue; }
    if (/^<\/DL/i.test(token)) { folders.pop(); continue; }
    const href = decodeHtml(token.match(/\bHREF\s*=\s*["']([^"']+)["']/i)?.[1] || "").trim();
    let parsed;
    try { parsed = new URL(href); } catch { continue; }
    if (!["http:", "https:"].includes(parsed.protocol)) continue;
    const name = decodeHtml(token.replace(/^<A\b[^>]*>|<\/A>$/gi, "").replace(/<[^>]+>/g, "")).trim() || parsed.hostname;
    const folderPath = folders.join(" / ");
    const categoryMeta = folderPath ? folderCategory(folderPath) : null;
    links.push({ id: `bookmark-${links.length}-${Date.now()}`, name: name.slice(0, 40), url: parsed.href, category: categoryMeta?.id || inferBookmarkCategory("", name, parsed.href), categoryMeta, icon: name.slice(0, 2), color: "#4f7cff" });
  }
  return links;
}

export function mergeBookmarkLinks(existing, imported) {
  const urls = new Set(existing.map(item => item.url.replace(/\/$/, "").toLowerCase()));
  const added = imported.filter(item => {
    const key = item.url.replace(/\/$/, "").toLowerCase();
    if (urls.has(key)) return false;
    urls.add(key);
    return true;
  });
  return { links: [...existing, ...added], added };
}

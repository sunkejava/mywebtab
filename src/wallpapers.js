const BIRD_API = "http://wp.birdpaper.com.cn/intf";
const BING_CN = "https://cn.bing.com";
const HAO_WALLPAPER = "https://haowallpaper.com";
const secureUrl = (value = "") => String(value).replace(/^http:/i, "https:");

export function mapBirdCategories(payload) {
  return (payload?.data || []).map(item => ({
    id: String(item.old_id || ""),
    name: item.show_name || item.category || "其他",
    fullName: item.category || item.show_name || "其他",
    tags: (item.hot_tag || []).map(tag => tag.show_tag || tag.tag).filter(Boolean)
  })).filter(item => item.id);
}

export function mapBirdWallpapers(payload) {
  const data = payload?.data || {};
  const items = (data.list || []).map((item, index) => {
    const url = secureUrl(item.url);
    if (!url) return null;
    const tags = String(item.tag || "").split(",").filter(Boolean);
    return {
      id: `bird-${item.id || index}`,
      name: tags[0] || item.category || item.author || "小鸟壁纸",
      thumbnail: url,
      url,
      source: item.category ? `小鸟 · ${item.category}` : "小鸟壁纸",
      tags
    };
  }).filter(Boolean);
  return {
    items,
    page: Number(data.pageno) || 1,
    totalPage: Number(data.total_page) || 1,
    totalCount: Number(data.total_count) || items.length
  };
}

async function requestBird(path, params = {}) {
  const response = await fetch(`${BIRD_API}/${path}?${new URLSearchParams(params)}`);
  if (!response.ok) throw new Error("小鸟壁纸接口暂时无法访问，请稍后重试");
  const payload = await response.json();
  if (payload?.errno !== 0) throw new Error(payload?.msg || "小鸟壁纸接口返回异常");
  return payload;
}

export async function getBirdCategories() {
  return mapBirdCategories(await requestBird("getCategory"));
}

export function buildBirdRequest({ mode = "latest", categoryId = "", keyword = "", page = 1, count = 24 } = {}) {
  let path = "newestList";
  let params = { pageno: String(page), count: String(count) };
  if (mode === "category" && categoryId) {
    path = "getListByCategory";
    params = { cids: String(categoryId), ...params };
  } else if (mode === "search" && keyword.trim()) {
    path = "search";
    params = { content: keyword.trim(), ...params };
  }
  return { path, params };
}

export async function loadBirdWallpapers(options = {}) {
  const { path, params } = buildBirdRequest(options);
  const result = mapBirdWallpapers(await requestBird(path, params));
  if (!result.items.length) throw new Error("没有找到相关壁纸，换个分类或关键词试试");
  return result;
}

export const searchWallpapers = (keyword, page = 1) => loadBirdWallpapers({ mode: "search", keyword, page });

async function bingChina() {
  const response = await fetch(`${BING_CN}/HPImageArchive.aspx?format=js&idx=0&n=8&mkt=zh-CN`);
  if (!response.ok) throw new Error("必应中国壁纸源暂时无法访问，请稍后重试");
  const payload = await response.json();
  return (payload.images || []).map((item, index) => {
    const url = item.url?.startsWith("http") ? item.url : `${BING_CN}${item.url}`;
    return { id: `bing-cn-${item.startdate || index}`, name: item.title || item.copyright?.split("(")[0]?.trim() || "必应每日壁纸", thumbnail: url, url, source: "必应中国" };
  });
}

const decodeHtml = (value = "") => value.replaceAll("&quot;", '"').replaceAll("&#39;", "'").replaceAll("&amp;", "&").replaceAll("&lt;", "<").replaceAll("&gt;", ">");

export function parseHaoWallpaperHtml(html) {
  const items = [];
  for (const tag of String(html).match(/<img\b[^>]*>/gi) || []) {
    const src = tag.match(/\bsrc=["']([^"']+)["']/i)?.[1];
    if (!src?.includes("/link/common/file/getCroppingImg/")) continue;
    const alt = decodeHtml(tag.match(/\balt=["']([^"']*)["']/i)?.[1] || "哲风壁纸");
    const url = new URL(decodeHtml(src), HAO_WALLPAPER).href;
    items.push({ id: `hao-${url.split("/").pop()}`, name: alt, thumbnail: url, url, source: "哲风壁纸" });
  }
  return items.slice(0, 24);
}

export const HAO_CATEGORIES = ["全部", "自然风景", "动漫", "美女", "明星", "游戏", "汽车", "简约", "科幻", "城市"];

export function buildHaoWallpaperUrl({ page = 1, keyword = "", category = "全部" } = {}) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  const search = keyword.trim() || (category !== "全部" ? category : "");
  if (search) params.set("search", search);
  const query = params.toString();
  return `${HAO_WALLPAPER}/homeView${query ? `?${query}` : ""}`;
}

export function parseHaoWallpaperPage(html, page = 1) {
  const items = parseHaoWallpaperHtml(html);
  const pagerHtml = String(html).slice(Math.max(0, String(html).indexOf('class="page-content"')), String(html).indexOf('class="page-content"') + 5000);
  const pages = [...pagerHtml.matchAll(/>(\d+)<\/a>/gi)].map(match => Number(match[1]));
  const totalPage = Math.max(page, ...pages.filter(Number.isFinite));
  return { items, page, totalPage, totalCount: totalPage * 12 };
}

export async function loadHaoWallpapers(options = {}) {
  const page = Math.max(1, Number(options.page) || 1);
  const response = await fetch(buildHaoWallpaperUrl({ ...options, page }));
  if (!response.ok) throw new Error("哲风壁纸源暂时无法访问，请稍后重试");
  const result = parseHaoWallpaperPage(await response.text(), page);
  const items = result.items;
  if (!items.length) throw new Error("哲风壁纸页面暂未返回可用图片");
  return result;
}

export const WALLPAPER_SOURCES = [
  { id: "curated", name: "内置精选", local: true },
  { id: "bird", name: "小鸟最新", bird: true, load: () => loadBirdWallpapers() },
  { id: "bing-cn", name: "必应中国", load: bingChina },
  { id: "hao-wallpaper", name: "哲风壁纸", hao: true, load: loadHaoWallpapers }
];

const BIRD_API = "http://wp.birdpaper.com.cn/intf";
const BING_CN = "https://cn.bing.com";
const TIMELINE_API = "https://api.nguaduot.cn/snake/v4";
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

export function mapTimelineWallpapers(payload) {
  return (payload?.data || []).map((item, index) => {
    const url = secureUrl(item.imgurl);
    if (!url) return null;
    const topics = String(item.topic || "").split(",").filter(Boolean);
    return {
      id: `timeline-${item.id || item.no || index}`,
      name: item.title || topics[0] || item.copyright || "拾光壁纸",
      thumbnail: secureUrl(item.thumburl || url),
      url,
      source: "拾光壁纸"
    };
  }).filter(Boolean).slice(0, 24);
}

async function timelineGallery() {
  const deviceId = crypto.randomUUID().replaceAll("-", "");
  const params = new URLSearchParams({ order: "date", seed: String(Date.now()), no: "", id: "", catehow: "", catewhat: "" });
  const response = await fetch(`${TIMELINE_API}?${params}`, { headers: { "Timeline-Client": "timelineweb", "Timeline-Device": deviceId } });
  if (!response.ok) throw new Error("拾光壁纸源暂时无法访问，请稍后重试");
  const payload = await response.json();
  const items = mapTimelineWallpapers(payload);
  if (payload?.status !== 1 || !items.length) throw new Error(payload?.msg || "拾光壁纸暂无可用内容");
  return items;
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

async function haoWallpaperGallery() {
  const firstPage = 1 + Math.floor(Math.random() * 50);
  const responses = await Promise.all(Array.from({ length: 4 }, (_, index) => fetch(`${HAO_WALLPAPER}/homeView?page=${firstPage + index}`)));
  if (responses.some(response => !response.ok)) throw new Error("哲风壁纸源暂时无法访问，请稍后重试");
  const items = parseHaoWallpaperHtml((await Promise.all(responses.map(response => response.text()))).join("\n"));
  if (!items.length) throw new Error("哲风壁纸页面暂未返回可用图片");
  return items;
}

export const WALLPAPER_SOURCES = [
  { id: "curated", name: "内置精选", local: true },
  { id: "bird", name: "小鸟最新", bird: true, load: () => loadBirdWallpapers() },
  { id: "bing-cn", name: "必应中国", load: bingChina },
  { id: "timeline", name: "拾光壁纸", load: timelineGallery },
  { id: "hao-wallpaper", name: "哲风壁纸", load: haoWallpaperGallery }
];

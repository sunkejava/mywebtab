const API_360 = "https://wallpaper.apc.360.cn/index.php";
const BING_CN = "https://cn.bing.com";
const secureUrl = (value = "") => String(value).replace(/^http:/i, "https:");

export function map360Wallpapers(payload) {
  const rows = Array.isArray(payload) ? payload : payload?.data || payload?.list || [];
  return rows.map((item, index) => {
    const url = secureUrl(item.url || item.img || item.url_mid || item.url_mobile || item.download_url);
    const thumbnail = secureUrl(item.url_thumb || item.thumb || item.preview || item.url_mid || url);
    if (!url) return null;
    return {
      id: `360-${item.id || item.pid || index}`,
      name: item.utag || item.tag || item.title || item.name || "360 壁纸",
      thumbnail,
      url,
      source: "360 壁纸"
    };
  }).filter(Boolean).slice(0, 24);
}

async function fetch360(params) {
  const response = await fetch(`${API_360}?${new URLSearchParams(params)}`);
  if (!response.ok) throw new Error("360 壁纸源暂时无法访问，请稍后重试");
  const items = map360Wallpapers(await response.json());
  if (!items.length) throw new Error("没有找到相关壁纸，换个关键词试试");
  return items;
}

export const searchWallpapers = (keyword) => fetch360({ c: "WallPaper", a: "search", kw: keyword.trim(), start: "0", count: "24" });
const category360 = (cid) => fetch360({ c: "WallPaper", a: "getAppsByCategory", cid: String(cid), start: "0", count: "24", from: "360chrome" });

async function bingChina() {
  const response = await fetch(`${BING_CN}/HPImageArchive.aspx?format=js&idx=0&n=8&mkt=zh-CN`);
  if (!response.ok) throw new Error("必应中国壁纸源暂时无法访问，请稍后重试");
  const payload = await response.json();
  return (payload.images || []).map((item, index) => {
    const url = item.url?.startsWith("http") ? item.url : `${BING_CN}${item.url}`;
    return { id: `bing-cn-${item.startdate || index}`, name: item.title || item.copyright?.split("(")[0]?.trim() || "必应每日壁纸", thumbnail: url, url, source: "必应中国" };
  });
}

export const WALLPAPER_SOURCES = [
  { id: "curated", name: "内置精选", local: true },
  { id: "360-featured", name: "360 精选", load: () => category360(36) },
  { id: "360-landscape", name: "自然风景", load: () => category360(9) },
  { id: "360-anime", name: "动漫", load: () => category360(26) },
  { id: "360-celebrity", name: "明星", load: () => category360(11) },
  { id: "360-portrait", name: "人像", load: () => category360(6) },
  { id: "360-pets", name: "萌宠", load: () => category360(14) },
  { id: "360-fresh", name: "小清新", load: () => category360(15) },
  { id: "bing-cn", name: "必应中国", load: bingChina }
];

const wallhaven = async (query, categories = "100") => {
  const response = await fetch(`https://wallhaven.cc/api/v1/search?q=${encodeURIComponent(query)}&categories=${categories}&purity=100&sorting=random&atleast=1920x1080&ratios=landscape`);
  if (!response.ok) throw new Error("Wallhaven 壁纸源暂不可用");
  const json = await response.json();
  return json.data.slice(0, 16).map(item => ({ id: `wallhaven-${item.id}`, name: item.id, thumbnail: item.thumbs.small, url: item.path, source: "Wallhaven" }));
};

export const WALLPAPER_SOURCES = [
  { id: "curated", name: "精选", local: true },
  { id: "wallhaven", name: "Wallhaven", load: () => wallhaven("", "100") },
  { id: "anime", name: "动漫", load: () => wallhaven("anime", "010") },
  { id: "celebrity", name: "明星", load: () => wallhaven("celebrity", "001") },
  { id: "portrait", name: "人像", load: () => wallhaven("portrait", "001") },
  { id: "bing", name: "必应每日", load: async () => (await Promise.all(Array.from({ length: 8 }, async (_, index) => {
    const response = await fetch(`https://bing.biturl.top/?resolution=UHD&format=json&index=${index}&mkt=zh-CN`);
    if (!response.ok) return null;
    const item = await response.json();
    return { id: `bing-${item.start_date || index}`, name: item.copyright?.split("(")[0] || "必应壁纸", thumbnail: item.url, url: item.url, source: "Bing" };
  }))).filter(Boolean) },
  { id: "picsum", name: "摄影随机", load: async () => {
    const response = await fetch(`https://picsum.photos/v2/list?page=${1 + Math.floor(Math.random() * 30)}&limit=16`);
    if (!response.ok) throw new Error("Picsum 壁纸源暂不可用");
    return (await response.json()).map(item => ({ id: `picsum-${item.id}`, name: item.author, thumbnail: `https://picsum.photos/id/${item.id}/400/240`, url: `https://picsum.photos/id/${item.id}/2400/1400`, source: "Picsum" }));
  }}
];

export const SEARCH_ENGINES = [
  { id: "bing", name: "必应", mark: "必", url: "https://www.bing.com/search?q=%s" },
  { id: "google", name: "Google", mark: "G", url: "https://www.google.com/search?q=%s" },
  { id: "baidu", name: "百度", mark: "百", url: "https://www.baidu.com/s?wd=%s" },
  { id: "duckduckgo", name: "DuckDuckGo", mark: "D", url: "https://duckduckgo.com/?q=%s" },
  { id: "sogou", name: "搜狗", mark: "搜", url: "https://www.sogou.com/web?query=%s" },
  { id: "360", name: "360 搜索", mark: "360", url: "https://www.so.com/s?q=%s" },
  { id: "yandex", name: "Yandex", mark: "Y", url: "https://yandex.com/search/?text=%s" },
  { id: "brave", name: "Brave", mark: "B", url: "https://search.brave.com/search?q=%s" },
  { id: "github", name: "GitHub", mark: "GH", url: "https://github.com/search?q=%s" },
  { id: "bilibili", name: "哔哩哔哩", mark: "B站", url: "https://search.bilibili.com/all?keyword=%s" },
  { id: "zhihu", name: "知乎", mark: "知", url: "https://www.zhihu.com/search?q=%s" },
  { id: "youtube", name: "YouTube", mark: "YT", url: "https://www.youtube.com/results?search_query=%s" },
  { id: "npm", name: "npm", mark: "npm", url: "https://www.npmjs.com/search?q=%s" },
  { id: "mdn", name: "MDN", mark: "MDN", url: "https://developer.mozilla.org/zh-CN/search?q=%s" }
];

export const CATEGORIES = [
  { id: "common", name: "常用" }, { id: "dev", name: "开发" }, { id: "design", name: "设计" },
  { id: "ai", name: "AI" }, { id: "media", name: "影音" }, { id: "office", name: "办公" }
];

export const DEFAULT_LINKS = [
  ["common", "必应", "https://www.bing.com", "B", "#20a4f3"], ["common", "GitHub", "https://github.com", "GH", "#151b26"],
  ["common", "哔哩哔哩", "https://www.bilibili.com", "B", "#fb7299"], ["common", "知乎", "https://www.zhihu.com", "知", "#1677ff"],
  ["common", "豆瓣", "https://www.douban.com", "豆", "#2e963d"], ["common", "少数派", "https://sspai.com", "派", "#e94b35"],
  ["dev", "GitHub", "https://github.com", "GH", "#151b26"], ["dev", "Stack Overflow", "https://stackoverflow.com", "SO", "#f48024"],
  ["dev", "MDN", "https://developer.mozilla.org/zh-CN", "MDN", "#111827"], ["dev", "掘金", "https://juejin.cn", "掘", "#1e80ff"],
  ["dev", "V2EX", "https://www.v2ex.com", "V2", "#334155"], ["dev", "Can I use", "https://caniuse.com", "CI", "#d25b34"],
  ["design", "Figma", "https://www.figma.com", "F", "#a259ff"], ["design", "Dribbble", "https://dribbble.com", "Dr", "#ea4c89"],
  ["design", "Behance", "https://www.behance.net", "Be", "#1769ff"], ["design", "花瓣", "https://huaban.com", "花", "#e34b4b"],
  ["design", "Iconfont", "https://www.iconfont.cn", "Icon", "#6b57ff"], ["design", "Coolors", "https://coolors.co", "Co", "#f7b32b"],
  ["ai", "ChatGPT", "https://chatgpt.com", "AI", "#10a37f"], ["ai", "Claude", "https://claude.ai", "C", "#c96f4b"],
  ["ai", "Gemini", "https://gemini.google.com", "G", "#4285f4"], ["ai", "Hugging Face", "https://huggingface.co", "HF", "#f4c430"],
  ["ai", "DeepSeek", "https://chat.deepseek.com", "DS", "#4d6bfe"], ["ai", "通义千问", "https://tongyi.aliyun.com", "Q", "#6f42f5"],
  ["media", "哔哩哔哩", "https://www.bilibili.com", "B", "#fb7299"], ["media", "YouTube", "https://www.youtube.com", "YT", "#ff0033"],
  ["media", "网易云音乐", "https://music.163.com", "云", "#e60026"], ["media", "腾讯视频", "https://v.qq.com", "V", "#22b14c"],
  ["media", "爱奇艺", "https://www.iqiyi.com", "iQ", "#00be06"], ["media", "抖音", "https://www.douyin.com", "抖", "#161823"],
  ["office", "Microsoft 365", "https://www.microsoft365.com", "M", "#d83b01"], ["office", "腾讯文档", "https://docs.qq.com", "T", "#1e6fff"],
  ["office", "金山文档", "https://www.kdocs.cn", "W", "#356bf6"], ["office", "语雀", "https://www.yuque.com", "语", "#00b96b"],
  ["office", "飞书", "https://www.feishu.cn", "飞", "#3370ff"], ["office", "Notion", "https://www.notion.so", "N", "#111111"]
].map(([category, name, url, icon, color], index) => ({ id: `default-${index}`, category, name, url, icon, color }));

export const THEMES = [
  { id: "aurora", name: "极光", background: "radial-gradient(circle at 18% 15%, #6e65ff 0, transparent 30%), radial-gradient(circle at 80% 12%, #15b8a6 0, transparent 28%), linear-gradient(135deg, #101429, #213b52 55%, #101827)" },
  { id: "sunset", name: "落日", background: "radial-gradient(circle at 75% 20%, #ffbc80 0, transparent 28%), linear-gradient(145deg, #502c68, #c55c5c 52%, #ef9b65)" },
  { id: "forest", name: "森林", background: "radial-gradient(circle at 70% 15%, #60c6a7 0, transparent 30%), linear-gradient(145deg, #102b2a, #1f574a 55%, #142d34)" },
  { id: "ink", name: "墨夜", background: "radial-gradient(circle at 20% 10%, #465266 0, transparent 30%), linear-gradient(145deg, #0b0d12, #252c3a 60%, #11131a)" }
];

export const WALLPAPERS = [
  ["mountain", "雪山晨光", "自然", "photo-1500530855697-b586d89ba3ee"],
  ["lake", "静谧湖泊", "自然", "photo-1470770841072-f978cf4d019e"],
  ["ocean", "蓝色海岸", "海洋", "photo-1507525428034-b723cf961d3e"],
  ["forest", "雾中森林", "自然", "photo-1448375240586-882707db888b"],
  ["city", "城市之夜", "城市", "photo-1519501025264-65ba15a82390"],
  ["desk", "极简桌面", "工作", "photo-1497215728101-856f4ea42174"],
  ["desert", "沙漠曲线", "自然", "photo-1509316785289-025f5b846b35"],
  ["aurora", "绚丽极光", "自然", "photo-1483347756197-71ef80e95f73"]
].map(([id,name,category,photo])=>({id,name,category,thumbnail:`https://images.unsplash.com/${photo}?auto=format&fit=crop&w=500&q=72`,url:`https://images.unsplash.com/${photo}?auto=format&fit=crop&w=2400&q=88`}));

export const DEFAULT_SETTINGS = { engine: "bing", category: "common", theme: "aurora", colorMode: "dark", openMode: "new", wallpaper: "", customBackground: "", blur: 18, shade: 36, links: DEFAULT_LINKS, weather: null };

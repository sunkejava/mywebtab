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
  , { id: "shopping", name: "购物" }, { id: "blog", name: "博客" }
];

export const DEFAULT_LINKS = [
  ["common", "必应", "https://www.bing.com", "B", "#20a4f3"], ["common", "GitHub", "https://github.com", "GH", "#151b26"],
  ["common", "哔哩哔哩", "https://www.bilibili.com", "B", "#fb7299"], ["common", "知乎", "https://www.zhihu.com", "知", "#1677ff"],
  ["common", "豆瓣", "https://www.douban.com", "豆", "#2e963d"], ["common", "少数派", "https://sspai.com", "派", "#e94b35"],
  ["dev", "GitHub", "https://github.com", "GH", "#151b26"], ["dev", "Stack Overflow", "https://stackoverflow.com", "SO", "#f48024"],
  ["dev", "MDN", "https://developer.mozilla.org/zh-CN", "MDN", "#111827"], ["dev", "掘金", "https://juejin.cn", "掘", "#1e80ff"],
  ["dev", "V2EX", "https://www.v2ex.com", "V2", "#334155"], ["dev", "Can I use", "https://caniuse.com", "CI", "#d25b34"],
  ["dev", "GitLab", "https://gitlab.com", "GL", "#fc6d26"], ["dev", "CodePen", "https://codepen.io", "CP", "#111827"],
  ["dev", "npm", "https://www.npmjs.com", "npm", "#cb3837"], ["dev", "NuGet", "https://www.nuget.org", "N", "#004880"],
  ["dev", "Docker Hub", "https://hub.docker.com", "D", "#2496ed"], ["dev", "Microsoft Learn", "https://learn.microsoft.com/zh-cn", "MS", "#5e5e5e"],
  ["dev", "Cloudflare", "https://dash.cloudflare.com", "CF", "#f48120"], ["dev", "LeetCode", "https://leetcode.cn", "LC", "#ffa116"],
  ["dev", "JetBrains", "https://www.jetbrains.com", "JB", "#7f52ff"], ["dev", "VS Code", "https://code.visualstudio.com", "VS", "#007acc"],
  ["design", "Figma", "https://www.figma.com", "F", "#a259ff"], ["design", "Dribbble", "https://dribbble.com", "Dr", "#ea4c89"],
  ["design", "Behance", "https://www.behance.net", "Be", "#1769ff"], ["design", "花瓣", "https://huaban.com", "花", "#e34b4b"],
  ["design", "Iconfont", "https://www.iconfont.cn", "Icon", "#6b57ff"], ["design", "Coolors", "https://coolors.co", "Co", "#f7b32b"],
  ["ai", "ChatGPT", "https://chatgpt.com", "AI", "#10a37f"], ["ai", "Claude", "https://claude.ai", "C", "#c96f4b"],
  ["ai", "Gemini", "https://gemini.google.com", "G", "#4285f4"], ["ai", "Hugging Face", "https://huggingface.co", "HF", "#f4c430"],
  ["ai", "DeepSeek", "https://chat.deepseek.com", "DS", "#4d6bfe"], ["ai", "通义千问", "https://tongyi.aliyun.com", "Q", "#6f42f5"],
  ["ai", "Microsoft Copilot", "https://copilot.microsoft.com", "Co", "#1677ff"], ["ai", "Perplexity", "https://www.perplexity.ai", "P", "#20808d"],
  ["ai", "Grok", "https://grok.com", "G", "#111111"], ["ai", "豆包", "https://www.doubao.com", "豆", "#2f6bff"],
  ["ai", "Kimi", "https://www.kimi.com", "K", "#111827"], ["ai", "腾讯元宝", "https://yuanbao.tencent.com", "元", "#14b866"],
  ["ai", "Cursor", "https://www.cursor.com", "Cu", "#111111"], ["ai", "Windsurf", "https://windsurf.com", "W", "#08b6a0"],
  ["ai", "GitHub Copilot", "https://github.com/features/copilot", "GC", "#151b26"], ["ai", "Replit", "https://replit.com", "R", "#f26207"],
  ["ai", "Midjourney", "https://www.midjourney.com", "MJ", "#111111"], ["ai", "Suno", "https://suno.com", "S", "#793cff"],
  ["ai", "Runway", "https://runwayml.com", "R", "#111111"], ["ai", "硅基流动", "https://siliconflow.cn", "SF", "#665bff"],
  ["media", "哔哩哔哩", "https://www.bilibili.com", "B", "#fb7299"], ["media", "YouTube", "https://www.youtube.com", "YT", "#ff0033"],
  ["media", "网易云音乐", "https://music.163.com", "云", "#e60026"], ["media", "腾讯视频", "https://v.qq.com", "V", "#22b14c"],
  ["media", "爱奇艺", "https://www.iqiyi.com", "iQ", "#00be06"], ["media", "抖音", "https://www.douyin.com", "抖", "#161823"],
  ["office", "Microsoft 365", "https://www.microsoft365.com", "M", "#d83b01"], ["office", "腾讯文档", "https://docs.qq.com", "T", "#1e6fff"],
  ["office", "金山文档", "https://www.kdocs.cn", "W", "#356bf6"], ["office", "语雀", "https://www.yuque.com", "语", "#00b96b"],
  ["office", "飞书", "https://www.feishu.cn", "飞", "#3370ff"], ["office", "Notion", "https://www.notion.so", "N", "#111111"],
  ["shopping", "淘宝", "https://www.taobao.com", "淘", "#ff5000"], ["shopping", "京东", "https://www.jd.com", "京", "#e1251b"],
  ["shopping", "天猫", "https://www.tmall.com", "猫", "#ff0036"], ["shopping", "拼多多", "https://www.pinduoduo.com", "拼", "#e02e24"],
  ["shopping", "苏宁易购", "https://www.suning.com", "苏", "#ffb400"], ["shopping", "唯品会", "https://www.vip.com", "唯", "#d7217b"],
  ["shopping", "Amazon", "https://www.amazon.com", "A", "#ff9900"], ["shopping", "闲鱼", "https://www.goofish.com", "闲", "#ffe100"],
  ["shopping", "小米商城", "https://www.mi.com/shop", "Mi", "#ff6900"], ["shopping", "什么值得买", "https://www.smzdm.com", "值", "#e62828"],
  ["blog", "博客园", "https://www.cnblogs.com", "博", "#2b6695"], ["blog", "CSDN", "https://www.csdn.net", "C", "#fc5531"],
  ["blog", "MSDN Archive", "https://learn.microsoft.com/en-us/archive/msdn-magazine/", "MS", "#0078d4"], ["blog", "掘金", "https://juejin.cn", "掘", "#1e80ff"],
  ["blog", "SegmentFault", "https://segmentfault.com", "SF", "#00965e"], ["blog", "开源中国", "https://www.oschina.net/blog", "OS", "#21b351"],
  ["blog", "51CTO博客", "https://blog.51cto.com", "51", "#e95420"], ["blog", "阮一峰博客", "https://www.ruanyifeng.com/blog/", "阮", "#111827"],
  ["blog", "Medium", "https://medium.com", "M", "#111111"], ["blog", "DEV Community", "https://dev.to", "DEV", "#0a0a0a"],
  ["blog", "Hashnode", "https://hashnode.com", "H", "#2962ff"], ["blog", "DZone", "https://dzone.com", "DZ", "#32a852"],
  ["blog", "Smashing Magazine", "https://www.smashingmagazine.com", "SM", "#d33a2c"], ["blog", "CSS-Tricks", "https://css-tricks.com", "CSS", "#111111"]
].map(([category, name, url, icon, color], index) => ({ id: `v3-${index}`, category, name, url, icon, color }));

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
  ["aurora", "绚丽极光", "自然", "photo-1483347756197-71ef80e95f73"],
  ["snow", "皑皑雪原", "自然", "photo-1483664852095-d6cc6870702d"], ["flower", "春日花园", "自然", "photo-1497250681960-ef046c08a56e"],
  ["wave", "深蓝海浪", "海洋", "photo-1455729552865-3658a5d39692"], ["beach", "热带沙滩", "海洋", "photo-1473116763249-2faaef81ccda"],
  ["bridge", "城市桥梁", "城市", "photo-1449824913935-59a10b8d2000"], ["tower", "摩登建筑", "城市", "photo-1486406146926-c627a92ad1ab"],
  ["workspace", "程序员桌面", "工作", "photo-1498050108023-c5249f4df085"], ["keyboard", "机械键盘", "工作", "photo-1516321318423-f06f85e504b3"],
  ["abstract1", "流体彩绘", "抽象", "photo-1557682250-33bd709cbe85"], ["abstract2", "霓虹渐变", "抽象", "photo-1557682224-5b8590cd9ec5"],
  ["space", "浩瀚星空", "宇宙", "photo-1444703686981-a3abbc4d4fe3"], ["moon", "月球之上", "宇宙", "photo-1446941611757-91d2c3bd3d45"],
  ["cat", "慵懒猫咪", "动物", "photo-1518791841217-8f162f1e1131"], ["fox", "雪地狐狸", "动物", "photo-1474511320723-9a56873867b5"],
  ["minimal", "极简空间", "极简", "photo-1494438639946-1ebd1d20bf85"], ["paper", "柔和纸张", "极简", "photo-1497366811353-6870744d04b2"]
].map(([id,name,category,photo])=>({id,name,category,thumbnail:`https://images.unsplash.com/${photo}?auto=format&fit=crop&w=500&q=72`,url:`https://images.unsplash.com/${photo}?auto=format&fit=crop&w=2400&q=88`}));

export const DEFAULT_SETTINGS = { schemaVersion: 4, engine: "bing", category: "common", theme: "aurora", colorMode: "dark", openMode: "new", wallpaper: "", customBackground: "", blur: 18, shade: 36, links: DEFAULT_LINKS, weather: null };

export const DEFAULT_WATCHLIST = [
  ["023638", "国泰电网设备ETF联接A"],
  ["006328", "易方达中概互联ETF联接C"],
  ["010942", "招商瑞乐6个月持有期混合A"],
  ["166002", "中欧新蓝筹灵活配置混合A"],
  ["003949", "兴全稳泰债券A"],
  ["017175", "天弘绿色电力ETF联接C"],
  ["004997", "广发高端制造股票A"],
  ["005693", "广发中证军工ETF联接C"]
].map(([code, name]) => ({ id: `fund-${code}`, type: "fund", code, name }));

export function normalizeMarketItem(item) {
  const type = item?.type === "stock" ? "stock" : "fund";
  const code = String(item?.code || "").trim().toLowerCase().replace(/\s+/g, "");
  const valid = type === "fund" ? /^\d{6}$/.test(code) : /^(?:(?:sh|sz|bj)?)\d{6}$/.test(code);
  if (!valid) return null;
  const plainCode = code.replace(/^(sh|sz|bj)/, "");
  return { id: String(item.id || `${type}-${plainCode}`), type, code, name: String(item.name || plainCode).trim().slice(0, 40) || plainCode };
}

export function toTencentSymbol(item) {
  const normalized = normalizeMarketItem(item);
  if (!normalized) throw new Error("证券代码格式无效");
  if (normalized.type === "fund") return `jj${normalized.code}`;
  if (/^(sh|sz|bj)/.test(normalized.code)) return normalized.code;
  if (/^(4|8|92)/.test(normalized.code)) return `bj${normalized.code}`;
  return /^(5|6|9)/.test(normalized.code) ? `sh${normalized.code}` : `sz${normalized.code}`;
}

export function parseTencentQuote(text, item) {
  const normalized = normalizeMarketItem(item);
  const match = String(text).match(/="([\s\S]*?)"/);
  if (!normalized || !match) throw new Error("行情数据暂不可用");
  const fields = match[1].split("~");
  const fund = normalized.type === "fund";
  const price = Number(fields[fund ? 6 : 3]);
  const changePercent = Number(fields[fund ? 7 : 32]);
  if (!Number.isFinite(price) || !Number.isFinite(changePercent)) throw new Error("行情数据暂不可用");
  return {
    ...normalized,
    name: fields[1] || normalized.name,
    price,
    previousClose: Number(fields[fund ? 5 : 4]) || null,
    changePercent,
    change: fund ? null : Number(fields[31]) || 0,
    time: fields[fund ? 8 : 30] || "",
    estimated: false
  };
}

export async function fetchMarketQuote(item, fetcher = fetch) {
  const symbol = toTencentSymbol(item);
  const response = await fetcher(`https://qt.gtimg.cn/q=${symbol}`, { cache: "no-store" });
  if (!response.ok) throw new Error("行情服务请求失败");
  const buffer = await response.arrayBuffer();
  return parseTencentQuote(new TextDecoder("gbk").decode(buffer), item);
}

export async function fetchWatchlist(items, fetcher = fetch) {
  return Promise.all(items.map(async item => {
    try { return { status: "fulfilled", value: await fetchMarketQuote(item, fetcher) }; }
    catch (error) { return { status: "rejected", item, reason: error.message || "获取失败" }; }
  }));
}


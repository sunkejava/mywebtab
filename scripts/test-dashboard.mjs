import assert from "node:assert/strict";
import { DEFAULT_WATCHLIST, fetchWatchlist, normalizeMarketItem, parseTencentQuote, toTencentSymbol } from "../src/market.js";
import { inferBookmarkCategory, mergeBookmarkLinks, parseBookmarksHtml } from "../src/bookmarks.js";

function defaultWatchlistContainsRequestedEightFunds() {
  assert.deepEqual(DEFAULT_WATCHLIST.map(item => item.code), ["023638", "006328", "010942", "166002", "003949", "017175", "004997", "005693"]);
  assert.deepEqual(DEFAULT_WATCHLIST.map(item => item.name), ["国泰电网设备ETF联接A", "易方达中概互联ETF联接C", "招商瑞乐6个月持有期混合A", "中欧新蓝筹灵活配置混合A", "兴全稳泰债券A", "天弘绿色电力ETF联接C", "广发高端制造股票A", "广发中证军工ETF联接C"]);
  assert.ok(DEFAULT_WATCHLIST.every(item => item.type === "fund"));
}

function marketCodesMapToTencentSymbols() {
  assert.equal(toTencentSymbol({ type: "fund", code: "005693" }), "jj005693");
  assert.equal(toTencentSymbol({ type: "stock", code: "600519" }), "sh600519");
  assert.equal(toTencentSymbol({ type: "stock", code: "000001" }), "sz000001");
  assert.equal(toTencentSymbol({ type: "stock", code: "bj830799" }), "bj830799");
  assert.equal(normalizeMarketItem({ type: "fund", code: "abc" }), null);
}

function fundAndStockQuotesParseIntoUnifiedShape() {
  const fund = parseTencentQuote('v_jj005693="005693~广发中证军工ETF联接C~0.0000~0.0000~~1.1011~1.0814~-1.7927~2026-09-24~";', { type: "fund", code: "005693", name: "军工" });
  assert.deepEqual({ name: fund.name, price: fund.price, changePercent: fund.changePercent, time: fund.time }, { name: "广发中证军工ETF联接C", price: 1.0814, changePercent: -1.7927, time: "2026-09-24" });
  const stockFields = Array(33).fill(""); stockFields[1]="贵州茅台";stockFields[2]="600519";stockFields[3]="1237.00";stockFields[4]="1251.24";stockFields[30]="20260924161444";stockFields[31]="-14.24";stockFields[32]="-1.14";
  const stock = parseTencentQuote(`v_sh600519="${stockFields.join("~")}";`, { type: "stock", code: "600519", name: "茅台" });
  assert.deepEqual({ price: stock.price, previousClose: stock.previousClose, change: stock.change, changePercent: stock.changePercent }, { price: 1237, previousClose: 1251.24, change: -14.24, changePercent: -1.14 });
  assert.throws(() => parseTencentQuote("invalid", { type: "fund", code: "005693" }), /行情数据暂不可用/);
}

function edgeBookmarksImportNestedFoldersAndRejectUnsafeUrls() {
  const html = `<!DOCTYPE NETSCAPE-Bookmark-file-1><DL><DT><H3>开发收藏</H3><DL><DT><A HREF="https://github.com/a?x=1&amp;y=2">GitHub &amp; Docs</A><DT><A HREF="javascript:alert(1)">危险链接</A></DL><DT><H3>购物</H3><DL><DT><A HREF="https://www.jd.com/">京东</A></DL></DL>`;
  const links = parseBookmarksHtml(html);
  assert.equal(links.length, 2);
  assert.deepEqual(links.map(item => [item.name, item.category]), [["GitHub & Docs", "dev"], ["京东", "shopping"]]);
  assert.equal(links[0].url, "https://github.com/a?x=1&y=2");
  assert.equal(inferBookmarkCategory("博客", "文章", "https://example.com"), "blog");
}

function bookmarkMergeKeepsExistingAndDeduplicatesUrls() {
  const existing = [{ id: "1", url: "https://github.com/" }];
  const imported = [{ id: "2", url: "https://github.com" }, { id: "3", url: "https://cnblogs.com/" }];
  const result = mergeBookmarkLinks(existing, imported);
  assert.equal(result.links.length, 2);
  assert.deepEqual(result.added.map(item => item.id), ["3"]);
  assert.equal(result.links[0], existing[0]);
}

async function watchlistRefreshIsolatesIndividualQuoteFailures() {
  const encoder = new TextEncoder();
  const fetcher = async url => url.includes("jj005693")
    ? { ok: true, arrayBuffer: async () => encoder.encode('v_jj005693="005693~Fund~0~0~~1.1011~1.0814~-1.79~2026-09-24~";').buffer }
    : { ok: false, arrayBuffer: async () => new ArrayBuffer(0) };
  const results = await fetchWatchlist([{ type: "fund", code: "005693", name: "军工" }, { type: "stock", code: "600519", name: "茅台" }], fetcher);
  assert.equal(results[0].status, "fulfilled");
  assert.equal(results[0].value.changePercent, -1.79);
  assert.deepEqual({ status: results[1].status, code: results[1].item.code, reason: results[1].reason }, { status: "rejected", code: "600519", reason: "行情服务请求失败" });
}

defaultWatchlistContainsRequestedEightFunds();
marketCodesMapToTencentSymbols();
fundAndStockQuotesParseIntoUnifiedShape();
edgeBookmarksImportNestedFoldersAndRejectUnsafeUrls();
bookmarkMergeKeepsExistingAndDeduplicatesUrls();
await watchlistRefreshIsolatesIndividualQuoteFailures();
console.log("✓ defaultWatchlistContainsRequestedEightFunds 通过");
console.log("✓ marketCodesMapToTencentSymbols 通过");
console.log("✓ fundAndStockQuotesParseIntoUnifiedShape 通过");
console.log("✓ edgeBookmarksImportNestedFoldersAndRejectUnsafeUrls 通过");
console.log("✓ bookmarkMergeKeepsExistingAndDeduplicatesUrls 通过");
console.log("✓ watchlistRefreshIsolatesIndividualQuoteFailures 通过");

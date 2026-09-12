import assert from "node:assert/strict";
import { buildBirdRequest, buildHaoWallpaperUrl, getHaoDisplayUrl, mapBirdCategories, mapBirdWallpapers, parseHaoWallpaperHtml, parseHaoWallpaperPage } from "../src/wallpapers.js";

function birdCategoriesKeepTypeAndHotTags() {
  const categories = mapBirdCategories({ data: [{ old_id: "9", category: "风景大片", show_name: "风景", hot_tag: [{ tag: "城市夜景", show_tag: "城市夜景" }] }] });
  assert.deepEqual(categories[0], { id: "9", name: "风景", fullName: "风景大片", tags: ["城市夜景"] });
}

function birdWallpaperMapsPaginationTagsAndHttpsImage() {
  const result = mapBirdWallpapers({ data: { total_count: 2000, total_page: 84, pageno: 2, list: [{ id: "2066808", category: "风景大片", tag: "奇幻梦境,山峰,星空", url: "http://cdn.example/wallpaper.jpg" }] } });
  assert.equal(result.page, 2);
  assert.equal(result.totalPage, 84);
  assert.equal(result.totalCount, 2000);
  assert.deepEqual(result.items[0], { id: "bird-2066808", name: "奇幻梦境", thumbnail: "https://cdn.example/wallpaper.jpg", url: "https://cdn.example/wallpaper.jpg", source: "小鸟 · 风景大片", tags: ["奇幻梦境", "山峰", "星空"] });
}

function birdCategoryRequestIncludesTypeAndPage() {
  assert.deepEqual(buildBirdRequest({ mode: "category", categoryId: "26", page: 3, count: 24 }), { path: "getListByCategory", params: { cids: "26", pageno: "3", count: "24" } });
}

function birdTagSearchRequestIncludesKeywordAndPage() {
  assert.deepEqual(buildBirdRequest({ mode: "search", keyword: " 城市夜景 ", page: 4 }), { path: "search", params: { content: "城市夜景", pageno: "4", count: "24" } });
}

function birdLatestRequestIncludesPage() {
  assert.deepEqual(buildBirdRequest({ mode: "latest", page: 2 }), { path: "newestList", params: { pageno: "2", count: "24" } });
}

function haoHtmlKeepsOnlyWallpaperCards() {
  const html = '<img src="/favicon.ico"><img src="https://haowallpaper.com/link/common/file/getCroppingImg/123" alt="山川 &amp; 湖泊"><img src="/other.png">';
  const items = parseHaoWallpaperHtml(html);
  assert.equal(items.length, 1);
  assert.deepEqual(items[0], { id: "hao-123", name: "山川 & 湖泊", thumbnail: "https://haowallpaper.com/link/common/file/getCroppingImg/123", url: "https://haowallpaper.com/link/common/file/previewFileImg/123", source: "哲风壁纸" });
  assert.equal(getHaoDisplayUrl("/link/common/file/getCroppingImg/456"), "https://haowallpaper.com/link/common/file/previewFileImg/456");
}

function haoSearchCategoryAndPaginationAreMapped() {
  assert.equal(buildHaoWallpaperUrl({ page: 3, keyword: "动漫" }), "https://haowallpaper.com/homeView?page=3&search=%E5%8A%A8%E6%BC%AB");
  assert.equal(buildHaoWallpaperUrl({ category: "自然风景" }), "https://haowallpaper.com/homeView?search=%E8%87%AA%E7%84%B6%E9%A3%8E%E6%99%AF");
  const html = '<div class="page-content"><a href="/homeView?page=7">7</a><a class="isDefault">4482</a></div><img src="/link/common/file/getCroppingImg/456" alt="风景">';
  const result = parseHaoWallpaperPage(html, 2);
  assert.equal(result.page, 2);
  assert.equal(result.totalPage, 4482);
  assert.equal(result.items.length, 1);
}

birdCategoriesKeepTypeAndHotTags();
birdWallpaperMapsPaginationTagsAndHttpsImage();
birdCategoryRequestIncludesTypeAndPage();
birdTagSearchRequestIncludesKeywordAndPage();
birdLatestRequestIncludesPage();
haoHtmlKeepsOnlyWallpaperCards();
haoSearchCategoryAndPaginationAreMapped();
console.log("✓ birdCategoriesKeepTypeAndHotTags 通过");
console.log("✓ birdWallpaperMapsPaginationTagsAndHttpsImage 通过");
console.log("✓ birdCategoryRequestIncludesTypeAndPage 通过");
console.log("✓ birdTagSearchRequestIncludesKeywordAndPage 通过");
console.log("✓ birdLatestRequestIncludesPage 通过");
console.log("✓ haoHtmlKeepsOnlyWallpaperCards 通过");
console.log("✓ haoSearchCategoryAndPaginationAreMapped 通过");

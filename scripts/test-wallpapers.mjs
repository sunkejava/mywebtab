import assert from "node:assert/strict";
import { mapTimelineWallpapers, parseHaoWallpaperHtml } from "../src/wallpapers.js";

function timelinePayloadMapsOriginalAndThumbnail() {
  const items = mapTimelineWallpapers({ data: [{ id: "abc", title: "晨光", imgurl: "http://img.example/a.jpg", thumburl: "http://img.example/a.webp" }] });
  assert.deepEqual(items[0], { id: "timeline-abc", name: "晨光", url: "https://img.example/a.jpg", thumbnail: "https://img.example/a.webp", source: "拾光壁纸" });
}

function haoHtmlKeepsOnlyWallpaperCards() {
  const html = '<img src="/favicon.ico"><img src="https://haowallpaper.com/link/common/file/getCroppingImg/123" alt="山川 &amp; 湖泊"><img src="/other.png">';
  const items = parseHaoWallpaperHtml(html);
  assert.equal(items.length, 1);
  assert.deepEqual(items[0], { id: "hao-123", name: "山川 & 湖泊", thumbnail: "https://haowallpaper.com/link/common/file/getCroppingImg/123", url: "https://haowallpaper.com/link/common/file/getCroppingImg/123", source: "哲风壁纸" });
}

timelinePayloadMapsOriginalAndThumbnail();
haoHtmlKeepsOnlyWallpaperCards();
console.log("✓ timelinePayloadMapsOriginalAndThumbnail 通过");
console.log("✓ haoHtmlKeepsOnlyWallpaperCards 通过");

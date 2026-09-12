import { CATEGORIES, DEFAULT_LINKS, DEFAULT_SETTINGS, SEARCH_ENGINES, THEMES, WALLPAPERS } from "./data.js";
import { loadSettings, saveSettings } from "./storage.js";
import { fetchWeather } from "./weather.js";
import { HAO_CATEGORIES, WALLPAPER_SOURCES, getBirdCategories, loadBirdWallpapers, loadHaoWallpapers, searchWallpapers } from "./wallpapers.js";

const $ = (selector) => document.querySelector(selector);
const state = { settings: await loadSettings(), timer: null, showSeconds: false };
let settingsActiveTab = "appearance";
const quotes = [["保持好奇，持续创造。","MyWebTab"],["种一棵树最好的时间是十年前，其次是现在。","谚语"],["简单是可靠的先决条件。","Edsger Dijkstra"],["先完成，再完美。","行动准则"],["不积跬步，无以至千里。","荀子"],["知不足者好学，耻下问者自满。","林逋"],["日日行，不怕千万里；常常做，不怕千万事。","格言"],["纸上得来终觉浅，绝知此事要躬行。","陆游"],["凡事预则立，不预则废。","礼记"],["路虽远，行则将至；事虽难，做则必成。","荀子"]];

function normalizeUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  try { return new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`).href; } catch { return ""; }
}

function applyAppearance() {
  const theme = THEMES.find((item) => item.id === state.settings.theme) || THEMES[0];
  const remoteWallpaper = WALLPAPERS.find(item=>item.id===state.settings.wallpaper)?.url;
  const backgroundImage = state.settings.customBackground || remoteWallpaper;
  const background = backgroundImage ? `url("${backgroundImage}")` : theme.background;
  $("#backdrop").style.backgroundImage = background;
  document.documentElement.style.setProperty("--card-blur", `${state.settings.blur}px`);
  document.documentElement.style.setProperty("--shortcut-blur", `${state.settings.shortcutBlur}px`);
  $(".veil").style.background = state.settings.colorMode==="light" ? `rgba(245,248,252,${state.settings.shade / 140})` : `rgba(5,9,18,${state.settings.shade / 100})`;
  document.body.dataset.mode = state.settings.colorMode || "dark";
}

function renderClock() {
  const now = new Date();
  $("#clock").textContent = now.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second:state.showSeconds?"2-digit":undefined, hour12: false });
  $("#dateLine").textContent = now.toLocaleDateString("zh-CN", { year:"numeric", month:"long", day:"numeric", weekday:"long" });
  $("#calendarMonth").textContent = now.toLocaleDateString("zh-CN", { month:"long" });
  $("#calendarDay").textContent = now.getDate();
  $("#calendarWeekday").textContent = now.toLocaleDateString("zh-CN", { weekday:"long" });
}

function renderEngine() {
  const engine = SEARCH_ENGINES.find((item) => item.id === state.settings.engine) || SEARCH_ENGINES[0];
  $("#engineName").textContent = engine.name; $("#engineMark").textContent = engine.mark;
  $("#engineMenu").innerHTML = SEARCH_ENGINES.map((item) => `<button class="engine-option ${item.id === engine.id ? "active" : ""}" data-engine="${item.id}" role="option"><span>${item.mark}</span>${item.name}</button>`).join("");
}

function renderLinks() {
  $("#categoryTabs").innerHTML = CATEGORIES.map((category) => `<button class="tab ${category.id === state.settings.category ? "active" : ""}" data-category="${category.id}">${category.name}</button>`).join("");
  const links = state.settings.links.filter((link) => link.category === state.settings.category && isSafeWebUrl(link.url));
  const target=state.settings.openMode==="new"?"_blank":"_self";
  $("#shortcutGrid").innerHTML = links.map((link) => {const favicon=`${new URL(link.url).origin}/favicon.ico`;return `<a class="shortcut" href="${link.url}" target="${target}" rel="noopener" title="${escapeHtml(link.name)}"><span class="shortcut-icon" style="--shortcut-color:${link.color}"><img src="${favicon}" alt="" data-fallback><b>${escapeHtml(link.icon || link.name.slice(0,2))}</b></span><span class="shortcut-name">${escapeHtml(link.name)}</span></a>`;}).join("") + `<button class="shortcut add-shortcut" id="addShortcut"><span class="shortcut-icon">+</span><span class="shortcut-name">添加网站</span></button>`;
  document.querySelectorAll("[data-fallback]").forEach(img=>img.addEventListener("error",()=>img.classList.add("failed"),{once:true}));
}

function renderWeather(weather = state.settings.weather) {
  if (!weather) return;
  $("#weatherLocation").textContent = weather.location; $("#temperature").textContent = weather.temperature;
  $("#weatherText").textContent = weather.text; $("#weatherIcon").textContent = weather.icon;
  $("#weatherRange").textContent = `${weather.min}° / ${weather.max}°`;
}

function escapeHtml(text) { const element = document.createElement("span"); element.textContent = text; return element.innerHTML; }
function isSafeWebUrl(value){try{return ["http:","https:"].includes(new URL(value).protocol)}catch{return false}}
function toast(message) { const el=$("#toast"); el.textContent=message; el.classList.remove("hidden"); clearTimeout(state.timer); state.timer=setTimeout(()=>el.classList.add("hidden"),2200); }
async function persist() { await saveSettings(state.settings); }
function closeModal(){ $("#modalLayer").classList.add("hidden"); }
function openModal(title, eyebrow, content){ $(".modal").classList.remove("settings-modal"); $("#modalTitle").textContent=title; $("#modalEyebrow").textContent=eyebrow; $("#modalBody").innerHTML=content; $("#modalLayer").classList.remove("hidden"); }

function openAddLink() {
  const options=CATEGORIES.map(c=>`<option value="${c.id}" ${c.id===state.settings.category?"selected":""}>${c.name}</option>`).join("");
  openModal("添加网站", "快捷方式", `<form id="linkForm"><div class="field-row"><div class="field"><label>网站名称</label><input name="name" required maxlength="20" placeholder="例如：我的博客"></div><div class="field"><label>所属板块</label><select name="category">${options}</select></div></div><div class="field"><label>网站地址</label><input name="url" required placeholder="https://example.com"></div><div class="field-row"><div class="field"><label>图标文字（1-4 字符）</label><input name="icon" maxlength="4" placeholder="自动取名称"></div><div class="field"><label>图标颜色</label><input name="color" type="color" value="#4f7cff"></div></div><button class="primary-button" type="submit">保存快捷方式</button></form>`);
  $("#linkForm").addEventListener("submit", async (event)=>{event.preventDefault();const data=new FormData(event.currentTarget);const url=normalizeUrl(data.get("url"));if(!url){toast("请输入有效的网站地址");return;} const name=data.get("name").trim();state.settings.links.push({id:crypto.randomUUID(),name,url,category:data.get("category"),icon:data.get("icon").trim()||name.slice(0,2),color:data.get("color")});await persist();state.settings.category=data.get("category");renderLinks();closeModal();toast("快捷方式已添加");});
}

function openManageLinks(){
  const links=state.settings.links.filter(l=>l.category===state.settings.category); const category=CATEGORIES.find(c=>c.id===state.settings.category);
  openModal(`${category.name}板块`,"管理快捷方式",`<div class="button-row"><button class="primary-button" id="modalAddLink">+ 添加网站</button><button class="secondary-button" id="restoreLinks">恢复默认快捷方式</button></div><div class="link-list">${links.map(l=>`<div class="link-row"><span class="shortcut-icon" style="--shortcut-color:${l.color}">${escapeHtml(l.icon)}</span><div><strong>${escapeHtml(l.name)}</strong><small>${escapeHtml(l.url)}</small></div><button class="remove-link" data-remove="${l.id}" title="删除">×</button></div>`).join("")||"<p>这个板块还没有快捷方式。</p>"}</div>`);
  $("#modalAddLink").onclick=openAddLink; $("#restoreLinks").onclick=async()=>{state.settings.links=structuredClone(DEFAULT_LINKS);await persist();renderLinks();openManageLinks();toast("已恢复默认快捷方式");};
  $("#modalBody").addEventListener("click",async e=>{const id=e.target.dataset.remove;if(!id)return;state.settings.links=state.settings.links.filter(l=>l.id!==id);await persist();renderLinks();openManageLinks();toast("已删除");});
}

function openSettings(){
  const activeTheme=THEMES.find(t=>t.id===state.settings.theme)||THEMES[0],activeWallpaper=state.settings.customBackground||WALLPAPERS.find(w=>w.id===state.settings.wallpaper)?.url,previewBackground=activeWallpaper?`url(&quot;${escapeHtml(activeWallpaper)}&quot;)`:activeTheme.background;
  openModal("个性化设置","MyWebTab 2.0",`<div class="settings-layout"><nav class="settings-tabs" id="settingsTabs" role="tablist" aria-label="设置分类"><button data-settings-tab="appearance" role="tab">外观主题</button><button data-settings-tab="wallpaper" role="tab">壁纸图库</button><button data-settings-tab="effects" role="tab">显示效果</button><button data-settings-tab="data" role="tab">数据管理</button></nav><div class="settings-panels"><section class="settings-panel" data-settings-panel="appearance" role="tabpanel"><div class="settings-section-heading"><div><h3>外观与行为</h3><p>选择界面模式、网站打开方式和渐变主题</p></div></div><div class="field-row"><div class="field"><label>界面色彩</label><select id="colorMode"><option value="dark" ${state.settings.colorMode==="dark"?"selected":""}>暗色模式</option><option value="light" ${state.settings.colorMode==="light"?"selected":""}>亮色模式</option></select></div><div class="field"><label>网站打开方式</label><select id="openMode"><option value="new" ${state.settings.openMode==="new"?"selected":""}>新标签页打开（默认）</option><option value="current" ${state.settings.openMode==="current"?"selected":""}>当前标签页打开</option></select></div></div><div class="settings-group compact"><h3>渐变主题</h3><div class="theme-grid">${THEMES.map(t=>`<button class="theme-swatch ${t.id===state.settings.theme&&!state.settings.wallpaper?"active":""}" style="--theme-bg:${t.background}" data-theme="${t.id}" title="${t.name}"></button>`).join("")}</div></div></section><section class="settings-panel" data-settings-panel="wallpaper" role="tabpanel"><div class="wallpaper-grid">${WALLPAPERS.map(w=>`<button class="wallpaper-card ${w.id===state.settings.wallpaper?"active":""}" data-wallpaper="${w.id}" title="${w.name}"><img src="${w.thumbnail}" alt="${w.name}"><span>${w.name}</span></button>`).join("")}</div><div class="wallpaper-footer"><div><h3>自定义背景</h3><p>也可以使用本地图片，或随时清除当前图片背景</p></div><div class="button-row"><button class="secondary-button" id="uploadBackground">本地图片</button><button class="danger-button" id="clearBackground">清除背景</button></div></div></section><section class="settings-panel" data-settings-panel="effects" role="tabpanel"><div class="settings-section-heading"><div><h3>显示效果</h3><p>微调卡片的通透感和背景可读性</p></div></div><div class="effect-preview" id="effectPreview" style="--preview-bg:${previewBackground};--preview-blur:${state.settings.blur}px;--preview-shade:${state.settings.shade/100}"><div class="preview-side before"><span>调整前</span><div class="preview-card"><b>快捷方式</b><small>默认显示效果</small></div></div><div class="preview-side after"><span>调整后</span><div class="preview-card"><b>快捷方式</b><small>当前实时效果</small></div></div></div><div class="effect-card"><div class="field"><label>卡片模糊度 <strong id="blurValue">${state.settings.blur}px</strong></label><p>数值越高，卡片后的背景越柔和。</p><div class="range-line"><span>清晰</span><input id="blurRange" type="range" min="0" max="32" value="${state.settings.blur}"><span>柔和</span></div></div></div><div class="effect-card"><div class="field"><label>背景遮罩 <strong id="shadeValue">${state.settings.shade}%</strong></label><p>提高遮罩可以让文字和快捷方式更容易辨认。</p><div class="range-line"><span>明亮</span><input id="shadeRange" type="range" min="0" max="75" value="${state.settings.shade}"><span>沉浸</span></div></div></div></section><section class="settings-panel" data-settings-panel="data" role="tabpanel"><div class="settings-section-heading"><div><h3>数据管理</h3><p>备份、迁移或重置当前浏览器中的配置</p></div></div><div class="data-actions"><article><div><strong>导出配置</strong><p>下载包含快捷方式和个性化设置的 JSON 备份。</p></div><button class="secondary-button" id="exportSettings">导出</button></article><article><div><strong>导入配置</strong><p>从此前导出的 JSON 文件恢复设置。</p></div><button class="secondary-button" id="importSettings">导入</button></article><article class="danger-zone"><div><strong>恢复全部默认</strong><p>清除自定义内容，并恢复初始快捷方式和外观。</p></div><button class="danger-button" id="resetSettings">恢复默认</button></article></div></section></div></div>`);
  $(".modal").classList.add("settings-modal");
  $("#shadeRange").closest(".effect-card").insertAdjacentHTML("beforebegin",`<div class="effect-card"><div class="field"><label>快捷方式背景模糊度 <strong id="shortcutBlurValue">${state.settings.shortcutBlur}px</strong></label><p>单独调整快捷方式图标背景的玻璃模糊效果。</p><div class="range-line"><span>清晰</span><input id="shortcutBlurRange" type="range" min="0" max="32" value="${state.settings.shortcutBlur}"><span>柔和</span></div></div></div>`);
  $("#effectPreview").style.setProperty("--preview-shortcut-blur",`${state.settings.shortcutBlur}px`);
  const activateSettingsTab=tab=>{settingsActiveTab=tab;document.querySelectorAll("[data-settings-tab]").forEach(button=>{const active=button.dataset.settingsTab===tab;button.classList.toggle("active",active);button.setAttribute("aria-selected",String(active));});document.querySelectorAll("[data-settings-panel]").forEach(panel=>panel.classList.toggle("active",panel.dataset.settingsPanel===tab));};
  activateSettingsTab(settingsActiveTab);$("#settingsTabs").addEventListener("click",event=>{const tab=event.target.closest("[data-settings-tab]")?.dataset.settingsTab;if(tab)activateSettingsTab(tab);});
  const wallpaperGrid=$(".wallpaper-grid"),categories=["全部",...new Set(WALLPAPERS.map(w=>w.category))];wallpaperGrid.insertAdjacentHTML("beforebegin",`<form class="wallpaper-search" id="wallpaperSearchForm"><input id="wallpaperKeyword" maxlength="40" placeholder="搜索当前壁纸源" aria-label="壁纸关键词"><button class="primary-button" type="submit">搜索壁纸</button></form><div class="wallpaper-sources">${WALLPAPER_SOURCES.map((source,i)=>`<button class="${i===0?"active":""}" data-wallpaper-source="${source.id}">${source.name}</button>`).join("")}</div><div class="bird-browser hidden" id="birdBrowser"><label for="birdCategory">小鸟分类</label><select id="birdCategory"><option value="">正在加载分类…</option></select><div class="bird-tags" id="birdTags"><span>选择分类后显示热门 tag</span></div></div><div class="hao-browser hidden" id="haoBrowser"><label for="haoCategory">哲风分类</label><select id="haoCategory">${HAO_CATEGORIES.map(category=>`<option value="${category}">${category}</option>`).join("")}</select><span>支持关键词、分类及分页</span></div><div class="wallpaper-filters">${categories.map((c,i)=>`<button class="${i===0?"active":""}" data-wallpaper-filter="${c}">${c}</button>`).join("")}</div>`);wallpaperGrid.insertAdjacentHTML("afterend",`<div class="wallpaper-pager hidden" id="wallpaperPager"><button class="secondary-button" data-wallpaper-page="prev">上一页</button><span id="wallpaperPageInfo">第 1 / 1 页</span><button class="secondary-button" data-wallpaper-page="next">下一页</button></div>`);[...wallpaperGrid.children].forEach((card,index)=>{card.dataset.category=WALLPAPERS[index].category;card.insertAdjacentHTML("beforeend",`<em>${WALLPAPERS[index].category}</em>`)});
  let birdCategories=[],activeWallpaperRequest={source:"curated",mode:"latest",page:1,keyword:"",category:"全部"};const wallpaperFilters=document.querySelector(".wallpaper-filters"),pager=$("#wallpaperPager");
  const renderOnlineWallpapers=result=>{const items=Array.isArray(result)?result:result.items||[];wallpaperGrid.innerHTML=items.map(item=>`<button class="wallpaper-card" data-wallpaper-url="${escapeHtml(item.url)}" title="${escapeHtml(item.name)}"><img src="${escapeHtml(item.thumbnail)}" alt="${escapeHtml(item.name)}" loading="lazy"><span>${escapeHtml(item.name)}</span><em>${escapeHtml(item.source)}</em></button>`).join("");const paged=!Array.isArray(result)&&result.totalPage;pager.classList.toggle("hidden",!paged);if(paged){$("#wallpaperPageInfo").textContent=`第 ${result.page} / ${result.totalPage} 页 · 共 ${result.totalCount} 张`;pager.querySelector('[data-wallpaper-page="prev"]').disabled=result.page<=1;pager.querySelector('[data-wallpaper-page="next"]').disabled=result.page>=result.totalPage;}};
  const setSourceControls=source=>{$("#birdBrowser").classList.toggle("hidden",source!=="bird");$("#haoBrowser").classList.toggle("hidden",source!=="hao-wallpaper");wallpaperFilters.classList.toggle("hidden",source!=="curated");};
  const loadWallpaperView=async request=>{activeWallpaperRequest={...activeWallpaperRequest,...request};const source=activeWallpaperRequest.source;setSourceControls(source);wallpaperGrid.innerHTML=`<div class="wallpaper-loading">正在加载${source==="hao-wallpaper"?"哲风":"小鸟"}壁纸…</div>`;pager.classList.add("hidden");try{const result=source==="hao-wallpaper"?await loadHaoWallpapers(activeWallpaperRequest):await loadBirdWallpapers(activeWallpaperRequest);renderOnlineWallpapers(result)}catch(error){wallpaperGrid.innerHTML=`<div class="wallpaper-error">${escapeHtml(error.message)}</div>`}};
  getBirdCategories().then(items=>{birdCategories=items;$("#birdCategory").innerHTML=`<option value="">最新壁纸</option>${items.map(item=>`<option value="${item.id}">${escapeHtml(item.fullName)}</option>`).join("")}`;}).catch(error=>{$("#birdCategory").innerHTML='<option value="">分类加载失败</option>';$("#birdTags").innerHTML=`<span>${escapeHtml(error.message)}</span>`});
  $("#birdCategory").addEventListener("change",e=>{const category=birdCategories.find(item=>item.id===e.target.value);$("#birdTags").innerHTML=category?.tags.length?category.tags.map(tag=>`<button data-bird-tag="${escapeHtml(tag)}"># ${escapeHtml(tag)}</button>`).join(""):'<span>该分类暂无热门 tag</span>';document.querySelectorAll("[data-wallpaper-source]").forEach(x=>x.classList.toggle("active",x.dataset.wallpaperSource==="bird"));loadWallpaperView(category?{source:"bird",mode:"category",categoryId:category.id,keyword:"",page:1}:{source:"bird",mode:"latest",categoryId:"",keyword:"",page:1});});
  $("#haoCategory").addEventListener("change",e=>{$("#wallpaperKeyword").value="";loadWallpaperView({source:"hao-wallpaper",category:e.target.value,keyword:"",page:1});});
  $("#wallpaperSearchForm").addEventListener("submit",async e=>{e.preventDefault();const keyword=$("#wallpaperKeyword").value.trim();if(!keyword){toast("请输入壁纸关键词");return}const source=activeWallpaperRequest.source==="hao-wallpaper"?"hao-wallpaper":"bird";document.querySelectorAll("[data-wallpaper-source]").forEach(x=>x.classList.toggle("active",x.dataset.wallpaperSource===source));if(source==="hao-wallpaper")loadWallpaperView({source,keyword,category:"全部",page:1});else{activeWallpaperRequest={source:"bird",mode:"search",keyword,page:1,categoryId:""};wallpaperGrid.innerHTML='<div class="wallpaper-loading">正在搜索小鸟壁纸…</div>';pager.classList.add("hidden");try{renderOnlineWallpapers(await searchWallpapers(keyword,1))}catch(error){wallpaperGrid.innerHTML=`<div class="wallpaper-error">${escapeHtml(error.message)}</div>`}}});
  $("#modalBody").addEventListener("click",async e=>{
    const tag=e.target.closest("[data-bird-tag]")?.dataset.birdTag;
    if(tag){$("#wallpaperKeyword").value=tag;await loadWallpaperView({source:"bird",mode:"search",keyword:tag,page:1,categoryId:""});return}
    const pageAction=e.target.closest("[data-wallpaper-page]")?.dataset.wallpaperPage;
    if(pageAction){const page=activeWallpaperRequest.page+(pageAction==="next"?1:-1);if(page>0)await loadWallpaperView({page});return}
    const sourceId=e.target.closest("[data-wallpaper-source]")?.dataset.wallpaperSource;
    if(sourceId){
      document.querySelectorAll("[data-wallpaper-source]").forEach(x=>x.classList.toggle("active",x.dataset.wallpaperSource===sourceId));
      const source=WALLPAPER_SOURCES.find(x=>x.id===sourceId);$("#wallpaperKeyword").value="";
      if(source.local){activeWallpaperRequest={source:"curated",mode:"latest",page:1,keyword:"",category:"全部"};openSettings();return}
      if(source.bird){activeWallpaperRequest={source:"bird",mode:"latest",page:1,categoryId:"",keyword:"",category:"全部"};$("#birdCategory").value="";$("#birdTags").innerHTML='<span>选择分类后显示热门 tag</span>';await loadWallpaperView(activeWallpaperRequest);return}
      if(source.hao){activeWallpaperRequest={source:"hao-wallpaper",page:1,keyword:"",category:"全部"};$("#haoCategory").value="全部";await loadWallpaperView(activeWallpaperRequest);return}
      activeWallpaperRequest={source:sourceId,page:1,keyword:"",category:"全部"};setSourceControls(sourceId);wallpaperGrid.innerHTML='<div class="wallpaper-loading">正在加载壁纸…</div>';pager.classList.add("hidden");try{renderOnlineWallpapers(await source.load())}catch(error){wallpaperGrid.innerHTML=`<div class="wallpaper-error">${escapeHtml(error.message)}</div>`}return;
    }
    const filter=e.target.closest("[data-wallpaper-filter]")?.dataset.wallpaperFilter;if(filter){document.querySelectorAll("[data-wallpaper-filter]").forEach(x=>x.classList.toggle("active",x.dataset.wallpaperFilter===filter));[...wallpaperGrid.children].forEach(card=>card.classList.toggle("filtered",filter!=="全部"&&card.dataset.category!==filter));return}
    const remoteUrl=e.target.closest("[data-wallpaper-url]")?.dataset.wallpaperUrl;if(remoteUrl){state.settings.wallpaper="";state.settings.customBackground=remoteUrl;await persist();applyAppearance();toast("壁纸已应用");return}
    const theme=e.target.closest("[data-theme]")?.dataset.theme,wallpaper=e.target.closest("[data-wallpaper]")?.dataset.wallpaper;if(theme){state.settings.theme=theme;state.settings.wallpaper="";state.settings.customBackground="";await persist();applyAppearance();openSettings();}if(wallpaper){state.settings.wallpaper=wallpaper;state.settings.customBackground="";await persist();applyAppearance();openSettings();}
  });
  $("#colorMode").onchange=async e=>{state.settings.colorMode=e.target.value;await persist();applyAppearance();};$("#openMode").onchange=async e=>{state.settings.openMode=e.target.value;await persist();renderLinks();};
  $("#uploadBackground").onclick=()=>$("#backgroundPicker").click(); $("#clearBackground").onclick=async()=>{state.settings.customBackground="";state.settings.wallpaper="";await persist();applyAppearance();openSettings();};
  for(const key of ["blur","shortcutBlur","shade"]){$(`#${key}Range`).oninput=async e=>{state.settings[key]=Number(e.target.value);$(`#${key}Value`).textContent=`${e.target.value}${key==="shade"?"%":"px"}`;const previewProperty=key==="blur"?"--preview-blur":key==="shortcutBlur"?"--preview-shortcut-blur":"--preview-shade";$("#effectPreview").style.setProperty(previewProperty,key==="shade"?String(Number(e.target.value)/100):`${e.target.value}px`);applyAppearance();await persist();};}
  $("#exportSettings").onclick=()=>{const blob=new Blob([JSON.stringify(state.settings,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`mywebtab-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href);};
  $("#importSettings").onclick=()=>$("#importPicker").click(); $("#resetSettings").onclick=async()=>{state.settings=structuredClone(DEFAULT_SETTINGS);await persist();location.reload();};
}

$("#engineButton").onclick=()=>$("#engineMenu").classList.toggle("hidden");
$("#engineMenu").onclick=async event=>{const id=event.target.closest("[data-engine]")?.dataset.engine;if(!id)return;state.settings.engine=id;await persist();renderEngine();$("#engineMenu").classList.add("hidden");$("#searchInput").focus();};
$("#searchForm").onsubmit=event=>{event.preventDefault();const query=$("#searchInput").value.trim();if(!query)return;const direct=/^(https?:\/\/|localhost[:/]|[\w-]+\.[a-z]{2,})(\/.*)?$/i.test(query);if(direct){location.href=normalizeUrl(query);return;}const engine=SEARCH_ENGINES.find(e=>e.id===state.settings.engine)||SEARCH_ENGINES[0];location.href=engine.url.replace("%s",encodeURIComponent(query));};
$("#categoryTabs").onclick=async event=>{const id=event.target.dataset.category;if(!id)return;state.settings.category=id;await persist();renderLinks();};
$("#shortcutGrid").onclick=event=>{if(event.target.closest("#addShortcut"))openAddLink();};
$("#manageLinksButton").onclick=openManageLinks; $("#settingsButton").onclick=openSettings; $("#focusButton").onclick=()=>document.body.classList.toggle("focus-mode"); $("#homeButton").onclick=()=>document.body.classList.remove("focus-mode");
$("#clock").ondblclick=()=>{state.showSeconds=!state.showSeconds;renderClock();toast(state.showSeconds?"已显示秒数":"已隐藏秒数")};
$("#modalLayer").onclick=event=>{if(event.target.closest("[data-close-modal]"))closeModal();};
$("#weatherButton").onclick=async()=>{try{$("#weatherText").textContent="正在获取…";state.settings.weather=await fetchWeather();await persist();renderWeather();toast("天气已更新");}catch(error){$("#weatherText").textContent="无法获取天气";$("#weatherRange").textContent=error.message||"请检查定位权限";}};
$("#backgroundPicker").onchange=event=>{const file=event.target.files[0];if(!file)return;if(file.size>8*1024*1024){toast("图片过大，请选择 8MB 以内图片");return;}const reader=new FileReader();reader.onload=async()=>{state.settings.customBackground=reader.result;try{await persist();applyAppearance();openSettings();toast("背景已更新");}catch{state.settings.customBackground="";toast("背景保存失败，请压缩图片后重试");}};reader.readAsDataURL(file);};
$("#importPicker").onchange=event=>{const file=event.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=async()=>{try{const imported=JSON.parse(reader.result);if(!Array.isArray(imported.links))throw new Error();imported.links=imported.links.filter(link=>isSafeWebUrl(link.url));state.settings={...DEFAULT_SETTINGS,...imported};await persist();location.reload();}catch{toast("配置文件格式无效");}};reader.readAsText(file);};
document.addEventListener("keydown",event=>{if(event.key==="/"&&!/INPUT|TEXTAREA/.test(document.activeElement.tagName)){event.preventDefault();$("#searchInput").focus();}if(event.key==="Escape"){closeModal();$("#engineMenu").classList.add("hidden");}});
document.addEventListener("click",event=>{if(!event.target.closest(".search"))$("#engineMenu").classList.add("hidden");});

const quote=quotes[Math.floor(Math.random()*quotes.length)];$("#quoteText").textContent=quote[0];$("#quoteAuthor").textContent=quote[1];
applyAppearance();renderClock();renderEngine();renderLinks();renderWeather();setInterval(renderClock,1000);
setTimeout(async()=>{try{state.settings.weather=await fetchWeather();await persist();renderWeather();}catch(error){if(!state.settings.weather){$("#weatherText").textContent="天气暂不可用";$("#weatherRange").textContent=error.message||"稍后重试";}}},200);

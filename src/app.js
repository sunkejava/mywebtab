import { CATEGORIES, DEFAULT_LINKS, DEFAULT_SETTINGS, SEARCH_ENGINES, THEMES, WALLPAPERS } from "./data.js";
import { loadSettings, saveSettings } from "./storage.js";
import { fetchWeather } from "./weather.js";

const $ = (selector) => document.querySelector(selector);
const state = { settings: await loadSettings(), timer: null, showSeconds: false };
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
function openModal(title, eyebrow, content){ $("#modalTitle").textContent=title; $("#modalEyebrow").textContent=eyebrow; $("#modalBody").innerHTML=content; $("#modalLayer").classList.remove("hidden"); }

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
  openModal("个性化设置","MyWebTab 2.0",`<div class="settings-group"><h3>显示与行为</h3><div class="field-row"><div class="field"><label>界面色彩</label><select id="colorMode"><option value="dark" ${state.settings.colorMode==="dark"?"selected":""}>暗色模式</option><option value="light" ${state.settings.colorMode==="light"?"selected":""}>亮色模式</option></select></div><div class="field"><label>网站打开方式</label><select id="openMode"><option value="new" ${state.settings.openMode==="new"?"selected":""}>新标签页打开（默认）</option><option value="current" ${state.settings.openMode==="current"?"selected":""}>当前标签页打开</option></select></div></div></div><div class="settings-group"><h3>渐变主题</h3><div class="theme-grid">${THEMES.map(t=>`<button class="theme-swatch ${t.id===state.settings.theme&&!state.settings.wallpaper?"active":""}" style="--theme-bg:${t.background}" data-theme="${t.id}" title="${t.name}"></button>`).join("")}</div></div><div class="settings-group"><div class="group-title"><h3>免费壁纸库</h3><span>Unsplash 精选</span></div><div class="wallpaper-grid">${WALLPAPERS.map(w=>`<button class="wallpaper-card ${w.id===state.settings.wallpaper?"active":""}" data-wallpaper="${w.id}" title="${w.name}"><img src="${w.thumbnail}" alt="${w.name}"><span>${w.name}</span></button>`).join("")}</div></div><div class="settings-group"><h3>本地背景</h3><div class="button-row"><button class="secondary-button" id="uploadBackground">选择本地图片</button><button class="danger-button" id="clearBackground">清除图片背景</button></div></div><div class="settings-group"><h3>显示效果</h3><div class="field"><label>卡片模糊度：<span id="blurValue">${state.settings.blur}px</span></label><div class="range-line"><input id="blurRange" type="range" min="0" max="32" value="${state.settings.blur}"></div></div><div class="field"><label>背景遮罩：<span id="shadeValue">${state.settings.shade}%</span></label><div class="range-line"><input id="shadeRange" type="range" min="0" max="75" value="${state.settings.shade}"></div></div></div><div class="settings-group"><h3>数据管理</h3><div class="button-row"><button class="secondary-button" id="exportSettings">导出配置</button><button class="secondary-button" id="importSettings">导入配置</button><button class="danger-button" id="resetSettings">恢复全部默认</button></div></div>`);
  const wallpaperGrid=$(".wallpaper-grid"),categories=["全部",...new Set(WALLPAPERS.map(w=>w.category))];wallpaperGrid.insertAdjacentHTML("beforebegin",`<div class="wallpaper-filters">${categories.map((c,i)=>`<button class="${i===0?"active":""}" data-wallpaper-filter="${c}">${c}</button>`).join("")}</div>`);[...wallpaperGrid.children].forEach((card,index)=>{card.dataset.category=WALLPAPERS[index].category;card.insertAdjacentHTML("beforeend",`<em>${WALLPAPERS[index].category}</em>`)});
  $("#modalBody").addEventListener("click",async e=>{const filter=e.target.closest("[data-wallpaper-filter]")?.dataset.wallpaperFilter;if(filter){document.querySelectorAll("[data-wallpaper-filter]").forEach(x=>x.classList.toggle("active",x.dataset.wallpaperFilter===filter));[...wallpaperGrid.children].forEach(card=>card.classList.toggle("filtered",filter!=="全部"&&card.dataset.category!==filter));return}const theme=e.target.closest("[data-theme]")?.dataset.theme;const wallpaper=e.target.closest("[data-wallpaper]")?.dataset.wallpaper;if(theme){state.settings.theme=theme;state.settings.wallpaper="";state.settings.customBackground="";await persist();applyAppearance();openSettings();}if(wallpaper){state.settings.wallpaper=wallpaper;state.settings.customBackground="";await persist();applyAppearance();openSettings();}});
  $("#colorMode").onchange=async e=>{state.settings.colorMode=e.target.value;await persist();applyAppearance();};$("#openMode").onchange=async e=>{state.settings.openMode=e.target.value;await persist();renderLinks();};
  $("#uploadBackground").onclick=()=>$("#backgroundPicker").click(); $("#clearBackground").onclick=async()=>{state.settings.customBackground="";state.settings.wallpaper="";await persist();applyAppearance();openSettings();};
  for(const key of ["blur","shade"]){$(`#${key}Range`).oninput=async e=>{state.settings[key]=Number(e.target.value);$(`#${key}Value`).textContent=`${e.target.value}${key==="blur"?"px":"%"}`;applyAppearance();await persist();};}
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

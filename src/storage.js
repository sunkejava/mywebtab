import { DEFAULT_SETTINGS } from "./data.js";

const storageArea = globalThis.chrome?.storage?.local;

export async function loadSettings() {
  if (!storageArea) {
    const saved = JSON.parse(localStorage.getItem("mywebtab") || "null");
    const settings = migrate(saved);
    localStorage.setItem("mywebtab", JSON.stringify(settings));
    return settings;
  }
  const { settings } = await storageArea.get("settings");
  const migrated = migrate(settings);
  if (migrated.schemaVersion !== settings?.schemaVersion) await storageArea.set({ settings: migrated });
  return migrated;
}

function migrate(saved) {
  if (!saved) return structuredClone(DEFAULT_SETTINGS);
  let links = Array.isArray(saved.links) ? saved.links : [];
  if ((saved.schemaVersion || 0) < DEFAULT_SETTINGS.schemaVersion) {
    const existing = new Set(links.map(link => `${link.category}|${link.url}`));
    links = [...links, ...DEFAULT_SETTINGS.links.filter(link => !existing.has(`${link.category}|${link.url}`))];
  }
  return { ...DEFAULT_SETTINGS, ...saved, schemaVersion: DEFAULT_SETTINGS.schemaVersion, links };
}

export async function saveSettings(settings) {
  if (storageArea) await storageArea.set({ settings });
  else localStorage.setItem("mywebtab", JSON.stringify(settings));
}

import { DEFAULT_SETTINGS } from "./data.js";

const storageArea = globalThis.chrome?.storage?.local;

export async function loadSettings() {
  if (!storageArea) {
    const saved = JSON.parse(localStorage.getItem("mywebtab") || "null");
    return { ...DEFAULT_SETTINGS, ...saved, links: saved?.links || DEFAULT_SETTINGS.links };
  }
  const { settings } = await storageArea.get("settings");
  return { ...DEFAULT_SETTINGS, ...settings, links: settings?.links || DEFAULT_SETTINGS.links };
}

export async function saveSettings(settings) {
  if (storageArea) await storageArea.set({ settings });
  else localStorage.setItem("mywebtab", JSON.stringify(settings));
}

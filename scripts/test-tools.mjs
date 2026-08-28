Object.defineProperty(globalThis, "navigator", { value: { clipboard: { writeText: async () => {} } }, configurable: true });
Object.defineProperty(globalThis, "window", { value: {}, configurable: true });
const elements = new Map();
function element(selector) {
  if (!elements.has(selector)) elements.set(selector, {
    value: "", textContent: "", innerHTML: "", dataset: {}, style: {}, className: "",
    classList: { add() {}, remove() {}, toggle() {} }, append() {}, insertAdjacentHTML() {},
    setAttribute() {}, closest() { return null; }, scrollTop: 0, scrollHeight: 0
  });
  return elements.get(selector);
}
globalThis.document = {
  querySelector: element,
  querySelectorAll: () => [],
  createElement: () => element(`created-${Math.random()}`)
};

await import("../src/tools.js");

element("#cryptoAlgorithm").value = "AES-GCM";
element("#cryptoKey").value = "测试密钥";
element("#cryptoInput").value = "MyWebTab 加密测试";
await element("#cryptoEncrypt").onclick();
const cipher = element("#cryptoOutput").value;
if (!cipher || cipher.includes("MyWebTab")) throw new Error("AES encryption failed");
element("#cryptoInput").value = cipher;
await element("#cryptoDecrypt").onclick();
if (element("#cryptoOutput").value !== "MyWebTab 加密测试") throw new Error("AES roundtrip failed");

element("#cryptoAlgorithm").value = "RC4";
element("#cryptoInput").value = "RC4 roundtrip";
await element("#cryptoEncrypt").onclick();
element("#cryptoInput").value = element("#cryptoOutput").value;
await element("#cryptoDecrypt").onclick();
if (element("#cryptoOutput").value !== "RC4 roundtrip") throw new Error("RC4 roundtrip failed");

element("#encodingMode").value = "urlEncode";
element("#encodingInput").value = "中文 test";
element("#runEncoding").onclick();
if (element("#encodingOutput").value !== "%E4%B8%AD%E6%96%87%20test") throw new Error("URL encoding failed");

console.log("✓ AES-GCM、RC4 与编码工具往返测试通过");

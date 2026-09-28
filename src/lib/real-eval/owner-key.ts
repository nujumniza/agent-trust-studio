/**
 * Anonymous per-browser access key. The server stores only its SHA-256 hash
 * and returns runs whose hash matches, so a browser can only read its own runs.
 * Replace with signed-in user ids when accounts are added.
 */
const KEY = "trust-ai:owner-key:v1";

export function getOwnerKey(): string {
  let k = window.localStorage.getItem(KEY);
  if (!k || k.length < 32) {
    k = crypto.randomUUID() + crypto.randomUUID();
    window.localStorage.setItem(KEY, k);
  }
  return k;
}

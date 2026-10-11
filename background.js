// Per-window MRU list of tab IDs, kept in storage because the background
// script is suspended when idle.
const KEY = "mru";
const store = browser.storage.session || browser.storage.local;

async function load() {
  return (await store.get(KEY))[KEY] || {};
}
const save = (mru) => store.set({ [KEY]: mru });

browser.tabs.onActivated.addListener(async ({ tabId, windowId }) => {
  const mru = await load();
  const list = (mru[windowId] || []).filter((id) => id !== tabId);
  mru[windowId] = [tabId, ...list].slice(0, 20);
  await save(mru);
});

browser.tabs.onRemoved.addListener(async (tabId) => {
  const mru = await load();
  for (const w in mru) mru[w] = mru[w].filter((id) => id !== tabId);
  await save(mru);
});

browser.commands.onCommand.addListener(async (command) => {
  if (command !== "last-tab") return;
  const [active] = await browser.tabs.query({ active: true, currentWindow: true });
  if (!active) return;

  const mru = await load();
  const list = (mru[active.windowId] || []).filter((id) => id !== active.id);

  // Pick the most recent tab that still exists
  for (const id of list) {
    try {
      await browser.tabs.update(id, { active: true });
      return;
    } catch (_) { /* tab gone, try next */ }
  }
});
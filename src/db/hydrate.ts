import { db } from '@/db/dexie';
import { seedSignature, seedReflexes, seedSuggestions, seedPatches, seedSettings } from '@/db/seed';
import { useAppStore } from '@/store/useAppStore';

export async function hydrateStore() {
  const store = useAppStore.getState();

  const sigs = await db.signatures.toArray();
  const reflexes = await db.reflexes.toArray();
  const suggestions = await db.suggestions.toArray();
  const patches = await db.patches.toArray();
  const settings = await db.settings.toArray();

  // Seed if empty
  if (sigs.length === 0) {
    await db.signatures.put(seedSignature);
    store.setSignature(seedSignature);
  } else {
    store.setSignature(sigs[0]);
  }

  if (reflexes.length === 0) {
    await db.reflexes.bulkPut(seedReflexes);
    store.setReflexes(seedReflexes);
  } else {
    store.setReflexes(reflexes);
  }

  if (suggestions.length === 0) {
    await db.suggestions.bulkPut(seedSuggestions);
    store.setSuggestions(seedSuggestions);
  } else {
    store.setSuggestions(suggestions);
  }

  if (patches.length === 0) {
    await db.patches.bulkPut(seedPatches);
    store.setPatches(seedPatches);
  } else {
    store.setPatches(patches);
  }

  if (settings.length === 0) {
    await db.settings.put({ id: 'main', ...seedSettings });
    store.setProvider(seedSettings.provider);
  } else {
    store.setProvider(settings[0].provider);
  }

  // Check guest session
  const guestSession = localStorage.getItem('sf_guest');
  if (guestSession) {
    store.setAuthenticated(true);
    store.setUser({ id: 'guest', name: 'Guest', avatar: '', provider: 'guest' });
  }

  store.setHydrated(true);
}

export async function clearAllData() {
  await db.signatures.clear();
  await db.reflexes.clear();
  await db.suggestions.clear();
  await db.patches.clear();
  await db.settings.clear();
  localStorage.removeItem('sf_guest');
  useAppStore.getState().resetAll();
}

export async function exportData() {
  const data = {
    exportedAt: new Date().toISOString(),
    signature: await db.signatures.toArray(),
    reflexes: await db.reflexes.toArray(),
    suggestions: await db.suggestions.toArray(),
    patches: await db.patches.toArray(),
    settings: await db.settings.toArray(),
  };
  return data;
}

export async function importData(data: any) {
  if (data.signature?.length) await db.signatures.bulkPut(data.signature);
  if (data.reflexes?.length) await db.reflexes.bulkPut(data.reflexes);
  if (data.suggestions?.length) await db.suggestions.bulkPut(data.suggestions);
  if (data.patches?.length) await db.patches.bulkPut(data.patches);
  if (data.settings?.length) await db.settings.bulkPut(data.settings);
  await hydrateStore();
}

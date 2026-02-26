/**
 * Mock data seed script for element-tracker.
 *
 * RUN VIA BROWSER CONSOLE (after logging in to /progress):
 *   1. Open /progress in the browser while logged in
 *   2. Open DevTools console
 *   3. Paste the output of: npx tsx scripts/seed-mock-data.ts
 *
 * OR run directly if Firebase Admin is configured.
 *
 * All entries are clearly marked with [MOCK] in the reason field.
 * To clean up: delete all documents where reason starts with "[MOCK]"
 */

// Generate mock entries from 2026-01-01 to 2026-02-25
interface MockEntry {
  date: string;
  inElement: boolean;
  reason: string;
}

const mockEntries: MockEntry[] = [];

const reasons = {
  inElement: [
    "[MOCK] Great morning workout, felt energized all day",
    "[MOCK] Deep focus session on a challenging problem",
    "[MOCK] Quality time with family, feeling grateful",
    "[MOCK] Finished a creative project I've been working on",
    "[MOCK] Had a productive brainstorming session",
    "[MOCK] Helped a colleague with something meaningful",
    "[MOCK] Meditation and journaling felt really centering",
    "[MOCK] Cooked a new recipe, nailed it",
    "[MOCK] Long walk in nature, clear mind",
    "[MOCK] Crushed my goals for the week ahead of schedule",
  ],
  notInElement: [
    "[MOCK] Couldn't focus, kept getting distracted",
    "[MOCK] Felt drained after too many meetings",
    "[MOCK] Poor sleep last night affected everything",
    "[MOCK] Overwhelmed by deadlines, not my best day",
    "[MOCK] Skipped workout, felt sluggish",
    "[MOCK] Arguments at work brought me down",
  ],
};

// Seed a deterministic random based on date
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const startDate = new Date(2026, 0, 1); // Jan 1, 2026
const endDate = new Date(2026, 1, 25);  // Feb 25, 2026

for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const seed = d.getTime();
  const rand = seededRandom(seed);

  // Skip ~15% of days to create gaps (unlogged days)
  if (rand < 0.15) continue;

  // ~70% chance of being "in element"
  const inElement = seededRandom(seed + 1) < 0.70;

  const reasonList = inElement ? reasons.inElement : reasons.notInElement;
  const reasonIndex = Math.floor(seededRandom(seed + 2) * reasonList.length);

  mockEntries.push({
    date: dateStr,
    inElement,
    reason: reasonList[reasonIndex],
  });
}

// Output as JSON for use in seed operations
console.log(JSON.stringify(mockEntries, null, 2));
console.log(`\nTotal entries: ${mockEntries.length}`);
console.log(`In element: ${mockEntries.filter(e => e.inElement).length}`);
console.log(`Not in element: ${mockEntries.filter(e => !e.inElement).length}`);

// Generate browser console paste script
const browserScript = `
// MOCK DATA SEED SCRIPT — paste this in browser console on /progress page
// All entries marked with [MOCK] in reason field
(async () => {
  const { collection, doc, setDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js');
  // Use the app's existing Firestore instance
  const db = window.__FIREBASE_DB__;
  if (!db) {
    console.error('Firebase DB not found. Make sure you are on the /progress page.');
    return;
  }

  const entries = ${JSON.stringify(mockEntries)};

  let success = 0;
  let failed = 0;

  for (const entry of entries) {
    try {
      await setDoc(doc(db, 'element-tracker', entry.date), {
        inElement: entry.inElement,
        reason: entry.reason,
        date: entry.date,
        updatedAt: serverTimestamp(),
      });
      success++;
      console.log(\`[\${success}/\${entries.length}] Seeded \${entry.date}\`);
    } catch (err) {
      failed++;
      console.error(\`Failed \${entry.date}:\`, err);
    }
  }

  console.log(\`Done! \${success} seeded, \${failed} failed.\`);
})();
`;

export { mockEntries };

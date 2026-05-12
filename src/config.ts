// src/config.ts
// ⚠️ Quando cambi appName, aggiorna anche "name" in devvit.json

export const APP_CONFIG = {
  // Nome dell'app (deve corrispondere a "name" in devvit.json)
  appName: 'MY_APP_NAME',

  // Cron schedule
  // Esempi:
  //   '0 9 * * 1'      → ogni lunedì alle 09:00 UTC
  //   '0 9 * * 1,3,5'  → lunedì, mercoledì, venerdì alle 09:00 UTC
  //   '0 9 1 * *'      → il primo del mese alle 09:00 UTC
  cron: '*/5 * * * *', // Ogni 5 minuti (per test, cambia in '0 9 * * 1' per produzione)

  // Titolo del post
  postTitle: 'Discussione Settimanale 🗓️',

  // Contenuto del post (supporta markdown Reddit)
  postContent: `# Benvenuti nel thread settimanale!

Questo post viene ricreato automaticamente ogni settimana.

---

*Questo è un post automatico creato da un bot*`,
};
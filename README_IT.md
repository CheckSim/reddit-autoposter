# Devvit Weekly Post Bot — Template

Un template per costruire un bot Reddit con [Devvit](https://developers.reddit.com/docs/devvit) che crea e pinna automaticamente un post ricorrente secondo uno schedule, cancella il precedente e salva lo stato con Redis.

***

## Prerequisiti

- Python 3.8+ (opzionale)
- Node.js (se si usa in coppia con python può essere installato tramite `nodeenv` dentro un virtualenv Python — vedi sotto)
- Un account Reddit con accesso da moderatore ad almeno un subreddit
- Un [account sviluppatore Devvit](https://developers.reddit.com)

***

## Installare Node.js in un Virtual Environment

Questo progetto è stato sviluppato con `nodeenv` per eseguire Node.js all'interno di un virtual environment Python, mantenendo le dipendenze isolate.

Se avete già installato Node.js potete saltare i punti dall'1 al 4.

```bash
# 1. Crea il virtual environment Python
python3 -m venv .venv

# 2. Attivalo
source .venv/bin/activate        # macOS/Linux
# .venv\Scripts\activate         # Windows

# 3. Installa nodeenv
pip install nodeenv

# 4. Installa Node.js dentro il virtual environment
nodeenv --node=20.11.0 --prebuilt -p

# 5. Verifica che Node.js e npm siano disponibili
node --version
npm --version
```

> Tutti i comandi successivi devono essere eseguiti con il virtual environment attivo.

***

## Installazione

```bash
# Installa le dipendenze
npm install

# Installa la CLI di Devvit globalmente
npm install -g devvit

# Accedi al tuo account Devvit
devvit login
```

***

## Configurazione

Tutte le impostazioni specifiche del progetto si trovano in **un solo file**: `src/config.ts`.

```typescript
// src/config.ts
export const APP_CONFIG = {
  // Deve corrispondere a "name" in devvit.json
  appName: 'nome-della-tua-app',

  // Cron schedule (formato UNIX a 5 campi, orario UTC)
  // '0 9 * * 1'     → ogni lunedì alle 09:00 UTC (11:00 ora italiana)
  // '0 9 1 * *'     → il primo del mese alle 09:00 UTC
  cron: '0 9 * * 1',

  // Titolo del post
  postTitle: 'Discussione Settimanale 🗓️',

  // Contenuto del post (supporta Markdown di Reddit)
  postContent: `# Benvenuti nel thread settimanale!\n\n*Creato automaticamente da un bot.*`,
};
```

Aggiorna anche il campo `name` in `devvit.json` in modo che corrisponda ad `appName`:

```json
{
  "name": "nome-della-tua-app"
}
```

> ⚠️ `appName` in `config.ts` e `name` in `devvit.json` devono essere sempre identici.

***

## Struttura del Progetto

```
├── src/
│   ├── config.ts       ← Modifica questo file per configurare il bot
│   └── main.ts         ← Logica del bot (scheduler, trigger, menu item)
├── devvit.json         ← Manifest dell'app Devvit
├── package.json
├── tsconfig.json
└── .gitignore
```

***

## Come Funziona

1. **Trigger `AppInstall` / `AppUpgrade`** — All'installazione o ad ogni nuovo deploy, i job schedulati esistenti vengono cancellati e il job viene rischedulato con il cron definito in `config.ts`.
2. **Scheduler job** — Quando scatta il cron, il bot:
   - Recupera l'ID del post precedente da Redis
   - Elimina il vecchio post (se esiste)
   - Crea un nuovo post nel subreddit dove l'app è installata
   - Pinna il nuovo post
   - Salva il nuovo ID su Redis per la volta successiva
3. **Trigger manuale** — Un menu item visibile solo ai moderatori ("🔄 Forza ricreazione post settimanale") è disponibile nel menu del subreddit per triggerare il job immediatamente in qualsiasi momento.

***

## Deploy

```bash
# Build
npm run type-check

# Carica e pubblica l'app su Devvit
npm run upload

# Installa l'app su un subreddit (prima volta)
devvit install nome-della-tua-app NOME_SUBREDDIT
```

***

## Sviluppo e Log

```bash
# Visualizza i log in tempo reale per un subreddit specifico
devvit logs nome-della-tua-app --subreddit NOME_SUBREDDIT

# Sessione di playtest interattiva con log live
devvit playtest NOME_SUBREDDIT
```

***

## Script Disponibili

| Script | Comando | Descrizione |
|--------|---------|-------------|
| `upload` | `devvit upload` | Build e upload dell'app |
| `install-app` | `devvit install` | Installa l'app su un subreddit |
| `logs` | `devvit logs` | Stream dei log in tempo reale |

***

## Note

- Il cron schedule usa l'orario **UTC**. L'Italia (CEST) è UTC+2, quindi `0 9 * * 1` corrisponde alle **11:00 ora italiana**.
- Il bot posta come **account dell'app**, non con il tuo account Reddit personale.
- Il `subredditName` viene ricavato automaticamente dal contesto di installazione — non serve hardcodarlo.
- Per pinnare i post è necessario che l'app abbia i permessi Reddit a livello moderatore (`reddit: true` in `devvit.json`).

***

## Licenza

MIT
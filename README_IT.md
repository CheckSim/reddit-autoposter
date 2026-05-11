# Devvit Weekly Post Bot

App Devvit per Reddit che crea automaticamente un post settimanale in un subreddit, elimina quello della settimana precedente e ripete il ciclo all'infinito — il tutto in esecuzione serverless sull'infrastruttura di Reddit, senza bisogno di server esterni.

## 📋 Prerequisiti

- Node.js (installato in un ambiente virtuale — vedi sotto)
- Un account Reddit con permessi da moderatore nel subreddit di destinazione
- Un account sviluppatore Reddit su [developers.reddit.com](https://developers.reddit.com)

***

## 🐍 Installare Node.js in un Ambiente Virtuale

Questo progetto utilizza la combinazione `virtualenv` Python + `nodeenv` per mantenere Node.js isolato dall'installazione di sistema. È l'approccio consigliato se preferisci gestire le versioni di Node.js per singolo progetto.

### 1. Crea e attiva l'ambiente virtuale Python

```bash
# Crea il virtualenv
python3 -m venv .venv

# Attivalo (macOS/Linux)
source .venv/bin/activate

# Attivalo (Windows CMD)
.venv\Scripts\activate.bat

# Attivalo (Windows PowerShell)
.venv\Scripts\Activate.ps1
```

### 2. Installa nodeenv

```bash
pip install nodeenv
```

### 3. Installa Node.js dentro l'ambiente virtuale

```bash
nodeenv --node=lts --prebuilt -p
```

> Il flag `-p` indica a `nodeenv` di installare Node all'interno del virtualenv Python già attivo, mantenendo tutto contenuto e isolato.

### 4. Verifica l'installazione

```bash
node --version
npm --version
```

### 5. Installa la CLI di Devvit

```bash
npm install -g @devvit/cli
```

> ⚠️ Se il comando `devvit` non viene riconosciuto dopo l'installazione, usa `npx devvit` come prefisso per ogni comando.

***

## 🚀 Installazione e Configurazione

### 1. Autenticati con Reddit

```bash
npx devvit login
```

Si aprirà una finestra del browser che ti chiederà di autorizzare la CLI Devvit con il tuo account Reddit.

### 2. Clona o usa questo template

```bash
npx devvit new il-mio-bot-settimanale
cd il-mio-bot-settimanale
```

Sostituisci poi il contenuto di `src/main.ts` con il codice presente in questo repository.

### 3. Configura l'app

Apri `src/main.ts` e imposta il nome del subreddit e il contenuto del post:

```typescript
const SUBREDDIT_NAME = 'nomedeltuosubreddit'; // Senza r/
const POST_TITLE     = 'Thread Settimanale 🗓️';
const POST_BODY      = 'Questo è il corpo del post settimanale. Supporta il **Markdown**!';
```

***

## ⚙️ Struttura del Progetto

```
il-mio-bot-settimanale/
├── src/
│   └── main.ts          # Logica principale del bot (scheduler + Redis + creazione post)
├── devvit.yaml          # Manifest dell'app: nome, versione, configurazione scheduler
├── package.json         # Dipendenze Node.js
└── tsconfig.json        # Configurazione del compilatore TypeScript
```

***

## 🔁 Come Funziona

Ogni settimana all'orario programmato, il bot:

1. ✅ Legge l'ID del post precedente dallo store **Redis** integrato
2. ✅ **Elimina** il vecchio post (se esiste)
3. ✅ **Crea** un nuovo post con lo stesso titolo e corpo
4. ✅ **Salva** il nuovo ID del post su Redis per il ciclo successivo
5. ✅ Opzionalmente **fissa** il post in cima al subreddit (richiede permessi da moderatore)

Nessun server esterno, nessun cron job da gestire, nessun token da rinnovare — Reddit ospita tutto gratuitamente.

***

## ▶️ Deploy ed Esecuzione

### Carica l'app sui server di Reddit

```bash
npx devvit upload
```

### Installa l'app nel tuo subreddit

```bash
npx devvit install
```

Seleziona il subreddit di destinazione dalla lista interattiva.

### Esegui il job manualmente (per testare)

```bash
npx devvit exec scheduler run weekly-post
```

***

## 🔧 Personalizzare la Pianificazione

L'espressione cron è definita nel file `devvit.yaml`:

```yaml
scheduler:
  tasks:
    weekly-post:
      cron: "0 9 * * 1"   # Ogni lunedì alle 09:00 UTC
```

Alcune alternative comuni:

| Espressione       | Significato                     |
|-------------------|---------------------------------|
| `0 9 * * 1`       | Ogni lunedì alle 09:00 UTC      |
| `0 12 * * 5`      | Ogni venerdì alle 12:00 UTC     |
| `0 8 * * *`       | Ogni giorno alle 08:00 UTC      |
| `0 18 1 * *`      | Il primo giorno di ogni mese    |

> ⚠️ I tempi del cron Devvit sono in **UTC**. Ricordati di convertire dal tuo fuso orario locale (es. CEST = UTC+2, quindi le 11:00 CEST corrispondono alle 09:00 UTC).

***

## 📊 Log

Il bot usa `console.log` / `console.error` per l'output strutturato. Puoi visualizzare i log in tempo reale dalla CLI di Devvit:

```bash
npx devvit logs <nome-del-tuo-subreddit>
```

***

## ⚠️ Note Importanti

1. **Permessi da moderatore**: L'account Reddit usato durante `devvit login` deve essere moderatore del subreddit di destinazione.
2. **Slot sticky**: Reddit permette un massimo di 2 post fissati. Se entrambi gli slot sono occupati, il fissaggio fallirà silenziosamente.
3. **Persistenza Redis**: I dati sono salvati nell'istanza Redis gestita da Devvit, legata all'installazione dell'app. Se disinstalli e reinstalli l'app, l'ID del post salvato andrà perso.
4. **Privacy**: Non committare mai credenziali nel repository. Devvit gestisce l'autenticazione internamente — non sono necessari segreti nel codice.
5. **Rate limiting**: L'integrazione Devvit con le API di Reddit gestisce automaticamente i limiti di frequenza.

***

## 🐛 Risoluzione Problemi

### `command not found: devvit`
Usa `npx devvit` al posto di `devvit` direttamente. Questo aggira i problemi di PATH con i pacchetti npm installati globalmente.

### `Error: Not a moderator`
Assicurati che l'account Reddit usato durante `devvit login` abbia i privilegi da moderatore nel subreddit di destinazione.

### Il post viene creato ma non fissato
Verifica che non ci sia già più di 1 post fissato nel subreddit (Reddit permette un massimo di 2).

### Redis key non trovata alla prima esecuzione
È normale — alla primissima esecuzione non esiste ancora un ID del post precedente. Il bot gestisce questo caso in modo sicuro e procede a creare il primo post.

***

## 📚 Risorse

- [Documentazione Ufficiale Devvit](https://developers.reddit.com/docs/)
- [Devvit Scheduler API](https://developers.reddit.com/docs/capabilities/server/scheduler)
- [Devvit Redis API](https://developers.reddit.com/docs/capabilities/server/redis)
- [Reddit Responsible Builder Policy](https://support.reddithelp.com/hc/en-us/articles/42728983564564-Responsible-Builder-Policy)

***

**Buon botting! 🤖**
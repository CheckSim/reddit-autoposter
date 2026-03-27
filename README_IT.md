# Reddit Weekly Post Bot

Bot automatico per ricreare post settimanali su Reddit, eliminando il vecchio e creando il nuovo per massimizzare la visibilità.

## 📋 Prerequisiti

- Python 3.7 o superiore
- Account Reddit con permessi di moderatore sul subreddit target
- Credenziali API Reddit

## 🚀 Installazione

### 1. Installa Python

Verifica di avere Python installato:
```bash
python --version
```

Se non è installato, scaricalo da [python.org](https://www.python.org/downloads/)

### 2. Installa le librerie necessarie

```bash
pip install praw schedule
```

### 3. Crea l'applicazione Reddit

1. Vai su https://www.reddit.com/prefs/apps
2. Clicca su "create another app..." o "are you a developer? create an app..."
3. Compila i campi:
   - **name**: `WeeklyPostBot` (o un nome a tua scelta)
   - **type**: seleziona **script**
   - **description**: lascia vuoto o scrivi una descrizione
   - **about url**: lascia vuoto
   - **redirect uri**: `http://localhost:8080`
4. Clicca su "create app"
5. Annota:
   - **client_id**: la stringa sotto "personal use script"
   - **client_secret**: la stringa accanto a "secret"

## ⚙️ Configurazione

Hai due opzioni:

### Opzione A: Configurazione nel codice (più semplice)

Usa `reddit_weekly_bot.py` e modifica direttamente la sezione CONFIG nello script:

```python
CONFIG = {
    'client_id': 'abc123def456',              # Dal passo 3
    'client_secret': 'xyz789uvw321',          # Dal passo 3
    'username': 'il_tuo_username',            # Username Reddit
    'password': 'la_tua_password',            # Password Reddit
    'user_agent': 'WeeklyPostBot v1.0',
    
    'posts': [
        {
            'subreddit': 'nomedeltuosubreddit',     # Senza r/
            'title': 'Post Settimanale - Tool XYZ',
            'content': 'Contenuto del post...',
            'sticky': True,
            'schedule': '09:00'                      # Orario 24h (HH:MM)
        }
    ]
}
```

### Opzione B: Configurazione da file JSON (più pulito)

Usa `reddit_weekly_bot_json.py` e modifica il file `config.json`:

```json
{
    "client_id": "abc123def456",
    "client_secret": "xyz789uvw321",
    "username": "il_tuo_username",
    "password": "la_tua_password",
    "user_agent": "WeeklyPostBot v1.0",
    
    "posts": [
        {
            "subreddit": "nomedeltuosubreddit",
            "title": "Post Settimanale - Tool XYZ",
            "content": "# Titolo\n\nContenuto...",
            "sticky": true,
            "schedule": "09:00"
        }
    ]
}
```

**Nota sul contenuto**: Usa `\n` per andare a capo nel JSON.

## 🎯 Aggiungere più post

Puoi gestire più subreddit e più post. Basta aggiungere elementi all'array `posts`:

```python
'posts': [
    {
        'subreddit': 'primo_sub',
        'title': 'Post Settimanale #1',
        'content': 'Contenuto primo post',
        'sticky': True,
        'schedule': '09:00'  # Lunedì ore 9:00
    },
    {
        'subreddit': 'secondo_sub',
        'title': 'Post Settimanale #2',
        'content': 'Contenuto secondo post',
        'sticky': True,
        'schedule': '14:00'  # Lunedì ore 14:00
    },
    {
        'subreddit': 'primo_sub',
        'title': 'Altro Post Ricorrente',
        'content': 'Altro contenuto',
        'sticky': False,  # Non pinnato
        'schedule': '18:00'  # Lunedì ore 18:00
    }
]
```

## ▶️ Esecuzione

### Avvio del bot

**Con configurazione nel codice:**
```bash
python reddit_weekly_bot.py
```

**Con configurazione JSON:**
```bash
python reddit_weekly_bot_json.py
```

### Il bot farà:
1. ✅ Cerca ed elimina il vecchio post con lo stesso titolo
2. ✅ Crea un nuovo post identico
3. ✅ Lo pinna in alto al subreddit (se `sticky: True`)
4. ✅ Ripete l'operazione ogni settimana all'orario specificato

### Fermarlo

Premi `Ctrl+C` nel terminale

## 📊 Log

Il bot crea un file `reddit_bot.log` con tutti i dettagli delle operazioni:
- Post eliminati
- Post creati
- Errori eventuali
- Orari di esecuzione

## 🖥️ Mantenere il bot sempre attivo

### Opzione 1: Computer sempre acceso
Lascia il terminale aperto con il bot in esecuzione.

### Opzione 2: VPS/Cloud (raccomandato)
Usa un server cloud economico (DigitalOcean, Linode, AWS, etc.):

1. Noleggia un VPS Linux (5-10€/mese)
2. Carica lo script
3. Usa `screen` o `tmux` per mantenerlo attivo:

```bash
# Installa screen
sudo apt install screen

# Avvia una sessione
screen -S redditbot

# Avvia il bot
python reddit_weekly_bot.py

# Disconnettiti (il bot continua): Ctrl+A poi D
# Riconnettiti quando vuoi: screen -r redditbot
```

### Opzione 3: Systemd (Linux avanzato)
Crea un servizio systemd per avvio automatico al boot.

## 🔧 Personalizzazioni

### Cambiare la frequenza

Modifica la riga nel codice:
```python
schedule.every().week.at(schedule_time).do(...)
```

Puoi usare:
- `.day.at("10:00")` - Ogni giorno
- `.monday.at("10:00")` - Ogni lunedì
- `.week.at("10:00")` - Ogni settimana (default lunedì)
- `.hours.do(...)` - Ogni X ore
- `.minutes.do(...)` - Ogni X minuti

### Formattazione del contenuto

Il contenuto supporta Markdown Reddit:
```python
content = '''
# Titolo grande
## Sottotitolo

**Grassetto** e *corsivo*

- Lista
- Di
- Elementi

[Link](https://esempio.com)

> Citazione

`codice inline`

    blocco di codice
'''
```

## ⚠️ Note importanti

1. **Permessi**: L'account deve essere moderatore del subreddit
2. **Rate limiting**: Reddit limita le API. Il bot gestisce pause automatiche
3. **Sticky slots**: Reddit permette max 2 post pinnati. Il bot usa il primo slot
4. **Privacy**: Non condividere mai `client_secret` e `password`
5. **Backup**: Salva il file `config.json` in modo sicuro

## 🐛 Troubleshooting

### "Invalid credentials"
- Verifica username e password
- Verifica client_id e client_secret
- Controlla di non avere 2FA attivo (o usa token)

### "Forbidden (HTTP 403)"
- Verifica di essere moderatore del subreddit
- Controlla i permessi mod (devi avere "posts")

### "Rate limit exceeded"
- Attendi qualche minuto
- Il bot ha meccanismi di attesa automatici

### Il post non viene pinnato
- Verifica di avere i permessi "posts" come mod
- Controlla che non ci siano già 2 post pinnati

## 📝 Esempio completo

```json
{
    "client_id": "abc123XYZ",
    "client_secret": "xyz456ABC-secret",
    "username": "MioBot",
    "password": "PasswordSicura123!",
    "user_agent": "WeeklyPostBot v1.0 by u/MioBot",
    
    "posts": [
        {
            "subreddit": "miosubreddit",
            "title": "📢 Thread Settimanale - Tool Consigliato",
            "content": "# Benvenuti nel thread settimanale!\n\n## Tool della settimana\n\n**Nome**: Tool XYZ\n**Link**: https://esempio.com\n**Descrizione**: Questo tool è fantastico perché...\n\n### Come usarlo\n\n1. Passo uno\n2. Passo due\n3. Passo tre\n\n---\n\n*Post ricreato automaticamente ogni lunedì alle 9:00*",
            "sticky": true,
            "schedule": "09:00"
        }
    ]
}
```

## 📞 Supporto

Per problemi o domande:
- Controlla i log in `reddit_bot.log`
- Verifica la documentazione PRAW: https://praw.readthedocs.io/
- Controlla le API Reddit: https://www.reddit.com/dev/api/

---

**Buon botting! 🤖**

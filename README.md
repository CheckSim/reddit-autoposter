# Devvit Weekly Post Bot — Template

A template for building a Reddit bot with [Devvit](https://developers.reddit.com/docs/devvit) that automatically creates and pins a recurring post on a schedule, deletes the previous one, and saves state with Redis.

***

## Prerequisites

- Python 3.8+ (optional)
- Node.js (if developed with python it can be installed via `nodeenv` inside a Python virtualenv — see below)
- A Reddit account with moderator access to at least one subreddit
- A [Devvit developer account](https://developers.reddit.com)

***

## Setting Up Node.js in a Virtual Environment

This project has been developed using `nodeenv` to run Node.js inside a Python virtual environment, keeping dependencies isolated.

If you already have Node.js in your machine, you can skip the step from 1 to 4.

```bash
# 1. Create a Python virtual environment
python3 -m venv .venv

# 2. Activate it
source .venv/bin/activate        # macOS/Linux
# .venv\Scripts\activate         # Windows

# 3. Install nodeenv
pip install nodeenv

# 4. Install Node.js inside the virtual environment
nodeenv --node=20.11.0 --prebuilt -p

# 5. Verify Node.js and npm are available
node --version
npm --version
```

> All subsequent commands must be run with the virtual environment active.

***

## Installation

```bash
# Install dependencies
npm install

# Install the Devvit CLI globally
npm install -g devvit

# Log in to your Devvit account
devvit login
```

***

## Configuration

All project-specific settings live in a **single file**: `src/config.ts`.

```typescript
// src/config.ts
export const APP_CONFIG = {
  // Must match "name" in devvit.json
  appName: 'your-app-name',

  // Cron schedule (standard 5-part UNIX format, UTC)
  // '0 9 * * 1'     → every Monday at 09:00 UTC
  // '0 9 1 * *'     → first day of the month at 09:00 UTC
  cron: '0 9 * * 1',

  // Post title
  postTitle: 'Weekly Discussion 🗓️',

  // Post content (Reddit Markdown supported)
  postContent: `# Welcome to the weekly thread!\n\n*Automatically created by a bot.*`,
};
```

Also update the `name` field in `devvit.json` to match `appName`:

```json
{
  "name": "your-app-name"
}
```

> ⚠️ `appName` in `config.ts` and `name` in `devvit.json` must always be identical.

***

## Project Structure

```
├── src/
│   ├── config.ts       ← Edit this file to configure the bot
│   └── main.ts         ← Bot logic (scheduler, triggers, menu item)
├── devvit.json         ← Devvit app manifest
├── package.json
├── tsconfig.json
└── .gitignore
```

***

## How It Works

1. **`AppInstall` / `AppUpgrade` trigger** — On installation or each new deploy, any existing scheduled jobs are cancelled and the job is rescheduled with the cron from `config.ts`.
2. **Scheduler job** — When the cron fires, the bot:
   - Retrieves the previous post ID from Redis
   - Deletes the old post (if it exists)
   - Creates a new post in the subreddit where the app is installed
   - Pins the new post
   - Saves the new post ID to Redis for next time
3. **Manual trigger** — A moderator-only menu item ("🔄 Force recreate weekly post") is available in the subreddit menu to trigger the job immediately at any time.

***

## Deploy

```bash
# Build
npm run type-check

# Upload and deploy the app to Devvit
npm run upload

# Install the app on a subreddit (first time)
devvit install your-app-name SUBREDDIT_NAME
```

⚠️ Important: After Every Deploy
After each deploy where you changed the cron or any scheduler settings, you must manually reschedule the job:

Go to your subreddit

Open the subreddit menu

Click ⚙️ Reset and reschedule cron (use after deploy)

This cancels any stale scheduled jobs and registers the new cron from config.ts. You do not need to do this if you only changed postTitle or postContent.

***

## Development & Logs

```bash
# Watch logs for a specific subreddit
devvit logs your-app-name --subreddit SUBREDDIT_NAME

# Interactive playtest session with live logs
devvit playtest SUBREDDIT_NAME
```

***

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `upload` | `devvit upload` | Build and upload the app |
| `install-app` | `devvit install` | Install the app on a subreddit |
| `logs` | `devvit logs` | Stream live logs |

***

## Notes

- The cron schedule uses **UTC time**. Italy (CEST) is UTC+2, so `0 9 * * 1` runs at **11:00 AM Italian time**.
- The bot posts as the **app account**, not your personal Reddit account.
- The `subredditName` is automatically inferred from the installation context — no hardcoding needed.
- Pinning a post requires the app to have moderator-level Reddit permissions (`reddit: true` in `devvit.json`).

***

## License

MIT
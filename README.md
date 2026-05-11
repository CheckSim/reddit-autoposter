# Devvit Weekly Post Bot

Automatic Devvit app for Reddit that creates a weekly post in a subreddit, deletes the previous one, and repeats the cycle indefinitely — all running serverlessly on Reddit's own infrastructure.

## 📋 Prerequisites

- Node.js (installed inside a virtual environment — see below)
- A Reddit account with moderator permissions on the target subreddit
- A Reddit Developer account on [developers.reddit.com](https://developers.reddit.com)

***

## 🐍 Installing Node.js in a Virtual Environment

This project uses a Python `virtualenv` + `nodeenv` combo to keep Node.js isolated from your system installation. This is the recommended approach if you prefer to manage Node.js versions per-project.

### 1. Create and activate the Python virtual environment

```bash
# Create the virtualenv
python3 -m venv .venv

# Activate it (macOS/Linux)
source .venv/bin/activate

# Activate it (Windows CMD)
.venv\Scripts\activate.bat

# Activate it (Windows PowerShell)
.venv\Scripts\Activate.ps1
```

### 2. Install nodeenv

```bash
pip install nodeenv
```

### 3. Install Node.js inside the virtual environment

```bash
nodeenv --node=lts --prebuilt -p
```

> The `-p` flag tells `nodeenv` to install Node inside the already active Python virtualenv, so everything stays contained.

### 4. Verify the installation

```bash
node --version
npm --version
```

### 5. Install the Devvit CLI

```bash
npm install -g @devvit/cli
```

> ⚠️ If the `devvit` command is not recognized after installation, use `npx devvit` as a prefix for every command instead.

***

## 🚀 Installation & Setup

### 1. Authenticate with Reddit

```bash
npx devvit login
```

A browser window will open asking you to authorize the Devvit CLI with your Reddit account.

### 2. Clone or use this template

```bash
npx devvit new my-weekly-bot
cd my-weekly-bot
```

Then replace the content of `src/main.ts` with the code from this repository.

### 3. Configure the app

Open `src/main.ts` and set your subreddit name and post content:

```typescript
const SUBREDDIT_NAME = 'yoursubredditname'; // Without r/
const POST_TITLE     = 'Weekly Thread 🗓️';
const POST_BODY      = 'This is the weekly post body. Supports **Markdown**!';
```

***

## ⚙️ Project Structure

```
my-weekly-bot/
├── src/
│   └── main.ts          # Core bot logic (scheduler + Redis + post creation)
├── devvit.yaml          # App manifest: name, version, scheduler config
├── package.json         # Node.js dependencies
└── tsconfig.json        # TypeScript compiler config
```

***

## 🔁 How It Works

Every week at the scheduled time, the bot:

1. ✅ Reads the previous post ID from the **Redis** key-value store
2. ✅ **Deletes** the old post (if it exists)
3. ✅ **Creates** a new post with the same title and body
4. ✅ **Saves** the new post ID to Redis for the next cycle
5. ✅ Optionally **pins** the post to the subreddit (requires moderator permissions)

No external server, no cron job, no tokens to refresh — Reddit hosts everything for free.

***

## ▶️ Deploy & Run

### Upload the app to Reddit's servers

```bash
npx devvit upload
```

### Install the app on your subreddit

```bash
npx devvit install
```

Select your target subreddit from the interactive list.

### Trigger the job manually (for testing)

```bash
npx devvit exec scheduler run post-settimanale
```

***

## 🔧 Customizing the Schedule

The cron expression is defined in `devvit.yaml`:

```yaml
scheduler:
  tasks:
    weekly-post:
      cron: "0 9 * * 1"   # Every Monday at 09:00 UTC
```

Common alternatives:

| Expression        | Meaning                  |
|-------------------|--------------------------|
| `0 9 * * 1`       | Every Monday at 09:00 UTC |
| `0 12 * * 5`      | Every Friday at 12:00 UTC |
| `0 8 * * *`       | Every day at 08:00 UTC    |
| `0 18 1 * *`      | First day of each month   |

> ⚠️ Devvit cron times are in **UTC**. Remember to convert from your local timezone (e.g., CEST = UTC+2).

***

## 📊 Logging

The bot uses `console.log` / `console.error` for structured output. You can view logs in real time from the Devvit CLI:

```bash
npx devvit logs <your-subreddit>
```

***

## ⚠️ Important Notes

1. **Moderator permissions**: The Reddit account must be a moderator of the target subreddit.
2. **Sticky slots**: Reddit allows a maximum of 2 pinned posts. If both slots are taken, pinning will fail silently.
3. **Redis persistence**: Data is stored in Devvit's managed Redis instance, tied to the app installation. If you uninstall and reinstall the app, the stored post ID is lost.
4. **Privacy**: Never commit credentials to the repository. Devvit handles authentication internally — no secrets needed in the code.
5. **Rate limiting**: Devvit's Reddit API integration handles rate limits automatically.

***

## 🐛 Troubleshooting

### `command not found: devvit`
Use `npx devvit` instead of `devvit` directly. This bypasses PATH issues with globally installed npm packages.

### `Error: Not a moderator`
Make sure the Reddit account used during `devvit login` has moderator privileges on the target subreddit.

### Post is created but not pinned
Check that no more than 1 post is already pinned in the subreddit (Reddit allows a maximum of 2).

### Redis key not found on first run
This is expected — on the very first execution there is no previous post ID. The bot handles this gracefully and proceeds to create the first post.

***

## 📚 Resources

- [Devvit Official Documentation](https://developers.reddit.com/docs/)
- [Devvit Scheduler API](https://developers.reddit.com/docs/capabilities/server/scheduler)
- [Devvit Redis API](https://developers.reddit.com/docs/capabilities/server/redis)
- [Reddit Responsible Builder Policy](https://support.reddithelp.com/hc/en-us/articles/42728983564564-Responsible-Builder-Policy)

***

**Happy botting! 🤖**
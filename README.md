# Reddit Weekly Post Bot

Automatic bot to recreate weekly posts on Reddit, deleting the old one and creating a new one to maximize visibility.

## 📋 Prerequisites

- Python 3.7 or higher
- Reddit account with moderator permissions on the target subreddit
- Reddit API credentials

## 🚀 Installation

### 1. Install Python

Check if you have Python installed:
```bash
python --version
```

If not installed, download it from [python.org](https://www.python.org/downloads/)

### 2. Install required libraries

```bash
pip install praw schedule
```

### 3. Create a Reddit application

1. Go to https://www.reddit.com/prefs/apps
2. Click "create another app..." or "are you a developer? create an app..."
3. Fill in the fields:
   - **name**: `WeeklyPostBot` (or any name you prefer)
   - **type**: select **script**
   - **description**: leave empty or write a description
   - **about url**: leave empty
   - **redirect uri**: `http://localhost:8080`
4. Click "create app"
5. Note down:
   - **client_id**: the string under "personal use script"
   - **client_secret**: the string next to "secret"

## ⚙️ Configuration

You have two options:

### Option A: Configuration in code (simpler)

Use `reddit_weekly_bot.py` and directly modify the CONFIG section in the script:

```python
CONFIG = {
    'client_id': 'abc123def456',              # From step 3
    'client_secret': 'xyz789uvw321',          # From step 3
    'username': 'your_username',              # Reddit username
    'password': 'your_password',              # Reddit password
    'user_agent': 'WeeklyPostBot v1.0',
    
    'posts': [
        {
            'subreddit': 'yoursubredditname',        # Without r/
            'title': 'Weekly Post - Tool XYZ',
            'content': 'Post content...',
            'sticky': True,
            'schedule': '09:00'                      # 24h format (HH:MM)
        }
    ]
}
```

### Option B: Configuration from JSON file (cleaner)

Use `reddit_weekly_bot_json.py` and modify the `config.json` file:

```json
{
    "client_id": "abc123def456",
    "client_secret": "xyz789uvw321",
    "username": "your_username",
    "password": "your_password",
    "user_agent": "WeeklyPostBot v1.0",
    
    "posts": [
        {
            "subreddit": "yoursubredditname",
            "title": "Weekly Post - Tool XYZ",
            "content": "# Title\n\nContent...",
            "sticky": true,
            "schedule": "09:00"
        }
    ]
}
```

**Note on content**: Use `\n` for line breaks in JSON.

## 🎯 Adding Multiple Posts

You can manage multiple subreddits and posts. Just add elements to the `posts` array:

```python
'posts': [
    {
        'subreddit': 'first_sub',
        'title': 'Weekly Post #1',
        'content': 'First post content',
        'sticky': True,
        'schedule': '09:00'  # Monday at 9:00 AM
    },
    {
        'subreddit': 'second_sub',
        'title': 'Weekly Post #2',
        'content': 'Second post content',
        'sticky': True,
        'schedule': '14:00'  # Monday at 2:00 PM
    },
    {
        'subreddit': 'first_sub',
        'title': 'Another Recurring Post',
        'content': 'Other content',
        'sticky': False,  # Not pinned
        'schedule': '18:00'  # Monday at 6:00 PM
    }
]
```

## ▶️ Running the Bot

### Starting the bot

**With configuration in code:**
```bash
python reddit_weekly_bot.py
```

**With JSON configuration:**
```bash
python reddit_weekly_bot_json.py
```

### The bot will:
1. ✅ Search and delete the old post with the same title
2. ✅ Create a new identical post
3. ✅ Pin it to the top of the subreddit (if `sticky: True`)
4. ✅ Repeat the operation every week at the specified time

### Stopping it

Press `Ctrl+C` in the terminal

## 📊 Logging

The bot creates a `reddit_bot.log` file with all operation details:
- Deleted posts
- Created posts
- Any errors
- Execution times

## 🖥️ Keeping the Bot Always Running

### Option 1: Always-on computer
Leave the terminal open with the bot running.

### Option 2: VPS/Cloud (recommended)
Use an inexpensive cloud server (DigitalOcean, Linode, AWS, etc.):

1. Rent a Linux VPS ($5-10/month)
2. Upload the script
3. Use `screen` or `tmux` to keep it running:

```bash
# Install screen
sudo apt install screen

# Start a session
screen -S redditbot

# Start the bot
python reddit_weekly_bot.py

# Detach (bot continues running): Ctrl+A then D
# Reattach when needed: screen -r redditbot
```

### Option 3: Systemd (Advanced Linux)
Create a systemd service for automatic startup on boot.

## 🔧 Customizations

### Changing the frequency

Modify the line in the code:
```python
schedule.every().week.at(schedule_time).do(...)
```

You can use:
- `.day.at("10:00")` - Every day
- `.monday.at("10:00")` - Every Monday
- `.week.at("10:00")` - Every week (default Monday)
- `.hours.do(...)` - Every X hours
- `.minutes.do(...)` - Every X minutes

### Content formatting

The content supports Reddit Markdown:
```python
content = '''
# Large title
## Subtitle

**Bold** and *italic*

- List
- Of
- Items

[Link](https://example.com)

> Quote

`inline code`

    code block
'''
```

## ⚠️ Important Notes

1. **Permissions**: The account must be a moderator of the subreddit
2. **Rate limiting**: Reddit limits API usage. The bot handles automatic pauses
3. **Sticky slots**: Reddit allows max 2 pinned posts. The bot uses the first slot
4. **Privacy**: Never share your `client_secret` and `password`
5. **Backup**: Save the `config.json` file securely

## 🐛 Troubleshooting

### "Invalid credentials"
- Verify username and password
- Check client_id and client_secret
- Make sure you don't have 2FA enabled (or use a token)

### "Forbidden (HTTP 403)"
- Verify you're a moderator of the subreddit
- Check mod permissions (you need "posts" permission)

### "Rate limit exceeded"
- Wait a few minutes
- The bot has automatic waiting mechanisms

### Post doesn't get pinned
- Verify you have "posts" mod permissions
- Check there aren't already 2 pinned posts

## 📝 Complete Example

```json
{
    "client_id": "abc123XYZ",
    "client_secret": "xyz456ABC-secret",
    "username": "MyBot",
    "password": "SecurePassword123!",
    "user_agent": "WeeklyPostBot v1.0 by u/MyBot",
    
    "posts": [
        {
            "subreddit": "mysubreddit",
            "title": "📢 Weekly Thread - Recommended Tool",
            "content": "# Welcome to the weekly thread!\n\n## Tool of the week\n\n**Name**: Tool XYZ\n**Link**: https://example.com\n**Description**: This tool is awesome because...\n\n### How to use it\n\n1. Step one\n2. Step two\n3. Step three\n\n---\n\n*Post automatically recreated every Monday at 9:00 AM*",
            "sticky": true,
            "schedule": "09:00"
        }
    ]
}
```

## 📞 Support

For issues or questions:
- Check the logs in `reddit_bot.log`
- Check PRAW documentation: https://praw.readthedocs.io/
- Check Reddit API: https://www.reddit.com/dev/api/

---

**Happy botting! 🤖**
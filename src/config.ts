// src/config.ts
// ⚠️ When you change appName, remember to update also "name" in devvit.json

export const APP_CONFIG = {
  // App name (it must match "name" in devvit.json)
  appName: 'MY_APP_NAME',

  // With schedule
  // Examples:
  //   '0 9 * * 1'      → every monday at 09:00 UTC
  //   '0 9 * * 1,3,5'  → monday, wednesday, friday at 09:00 UTC
  //   '0 9 1 * *'      → the first of the month at 09:00 UTC
  cron: '*/5 * * * *', // Every 5 minutes (for testing, change to '0 9 * * 1' for production)

  // Post title
  postTitle: 'Weekly thread 🗓️',

  // Post content (supports Reddit markdown)
  postContent: `# Welcome in the weekly thread!

This post is automatically recreated every week.

---

*This is an automated post created by a bot*`,
};
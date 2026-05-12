import { Devvit } from '@devvit/public-api';
import { APP_CONFIG } from './config.js';

Devvit.configure({
  redditAPI: true,
  redis: true,
});

// Job definition
Devvit.addSchedulerJob({
  name: APP_CONFIG.appName,
  onRun: async (_, context) => {
    console.log('=== Starting weekly post recreation ===');

    try {
      // STEP 1: Delete old post if exists
      const oldPostId = await context.redis.get('weekly_post_id');
      if (oldPostId) {
        try {
          const oldPost = await context.reddit.getPostById(oldPostId);
          await oldPost.delete();
          console.log(`✓ Old post deleted: ${oldPostId}`);
        } catch (error) {
          console.log(`⚠️ Unable to delete the old post: ${error}`);
        }
      } else {
        console.log('No previous post found (first execution?)');
      }

      // STEP 2: Create new post
      const newPost = await context.reddit.submitPost({
        subredditName: await context.reddit.getCurrentSubreddit().then(s => s.name),
        title: APP_CONFIG.postTitle,
        text: APP_CONFIG.postContent,
      });
      console.log(`✓ New post created: ${newPost.id}`);

      // STEP 3: Pin the new post
      try {
        await newPost.sticky();
        console.log('✓ Post pinned successfully');
      } catch (error) {
        console.log(`⚠️ Unable to pin the post: ${error}`);
      }

      // STEP 4: Save the ID on Redis
      await context.redis.set('weekly_post_id', newPost.id);
      console.log(`✓ ID saved on Redis: ${newPost.id}`);

      console.log('=== Weekly post recreation completed successfully ===');

    } catch (error) {
      console.error('❌ Error during execution:', error);
      throw error;
    }
  },
});

// Common function to schedule the job (used on install and upgrade)
async function scheduleJob(context: any) {
  const jobs = await context.scheduler.listJobs();
  for (const job of jobs) {
    await context.scheduler.cancelJob(job.id);
  }
  await context.scheduler.runJob({
    name: APP_CONFIG.appName,
    cron: APP_CONFIG.cron,
  });
  console.log(`✓ Job scheduled with cron: ${APP_CONFIG.cron}`);
}

// Automatic triggers on app install and upgrade
Devvit.addTrigger({
  event: 'AppInstall',
  onEvent: async (_, context) => scheduleJob(context),
});

// Debug menu to reset and reschedule the cron
Devvit.addMenuItem({
  label: '⚙️ Reset and reschedule cron (use after deploy)',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_, context) => {
    const jobs = await context.scheduler.listJobs();
    for (const job of jobs) {
      await context.scheduler.cancelJob(job.id);
    }
    await context.scheduler.runJob({
      name: APP_CONFIG.appName,
      cron: APP_CONFIG.cron,
    });
    context.ui.showToast(`Cancelled ${jobs.length} jobs, new cron scheduled`);
  },
});

// Item menu to manually trigger the job
Devvit.addMenuItem({
  label: '🔄 Trigger weekly post creation',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_, context) => {
    await context.scheduler.runJob({
      name: APP_CONFIG.appName,
      runAt: new Date(),
    });
    context.ui.showToast('Weekly post in creation...');
  },
});

// Debug menu to list active jobs
Devvit.addMenuItem({
  label: '🔍 Debug: show active jobs',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_, context) => {
    const jobs = await context.scheduler.listJobs();
    console.log(`Active jobs: ${jobs.length}`);
    for (const job of jobs) {
      console.log(JSON.stringify(job));
    }
    context.ui.showToast(`Active jobs: ${jobs.length} — see log`);
  },
});



export default Devvit;
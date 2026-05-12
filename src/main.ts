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
        console.log('✓ Post pinnato');
      } catch (error) {
        console.log(`⚠️ Impossibile pinnare il post: ${error}`);
      }

      // STEP 4: Save the ID on Redis
      await context.redis.set('weekly_post_id', newPost.id);
      console.log(`✓ ID salvato su Redis: ${newPost.id}`);

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
  console.log(`✓ Job schedulato con cron: ${APP_CONFIG.cron}`);
}

// Automatic triggers on app install and upgrade
Devvit.addTrigger({
  event: 'AppInstall',
  onEvent: async (_, context) => scheduleJob(context),
});

Devvit.addTrigger({
  event: 'AppUpgrade',
  onEvent: async (_, context) => scheduleJob(context),
});

// Item menu to manually trigger the job
Devvit.addMenuItem({
  label: '🔄 Forza ricreazione post settimanale',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_, context) => {
    await context.scheduler.runJob({
      name: APP_CONFIG.appName,
      runAt: new Date(),
    });
    context.ui.showToast('Post settimanale in creazione...');
  },
});

export default Devvit;
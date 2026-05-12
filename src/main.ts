import { Devvit } from '@devvit/public-api';
import { APP_CONFIG } from './config.js';

Devvit.configure({
  redditAPI: true,
  redis: true,
});

// Definizione del job
Devvit.addSchedulerJob({
  name: APP_CONFIG.appName,
  onRun: async (_, context) => {
    console.log('=== Avvio ricreazione post settimanale ===');

    try {
      // STEP 1: Elimina il vecchio post
      const oldPostId = await context.redis.get('weekly_post_id');
      if (oldPostId) {
        try {
          const oldPost = await context.reddit.getPostById(oldPostId);
          await oldPost.delete();
          console.log(`✓ Vecchio post eliminato: ${oldPostId}`);
        } catch (error) {
          console.log(`⚠️ Impossibile eliminare il vecchio post: ${error}`);
        }
      } else {
        console.log('Nessun post precedente trovato (prima esecuzione?)');
      }

      // STEP 2: Crea il nuovo post
      const newPost = await context.reddit.submitPost({
        subredditName: await context.reddit.getCurrentSubreddit().then(s => s.name),
        title: APP_CONFIG.postTitle,
        text: APP_CONFIG.postContent,
      });
      console.log(`✓ Nuovo post creato: ${newPost.id}`);

      // STEP 3: Pinna il post
      try {
        await newPost.sticky();
        console.log('✓ Post pinnato');
      } catch (error) {
        console.log(`⚠️ Impossibile pinnare il post: ${error}`);
      }

      // STEP 4: Salva l'ID su Redis
      await context.redis.set('weekly_post_id', newPost.id);
      console.log(`✓ ID salvato su Redis: ${newPost.id}`);

      console.log('=== Ricreazione completata con successo ===');

    } catch (error) {
      console.error('❌ Errore durante l\'esecuzione:', error);
      throw error;
    }
  },
});

// Funzione comune per schedulare/rischedulare il job
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

// Trigger automatici
Devvit.addTrigger({
  event: 'AppInstall',
  onEvent: async (_, context) => scheduleJob(context),
});

Devvit.addTrigger({
  event: 'AppUpgrade',
  onEvent: async (_, context) => scheduleJob(context),
});

// Menu item per forzare manualmente la creazione del post
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
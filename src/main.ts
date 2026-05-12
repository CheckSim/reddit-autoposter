import { Devvit } from '@devvit/public-api';

// Configurazione
Devvit.configure({
  redditAPI: true,
  redis: true
});

// Configurazioni del bot (MODIFICA QUESTI VALORI)
const CONFIG = {
  postTitle: 'Discussione Settimanale 🗓️',
  postContent: `# Benvenuti nel thread settimanale!

Questo post viene ricreato automaticamente ogni settimana.

---

*Questo è un post automatico creato da un bot*`
};

// Definizione del job (cosa fare quando scatta)
Devvit.addSchedulerJob({
  name: 'rtaweeklyposter',
  onRun: async (event, context) => {
    console.log('=== Avvio ricreazione post settimanale ===');
    
    try {
      // STEP 1: Recupera l'ID del vecchio post da Redis
      const oldPostId = await context.redis.get('weekly_post_id');
      
      if (oldPostId) {
        console.log(`Trovato vecchio post ID: ${oldPostId}`);
        try {
          const oldPost = await context.reddit.getPostById(oldPostId);
          await oldPost.delete();
          console.log(`✓ Vecchio post eliminato: ${oldPostId}`);
        } catch (error) {
          console.log(`⚠️ Impossibile eliminare il vecchio post: ${error}`);
        }
      } else {
        console.log('Nessun post precedente trovato in Redis (prima esecuzione?)');
      }

      // STEP 2: Crea il nuovo post
      console.log('Creazione nuovo post...');
      const newPost = await context.reddit.submitPost({
        subredditName: await context.reddit.getCurrentSubreddit().then(s => s.name),
        title: CONFIG.postTitle,
        text: CONFIG.postContent,
      });
      
      console.log(`✓ Nuovo post creato: ${newPost.id}`);

      // STEP 3: Pinna il post
      try {
        await newPost.sticky();
        console.log('✓ Post pinnato con successo');
      } catch (error) {
        console.log(`⚠️ Impossibile pinnare il post: ${error}`);
      }

      // STEP 4: Salva il nuovo ID su Redis per la prossima settimana
      await context.redis.set('weekly_post_id', newPost.id);
      console.log(`✓ ID salvato su Redis: ${newPost.id}`);
      
      console.log('=== Ricreazione completata con successo ===');
      
    } catch (error) {
      console.error('❌ Errore durante l\'esecuzione:', error);
      throw error;
    }
  }
});

// Funzione comune per schedulare
async function scheduleWeeklyJob(context: any) {
  const jobs = await context.scheduler.listJobs();
  for (const job of jobs) {
    await context.scheduler.cancelJob(job.id);
  }
  await context.scheduler.runJob({
    name: 'rtaweeklyposter',
    cron: '0 9 * * 1',
  });
  console.log('✓ Job settimanale schedulato');
}

Devvit.addTrigger({
  event: 'AppInstall',
  onEvent: async (_, context) => scheduleWeeklyJob(context),
});

Devvit.addTrigger({
  event: 'AppUpgrade',
  onEvent: async (_, context) => scheduleWeeklyJob(context),
});

Devvit.addMenuItem({
  label: '🔄 Forza ricreazione post settimanale',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_, context) => {
    await context.scheduler.runJob({
      name: 'rtaweeklyposter',
      runAt: new Date(),
    });
    context.ui.showToast('Post settimanale in creazione...');
  },
});

export default Devvit;
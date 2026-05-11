import { Devvit } from '@devvit/public-api';

// Configurazione
Devvit.configure({
  redditAPI: true,
  redis: true
});

// Configurazioni del bot (MODIFICA QUESTI VALORI)
const CONFIG = {
  subredditName: 'IL_TUO_SUBREDDIT',  // Senza "r/"
  postTitle: 'Discussione Settimanale 🗓️',
  postContent: `# Benvenuti nel thread settimanale!

Questo post viene ricreato automaticamente ogni settimana.

---

*Questo è un post automatico creato da un bot*`
};

// Scheduler job
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
          console.log(`⚠️ Impossibile eliminare il vecchio post (potrebbe essere già stato eliminato): ${error}`);
        }
      } else {
        console.log('Nessun post precedente trovato in Redis (prima esecuzione?)');
      }

      // STEP 2: Crea il nuovo post
      console.log('Creazione nuovo post...');
      const newPost = await context.reddit.submitPost({
        subredditName: CONFIG.subredditName,
        title: CONFIG.postTitle,
        text: CONFIG.postContent,
      });
      
      console.log(`✓ Nuovo post creato: ${newPost.id}`);

      // STEP 3: Pinna il post (opzionale ma raccomandato)
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
      throw error; // Rilancia l'errore per permettere a Devvit di rilevarlo
    }
  }
});

export default Devvit;
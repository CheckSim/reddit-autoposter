import { Devvit } from '@devvit/public-api';

// 1. Abilitiamo i plugin necessari: Redis (database) e l'API di Reddit
Devvit.configure({
  redditAPI: true
});

// 2. Definiamo l'azione schedulata
Devvit.addSchedulerJob({
  name: 'rtaweeklyposter', // Deve coincidere col nome nel devvit.json
  onRun: async (event, context) => {
    const nomeSubreddit = 'IL_TUO_SUBREDDIT'; // Inserisci il nome senza "r/"
    
    // A. Controlliamo se esiste un ID del post precedente in memoria
    const oldPostId = await context.redis.get('weekly_post_id');
    
    if (oldPostId) {
      try {
        // Eliminiamo il vecchio post
        const vecchiopost = await context.reddit.getPostById(oldPostId);
        await vecchiopost.delete();
        console.log(`Vecchio post ${oldPostId} eliminato.`);
      } catch (error) {
        console.log("Errore nell'eliminazione, il post potrebbe essere già cancellato.");
      }
    }

    // B. Creiamo il nuovo post
    const nuovoPost = await context.reddit.submitPost({
      subredditName: nomeSubreddit,
      title: 'Discussione Settimanale',
      text: 'Questo è il post automatico della settimana.',
    });

    // C. Salviamo il nuovo ID su Redis per la prossima settimana
    await context.redis.set('weekly_post_id', nuovoPost.id);
    console.log(`Nuovo post creato con ID: ${nuovoPost.id}`);
  }
});

export default Devvit;
import { Devvit } from '@devvit/public-api';

// 1. Abilitiamo i plugin necessari: Redis (database) e l'API di Reddit
Devvit.configure({
  redditAPI: true
});

// 2. Definiamo l'azione schedulata
Devvit.addSchedulerJob({
  name: 'post-settimanale', // Deve coincidere col nome nel devvit.json
  onRun: async (event, context) => {
    const nomeSubreddit = 'IL_TUO_SUBREDDIT'; // Inserisci il nome senza "r/"
    const postTitle = 'Discussione Settimanale';

    // A. Cerchiamo e rimuoviamo il vecchio post con lo stesso titolo
    try {
      // Otteniamo i post recenti del subreddit per cercare quello con lo stesso titolo
      const posts = await context.reddit.getNewPosts({
        subredditName: nomeSubreddit,
        limit: 10 // Controlliamo gli ultimi 10 post
      }).all();

      // Otteniamo l'utente corrente
      const currentUser = await context.reddit.getCurrentUser();

      // Se non riusciamo a ottenere l'utente corrente, saltiamo la ricerca del post vecchio
      if (currentUser) {
        // Cerchiamo il post con lo stesso titolo creato da questo bot
        const oldPost = posts.find(post =>
          post.title === postTitle &&
          post.authorName === currentUser.username
        );

        if (oldPost) {
          await oldPost.remove();
          console.log(`Vecchio post "${oldPost.title}" (ID: ${oldPost.id}) eliminato.`);
        }
      } else {
        console.log("Impossibile ottenere l'utente corrente, salto la ricerca del post vecchio.");
      }
    } catch (error) {
      console.log("Errore nella ricerca/eliminazione del vecchio post:", error);
    }

    // B. Creiamo il nuovo post
    const nuovoPost = await context.reddit.submitPost({
      subredditName: nomeSubreddit,
      title: postTitle,
      text: 'Questo è il post automatico della settimana.',
    });

    // C. Piniamo il nuovo post
    try {
      await nuovoPost.sticky(1); // Posizione 1 = in alto
      console.log(`Nuovo post "${nuovoPost.title}" (ID: ${nuovoPost.id}) creato e pinnato.`);
    } catch (error) {
      console.log("Errore nel pinnare il post:", error);
      // Comunque continuiamo poiché il post è stato creato
      console.log(`Nuovo post creato con ID: ${nuovoPost.id} (ma non pinnato a causa di errore)`);
    }
  }
});

export default Devvit;
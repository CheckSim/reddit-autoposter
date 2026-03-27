#!/usr/bin/env python3
"""
Reddit Weekly Post Bot - Versione con config JSON
Ricrea automaticamente post settimanali in subreddit specificati
"""

import praw
import schedule
import time
import logging
import json
from datetime import datetime

# Configurazione logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('reddit_bot.log'),
        logging.StreamHandler()
    ]
)

class RedditWeeklyBot:
    def __init__(self, config):
        """
        Inizializza il bot con la configurazione fornita
        
        Args:
            config (dict): Dizionario con le credenziali Reddit e configurazioni dei post
        """
        self.reddit = praw.Reddit(
            client_id=config['client_id'],
            client_secret=config['client_secret'],
            username=config['username'],
            password=config['password'],
            user_agent=config['user_agent']
        )
        
        self.posts_config = config['posts']
        logging.info(f"Bot inizializzato come u/{config['username']}")
    
    def delete_old_post(self, subreddit_name, post_title):
        """
        Elimina il vecchio post con lo stesso titolo
        
        Args:
            subreddit_name (str): Nome del subreddit
            post_title (str): Titolo del post da cercare ed eliminare
        """
        try:
            subreddit = self.reddit.subreddit(subreddit_name)
            
            # Cerca nei post recenti (limita a 100 per efficienza)
            for post in subreddit.new(limit=100):
                if post.title == post_title and post.author == self.reddit.user.me():
                    logging.info(f"Eliminazione vecchio post: {post.id} in r/{subreddit_name}")
                    post.delete()
                    return True
            
            logging.info(f"Nessun vecchio post trovato con titolo: {post_title}")
            return False
            
        except Exception as e:
            logging.error(f"Errore durante eliminazione in r/{subreddit_name}: {e}")
            return False
    
    def create_new_post(self, subreddit_name, title, content, sticky=True):
        """
        Crea un nuovo post e opzionalmente lo pinna
        
        Args:
            subreddit_name (str): Nome del subreddit
            title (str): Titolo del post
            content (str): Contenuto del post
            sticky (bool): Se True, pinna il post in alto
        """
        try:
            subreddit = self.reddit.subreddit(subreddit_name)
            
            # Crea il post
            new_post = subreddit.submit(title=title, selftext=content)
            logging.info(f"Nuovo post creato: {new_post.id} in r/{subreddit_name}")
            
            # Pinna il post se richiesto
            if sticky:
                # Prova a pinnarlo nel primo slot
                new_post.mod.sticky(state=True, bottom=False)
                logging.info(f"Post pinnato in r/{subreddit_name}")
            
            return new_post
            
        except Exception as e:
            logging.error(f"Errore durante creazione post in r/{subreddit_name}: {e}")
            return None
    
    def recreate_post(self, post_config):
        """
        Ricrea un post: elimina il vecchio e crea il nuovo
        
        Args:
            post_config (dict): Configurazione del post da ricreare
        """
        subreddit = post_config['subreddit']
        title = post_config['title']
        content = post_config['content']
        sticky = post_config.get('sticky', True)
        
        logging.info(f"=== Avvio ricreazione post in r/{subreddit} ===")
        logging.info(f"Titolo: {title}")
        
        # Step 1: Elimina il vecchio post
        self.delete_old_post(subreddit, title)
        
        # Pausa breve per evitare rate limiting
        time.sleep(2)
        
        # Step 2: Crea il nuovo post
        self.create_new_post(subreddit, title, content, sticky)
        
        logging.info(f"=== Ricreazione completata per r/{subreddit} ===\n")
    
    def schedule_posts(self):
        """
        Programma tutti i post configurati
        """
        for post_config in self.posts_config:
            schedule_time = post_config['schedule']
            
            # Programma il task
            schedule.every().week.at(schedule_time).do(
                self.recreate_post,
                post_config=post_config
            )
            
            logging.info(
                f"Post programmato per r/{post_config['subreddit']} "
                f"ogni settimana alle {schedule_time}"
            )
    
    def run(self):
        """
        Avvia il bot e mantiene il loop attivo
        """
        logging.info("=== Bot avviato ===")
        self.schedule_posts()
        
        logging.info("In attesa dei task programmati...")
        logging.info("Premi Ctrl+C per fermare il bot\n")
        
        try:
            while True:
                schedule.run_pending()
                time.sleep(60)  # Controlla ogni minuto
                
        except KeyboardInterrupt:
            logging.info("\n=== Bot fermato manualmente ===")


def load_config(config_file='config.json'):
    """
    Carica la configurazione da file JSON
    
    Args:
        config_file (str): Path del file di configurazione
        
    Returns:
        dict: Configurazione caricata
    """
    try:
        with open(config_file, 'r', encoding='utf-8') as f:
            config = json.load(f)
        logging.info(f"Configurazione caricata da {config_file}")
        return config
    except FileNotFoundError:
        logging.error(f"File di configurazione {config_file} non trovato!")
        raise
    except json.JSONDecodeError as e:
        logging.error(f"Errore nel parsing del JSON: {e}")
        raise


if __name__ == "__main__":
    # Carica configurazione da file
    config = load_config('config.json')
    
    # Crea e avvia il bot
    bot = RedditWeeklyBot(config)
    bot.run()

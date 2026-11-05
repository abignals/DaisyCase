## Lundi / Mardi - Analyse (~ 1h)
- Lu les 3 sujets, penché d'abord vers le A (backend, proche de mon projet personnel).
- Choisi le B suite au 1er entretien : l'équipe manque de profils front.
- Lu daisy-api.md, prise en compte des requirements et de la realité du terrain : CORS/403, POST lent sans idempotence, fuseau horaire, prix variables, 320 px et traffic a 60% mobile.

## Mercredi - Mise à niveau et choix d'architecture (~ 2h)
- J'ai approfondi Shadow DOM vs iframe, CORS, Vercel.
- Je suis parti sur Shadow DOM (contrôle CORS, s'adapte au conteneur) + Vite pour build le widget.

### Raisonnement choix du Shadow DOM
- CSS safe, il est isolé dans le widget ainsi le CSS ne casse pas le site.
- Les requêtes partent du site de l'artisan : le contrôle CORS garde son sens.
- S'adapte au conteneur avec des container queries.
- Le prix : Les proprietes herites traversent l'isolation, le conteneur hote reste expose aux CSS du site, aucune isolation JS.
- La parade : On peut contourner le probleme avec un ```:host { all: initial; } ``` a la racine et avec un script cree un element personnalise ```<daisy-booking>``` qui porte le Shadow DOM.
- Pourquoi ne pas avoir chosi l'iframe : Isolation totale mais le CORS par domaine perd son sens et il faut piloter la hauteur du widget par ```postMessage``` ce qui est plus lourd.

## Outils choisi
- React + TypeScript + Tailwind pour le widget.
- Vite en mode bibliotheque pour produire un seul fichier ```v1.js``` autonome, Next.JS ne produit pas de script integrable sur des sites tiers.
- Next.js pour la page demo, les pages hotes de test er le faux serveur d'API (route handlers).
- Vercel pour le deploiement.
- Le widget embarque ses dépendances : il ne suppose rien de la page hôte.
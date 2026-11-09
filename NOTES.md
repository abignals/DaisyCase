# Journal de bord
## Lundi / Mardi - Analyse (~ 1h)
- Lu les 3 sujets, penché d'abord vers le A (backend, proche de mon projet personnel).
- Choisi le B suite au 1er entretien : l'équipe manque de profils front.
- Lu daisy-api.md, prise en compte des requirements et de la realité du terrain : CORS/403, POST lent sans idempotence, fuseau horaire, prix variables, 320 px et traffic a 60% mobile.
- Découverte de Vercel.
- Observation des codes couleurs de Daisy pour realiser un widget fictif sur le theme du style actuel.

## Mercredi - Mise à niveau et choix d'architecture (~ 1h30)
- J'ai approfondi **Shadow DOM** vs **iframe**, **CORS**, Vercel.
- Je suis parti sur **Shadow DOM** (contrôle CORS, s'adapte au conteneur) + Vite pour build le widget.

### Raisonnement choix du Shadow DOM
- CSS safe, il est isolé dans le widget ainsi le CSS ne casse pas le site.
- Les requêtes partent du site de l'artisan : le contrôle CORS garde son sens.
- S'adapte au conteneur avec des container queries.
- Le prix : Les proprietes herites traversent l'isolation, le conteneur hote reste expose aux CSS du site, aucune isolation JS.
- La parade : On peut contourner le probleme avec un ```:host { all: initial; } ``` a la racine et avec un script cree un element personnalise ```<daisy-booking>``` qui porte le Shadow DOM.
- Pourquoi ne pas avoir chosi l'iframe : Isolation totale mais le CORS par domaine perd son sens et il faut piloter la hauteur du widget par ```postMessage``` ce qui est plus lourd.
- Pas de Supabase ici, l'API est seulement simulée.

## Outils choisi
- React + TypeScript + Tailwind pour le widget.
- Vite en mode bibliotheque pour produire un seul fichier ```v1.js``` autonome, Next.JS ne produit pas de script integrable sur des sites tiers.
- Next.js pour la page demo, les pages hotes de test er le faux serveur d'API (route handlers).
- Vercel pour le deploiement.
- Le widget embarque ses dépendances : il ne suppose rien de la page hôte.

## Jeudi - Mise en place et faux serveur (~1h30)
- Mise en ligne du projet sur **GitHub** et **Vercel**.
- Création basique du widget et isolation du CSS.
- Page de test « clean » (page vierge) et « hostile » (* { … !important }, boutons et div restylés, police exotique, colonne de 320 px) pour tester en conditions défavorables.
- **Bloqué** : la police du site (* { font-family … !important }) passait par l'élément hôte et s'héritait dans le widget. Corrigé avec all: initial !important sur :host + une racine interne .daisy-root qui redéfinit la typographie.
- Création du **faux serveur d'API** qui reproduit daisy-api.md et la réalité du terrain (latence, fuseau horaire, prix variables par créneau, 42 cours aux descriptions et images irrégulières). Testé avec curl.
- **Bloqué** : route courses/route.ts manquante, puis dossier nommé crs_118 au lieu du segment dynamique [courseId] (500 sur toutes les requêtes de créneaux).
- Mise en place du **CORS** (liste de domaines autorisés, réponse aux requêtes OPTIONS, 403 sans en-têtes CORS comme en réalité).
- **Client API** commencé.

## Vendredi - Client API, liste des cours, créneaux (~2h)
- **Client API typé** (api.ts) : adresse de l'API déduite du script lui-même (document.currentScript), transmission du scénario de démo, erreurs traduites en codes. Distinction network (lecture, réessayable) / uncertain (réservation envoyée sans réponse).
- Hook useAsync (chargement / erreur / succès + « Réessayer »).
- **Liste des cours** : filtres par niveau, descriptions vides ou longues (« Voir plus »), image de remplacement aux couleurs de l'atelier, prix « à partir de ».
- **Erreur de chargement** : message sobre pour le visiteur, explication dans la console pour l'artisan, mode ?daisy_debug=1.
- **Bloqué** : une erreur Intl.NumberFormat (devise vide) dans une seule carte a fait disparaître tout le widget → formatPrice rendu robuste, idée de l'Error Boundary.
- **Choix du créneau** : une requête par mois (jamais au-delà des 90 jours de l'API), 3 mois proposés, horaires affichés dans le fuseau de l'atelier, créneaux complets visibles mais désactivés, « Plus que N places », prix par créneau. Testé en changeant le fuseau du navigateur.

## Lundi — Réservation, robustesse, personnalisation (~2h)
- **Formulaire de coordonnées** : coordonnées gardées dans App pour survivre à un changement de créneau, validation en français, autoComplete / inputMode pour le mobile, nombre de places limité par la politique et les places restantes.
- **Envoi : bouton désactivé** (pas de double envoi), message rassurant après 2 s, aucun nouvel essai automatique, état « incertain » sur coupure ou erreur 5xx.
- **Confirmation** : code, récapitulatif, total renvoyé par le serveur, politique d'annulation.
- **Bloqué** : URL /v1bookings (barre oblique oubliée) → url() rendue tolérante.
- **Error Boundary** : message de repli au lieu d'un widget vide.
- **Personnalisation contrôlée** : couleur principale, contraste automatique (formule WCAG), option « police du site » (getComputedStyle côté page, car all: initial coupe l'héritage), arrondi des boutons. Thèmes de démo avec ?theme=pale / ?theme=dark.
- **Découverte** : la terre cuite de démo donne un contraste avec du blanc, le texte passe automatiquement en noir.
- **Pages de démo** : faux site d'atelier réaliste (atelier.html) et page d'accueil qui liste les démos et les scénarios.

## A Noter:
- Je n'ai pas comptabilisé le temps de recherche sur les différentes technos et frameworks, ni celui de mes décisions d'architecture.
- **Suivi des erreurs en production** : les erreurs sont seulement journalisées dans la console. En production, il faudrait les renvoyés depuis l'Error Boundary et le client API, pour être alerté avant que l'artisan ne contacte le support.
- **Base de données pour le faux serveur** : les réservations ne décrémentent pas réellement les places. Avec une vraie base (Supabase), la décrémentation automatiquement en SQL, pour qu'un créneau ne soit jamais surréservé.
- **Interface de réglages dans le back-office** : elle n'est pas implémentée. Je la simule avec le paramètre de démo `?theme=`, qui renvoie les champs `font` et `radius` que je propose d'ajouter à l'API.

# Partie 1 - Widget de réservation Daisy — Sujet B
**Démo : (https://daisy-case.vercel.app)** (Page d'accueil avec liste de demos et scenarios)

Un widget que l'artisan installe sur son site en collant deux lignes. Le visiteur choisit un cours, un créneau, saisit ses coordonnées et reçoit sa confirmation sans quitter le site.

```html
<div id="daisy-booking" data-studio="std_pk_7f2a9c"></div>
<script src="https://widget.daisy.example/v1.js" async></script>
```

L'API Daisy est simulée (mock) et reproduit les contraintes de `daisy-api.md` : latence de la réservation, domaines non déclarés, fuseau horaire, prix variables, données irrégulières.

## Lancer le projet
```bash
npm install
npm run build:widget   # construction de public/v1.js
npm run dev            # http://localhost:3000
```

Pages de démo : `/demo/atelier.html` (site réaliste), `/demo/clean.html`, `/demo/hostile.html` (CSS agressif, colonne de 320 px) (redirection automatique sur la page d'accueil maintenant).
Paramètres : `?scenario=` `slow` · `error` · `forbidden` · `full` · `partial` · `cancelled` · `ratelimit`, `?daisy_debug=1`, `?theme=pale` / `dark`.

## Choix techniques
- **Shadow DOM plutôt qu'iframe.** Le CSS est isolé dans les deux sens, le widget s'adapte à son conteneur, et les requêtes partent du site de l'artisan, donc le contrôle CORS par domaine garde son sens. Une iframe isolerait davantage, mais ses requêtes partiraient du domaine du widget, et sa hauteur serait à piloter par `postMessage`. Je la réserverais à un formulaire de paiement.
- **Vite pour construire le widget**, Next.js pour la démo et le faux serveur. Next.js ne produit pas de script autonome intégrable sur un site tiers : c'est le seul écart à la stack.
- **Pas de Supabase** : l'API est simulée, comme l'énoncé le permet.

## Les questions de l'énoncé

### 1. Le CSS agressif du site hôte
Le Shadow DOM bloque les sélecteurs du site, même en `!important`. Deux fuites restent, et je les traite :

- **les propriétés héritées** (police, couleur) : coupées par `:host { all: initial !important; }`, puis redéfinies dans une racine interne ;
- **l'élément hôte**, qui appartient au DOM du site : c'est un élément personnalisé `<daisy-booking>` que les règles `div { … }` ne ciblent pas.

Je l'ai découvert en testant : sur la page hostile, `* { font-family: "Comic Sans MS" !important }` atteignait l'hôte et s'héritait dans le widget. Les container queries adaptent ensuite la mise en page à la place disponible, pas à la taille de l'écran.

**Le prix :** Moins isolé qu'une iframe, aucune isolation JavaScript, et quelques utilitaires de Tailwind 4 (ombres, dégradés) inutilisables dans un Shadow DOM.

### 2. La personnalisation
**Quelques réglages dans le back-office, pas de CSS libre.** L'artisan choisit une couleur, la police (celle de Daisy ou celle de son site) et la forme des boutons, sans toucher à son site.

- **Garde-fou :** le widget calcule le contraste (formule WCAG) et choisit un texte blanc ou noir. La terre cuite de démo donnait 4,0:1 avec du blanc, sous le seuil de 4,5:1 : le texte passe en noir (5,2:1).
- **Pourquoi pas de CSS libre :** sur 70 ateliers, chaque CSS personnalisé est une dette, et une mise à jour pourrait casser 70 sites de 70 façons.
- **Le « moche sur mobile »** vient plus probablement d'un conteneur étroit que des couleurs. La vraie réponse est un widget mobile-first (60 % du trafic) qui s'adapte à sa place.

Les champs `font` et `radius` sont une extension de l'API que je propose, simulée par `?theme=`.

### 3. La dernière place part pendant la saisie
Le visiteur voit :

> **« La dernière place de ce créneau vient d'être réservée par quelqu'un d'autre. Vos informations sont conservées : choisissez un autre créneau, vous n'aurez rien à ressaisir. »**
> Bouton : « Choisir un autre créneau »

Le message explique sans culpabiliser, rassure sur ce qui inquiète le plus, et donne une action immédiate. S'il reste des places, mais moins que demandé, le widget propose de réserver le nombre restant.

**Le cas le plus délicat est celui où l'on ne sait pas :** la réservation met jusqu'à 4 s et n'est pas idempotente. En cas de coupure, le widget ne réessaie jamais seul et demande au visiteur de vérifier sa boîte mail avant de réessayer.

### 4. L'indicateur
**Le taux de conversion du tunnel, étape par étape** (affiché → cours → créneau → envoi → confirmé). Il répond à la vraie question, « le widget fait-il réserver ? », et il localise où ça casse. Le widget enverrait un événement anonyme à chaque étape.

En complément : le **taux d'affichage réussi** (un 403 sur une nouvelle installation permet au support de prévenir l'artisan avant qu'il ne crée un ticket) et le **taux de `409` en fin de tunnel**.

## Non fait, et comment je m'y prendrais
- **Tests automatisés** : les fonctions pures d'abord (`readableTextOn`, `formatPrice`, `toProblem`), puis un outil de test de bout en bout (surement Playwright).
- **Suivi des erreurs** : Service de suivi des erreurs en production (surement Sentry), branché sur l'Error Boundary et le client API.
- **Vraie base pour le faux serveur** : décrémentation des places en SQL.
- **Réglages du back-office** : simulés par `?theme=`.
- **Poids** : Optimiser le poids surement en utilisant Preact au lieu de React (peu utile pour une application mais a du sens pour un widget).

## Hypothèses

- **Idempotence** : je suppose que `POST /bookings` n'en a pas. Je demanderais un en-tête `Idempotency-Key`.
- **Clé publique** : `daisy-api.md` ne dit pas comment l'envoyer. Je suppose que l'API identifie l'atelier autrement.
- **403 en production** : sans en-têtes CORS, il ressemble à une erreur réseau. Le widget traite un échec du premier appel comme un problème d'installation probable.
- **Faux serveur** : pas d'état persistant ; scénarios et thèmes réservés à la démo.

# Partie 2 - Reponses aux questions
## 1. Journal de bord
Temps total : environ 3 h (hors temps d'apprentissage des technologies).
Ordre : analyse et choix du sujet → choix d'architecture → mise en place et faux serveur → tunnel de réservation → robustesse → personnalisation → README.
Bloqué :
- La police du site traversait le Shadow DOM. Sur la page hostile, * { font-family … !important } atteignait l’élément hôte, et la police s’héritait dans le widget. Résolu avec all: initial !important sur :host et une racine interne
- Une seule erreur a fait disparaître tout le widget. Une devise vide dans Intl.NumberFormat, dans une seule carte de cours, a démonté toute l’application React, et le widget est devenu blanc. Ce qui m'a mené à l’Error Boundary.

Abandonné :
- Le sujet A, au profit du Sujet B, pour répondre au manque de profils front.
- Next.js pour construire le widget, remplacé par Vite
- le nouvel essai automatique de la réservation, à cause du risque de double réservation

## 2. Tri des tickets

Mon classement, du ticket qui me donne le plus envie à celui qui m'en donne le moins :

1. **Ticket 7** : trois artisans signalent que l'export comptable ne correspond pas à leurs relevés bancaires.
2. **Ticket 1** : un partenaire a changé le format de ses dates sans prévenir, les réservations n'entrent plus depuis ce matin.
3. **Ticket 2** : le calendrier du back-office rame dès qu'un atelier a plus de 200 cours affichés.
4. **Ticket 4** : les artisans réclament un filtre par type de cours dans la liste des réservations.
5. **Ticket 5** : le tunnel du widget a un taux d'abandon de 60 % à l'étape des coordonnées.
6. **Ticket 3** : ajouter les paiements sur place par TPE dans le parcours de réservation.
7. **Ticket 6** : exposer une API publique propre pour que de futurs partenaires s'intègrent seuls.
8. **Ticket 8** : le design system n'existe pas, chaque écran a ses propres boutons.

Ce classement montre que j'ai d'abord envie de m'attaquer à ce qui ne fonctionne pas comme prévu : un export faux, des réservations bloquées, un calendrier lent. Résoudre un problème existant, dont l'impact sur les artisans est concret, me motive davantage que construire quelque chose de nouveau ou peaufiner l'existant. J'aime avancer sur des bases solides avant de me lancer dans de nouveaux défis.

## 3. Mes deux premières semaines

Dans un premier temps, j'observe et j'essaie de comprendre le besoin métier et l'offre proposée, puis l'application et son architecture, grâce à la documentation disponible. J'identifie ensuite les zones sensibles (facturation, synchronisations, etc.) et j'essaie de comprendre les choix techniques qui ont été faits. J'installerai le projet en local et l'utiliserai comme un artisan (créer un cours, recevoir une réservation) et lire quelques tickets du support, puis j'essaierai de livrer un premier petit ticket en production.

Dans un second temps, je participe activement à la vie de l'équipe : je propose de prendre en charge un ticket plus important et de le traiter en collaboration, avec des revues de code, pour apprendre les conventions et poser mes questions.

## 4. Ce que je vous demanderais

En lien avec mon sujet : existe-t-il déjà un design system, ou des composants partagés, que le widget devrait réutiliser ?

J'ai supposé qu'il n'y en avait pas. Je suis donc parti de zéro, avec des composants simples, pour qu'ils puissent facilement être alignés plus tard.
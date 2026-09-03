# Prédictions Football — MVP automatisé

Application qui récupère automatiquement les matchs d'une date donnée, leurs statistiques,
et génère un pronostic (1X2, over/under, BTTS, score probable) via un modèle de Poisson.
Aucune saisie manuelle de match n'est nécessaire.

## Important à savoir avant de démarrer

- Ce projet est un **code réel et fonctionnel**, mais il doit être **installé et déployé**
  pour tourner — ce n'est pas une démo qui s'exécute toute seule dans le chat.
- Il vous faut une **clé API-Football gratuite** : créez un compte sur
  https://dashboard.api-football.com (tier gratuit : 100 requêtes/jour).
- La clé API n'est **jamais exposée au navigateur** : elle est lue uniquement dans les
  routes `/pages/api/*`, qui tournent côté serveur.

## Installation locale

```bash
npm install
cp .env.local.example .env.local
# éditez .env.local et collez votre clé API_FOOTBALL_KEY
npm run dev
```

Ouvrez http://localhost:3000

## Déploiement (gratuit)

Le plus simple est Vercel (créateur de Next.js) :

1. Poussez ce projet sur un dépôt GitHub.
2. Importez-le sur https://vercel.com/new
3. Dans les réglages du projet Vercel, ajoutez la variable d'environnement
   `API_FOOTBALL_KEY` avec votre clé.
4. Déployez.

## Ce que couvre cette version

- Sélection de date (aujourd'hui / demain / après-demain / date libre)
- Récupération automatique des matchs, statistiques, 5 derniers matchs réels,
  confrontations directes, blessures et classement — aucune saisie manuelle
- Moteur de prédiction (modèle de Poisson) qui **distingue explicitement** les données
  réelles, calculées et indisponibles — aucune valeur de secours n'est présentée
  comme si elle venait de l'API (voir `lib/predictionEngine.js`)
- Confrontations directes traitées comme facteur **secondaire** (ajustement de 5 points
  de pourcentage maximum), jamais comme base principale de la prédiction
- Score de confiance composite (complétude des données + écart entre issues +
  cohérence avec le classement), avec une explication en clair
- Classement "🔥 Meilleures prédictions du jour" (`/api/top-predictions`), avec filtres
  par type de pari et par championnat sur la page d'accueil
- Gestion différenciée des erreurs : clé absente, clé invalide, quota dépassé, API
  indisponible, match reporté/annulé
- Historique local des pronostics consultés (prédiction retenue, probabilité,
  confiance) + vérification du résultat réel, tous types de paris confondus

## Ce qui reste à construire pour la version complète

Le reste de votre cahier des charges (points 8 à 17) demande une vraie infrastructure
que ce chat ne peut pas héberger lui-même — mais l'architecture ci-dessus est conçue
pour vous permettre de les ajouter progressivement sans tout réécrire :

- **Base de données partagée** (ex : Supabase/Postgres) pour remplacer le localStorage
  de l'historique — utile si plusieurs utilisateurs doivent voir le même historique.
- **Cache distribué** (ex : Redis/Upstash) pour remplacer `lib/cache.js` si vous dépassez
  un seul serveur — l'interface (`get/set/wrap`) resterait identique.
- **Filtres par championnat** et **classement "meilleures prédictions du jour"** :
  faciles à ajouter en appelant `/api/match-analysis` pour chaque match du jour, mais
  attention au coût en requêtes API — à déclencher explicitement par l'utilisateur,
  pas automatiquement.
- **Tableau de bord admin** (nombre de matchs récupérés, état de l'API, erreurs) :
  peut se brancher sur les compteurs déjà présents dans `lib/cache.js`.
- **Détection des matchs reportés/annulés** : le statut est déjà récupéré
  (`fixture.status`), il suffit de l'afficher et de filtrer dessus.

## Structure du projet

```
lib/
  apiFootball.js      → tous les appels à l'API sportive (remplaçable)
  cache.js            → cache mémoire avec durée de vie
  predictionEngine.js → modèle statistique de prédiction
pages/
  index.js            → accueil (sélection de date, liste des matchs)
  match/[id].js        → détail + prédiction d'un match
  historique.js        → historique local + vérification des résultats
  api/
    matches.js          → backend : matchs d'une date
    match-analysis.js   → backend : analyse complète d'un match
    top-predictions.js  → backend : classement des meilleures opportunités du jour
    verify.js           → backend : résultat réel d'un match terminé
```

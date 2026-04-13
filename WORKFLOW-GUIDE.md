# 🚀 Guide d'Exécution du Workflow

## ✅ Pré-requis

Avant de commencer, assure-toi d'avoir:
- [ ] Node.js 18+ installé
- [ ] Claude Code accessible dans le terminal
- [ ] Le dossier du projet ouvert dans ton IDE
- [ ] L'URL du site à refondre

## 📋 Étapes à suivre

### 🎬 Démarrage

1. **Bootstrap du projet**
```bash
chmod +x bootstrap-refonte.sh
./bootstrap-refonte.sh nom-du-projet https://site-actuel.com
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Vérifier la structure**
```bash
tree -L 2
# Tu dois voir: 01-extraction/, 02-design/, 03-nouveau-site/, etc.
```

---

### 📥 PHASE 1: Extraction (30-45 min)

#### Étape 1.1: Créer le script d'extraction

**Dans le terminal avec Claude Code:**
```bash
claude-code
```

**Prompt à utiliser:**
```
Crée un script scripts/extract-site.js qui utilise Playwright pour:
1. Crawler https://[URL-DU-SITE] (max 50 pages)
2. Prendre des screenshots (desktop 1920x1080 + mobile 375x667)
3. Télécharger toutes les images
4. Sauvegarder dans 01-extraction/

Le script doit:
- Afficher une barre de progression
- Gérer les timeouts
- Créer un rapport crawl-report.json

Ajoute aussi la commande "extract" dans package.json qui lance ce script.
```

**Attends que Claude génère le script, puis:**
```bash
npm run extract
```

#### Étape 1.2: Générer le content inventory

**Prompt à utiliser:**
```
Analyse tous les fichiers HTML dans 01-extraction/ et crée un fichier
01-extraction/content-inventory.json structuré avec:
- metadata du site
- array de pages (url, title, content, images, links)
- navigation (header, footer)
- liste des assets

Utilise cheerio pour parser proprement le HTML.
Génère aussi un script scripts/generate-inventory.js pour ça.
```

**Exécute:**
```bash
npm run generate-inventory
```

**Valide:**
```bash
cat 01-extraction/content-inventory.json | jq '.metadata'
# Tu dois voir l'URL, la date, le nombre de pages
```

✅ **Checkpoint**: Tu as maintenant tout le contenu du site extrait et structuré.

---

### 🎨 PHASE 2: Design (20-30 min)

#### Étape 2.1: Analyser le site actuel

**Prompt:**
```
Analyse le site actuel à partir de:
- 01-extraction/screenshots/
- 01-extraction/content-inventory.json

Crée 02-design/analyse-site-actuel.md avec:
1. Points forts du design
2. Points faibles à améliorer
3. Structure de navigation
4. Éléments de branding à conserver
5. Recommandations

En français.
```

**Lis le rapport:**
```bash
cat 02-design/analyse-site-actuel.md
```

#### Étape 2.2: Définir le styles.md

**Choisis 2-3 sites de référence qui t'inspirent**

Exemples:
- Sites modernes du même secteur
- Dribbble/Awwwards pour le style
- Concurrents avec un bon design

**Prompt:**
```
J'ai ces sites de référence pour l'inspiration:
1. https://[site-ref-1.com] - style moderne et épuré
2. https://[site-ref-2.com] - belle typographie
3. https://[site-ref-3.com] - bon équilibre desktop/mobile

Le site est pour [décrire l'activité du client].

Remplis complètement 02-design/styles.md en:
- T'inspirant de ces références
- Restant cohérent avec l'identité du client
- Définissant une palette moderne
- Spécifiant TOUS les composants nécessaires

Pose-moi des questions si besoin pour affiner.
```

**Révise le styles.md généré:**
```bash
code 02-design/styles.md
# Ajuste si nécessaire
```

#### Étape 2.3: Créer le moodboard

**Prompt:**
```
Crée 02-design/moodboard.md qui:
- Liste des exemples visuels pour chaque composant
- Propose des alternatives pour les choix clés
- Aide à la validation avec le client
- Inclut des captures ou liens de référence
```

✅ **Checkpoint**: Le design system est défini et documenté.

---

### ⚙️ PHASE 3: Stack (10 min)

#### Étape 3.1: Décider de la stack

**Prompt:**
```
Analyse content-inventory.json et styles.md.

Recommande la meilleure stack technique dans 03-nouveau-site/STACK-DECISION.md avec:
- Stack principale + justification détaillée
- 2 alternatives avec leurs avantages
- Tableau comparatif
- Commandes d'installation

Considère: nombre de pages, interactivité, performance, coût.
```

**Lis la recommandation:**
```bash
cat 03-nouveau-site/STACK-DECISION.md
```

**Valide ou ajuste si besoin:**
```
Si je préfère Next.js au lieu d'Astro, adapte la recommandation et explique les différences.
```

✅ **Checkpoint**: La stack est choisie et justifiée.

---

### 🏗️ PHASE 4: Génération (1h30-2h)

#### Étape 4.1: Initialiser le projet

**Prompt:**
```
Initialise un projet [Astro/Next.js selon la stack choisie] dans 03-nouveau-site/ avec:
- Tailwind CSS configuré selon 02-design/styles.md
- TypeScript
- Structure de dossiers optimale
- ESLint + Prettier
- Configuration Vercel

Importe les custom CSS variables de styles.md dans tailwind.config.
Génère un README.md complet dans 03-nouveau-site/.
```

**Vérifie l'installation:**
```bash
cd 03-nouveau-site
npm install
npm run dev
# Ouvre http://localhost:4321 (ou le port affiché)
```

#### Étape 4.2: Générer les composants de base

**Prompt:**
```
Génère dans 03-nouveau-site/src/components/:

1. Layout/Header.astro - navigation selon content-inventory.json
2. Layout/Footer.astro - footer selon content-inventory.json
3. UI/Hero.astro - plusieurs variants (image, video, split)
4. UI/Card.astro - selon le style de styles.md
5. UI/Button.astro - primary, secondary, variants
6. UI/Container.astro - wrapper responsive

Respecte EXACTEMENT styles.md pour:
- Couleurs (Tailwind custom)
- Typographie
- Espacements
- Responsive breakpoints

Ajoute des props TypeScript et des exemples en commentaire.
```

**Teste un composant:**
```bash
# Crée une page test
code src/pages/test.astro
# Importe et teste le Hero par exemple
```

#### Étape 4.3: Créer le layout principal

**Prompt:**
```
Crée src/layouts/Layout.astro qui:
- Wrappe Header + slot + Footer
- Gère les meta tags SEO (props: title, description, image)
- Intègre les Google Fonts selon styles.md
- Configure les CSS custom properties
- Ajoute un placeholder pour analytics

Le layout doit être prêt pour toutes les pages.
```

#### Étape 4.4: Générer la page d'accueil

**Prompt:**
```
À partir de 01-extraction/content-inventory.json, génère src/pages/index.astro qui:
- Utilise les composants créés (Hero, Card, etc.)
- Reprend le contenu de la page d'accueil actuelle
- Modernise la présentation selon styles.md
- Est responsive
- A des meta tags SEO optimaux

Améliore le contenu si nécessaire (CTA plus clairs, textes plus punchy).
```

**Teste:**
```bash
npm run dev
# Visite http://localhost:4321
```

#### Étape 4.5: Migrer les autres pages

**Prompt:**
```
Génère toutes les pages listées dans content-inventory.json (sauf index) dans src/pages/.

Pour chaque page:
- Utilise Layout.astro
- Reprend le contenu
- Utilise les composants appropriés
- Optimise la hiérarchie visuelle

Priorise les pages du menu principal d'abord.
```

#### Étape 4.6: Optimiser les images

**Prompt:**
```
Crée scripts/optimize-assets.js qui:
1. Lit les images de 01-extraction/assets/
2. Les convertit en WebP + génère des thumbnails
3. Les copie dans 03-nouveau-site/public/images/
4. Génère un manifest JSON avec les paths
5. Affiche un rapport d'optimisation

Utilise Sharp pour la conversion.
Ajoute la commande npm "optimize-images".
```

**Exécute:**
```bash
npm run optimize-images
```

**Met à jour les références d'images dans les pages:**
```
Mets à jour toutes les balises <img> dans src/pages/ pour utiliser les images optimisées de public/images/ avec les formats WebP + fallback.
```

✅ **Checkpoint**: Le site est généré et fonctionnel localement.

---

### 🎯 PHASE 5: Finalisation (45 min)

#### Étape 5.1: Audit qualité

**Prompt:**
```
Crée scripts/quality-audit.js qui:
1. Lance le build
2. Vérifie:
   - Tous les liens internes
   - Présence des meta tags sur chaque page
   - Images optimisées
   - Accessibilité de base
3. Génère un rapport 04-livrables/quality-report.md

Ajoute la commande npm "audit".
```

**Exécute:**
```bash
npm run audit
```

**Corrige les problèmes identifiés:**
```
Voici le rapport d'audit: [coller le rapport]
Corrige tous les problèmes critiques.
```

#### Étape 5.2: Test responsive

**Prompt:**
```
Teste toutes les pages sur mobile (375px), tablet (768px), desktop (1440px).
Identifie les problèmes responsive et corrige-les.

Utilise Playwright pour automatiser ça et générer des screenshots comparatifs dans 04-livrables/screenshots-responsive/.
```

#### Étape 5.3: Générer la documentation client

**Prompt:**
```
Génère dans 04-livrables/documentation/:

1. 📘 guide-utilisation.md (français, non-tech):
   - Modifier les textes
   - Ajouter une page
   - Changer une image
   - Mettre à jour le menu

2. 🚀 guide-deploiement.md:
   - Étapes de déploiement Vercel
   - Configuration du domaine
   - Variables d'environnement

3. 🔧 maintenance.md:
   - Mises à jour recommandées (npm, etc.)
   - Contacts support
   - FAQ

Rends ça accessible à un client qui n'y connaît rien en dev.
```

#### Étape 5.4: Préparer le déploiement

**Prompt:**
```
Configure le déploiement Vercel:
1. Crée vercel.json avec la config optimale
2. Ajoute un .env.example
3. Documente le process dans 03-nouveau-site/DEPLOIEMENT.md
4. Prépare les commandes nécessaires
```

**Déploie:**
```bash
cd 03-nouveau-site
npx vercel
# Suis les instructions
```

#### Étape 5.5: Package de livraison

**Prompt:**
```
Crée scripts/prepare-delivery.js qui:
1. Build la version prod
2. Exporte en statique si possible
3. Package dans 04-livrables/exports/[nom-projet]-v1.0.zip:
   - Le build
   - La documentation
   - Le code source (sans node_modules)
   - Un README de livraison

Ajoute la commande npm "package".
```

**Exécute:**
```bash
npm run package
```

✅ **Checkpoint final**: Le projet est prêt pour livraison.

---

## 📊 Récapitulatif des Livrables

À la fin du workflow, tu as:

```
📦 04-livrables/
├── 📄 documentation/
│   ├── guide-utilisation.md
│   ├── guide-deploiement.md
│   └── maintenance.md
├── 📊 quality-report.md
├── 📸 screenshots-responsive/
└── 📦 exports/
    └── [projet]-v1.0.zip
```

**Plus:**
- ✅ Site déployé sur Vercel (URL de production)
- ✅ Repository GitHub (optionnel mais recommandé)
- ✅ Accès admin Vercel pour le client

---

## ⏱️ Temps Estimés

| Phase | Temps réel | Dont Claude Code |
|-------|------------|------------------|
| 1. Extraction | 30 min | 90% auto |
| 2. Design | 25 min | 60% assisté |
| 3. Stack | 10 min | 80% assisté |
| 4. Génération | 90 min | 75% auto |
| 5. Finalisation | 45 min | 50% assisté |
| **TOTAL** | **3h20** | **~70% assisté** |

---

## 💡 Tips pour Optimiser

1. **Batch les prompts**: Ne relance pas Claude Code entre chaque micro-tâche
2. **Valide par phase**: Ne passe pas à la suivante sans vérifier
3. **Garde le contexte**: Référence toujours styles.md et content-inventory.json
4. **Itère intelligemment**: Si un composant est imparfait, note-le et ajuste à la fin
5. **Automatise ce qui se répète**: Scripts > prompts manuels

---

## 🆘 Troubleshooting

### Claude Code ne trouve pas un fichier
```bash
# Vérifie le path absolu
pwd
ls -la
# Utilise le path complet dans le prompt
```

### Le build échoue
```
Le build échoue avec cette erreur: [coller l'erreur]
Voici le fichier concerné: [path]
Diagnostique et corrige.
```

### Les styles ne s'appliquent pas
```
Les couleurs de styles.md ne s'appliquent pas.
Vérifie tailwind.config.js et les imports CSS.
Corrige la configuration.
```

---

## ✅ Checklist Finale

Avant de livrer au client:

- [ ] Toutes les pages sont migrées
- [ ] Le site est responsive (mobile, tablet, desktop)
- [ ] Lighthouse score >90 (perf, SEO, accessibility)
- [ ] Toutes les images sont optimisées (WebP)
- [ ] Les formulaires fonctionnent
- [ ] Le site est déployé sur Vercel
- [ ] La documentation client est complète
- [ ] Le package de livraison est créé
- [ ] Le client a accès au dashboard Vercel
- [ ] Un backup du code est sur GitHub

---

## 🚀 Pour Aller Plus Loin

Après la livraison:

1. **Analytics**: Ajoute Vercel Analytics ou Plausible
2. **CMS**: Connecte Notion API ou Sanity pour le contenu
3. **Formulaires**: Intègre Formspree ou Netlify Forms
4. **Newsletter**: Ajoute Mailchimp/Buttondown
5. **Chat**: Intègre Crisp ou Intercom

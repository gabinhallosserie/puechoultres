#!/bin/bash

# ============================================================================
# 🎨 BOOTSTRAP REFONTE - Script d'initialisation
# ============================================================================
# Usage: ./bootstrap-refonte.sh [nom-du-projet] [url-du-site]
# Exemple: ./bootstrap-refonte.sh puechoultres https://www.puechoultres.fr
# ============================================================================

set -e

PROJECT_NAME="${1:-mon-projet}"
SITE_URL="${2:-}"

echo "🚀 Initialisation du projet de refonte: $PROJECT_NAME"
echo "=================================================="

# Vérification des prérequis
command -v node >/dev/null 2>&1 || { echo "❌ Node.js requis"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm requis"; exit 1; }

# Création de la structure de dossiers
echo "📁 Création de la structure..."

mkdir -p 01-extraction/{screenshots,assets}
mkdir -p 02-design/references
mkdir -p 03-nouveau-site
mkdir -p 04-livrables/{documentation,exports}
mkdir -p scripts
mkdir -p .claude-workspace

# Création des fichiers de base
echo "📝 Création des fichiers de configuration..."

# Package.json racine pour les scripts
cat > package.json << 'EOF'
{
  "name": "refonte-workflow",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "extract": "node scripts/extract-site.js",
    "generate-inventory": "node scripts/generate-inventory.js",
    "generate-site": "node scripts/generate-site.js",
    "dev": "cd 03-nouveau-site && npm run dev",
    "build": "cd 03-nouveau-site && npm run build",
    "deploy": "cd 03-nouveau-site && vercel --prod"
  },
  "dependencies": {
    "playwright": "^1.40.0",
    "cheerio": "^1.0.0-rc.12",
    "turndown": "^7.1.2",
    "axios": "^1.6.0",
    "sharp": "^0.33.0"
  }
}
EOF

# README principal
cat > README.md << EOF
# 🎨 Refonte: $PROJECT_NAME

## 📊 Informations du projet

- **Site actuel**: ${SITE_URL:-À définir}
- **Date de début**: $(date +"%Y-%m-%d")
- **Status**: 🔄 En cours

## 🗺️ Workflow

### Phase 1: Extraction ✅ / ⏳ / ❌
- [ ] Aspiration du site
- [ ] Screenshots générés
- [ ] Content inventory créé

### Phase 2: Design ✅ / ⏳ / ❌
- [ ] styles.md défini
- [ ] Références collectées
- [ ] Moodboard validé

### Phase 3: Choix Stack ✅ / ⏳ / ❌
- [ ] Stack technique définie
- [ ] Dépendances listées

### Phase 4: Génération ✅ / ⏳ / ❌
- [ ] Projet initialisé
- [ ] Composants générés
- [ ] Pages créées
- [ ] Contenu migré

### Phase 5: Finalisation ✅ / ⏳ / ❌
- [ ] Tests responsive
- [ ] Lighthouse audit
- [ ] Déploiement
- [ ] Documentation client

## 📂 Structure

\`\`\`
01-extraction/     → Contenu du site actuel
02-design/         → Design system et références
03-nouveau-site/   → Code du nouveau site
04-livrables/      → Exports et docs pour le client
scripts/           → Scripts d'automatisation
.claude-workspace/ → Contexte et prompts pour Claude Code
\`\`\`

## 🚀 Commandes rapides

\`\`\`bash
# Extraction
npm run extract

# Développement
npm run dev

# Build de production
npm run build

# Déploiement
npm run deploy
\`\`\`
EOF

# Template styles.md
cat > 02-design/styles.md << 'EOF'
# Design System

## 🎨 Inspiration

**Sites de référence**:
- [ ] URL 1
- [ ] URL 2
- [ ] URL 3

**Mots-clés**: moderne, professionnel, minimaliste, chaleureux

**Secteur d'activité**: [À définir]

## 🎭 Direction artistique

**Tonalité**: [corporate / friendly / luxe / artisanal / moderne]

**Identité visuelle**:
- Style: [minimal / riche / illustratif / photographique]
- Ambiance: [sobre / dynamique / chaleureuse / tech]

## 🌈 Palette de couleurs

```css
/* Primary */
--color-primary: #[HEX];
--color-primary-light: #[HEX];
--color-primary-dark: #[HEX];

/* Secondary */
--color-secondary: #[HEX];

/* Accent */
--color-accent: #[HEX];

/* Neutrals */
--color-gray-50: #fafafa;
--color-gray-100: #f5f5f5;
--color-gray-200: #e5e5e5;
--color-gray-800: #262626;
--color-gray-900: #171717;

/* Semantic */
--color-success: #22c55e;
--color-warning: #f59e0b;
--color-error: #ef4444;
```

## 📐 Typographie

**Headings**: [Font name]
- H1: [size] / [weight] / [line-height]
- H2: [size] / [weight] / [line-height]
- H3: [size] / [weight] / [line-height]

**Body**: [Font name]
- Regular: [size] / [weight] / [line-height]
- Small: [size] / [weight] / [line-height]

**Code/Mono**: [Font name] (optionnel)

## 🧩 Composants

### Navigation
- Type: [fixed / sticky / static]
- Style: [transparent / solid / glass]
- Mobile: [burger / bottom nav / drawer]

### Hero
- Layout: [full-screen / compact / split]
- Contenu: [image / video / illustration]
- CTA: [1 bouton / 2 boutons / form]

### Cards
- Style: [shadow / border / flat]
- Hover: [lift / border / scale]
- Layout: [grid / masonry / list]

### Boutons
- Primary: [rounded / square / pill]
- Secondary: [outline / ghost / soft]
- Tailles: [sm / md / lg]

### Footer
- Type: [minimal / riche / newsletter]
- Colonnes: [1 / 2 / 3 / 4]
- Social: [oui / non]

## 📱 Layout & Responsive

**Breakpoints**:
```css
mobile: 0-640px
tablet: 640-1024px
desktop: 1024px+
wide: 1440px+
```

**Container**:
- Max-width: 1200px
- Padding: 1rem (mobile) / 2rem (desktop)

**Grid**:
- System: [CSS Grid / Flexbox / 12 colonnes]
- Gap: [1rem / 1.5rem / 2rem]

## ✨ Animations & Interactions

**Page transitions**: [oui / non]
**Scroll animations**: [oui / non / subtil]
**Hover effects**: [subtil / prononcé / minimal]
**Loading states**: [skeleton / spinner / progressive]

**Timing**:
```css
--transition-fast: 150ms;
--transition-base: 250ms;
--transition-slow: 350ms;
```

## 🎯 Objectifs UX

- [ ] Mobile-first
- [ ] Performance (Lighthouse >90)
- [ ] Accessibilité (WCAG AA)
- [ ] SEO optimisé
- [ ] Conversion optimisée

## 📸 Images

**Style**: [photographique / illustratif / icônes / mixte]
**Traitement**: [naturel / filtré / B&W / coloré]
**Formats**: WebP + fallback PNG/JPG
**Lazy loading**: Oui

## 🔤 Ton & Voix

**Rédaction**:
- Style: [formel / conversationnel / technique]
- Personne: [nous / vous / tu]
- Longueur: [concis / détaillé / équilibré]

## ✅ Checklist de validation

- [ ] Palette définie et cohérente
- [ ] Typographie choisie et testée
- [ ] Composants principaux spécifiés
- [ ] Responsive strategy claire
- [ ] Animations définies
- [ ] Références validées
EOF

# Fichier de contexte pour Claude Code
cat > .claude-workspace/context.md << EOF
# Contexte du Projet

## Client
**Nom**: $PROJECT_NAME
**Site actuel**: ${SITE_URL:-À définir}
**Secteur**: [À définir]

## Objectifs
- Moderniser le design
- Améliorer les performances
- Optimiser pour mobile
- Améliorer le SEO

## Contraintes
- Budget: [À définir]
- Délai: [À définir]
- Hébergement préféré: Vercel / Netlify

## Stack par défaut
- Framework: Astro 4.x
- Styling: Tailwind CSS
- Composants React: pour les parties interactives
- Hébergement: Vercel
EOF

# Guide des prompts pour Claude Code
cat > .claude-workspace/prompts-guide.md << 'EOF'
# 📝 Guide des Prompts pour Claude Code

Ce fichier contient tous les prompts optimisés à utiliser à chaque étape.

## Phase 1: Extraction

### Prompt 1.1 - Créer le script d'extraction
```
Crée un script scripts/extract-site.js qui:
1. Utilise Playwright pour crawler [URL]
2. Extrait toutes les pages (max 50)
3. Prend des screenshots de chaque page (desktop + mobile)
4. Télécharge les assets (images, CSS, JS)
5. Sauvegarde tout dans 01-extraction/

Le script doit:
- Gérer les erreurs proprement
- Afficher une progress bar
- Générer un rapport JSON avec les URLs crawlées
- Respecter robots.txt
```

### Prompt 1.2 - Générer le content inventory
```
Analyse tous les fichiers HTML dans 01-extraction/ et génère un fichier
01-extraction/content-inventory.json qui contient:

{
  "metadata": {
    "site_url": "...",
    "crawled_at": "...",
    "total_pages": N
  },
  "pages": [
    {
      "url": "...",
      "title": "...",
      "description": "...",
      "h1": "...",
      "content": "...", // texte principal extrait
      "images": [...],
      "links": [...]
    }
  ],
  "navigation": {
    "header": [...],
    "footer": [...]
  },
  "assets": {
    "images": [...],
    "documents": [...]
  }
}

Utilise cheerio pour parser le HTML proprement.
```

## Phase 2: Design

### Prompt 2.1 - Analyser le site actuel
```
Analyse le site actuel à partir de:
- Les screenshots dans 01-extraction/screenshots/
- Le content-inventory.json
- L'HTML source

Identifie:
1. Points forts du design actuel à conserver
2. Points faibles à améliorer
3. Structure de l'information
4. Hiérarchie visuelle
5. Éléments de branding (couleurs, logos, typo)

Rédige une analyse en français dans 02-design/analyse-site-actuel.md
```

### Prompt 2.2 - Générer styles.md à partir de références
```
J'ai ces 3 sites de référence pour l'inspiration:
1. [URL ou description]
2. [URL ou description]
3. [URL ou description]

Le site est pour [type d'entreprise/secteur].

Génère un fichier 02-design/styles.md complet qui:
- S'inspire de ces références
- Reste cohérent avec l'identité du client (voir content-inventory.json)
- Définit une palette moderne
- Spécifie tous les composants nécessaires
- Est prêt pour l'implémentation

Suis exactement la structure du template dans 02-design/styles.md
```

### Prompt 2.3 - Créer le moodboard
```
À partir du styles.md, crée un fichier 02-design/moodboard.md qui:
- Liste des exemples concrets pour chaque composant
- Inclut des liens vers des références visuelles
- Propose des alternatives pour les éléments clés
- Aide à la validation avec le client
```

## Phase 3: Stack

### Prompt 3.1 - Recommander la stack
```
Analyse le content-inventory.json et le styles.md.

Recommande la stack technique optimale en considérant:
- Nombre de pages
- Complexité des interactions
- Besoins de CMS
- Performance requise
- Budget d'hébergement

Génère 03-nouveau-site/STACK-DECISION.md avec:
- Stack recommandée + justification
- 2 alternatives
- Comparaison (tableau)
- Commandes d'installation
```

## Phase 4: Génération

### Prompt 4.1 - Initialiser le projet
```
Initialise un projet Astro 4.x dans 03-nouveau-site/ avec:
- Tailwind CSS configuré selon 02-design/styles.md
- Structure de dossiers optimale
- TypeScript
- Composants React pour interactivité
- Intégration Vercel

Configure aussi:
- prettier
- eslint
- husky (optionnel)

Génère un README.md détaillé dans 03-nouveau-site/
```

### Prompt 4.2 - Générer les composants de base
```
À partir de 02-design/styles.md, génère les composants suivants dans
03-nouveau-site/src/components/:

- Header.astro (navigation)
- Footer.astro
- Hero.astro (plusieurs variants)
- Card.astro
- Button.astro
- Container.astro (wrapper responsive)

Chaque composant doit:
- Respecter exactement le design system
- Être responsive
- Avoir des props TypeScript
- Inclure des exemples d'utilisation en commentaire
```

### Prompt 4.3 - Générer le layout principal
```
Crée src/layouts/Layout.astro qui:
- Inclut le Header et Footer
- Gère les meta tags SEO (props dynamiques)
- Intègre les fonts selon styles.md
- Configure les couleurs CSS custom properties
- Ajoute les scripts analytics (placeholder)
```

### Prompt 4.4 - Migrer le contenu
```
À partir de 01-extraction/content-inventory.json, génère toutes les pages
dans 03-nouveau-site/src/pages/ en utilisant:
- Les composants créés
- Le contenu extrait
- La structure de navigation
- Les images optimisées (Sharp)

Priorise:
1. Page d'accueil (index.astro)
2. Pages principales du menu
3. Pages secondaires
```

### Prompt 4.5 - Optimiser les assets
```
Crée un script scripts/optimize-assets.js qui:
1. Copie les images de 01-extraction/assets/
2. Les convertit en WebP avec Sharp
3. Génère plusieurs tailles (responsive)
4. Les place dans 03-nouveau-site/public/images/
5. Met à jour les références dans le code
```

## Phase 5: Finalisation

### Prompt 5.1 - Audit Lighthouse
```
Crée un script scripts/lighthouse-audit.js qui:
- Lance Lighthouse sur toutes les pages
- Génère un rapport consolidé
- Identifie les problèmes
- Suggère des corrections

Sauvegarde dans 04-livrables/lighthouse-report.json
```

### Prompt 5.2 - Générer la documentation client
```
Génère dans 04-livrables/documentation/:

1. guide-modification-contenu.md
   - Comment modifier les textes
   - Comment ajouter une image
   - Comment ajouter une page

2. guide-deploiement.md
   - Processus de déploiement Vercel
   - Variables d'environnement
   - Configuration du domaine

3. maintenance.md
   - Contacts support
   - Mises à jour recommandées
   - Backup strategy

Tout en français, très accessible pour un non-tech.
```

### Prompt 5.3 - Créer le package de livraison
```
Crée un script scripts/prepare-delivery.js qui:
1. Build la version production
2. Génère un export statique si possible
3. Package tout dans 04-livrables/exports/
4. Crée un ZIP avec:
   - Le build
   - La documentation
   - Le code source (clean)
   - Un README.md de livraison
```

## Prompts Utilitaires

### Debug responsive
```
Le composant [nom] ne s'affiche pas correctement sur mobile.
Voici le code: [coller le code]
Fix le problème en respectant le design system de styles.md
```

### Améliorer le SEO
```
Analyse index.astro et améliore le SEO:
- Meta tags optimaux
- Open Graph
- Twitter Cards
- JSON-LD schema.org
- Sitemap

Respecte les best practices 2024.
```

### Ajouter une animation
```
Ajoute une animation [type] sur [composant] qui:
- Respecte le timing de styles.md
- Est performante (transform/opacity only)
- A un fallback si prefers-reduced-motion
- S'active au scroll / hover / mount
```

## 🎯 Tips pour bien prompter Claude Code

1. **Sois spécifique**: Réfère toujours aux fichiers existants
2. **Contextualize**: Mentionne styles.md, content-inventory.json
3. **Demande la justification**: "Explique pourquoi ce choix"
4. **Itère**: Ne cherche pas la perfection du premier coup
5. **Valide étape par étape**: Ne passe pas à la phase suivante sans valider
EOF

# Workflow step-by-step
cat > WORKFLOW-GUIDE.md << 'EOF'
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
EOF

echo ""
echo "✅ Bootstrap terminé!"
echo ""
echo "📂 Structure créée:"
tree -L 2 -I 'node_modules'
echo ""
echo "🚀 Next steps:"
echo "1. Lis WORKFLOW-GUIDE.md pour le guide complet"
echo "2. Lis .claude-workspace/prompts-guide.md pour les prompts optimisés"
echo "3. Lance: npm install"
echo "4. Commence la Phase 1 avec Claude Code!"
echo ""
echo "📖 Commande utile:"
echo "   code WORKFLOW-GUIDE.md"
echo ""

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

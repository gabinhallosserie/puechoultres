# Méthodologie — Refonte de site web

Workflow utilisé pour les missions de refonte de sites existants, de l'extraction du contenu jusqu'au déploiement du nouveau site.

---

## Structure du dossier de mission

```
01-extraction/     → Contenu aspiré du site actuel (textes, images, structure)
02-design/         → Design system, références visuelles, moodboard
03-nouveau-site/   → Code source du nouveau site
04-livrables/      → Exports et documentation client
scripts/           → Scripts d'automatisation
.claude-workspace/ → Contexte et prompts pour Claude Code
```

---

## Les 5 phases

### Phase 1 — Extraction

Aspiration du site existant pour constituer un inventaire de contenu :
- Textes, pages, navigation
- Images et médias
- Structure des URLs
- Données de contact, mentions légales

Outils : scripts d'aspiration Node.js, Playwright pour les screenshots.

---

### Phase 2 — Design

Définition du design system avant de coder :
- Palette de couleurs (primaire, secondaire, neutres)
- Typographie (heading, body)
- Références visuelles sectorielles
- Moodboard validé avec le client

Le fichier `02-design/styles.md` centralise toutes ces décisions.

---

### Phase 3 — Choix de stack

Sélection des technologies selon le profil du projet :

| Critère | Choix par défaut |
|---|---|
| Framework | Astro (sites vitrine statiques) |
| Styling | Tailwind CSS v4 |
| Interactivité | React (îles isolées) |
| Déploiement | Docker + Nginx / Netlify |

---

### Phase 4 — Génération

Initialisation du projet et développement :
1. Scaffold Astro avec les intégrations nécessaires
2. Mise en place du layout de base (Header, Footer, BaseLayout)
3. Création des composants UI réutilisables
4. Développement page par page en migrant le contenu extrait
5. Intégration des formulaires (contact, devis, candidature)

---

### Phase 5 — Finalisation

Avant livraison :
- Tests responsive (mobile, tablette, desktop)
- Audit Lighthouse (performance, accessibilité, SEO)
- Vérification des liens, emails, téléphones
- Configuration du déploiement (Docker Compose / CI)
- Documentation client

---

## Commandes rapides

```bash
# Développement local
cd 03-nouveau-site
npm install
npm run dev

# Build de production
npm run build

# Déploiement Docker
docker compose up -d --build
```

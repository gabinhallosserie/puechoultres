# Nouveau site — Puechoultres & Fils

Refonte du site [puechoultres.fr](https://www.puechoultres.fr) — SARL BTP basée à Baraqueville (Aveyron, 12160).

---

## Stack technique

| Outil | Version | Rôle |
|---|---|---|
| Astro | 6.x | Framework principal (rendu statique) |
| React | 19.x | Composants interactifs (formulaires, slider) |
| Tailwind CSS | 4.x | Styling utility-first |
| Framer Motion | 12.x | Animations au scroll |
| React Hook Form | 7.x | Gestion et validation des formulaires |
| Nginx | stable-alpine | Serveur web en production |
| Docker | — | Conteneurisation |

---

## Structure du projet

```
src/
├── components/
│   ├── layout/        → Header.astro, Footer.astro
│   ├── react/         → Composants React (formulaires, slider, animations)
│   └── ui/            → Composants Astro réutilisables (Button, GlassCard…)
├── layouts/
│   └── BaseLayout.astro   → Layout racine (SEO, schema.org, fonts)
├── pages/
│   ├── index.astro
│   ├── presentation.astro
│   ├── nos-evenements.astro
│   ├── offres-d-emploi.astro
│   ├── nous-contacter.astro
│   ├── mentions-legales.astro
│   └── services/          → Une page par service (12 au total)
public/
└── images/            → Logo et visuels statiques
```

---

## Informations client

| Champ | Valeur |
|---|---|
| Raison sociale | SARL Puechoultres & Fils |
| Adresse | ZA Marengo — 12160 Baraqueville |
| Téléphone | 05 65 69 02 70 |
| Email | sarl@puechoultres.fr |
| Facebook | [Puechoultrestp](https://www.facebook.com/Puechoultrestp#) |

---

## Développement local

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # génère dist/
npm run preview   # prévisualise le build
```

---

## Déploiement Docker

Le projet se déploie via un build multi-stage : Node.js construit le site statique, Nginx le sert.

```bash
# Depuis ce dossier
docker compose up -d --build
# Accessible sur http://<serveur>:3000
```

### Via Portainer (Git)

| Champ | Valeur |
|---|---|
| Repository URL | URL du repo GitHub |
| Branch | `refs/heads/main` |
| Compose path | `03-nouveau-site/docker-compose.yml` |

---

## Choix techniques notables

- **Astro en mode statique** : pas d'adaptateur SSR, le build produit du HTML pur servi par Nginx. Idéal pour un site vitrine.
- **React en îles isolées** : seuls les composants interactifs (formulaires, hero slider) sont hydrés côté client. Le reste est du HTML statique.
- **Formulaires Netlify-ready** : les formulaires incluent les attributs `data-netlify` pour une activation sans backend si le client migre vers Netlify.
- **Tailwind v4** : intégré via le plugin Vite (`@tailwindcss/vite`), pas de fichier de config séparé.

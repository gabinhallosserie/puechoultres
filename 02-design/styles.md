# Design System - Puech Oultres

## 🎨 Inspiration

**Sites de référence** :
- Sites BTP modernes avec impact visuel fort
- Entreprises de construction avec identité forte (ex: Bouygues Construction, Eiffage)
- Designs industriels avec effets glassmorphism

**Mots-clés** : dynamique, impactant, moderne, puissant, professionnel

**Secteur d'activité** : Travaux publics, BTP, Transport, Démolition, Assainissement

## 🎭 Direction artistique

**Tonalité** : Dynamique & Impactant

**Identité visuelle** :
- Style : Photographique avec contrastes forts
- Ambiance : Puissance, expertise technique, impact visuel
- Photos : Chantiers, engins, équipes en action
- Effets : Glassmorphism pour les éléments UI modernes

**Émotion recherchée** : Confiance, puissance, modernité, expertise

## 🌈 Palette de couleurs

```css
/* Primary - Rouge Impact */
--color-primary: #DC2626;        /* Rouge vif, énergique */
--color-primary-light: #EF4444;  /* Rouge plus clair pour hover */
--color-primary-dark: #991B1B;   /* Rouge foncé pour texte */

/* Secondary - Noir Puissance */
--color-secondary: #1F1F1F;      /* Noir profond */
--color-secondary-light: #2D2D2D; /* Gris très foncé */

/* Accent - Orange Énergie */
--color-accent: #F97316;         /* Orange pour CTAs secondaires */
--color-accent-light: #FB923C;   /* Orange clair */

/* Neutrals */
--color-white: #FFFFFF;
--color-gray-50: #F9FAFB;
--color-gray-100: #F3F4F6;
--color-gray-200: #E5E7EB;
--color-gray-300: #D1D5DB;
--color-gray-400: #9CA3AF;
--color-gray-500: #6B7280;
--color-gray-600: #4B5563;
--color-gray-700: #374151;
--color-gray-800: #1F2937;
--color-gray-900: #111827;
--color-black: #000000;

/* Semantic */
--color-success: #10B981;
--color-warning: #F59E0B;
--color-error: #DC2626;
--color-info: #3B82F6;

/* Glassmorphism */
--glass-bg: rgba(255, 255, 255, 0.1);
--glass-bg-dark: rgba(0, 0, 0, 0.2);
--glass-border: rgba(255, 255, 255, 0.2);
--glass-blur: blur(12px);
```

## 📐 Typographie

**Headings** : Montserrat (Google Font)
- H1 : 3.5rem (56px) / 800 (ExtraBold) / 1.1
- H2 : 2.5rem (40px) / 700 (Bold) / 1.2
- H3 : 2rem (32px) / 700 (Bold) / 1.3
- H4 : 1.5rem (24px) / 600 (SemiBold) / 1.4
- H5 : 1.25rem (20px) / 600 (SemiBold) / 1.5

**Body** : Inter (Google Font)
- Regular : 1rem (16px) / 400 / 1.6
- Large : 1.125rem (18px) / 400 / 1.6
- Small : 0.875rem (14px) / 400 / 1.5
- Bold : 1rem / 600 / 1.6

**Import Google Fonts** :
```html
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

## 🧩 Composants

### Navigation

**Type** : Transparent → Solide au scroll (sticky)

**Comportement** :
- État initial : Fond transparent avec glassmorphism
- Au scroll (>100px) : Fond noir solide avec ombre
- Hauteur : 80px
- Transition fluide : 300ms ease

**Style** :
```css
/* Initial */
background: rgba(0, 0, 0, 0.3);
backdrop-filter: blur(12px);
border-bottom: 1px solid rgba(255, 255, 255, 0.1);

/* Scrolled */
background: #1F1F1F;
box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
```

**Mobile** : Burger menu avec overlay plein écran

**Logo** : Gauche, taille 180px x 60px

**Menu items** :
- Couleur : Blanc
- Hover : Rouge primary avec underline animé
- Active : Rouge primary + Bold

### Hero (Page d'accueil)

**Layout** : Slider/Carousel d'images plein écran

**Dimensions** : 100vh (hauteur totale de l'écran)

**Contenu par slide** :
- Image de fond (chantier, engin, équipe)
- Overlay gradient : `linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.3))`
- Titre H1 en blanc (gauche)
- Sous-titre en gris-200
- 1-2 CTAs

**Slider** :
- Auto-play : 5 secondes
- Navigation : Dots + flèches
- Transition : Fade 800ms
- Minimum 3 slides différentes

**CTAs** :
- CTA Principal : Bouton rouge plein
- CTA Secondaire : Bouton outline blanc

### Cards

**Style** : Glassmorphism avec effets de profondeur

```css
background: rgba(255, 255, 255, 0.1);
backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.2);
border-radius: 12px;
padding: 2rem;
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
```

**Hover** :
```css
transform: translateY(-8px);
box-shadow: 0 16px 48px rgba(220, 38, 38, 0.2);
border-color: rgba(220, 38, 38, 0.3);
transition: all 300ms ease;
```

**Variantes** :
- Service card : Icon + Title + Description + CTA
- Testimonial card : Quote + Author + Photo
- Stats card : Number + Label

### Boutons

**Primary (Rouge)** :
```css
background: linear-gradient(135deg, #DC2626, #991B1B);
color: white;
padding: 1rem 2rem;
border-radius: 8px;
font-weight: 600;
font-size: 1rem;
box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
transition: all 250ms ease;
```

**Hover** :
```css
transform: translateY(-2px);
box-shadow: 0 8px 20px rgba(220, 38, 38, 0.4);
background: linear-gradient(135deg, #EF4444, #DC2626);
```

**Secondary (Outline)** :
```css
background: transparent;
border: 2px solid white;
color: white;
padding: 1rem 2rem;
border-radius: 8px;
```

**Tailles** :
- Small : padding 0.5rem 1rem / font 0.875rem
- Medium : padding 1rem 2rem / font 1rem
- Large : padding 1.25rem 2.5rem / font 1.125rem

### Footer

**Type** : Minimal avec liens essentiels

**Structure** : 1 ligne compacte

**Contenu** :
- Colonne 1 : Logo + tagline
- Colonne 2 : Navigation rapide (Services, Contact, Mentions légales)
- Colonne 3 : Contact (Tél, Email, Adresse)
- Colonne 4 : Réseaux sociaux (icônes)

**Style** :
```css
background: #1F1F1F;
color: #9CA3AF;
padding: 3rem 0 1rem;
border-top: 1px solid #374151;
```

**Copyright** : Centré en bas, petit texte gris

## 📱 Layout & Responsive

**Breakpoints** :
```css
/* Mobile */
@media (max-width: 640px) { ... }

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) { ... }

/* Desktop */
@media (min-width: 1025px) { ... }

/* Wide */
@media (min-width: 1440px) { ... }
```

**Container** :
- Max-width : 1280px
- Padding : 1rem (mobile) / 2rem (tablet) / 3rem (desktop)
- Margin : auto (centré)

**Grid** :
- System : CSS Grid
- Colonnes : 12 colonnes
- Gap : 1.5rem (mobile) / 2rem (desktop)

**Sections spacing** :
- Mobile : 3rem (48px)
- Desktop : 5rem (80px)

## ✨ Animations & Interactions

**Page transitions** : Oui, fade-in subtil

**Scroll animations** : Oui, prononcés
- Fade in + slide up au scroll
- Parallax sur hero images
- Counter animation pour les chiffres/stats

**Hover effects** : Prononcés
- Boutons : lift + shadow + color shift
- Cards : lift + border glow
- Images : zoom léger (scale 1.05)
- Links : underline slide-in

**Loading states** : Skeleton screens avec shimmer effect

**Timing** :
```css
--transition-fast: 150ms;
--transition-base: 250ms;
--transition-slow: 400ms;
--transition-slower: 800ms;
```

**Easing** :
```css
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

## 🎯 Objectifs UX

- [x] Mobile-first
- [x] Performance (Lighthouse >90)
- [x] Accessibilité (WCAG AA)
- [x] SEO optimisé
- [x] Conversion optimisée (CTAs clairs, formulaires simples)
- [x] Chargement progressif des images
- [x] Animations performantes (GPU)

## 📸 Images

**Style** : Photographique - chantiers, engins, équipes en action

**Traitement** :
- Photos naturelles avec contraste légèrement augmenté
- Overlays sombres pour lisibilité du texte
- Filtres : Saturation +10%, Contraste +15%

**Formats** : 
- WebP pour les photos (avec fallback JPG)
- SVG pour les icônes et logos
- PNG pour les images avec transparence

**Lazy loading** : Oui, avec placeholder blur

**Optimisation** :
- Desktop : max 1920px width
- Mobile : max 768px width
- Quality : 85%

## 🔤 Ton & Voix

**Rédaction** :
- Style : Professionnel mais accessible
- Personne : "Nous" (inclusif, équipe)
- Longueur : Concis et impactant

**Exemples de phrases** :
- ✅ "Experts en travaux publics depuis 1975"
- ✅ "Des solutions BTP adaptées à vos projets"
- ✅ "Matériel de pointe, équipe qualifiée"
- ❌ "On est les meilleurs" (trop familier)
- ❌ Jargon technique sans explication

**CTAs impactants** :
- "Demander un devis"
- "Découvrir nos services"
- "Contactez nos experts"
- "Voir nos réalisations"

## 🎨 Exemples de sections

### Section Services (Page d'accueil)

**Layout** : Grid 3 colonnes (1 sur mobile)

**Chaque carte** :
- Icône (rouge sur fond noir avec glassmorphism)
- Titre H3
- Description courte (2-3 lignes)
- Lien "En savoir plus →"

**Style** : Cards glassmorphism avec hover lift

### Section Chiffres Clés

**Layout** : 4 colonnes inline (2x2 sur mobile)

**Contenu** :
- Grand nombre animé (count-up)
- Label descriptif
- Icône subtile

**Couleurs** : Texte blanc sur fond noir/rouge dégradé

### Section Contact (Footer ou page dédiée)

**Layout** : Split 50/50
- Gauche : Formulaire (Nom, Email, Message)
- Droite : Infos contact + carte

**Style formulaire** :
- Inputs avec border subtile
- Focus : border rouge
- Bouton submit : rouge primary
- Validation inline

## ✅ Checklist de validation

- [x] Palette rouge/noir/orange définie
- [x] Typographie Montserrat + Inter choisie
- [x] Navigation transparente → solide configurée
- [x] Hero slider spécifié
- [x] Cards glassmorphism avec hover
- [x] Boutons avec effets prononcés
- [x] Footer minimal défini
- [x] Animations scroll activées
- [x] Border radius 8-12px
- [x] Responsive mobile-first
- [x] Images photographiques + overlays

## 🚀 Stack technique recommandée

**Framework** : Astro 4.x (performance maximale)
**Styling** : Tailwind CSS + Custom CSS pour glassmorphism
**Composants React** : Pour slider, animations, formulaires
**Images** : Sharp pour optimisation
**Animations** : Framer Motion ou GSAP
**Slider** : Swiper.js
**Icons** : Lucide React

## 📋 Pages à créer

D'après le content inventory, voici la structure :

1. **Accueil** (Hero slider + Services + Chiffres + CTA)
2. **Présentation** (Histoire, équipe, valeurs)
3. **Services** (liste complète) :
   - Travaux publics
   - Transport
   - Béton prêt à l'emploi
   - Désamiantage
   - Goudronnage
   - Démolition
   - Voirie et réseaux
   - Location
   - Assainissement
   - Recyclage
   - Levage
   - Aménagement extérieur
4. **Nos événements**
5. **Offres d'emploi**
6. **Contact**
7. **Mentions légales**

## 💡 Notes d'implémentation

**Glassmorphism** : Nécessite `backdrop-filter: blur()` - vérifier support navigateur

**Performance** :
- Lazy load images
- Preload hero images
- Defer non-critical JS
- Minify CSS/JS

**Accessibilité** :
- Alt text sur toutes images
- ARIA labels sur navigation
- Contraste suffisant (rouge #DC2626 sur blanc = OK)
- Focus visible sur interactive elements

**SEO** :
- Meta descriptions uniques par page
- H1 unique par page
- Structure heading logique (H1→H2→H3)
- Schema.org markup (Organization, LocalBusiness)

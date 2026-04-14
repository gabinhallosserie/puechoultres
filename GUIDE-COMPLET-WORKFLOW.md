# 🚀 Guide Complet de Refonte - Workflow Pas à Pas

**Méthodologie Claude Code pour Refontes de Sites Web Rapides et Professionnelles**

---

## 📋 Vue d'Ensemble

Ce guide vous accompagne étape par étape pour réaliser une refonte complète de site web en **2h30 à 4 heures**. Chaque section contient les commandes exactes à exécuter, les scripts à copier-coller, et les prompts optimisés pour Claude Code.

**Durée totale estimée :** 2h30 - 4h  
**Taux d'automatisation :** ~70%  
**Gain de temps vs. méthode traditionnelle :** 80%

---

## 🎯 Prérequis

Avant de commencer, assurez-vous d'avoir :

- ✅ Node.js 18+ installé (`node --version`)
- ✅ npm ou yarn installé
- ✅ Un IDE (VS Code, WebStorm, etc.)
- ✅ Claude Code accessible dans votre terminal
- ✅ L'URL du site à refondre

---

## 📂 Étape 0 : Initialisation du Projet

### 0.1 Créer la structure du projet

```bash
# Créer le dossier du projet
mkdir nom-du-projet
cd nom-du-projet

# Créer la structure de dossiers (version PowerShell)
mkdir 01-extraction
mkdir 01-extraction\screenshots
mkdir 01-extraction\screenshots\desktop
mkdir 01-extraction\screenshots\mobile
mkdir 01-extraction\assets
mkdir 01-extraction\assets\images
mkdir 01-extraction\html

mkdir 02-design
mkdir 02-design\references

mkdir 03-nouveau-site

mkdir 04-livrables
mkdir 04-livrables\documentation
mkdir 04-livrables\exports

mkdir scripts

mkdir .claude-workspace
```

### 0.2 Initialiser package.json

Créez le fichier `package.json` à la racine :

```json
{
  "name": "refonte-workflow",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "extract": "node scripts/extract-site.js",
    "generate-inventory": "node scripts/generate-inventory.js",
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
```

### 0.3 Installer les dépendances

```bash
npm install
npx playwright install chromium
```

---

## 📥 PHASE 1 : Audit & Extraction (30-45 min)

### 1.1 Créer le script d'extraction

Créez le fichier `scripts/extract-site.js` :

```javascript
#!/usr/bin/env node

/**
 * 🕷️ Script d'extraction de site web
 * 
 * Utilise Playwright pour crawler, capturer et extraire le site
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
  startUrl: process.argv[2] || 'https://www.example.com',
  maxPages: parseInt(process.argv[3]) || 50,
  outputDir: path.join(process.cwd(), '01-extraction'),
  screenshotsDir: path.join(process.cwd(), '01-extraction', 'screenshots'),
  assetsDir: path.join(process.cwd(), '01-extraction', 'assets'),
  timeout: 30000,
  userAgent: 'Mozilla/5.0 (compatible; SiteRefonte/1.0)'
};

// État du crawl
const crawlState = {
  visited: new Set(),
  toVisit: [],
  errors: [],
  images: new Set(),
  startTime: Date.now()
};

function normalizeUrl(url, baseUrl) {
  try {
    const urlObj = new URL(url, baseUrl);
    urlObj.hash = '';
    return urlObj.href;
  } catch (e) {
    return null;
  }
}

function isSameDomain(url, baseUrl) {
  try {
    const urlObj = new URL(url);
    const baseObj = new URL(baseUrl);
    return urlObj.hostname === baseObj.hostname;
  } catch (e) {
    return false;
  }
}

async function setupDirectories() {
  await fs.mkdir(CONFIG.outputDir, { recursive: true });
  await fs.mkdir(CONFIG.screenshotsDir, { recursive: true });
  await fs.mkdir(path.join(CONFIG.screenshotsDir, 'desktop'), { recursive: true });
  await fs.mkdir(path.join(CONFIG.screenshotsDir, 'mobile'), { recursive: true });
  await fs.mkdir(CONFIG.assetsDir, { recursive: true });
  await fs.mkdir(path.join(CONFIG.assetsDir, 'images'), { recursive: true });
  await fs.mkdir(path.join(CONFIG.outputDir, 'html'), { recursive: true });
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = require('fs').createWriteStream(filepath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
      } else {
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

async function extractPageData(page, url) {
  try {
    await page.waitForLoadState('networkidle', { timeout: CONFIG.timeout });

    const data = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href]'))
        .map(a => a.href)
        .filter(href => href && !href.startsWith('mailto:') && !href.startsWith('tel:'));

      const images = Array.from(document.querySelectorAll('img[src]'))
        .map(img => ({
          src: img.src,
          alt: img.alt || '',
          width: img.width,
          height: img.height
        }));

      const title = document.querySelector('title')?.textContent || '';
      const description = document.querySelector('meta[name="description"]')?.content || '';
      const h1 = document.querySelector('h1')?.textContent || '';

      const main = document.querySelector('main') || document.querySelector('.content') || document.querySelector('article') || document.body;
      const content = main?.innerText?.slice(0, 5000) || '';

      return { title, description, h1, links, images, content };
    });

    return data;
  } catch (error) {
    console.error(`❌ Erreur extraction ${url}:`, error.message);
    return null;
  }
}

async function takeScreenshots(page, url, index) {
  const urlObj = new URL(url);
  const filename = `page-${String(index).padStart(3, '0')}-${urlObj.pathname.replace(/\//g, '_') || 'home'}`;

  try {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.screenshot({
      path: path.join(CONFIG.screenshotsDir, 'desktop', `${filename}.png`),
      fullPage: true
    });

    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({
      path: path.join(CONFIG.screenshotsDir, 'mobile', `${filename}.png`),
      fullPage: true
    });

    console.log(`  📸 Screenshots: ${filename}`);
  } catch (error) {
    console.error(`  ❌ Erreur screenshots:`, error.message);
  }
}

async function saveHtml(page, url, index) {
  try {
    const html = await page.content();
    const urlObj = new URL(url);
    const filename = `page-${String(index).padStart(3, '0')}-${urlObj.pathname.replace(/\//g, '_') || 'home'}.html`;
    
    await fs.writeFile(
      path.join(CONFIG.outputDir, 'html', filename),
      html,
      'utf-8'
    );
  } catch (error) {
    console.error(`  ❌ Erreur sauvegarde HTML:`, error.message);
  }
}

async function downloadImages(images, baseUrl) {
  for (const img of images) {
    if (!img.src || crawlState.images.has(img.src)) continue;
    
    crawlState.images.add(img.src);
    
    try {
      const imgUrl = new URL(img.src, baseUrl);
      const ext = path.extname(imgUrl.pathname) || '.jpg';
      const filename = `img-${crawlState.images.size}${ext}`;
      const filepath = path.join(CONFIG.assetsDir, 'images', filename);
      
      await downloadImage(imgUrl.href, filepath);
      console.log(`  🖼️  Image: ${filename}`);
    } catch (error) {
      // Silent fail
    }
  }
}

async function crawlPage(browser, url, index) {
  console.log(`\n[${index + 1}/${CONFIG.maxPages}] 🔍 ${url}`);
  
  const page = await browser.newPage({ userAgent: CONFIG.userAgent });

  try {
    await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: CONFIG.timeout 
    });

    const data = await extractPageData(page, url);
    
    if (!data) {
      crawlState.errors.push({ url, error: 'Extraction failed' });
      await page.close();
      return null;
    }

    await takeScreenshots(page, url, index);
    await saveHtml(page, url, index);

    if (data.images && data.images.length > 0) {
      await downloadImages(data.images, url);
    }

    for (const link of data.links) {
      const normalizedLink = normalizeUrl(link, CONFIG.startUrl);
      
      if (normalizedLink && 
          !crawlState.visited.has(normalizedLink) && 
          !crawlState.toVisit.includes(normalizedLink) &&
          isSameDomain(normalizedLink, CONFIG.startUrl)) {
        crawlState.toVisit.push(normalizedLink);
      }
    }

    await page.close();

    return {
      url,
      ...data,
      crawledAt: new Date().toISOString()
    };

  } catch (error) {
    console.error(`  ❌ Erreur:`, error.message);
    crawlState.errors.push({ url, error: error.message });
    await page.close();
    return null;
  }
}

function showProgress() {
  const elapsed = ((Date.now() - crawlState.startTime) / 1000).toFixed(0);
  const pagesCount = crawlState.visited.size;
  const imagesCount = crawlState.images.size;
  const errorsCount = crawlState.errors.length;
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 ${pagesCount} pages | ${imagesCount} images | ${errorsCount} erreurs`);
  console.log(`⏱️  ${elapsed}s | 🔜 ${crawlState.toVisit.length} URLs en queue`);
  console.log(`${'='.repeat(60)}\n`);
}

async function generateReport(pages) {
  const report = {
    metadata: {
      site_url: CONFIG.startUrl,
      crawled_at: new Date().toISOString(),
      total_pages: pages.length,
      total_images: crawlState.images.size,
      total_errors: crawlState.errors.length,
      duration_seconds: ((Date.now() - crawlState.startTime) / 1000).toFixed(2)
    },
    pages: pages.filter(p => p !== null),
    errors: crawlState.errors,
    images: Array.from(crawlState.images)
  };

  await fs.writeFile(
    path.join(CONFIG.outputDir, 'crawl-report.json'),
    JSON.stringify(report, null, 2),
    'utf-8'
  );

  return report;
}

async function main() {
  console.log(`\n🕷️  EXTRACTION DE SITE WEB\n${'='.repeat(60)}`);
  console.log(`🌐 URL: ${CONFIG.startUrl}`);
  console.log(`📄 Max: ${CONFIG.maxPages} pages\n`);

  await setupDirectories();

  console.log('🚀 Lancement de Chromium...\n');
  const browser = await chromium.launch({ headless: true });

  crawlState.toVisit.push(CONFIG.startUrl);
  const pages = [];

  while (crawlState.toVisit.length > 0 && crawlState.visited.size < CONFIG.maxPages) {
    const url = crawlState.toVisit.shift();
    
    if (crawlState.visited.has(url)) continue;
    
    crawlState.visited.add(url);
    const pageData = await crawlPage(browser, url, crawlState.visited.size - 1);
    
    if (pageData) {
      pages.push(pageData);
    }

    if (crawlState.visited.size % 5 === 0) {
      showProgress();
    }
  }

  await browser.close();

  console.log('\n📝 Génération du rapport...');
  const report = await generateReport(pages);

  console.log(`\n✅ EXTRACTION TERMINÉE\n${'='.repeat(60)}`);
  console.log(`📊 Pages: ${report.metadata.total_pages}`);
  console.log(`🖼️  Images: ${report.metadata.total_images}`);
  console.log(`⏱️  Durée: ${report.metadata.duration_seconds}s`);
  console.log(`\n🚀 Prochaine étape: npm run generate-inventory\n`);
}

main().catch(error => {
  console.error('\n💥 Erreur fatale:', error);
  process.exit(1);
});
```

### 1.2 Exécuter l'extraction

```bash
# Lancer l'extraction (remplacez l'URL par celle du site à refondre)
npm run extract

# Le script va crawler le site et générer :
# - 01-extraction/screenshots/desktop/ (screenshots desktop)
# - 01-extraction/screenshots/mobile/ (screenshots mobile)
# - 01-extraction/assets/images/ (images téléchargées)
# - 01-extraction/html/ (pages HTML)
# - 01-extraction/crawl-report.json (rapport de crawl)
```

### 1.3 Créer le script de génération d'inventaire

Créez le fichier `scripts/generate-inventory.js` :

```javascript
#!/usr/bin/env node

/**
 * 📋 Script de génération du Content Inventory
 */

const fs = require('fs').promises;
const path = require('path');
const cheerio = require('cheerio');
const TurndownService = require('turndown');

const CONFIG = {
  htmlDir: path.join(process.cwd(), '01-extraction', 'html'),
  crawlReport: path.join(process.cwd(), '01-extraction', 'crawl-report.json'),
  outputFile: path.join(process.cwd(), '01-extraction', 'content-inventory.json')
};

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced'
});

function extractMainContent($) {
  const selectors = [
    'main',
    'article',
    '[role="main"]',
    '.main-content',
    '.content',
    '#content'
  ];

  for (const selector of selectors) {
    const element = $(selector).first();
    if (element.length > 0) {
      return element;
    }
  }

  const body = $('body').clone();
  body.find('header, footer, nav, aside').remove();
  return body;
}

async function parseHtmlFile(filepath, url) {
  try {
    const html = await fs.readFile(filepath, 'utf-8');
    const $ = cheerio.load(html);

    const title = $('title').text().trim() || '';
    const description = $('meta[name="description"]').attr('content') || '';
    const keywords = $('meta[name="keywords"]').attr('content') || '';
    
    const h1 = $('h1').first().text().trim() || '';
    const h2s = $('h2').map((i, el) => $(el).text().trim()).get();

    const mainContent = extractMainContent($);
    const textContent = mainContent.text().replace(/\s+/g, ' ').trim();
    
    let markdownContent = '';
    try {
      const contentHtml = mainContent.html() || '';
      markdownContent = turndownService.turndown(contentHtml);
    } catch (e) {
      markdownContent = textContent;
    }

    const images = $('img').map((i, el) => ({
      src: $(el).attr('src') || '',
      alt: $(el).attr('alt') || '',
      title: $(el).attr('title') || ''
    })).get();

    const links = $('a[href]').map((i, el) => ({
      href: $(el).attr('href') || '',
      text: $(el).text().trim()
    })).get();

    const forms = $('form').map((i, el) => {
      const $form = $(el);
      return {
        action: $form.attr('action') || '',
        method: $form.attr('method') || 'GET',
        fields: $form.find('input, textarea, select').map((j, field) => ({
          name: $(field).attr('name') || '',
          type: $(field).attr('type') || 'text',
          label: $(field).prev('label').text().trim() || $(field).attr('placeholder') || ''
        })).get()
      };
    }).get();

    const ctas = $('a.btn, a.button, button, input[type="submit"]').map((i, el) => ({
      text: $(el).text().trim() || $(el).attr('value') || '',
      href: $(el).attr('href') || ''
    })).get();

    return {
      url,
      title,
      description,
      keywords,
      h1,
      h2s,
      content: {
        text: textContent.slice(0, 3000),
        markdown: markdownContent.slice(0, 5000),
        wordCount: textContent.split(/\s+/).length
      },
      images,
      links,
      forms,
      ctas,
      metadata: {
        hasH1: h1.length > 0,
        imagesCount: images.length,
        linksCount: links.length,
        formsCount: forms.length
      }
    };

  } catch (error) {
    console.error(`❌ Erreur parsing ${filepath}:`, error.message);
    return null;
  }
}

async function extractNavigation(htmlFiles) {
  if (htmlFiles.length === 0) return { header: [], footer: [] };

  const firstFile = htmlFiles[0];
  const html = await fs.readFile(firstFile, 'utf-8');
  const $ = cheerio.load(html);

  const headerNav = $('header nav, nav.header, .main-nav').first();
  const headerLinks = headerNav.find('a').map((i, el) => ({
    text: $(el).text().trim(),
    href: $(el).attr('href') || ''
  })).get();

  const footerNav = $('footer nav, nav.footer').first();
  const footerLinks = footerNav.find('a').map((i, el) => ({
    text: $(el).text().trim(),
    href: $(el).attr('href') || ''
  })).get();

  return {
    header: headerLinks,
    footer: footerLinks
  };
}

function generateInsights(pages, navigation) {
  const totalWords = pages.reduce((sum, p) => sum + (p.content?.wordCount || 0), 0);
  const avgWords = Math.round(totalWords / pages.length);
  
  const pagesWithForms = pages.filter(p => p.forms && p.forms.length > 0);
  const pagesWithCTA = pages.filter(p => p.ctas && p.ctas.length > 0);

  return {
    content: {
      totalPages: pages.length,
      totalWords,
      averageWordsPerPage: avgWords,
      pagesWithForms: pagesWithForms.length,
      pagesWithCTA: pagesWithCTA.length
    },
    navigation: {
      headerLinksCount: navigation.header.length,
      footerLinksCount: navigation.footer.length
    },
    recommendations: {
      needsSEO: pages.filter(p => !p.description || !p.h1).length > 0,
      needsAccessibility: pages.some(p => p.images?.some(img => !img.alt)),
      hasContactForm: pagesWithForms.length > 0,
      hasCTAs: pagesWithCTA.length > 0
    }
  };
}

async function main() {
  console.log(`\n📋 GÉNÉRATION DU CONTENT INVENTORY\n${'='.repeat(60)}\n`);

  let crawlReport = null;
  try {
    const reportData = await fs.readFile(CONFIG.crawlReport, 'utf-8');
    crawlReport = JSON.parse(reportData);
  } catch (error) {
    console.log('⚠️  crawl-report.json non trouvé');
  }

  console.log('📂 Lecture des fichiers HTML...');
  const files = await fs.readdir(CONFIG.htmlDir);
  const htmlFiles = files
    .filter(f => f.endsWith('.html'))
    .map(f => path.join(CONFIG.htmlDir, f));

  console.log(`   Trouvé: ${htmlFiles.length} fichiers\n`);

  console.log('🔍 Parsing des pages...');
  const pages = [];
  
  for (let i = 0; i < htmlFiles.length; i++) {
    const file = htmlFiles[i];
    const filename = path.basename(file);
    
    let url = `page-${i}`;
    if (crawlReport && crawlReport.pages[i]) {
      url = crawlReport.pages[i].url;
    }

    console.log(`   [${i + 1}/${htmlFiles.length}] ${filename}`);
    
    const pageData = await parseHtmlFile(file, url);
    if (pageData) {
      pages.push(pageData);
    }
  }

  console.log('\n🧭 Extraction de la navigation...');
  const navigation = await extractNavigation(htmlFiles);

  console.log('💡 Génération des insights...');
  const insights = generateInsights(pages, navigation);

  const inventory = {
    metadata: {
      generated_at: new Date().toISOString(),
      source: crawlReport?.metadata?.site_url || 'Unknown',
      total_pages: pages.length,
      ...insights.content
    },
    pages,
    navigation,
    insights
  };

  console.log('\n💾 Sauvegarde...');
  await fs.writeFile(
    CONFIG.outputFile,
    JSON.stringify(inventory, null, 2),
    'utf-8'
  );

  console.log(`\n✅ CONTENT INVENTORY GÉNÉRÉ\n${'='.repeat(60)}`);
  console.log(`📊 Pages: ${pages.length}`);
  console.log(`📝 Mots: ${insights.content.totalWords}`);
  console.log(`📋 Formulaires: ${insights.content.pagesWithForms}`);
  console.log(`\n🚀 Prochaine étape: Définir le design dans 02-design/styles.md\n`);
}

main().catch(error => {
  console.error('\n💥 Erreur fatale:', error);
  process.exit(1);
});
```

### 1.4 Générer l'inventaire

```bash
npm run generate-inventory

# Résultat : 01-extraction/content-inventory.json
```

✅ **Phase 1 terminée !** Vous avez maintenant :
- Screenshots du site (desktop + mobile)
- Images téléchargées
- HTML de chaque page
- Content inventory structuré en JSON

---

## 🎨 PHASE 2 : Définition du Style (20-30 min)

### 2.1 Template styles.md

Créez le fichier `02-design/styles.md` avec ce template :

```markdown
# Design System - [Nom du Projet]

## 🎨 Inspiration

**Sites de référence** :
- URL ou description 1
- URL ou description 2
- URL ou description 3

**Secteur d'activité** : [BTP, Restaurant, Tech, etc.]

**Mots-clés** : [moderne, professionnel, dynamique, etc.]

## 🎭 Direction artistique

**Tonalité** : [Dynamique & Impactant / Moderne & Tech / Classique / Chaleureux]

**Style** : [Photographique / Illustratif / Minimal / Riche]

**Ambiance** : [Sobre / Dynamique / Chaleureuse / Tech]

## 🌈 Palette de couleurs

```css
/* Primary */
--color-primary: #DC2626;
--color-primary-light: #EF4444;
--color-primary-dark: #991B1B;

/* Secondary */
--color-secondary: #1F1F1F;
--color-secondary-light: #2D2D2D;

/* Accent */
--color-accent: #F97316;
--color-accent-light: #FB923C;

/* Neutrals */
--color-gray-50: #F9FAFB;
--color-gray-100: #F3F4F6;
--color-gray-800: #1F2937;
--color-gray-900: #111827;
```

## 📐 Typographie

**Headings** : Montserrat (Google Font)
- H1 : 3.5rem / 800 / 1.1
- H2 : 2.5rem / 700 / 1.2
- H3 : 2rem / 700 / 1.3

**Body** : Inter (Google Font)
- Regular : 1rem / 400 / 1.6
- Bold : 1rem / 600 / 1.6

## 🧩 Composants

### Navigation
- Type : Transparent → Solide au scroll
- Style : Glassmorphism
- Mobile : Burger menu

### Hero
- Layout : Slider/Carousel plein écran
- Contenu : Images + CTA
- Auto-play : 5 secondes

### Cards
- Style : Glassmorphism
- Hover : Lift + shadow
- Border-radius : 12px

### Boutons
- Primary : Gradient rouge
- Secondary : Outline blanc
- Border-radius : 8px

### Footer
- Type : Minimal
- Contenu : Logo + Navigation + Contact

## 📱 Layout

**Breakpoints** :
- Mobile : 0-640px
- Tablet : 640-1024px
- Desktop : 1024px+

**Container** :
- Max-width : 1280px
- Padding : 1rem (mobile) / 2rem (desktop)

## ✨ Animations

- Scroll animations : Oui, prononcées
- Hover effects : Lift + shadow
- Transitions : 250ms ease
```

### 2.2 Prompt Claude Code pour générer styles.md

**Option A - Génération automatique :**

```
Je travaille sur la refonte du site [URL du site].

Voici le contexte :
- Secteur d'activité : [décrire]
- Sites de référence qui m'inspirent :
  1. [URL ou description]
  2. [URL ou description]
  3. [URL ou description]

Objectif : [moderniser / dynamiser / professionnaliser]

Génère un fichier 02-design/styles.md complet qui définit :
1. Direction artistique (tonalité, mots-clés, ambiance)
2. Palette de couleurs (primary, secondary, accent, neutrals)
3. Typographie (fonts, tailles, weights)
4. Composants (navigation, hero, cards, boutons, footer)
5. Layout (breakpoints, container, grid)
6. Animations (transitions, hover, scroll)

Suis la structure du template et donne des spécifications précises et prêtes pour l'implémentation.
```

**Option B - Génération interactive :**

Utilisez Claude.ai (interface web) pour répondre aux questions via les widgets de sélection, puis demandez à Claude de générer le fichier styles.md final.

✅ **Phase 2 terminée !** Vous avez un design system complet dans `02-design/styles.md`

---

## ⚙️ PHASE 3 : Choix de la Stack (10 min)

### 3.1 Analyser et décider

**Prompt Claude Code :**

```
Analyse le content-inventory.json et le styles.md.

Recommande la stack technique optimale en considérant :
- Nombre de pages : [regarder dans content-inventory.json]
- Complexité des interactions : [formulaires, animations]
- Besoins de CMS : [oui/non]
- Performance requise : [Lighthouse >90]
- Budget d'hébergement : [gratuit de préférence]

Génère un fichier 03-nouveau-site/STACK-DECISION.md avec :
1. Stack recommandée + justification détaillée
2. 2 alternatives avec avantages/inconvénients
3. Tableau comparatif
4. Commandes d'installation

Pour un site vitrine de 20 pages avec design moderne, recommande probablement :
Astro 4.x + React + Tailwind CSS + Vercel
```

### 3.2 Stack par défaut (80% des cas)

Pour la majorité des sites vitrines :

**Stack :** Astro 4.x + React + Tailwind CSS
**Hébergement :** Vercel (gratuit)
**Justification :**
- Performance maximale (Lighthouse 100)
- SEO optimal (génération statique)
- Coût = 0€
- Développement rapide

✅ **Phase 3 terminée !** La stack est définie.

---

## 🏗️ PHASE 4 : Génération du Site (1-2h)

### 4.1 Initialiser le projet Astro

```bash
cd 03-nouveau-site

# Créer le projet Astro
npm create astro@latest . -- --template minimal --typescript strict --install

# Ajouter React
npx astro add react

# Ajouter Tailwind
npx astro add tailwind

# Installer les dépendances additionnelles
npm install swiper framer-motion lucide-react react-hook-form
```

### 4.2 Configuration Tailwind

**Prompt Claude Code :**

```
Configure tailwind.config.mjs pour implémenter le design system de 02-design/styles.md.

Ajoute :
1. Couleurs personnalisées (primary, secondary, accent selon styles.md)
2. Fonts (Montserrat pour headings, Inter pour body)
3. Extensions custom (backdrop-blur pour glassmorphism, box-shadows)
4. Breakpoints personnalisés si nécessaire
5. Plugins (@tailwindcss/typography, @tailwindcss/forms)

Le fichier doit être prêt pour utilisation immédiate avec les classes Tailwind qui matchent exactement le design system.
```

### 4.3 Configuration global.css

**Prompt Claude Code :**

```
Crée src/styles/global.css qui :

1. Importe Tailwind :
   @import "tailwindcss";

2. Importe Google Fonts (Montserrat + Inter selon styles.md)

3. Définit les CSS variables pour glassmorphism :
   --glass-bg, --glass-border, --glass-blur

4. Crée les classes utilitaires :
   .glass (effet glassmorphism)
   .text-gradient (dégradé rouge/orange)

5. Définit les animations :
   @keyframes slideUp, fadeIn, shimmer

Respecte EXACTEMENT styles.md.
```

### 4.4 Créer le Layout de base

**Prompt Claude Code :**

```
Crée src/layouts/BaseLayout.astro qui sera le layout principal.

Props TypeScript :
- title: string (requis)
- description: string (requis)
- image?: string (optionnel pour Open Graph)

Structure :
- <html lang="fr">
- <head> avec meta tags SEO complets (title, description, OG, Twitter Cards)
- Import Google Fonts (Montserrat + Inter)
- Import global.css
- Schema.org JSON-LD (Organization)
- <body> avec <slot /> pour le contenu

Pas de Header/Footer dans ce layout (on les ajoutera dans les pages).
```

### 4.5 Créer les composants UI

**Prompt Claude Code - Container :**

```
Crée src/components/ui/Container.astro

Wrapper responsive avec :
- Max-width : 1280px (selon styles.md)
- Padding : 1rem (mobile) / 2rem (tablet) / 3rem (desktop)
- Margin : auto (centré)

Props :
- class?: string (pour classes additionnelles)

Utilise uniquement Tailwind.
```

**Prompt Claude Code - Button :**

```
Crée src/components/ui/Button.astro selon styles.md.

Props TypeScript :
- variant: 'primary' | 'secondary' | 'outline' (default: 'primary')
- size: 'sm' | 'md' | 'lg' (default: 'md')
- href?: string (si lien, sinon bouton)
- class?: string

Styles selon styles.md :
- Primary : Gradient rouge, shadow, hover lift
- Secondary : Fond accent orange
- Outline : Transparent, border blanc
- Border-radius : 8px
- Transitions : 250ms ease

Si href fourni, utilise <a>, sinon <button>.
Contenu via <slot />.
```

**Prompt Claude Code - GlassCard :**

```
Crée src/components/ui/GlassCard.astro

Effet glassmorphism selon styles.md :

Props :
- class?: string
- hover?: boolean (default: true)

Style :
- background : rgba(255,255,255,0.1)
- backdrop-filter : blur(12px)
- border : 1px solid rgba(255,255,255,0.2)
- border-radius : 12px
- padding : 2rem
- box-shadow : 0 8px 32px rgba(0,0,0,0.1)

Hover (si activé) :
- transform : translateY(-8px)
- box-shadow : 0 16px 48px rgba(220,38,38,0.2)
- transition : all 300ms ease

<slot /> pour le contenu.
```

### 4.6 Créer le Header

**Prompt Claude Code :**

```
Crée src/components/layout/Header.astro

Navigation sticky transparente → solide au scroll (selon styles.md).

Structure :
1. <header> sticky top-0 z-50, hauteur 80px, transition 300ms

2. États :
   - Initial : fond rgba(0,0,0,0.3), backdrop-blur
   - Scrolled (>100px) : fond noir #1F1F1F, shadow

3. Contenu (dans Container) :
   - Logo texte "Nom Projet" à gauche
   - Nav desktop avec liens (Accueil, Présentation, Services avec dropdown, Contact)
   - Burger menu mobile

4. Script JavaScript :
   - Détecte scroll >100px
   - Ajoute classe "scrolled" au header
   - Toggle menu mobile

Menu Services avec 12 services depuis content-inventory.json.

Liens blancs, hover rouge primary.
Utilise Tailwind pour tous les styles.
```

### 4.7 Créer le Footer

**Prompt Claude Code :**

```
Crée src/components/layout/Footer.astro

Footer minimal selon styles.md.

Structure : 4 colonnes (stack sur mobile)

Colonne 1 : Logo + tagline
Colonne 2 : Navigation (Services, Présentation, Contact, Mentions légales)
Colonne 3 : Contact (Tél, Email, Adresse)
Colonne 4 : Réseaux sociaux (icônes Lucide React)

Style :
- Fond : #1F1F1F
- Texte : gray-400
- Padding : 3rem top, 1rem bottom
- Border-top : 1px gray-700

Copyright centré en bas.
Liens hover : rouge primary.
```

### 4.8 Créer le Hero Slider

**Prompt Claude Code :**

```
Crée src/components/react/HeroSlider.tsx

Slider plein écran avec Swiper.js selon styles.md.

Props TypeScript :
interface Slide {
  image: string;
  title: string;
  subtitle: string;
  cta1: { text: string; href: string };
  cta2?: { text: string; href: string };
}
props: { slides: Slide[] }

Spécifications :
1. Swiper config :
   - autoplay : 5000ms
   - loop : true
   - effect : 'fade'
   - speed : 800
   - pagination : dots
   - navigation : flèches

2. Chaque slide :
   - Height : 100vh
   - Image de fond
   - Overlay gradient : linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.3))
   
3. Contenu (Container, gauche) :
   - H1 blanc Montserrat 3.5rem
   - Subtitle gris-200
   - 2 CTAs (Button component)

4. Animations Framer Motion :
   - Fade in + slide up
   - Stagger children

5. Responsive :
   - Mobile : H1 2rem

Import styles Swiper.
Utilise le composant Button pour les CTAs.
```

### 4.9 Créer la page d'accueil

**Prompt Claude Code :**

```
Crée src/pages/index.astro - page d'accueil complète.

Structure :

1. Importer : BaseLayout, Header, Footer, HeroSlider, Container, GlassCard, Button

2. Layout :
   <BaseLayout title="..." description="...">
     <Header />
     <main>
       <!-- Sections -->
     </main>
     <Footer />
   </BaseLayout>

3. Sections :

   a) Hero Slider (3 slides)
      - Slide 1 : "Titre principal" + CTA
      - Slide 2 : "Deuxième message" + CTA
      - Slide 3 : "Troisième message" + CTA

   b) Section Services
      - Titre H2 "Nos services"
      - Grid 3 colonnes (1 sur mobile)
      - 6 services principaux en GlassCard
      - Chaque card : Icône + Titre + Description + Lien

   c) Section Chiffres Clés
      - Fond noir/rouge
      - 4 stats en ligne : "50+ ans", "200+ projets", etc.

   d) Section CTA Final
      - Fond dégradé rouge/noir
      - "Un projet ? Contactez-nous"
      - CTA principal

Spacing : 5rem entre sections.
Responsive : stack sur mobile.
Utilise les composants créés.
```

### 4.10 Créer les pages services

**Prompt Claude Code :**

```
Crée un template de page service : src/pages/services/[nom-service].astro

Structure :
1. BaseLayout + Header + Footer

2. Hero de page :
   - Image de fond
   - Overlay dark
   - H1 : "Nom du Service"
   - Breadcrumb

3. Contenu (2 colonnes desktop) :
   
   Gauche (8/12) :
   - Section "Notre expertise"
   - Texte depuis content-inventory.json
   - Liste des prestations
   
   Droite (4/12) - Sidebar sticky :
   - GlassCard "Besoin d'un devis ?"
   - Formulaire simple (Nom, Email, Tel, Message, Submit)
   - Card "Autres services" avec liens

4. Section CTA bas :
   - "Un projet en [service] ?"
   - CTA contact

Responsive : sidebar en dessous sur mobile.

Ensuite, duplique ce template pour les 12 services identifiés dans content-inventory.json.
```

### 4.11 Créer les pages secondaires

**Prompt Claude Code - Présentation :**

```
Crée src/pages/presentation.astro

Sections :
1. Hero simple : "Qui sommes-nous ?"
2. Histoire (timeline si possible)
3. Valeurs (3 cards glassmorphism)
4. CTA contact

Contenu depuis content-inventory.json.
```

**Prompt Claude Code - Contact :**

```
Crée src/pages/nous-contacter.astro

Layout 2 colonnes :

Gauche : Formulaire React Hook Form
- Nom, Prénom, Email, Tel, Sujet, Message
- Checkbox RGPD
- Submit

Droite :
- Infos contact
- Carte Google Maps (iframe)
- Horaires

Style : glassmorphism.
```

**Prompt Claude Code - Autres pages :**

```
Crée les pages restantes :
- src/pages/nos-evenements.astro
- src/pages/offres-d-emploi.astro
- src/pages/mentions-legales.astro

Structure simple avec Header + Footer + contenu depuis content-inventory.json.
```

✅ **Phase 4 terminée !** Le site est généré et fonctionnel.

---

## ✅ PHASE 5 : Finalisation & Livraison (30-45 min)

### 5.1 Tests de qualité

```bash
# Build de production
cd 03-nouveau-site
npm run build

# Preview
npm run preview

# Ouvrir http://localhost:4321 et tester :
# - Toutes les pages chargent
# - Navigation fonctionne
# - Menu mobile fonctionne
# - Responsive (DevTools)
# - Formulaires
```

### 5.2 Audit Lighthouse

```bash
# Utiliser Chrome DevTools
# Lighthouse > Generate report
# Viser : Performance >90, SEO 100, Accessibility >90
```

### 5.3 Optimiser les images

**Prompt Claude Code :**

```
Crée scripts/optimize-images.js qui :
1. Lit les images de 01-extraction/assets/images/
2. Les convertit en WebP avec Sharp
3. Génère des tailles responsive
4. Les copie dans 03-nouveau-site/public/images/
5. Génère un manifest JSON

Ajoute la commande npm "optimize-images" dans package.json racine.

Ensuite, mets à jour toutes les <img> pour utiliser :
- Images de /images/
- loading="lazy"
- width + height (éviter layout shift)
- Format WebP + fallback
```

### 5.4 Configuration Vercel

Créez `03-nouveau-site/vercel.json` :

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "astro"
}
```

### 5.5 Déploiement

```bash
# Installer Vercel CLI
npm install -g vercel

# Login
vercel login

# Déployer
cd 03-nouveau-site
vercel --prod

# Suivre les instructions
# Le site sera accessible sur une URL Vercel
# Configurer le domaine custom dans le dashboard
```

### 5.6 Générer la documentation client

**Prompt Claude Code :**

```
Génère dans 04-livrables/documentation/ :

1. guide-utilisation.md (français, non-tech) :
   - Modifier les textes
   - Ajouter une page
   - Changer une image
   - Mettre à jour le menu

2. guide-deploiement.md :
   - Installation Vercel CLI
   - Commandes de déploiement
   - Configuration domaine

3. maintenance.md :
   - Mises à jour npm
   - Contacts support
   - FAQ

Rends ça accessible pour un client non technique.
```

### 5.7 Package de livraison

```bash
# Créer l'archive finale
cd 04-livrables
mkdir exports
zip -r exports/[nom-projet]-v1.0.zip ../03-nouveau-site/ ../02-design/styles.md documentation/

# Le client reçoit :
# - Code source complet
# - Design system (styles.md)
# - Documentation complète
```

✅ **Phase 5 terminée !** Le projet est prêt pour livraison.

---

## 📊 Checklist Finale

Avant de livrer au client :

- [ ] Toutes les 20+ pages sont créées et accessibles
- [ ] Navigation fonctionne (tous les liens)
- [ ] Menu mobile fonctionne parfaitement
- [ ] Hero slider fonctionne (3+ slides, auto-play)
- [ ] Animations scroll activées et fluides
- [ ] Formulaires fonctionnels (validation + soumission)
- [ ] Images optimisées (WebP + lazy loading)
- [ ] Responsive parfait (mobile, tablet, desktop)
- [ ] Lighthouse Performance >90
- [ ] Lighthouse SEO 100
- [ ] Lighthouse Accessibility >90
- [ ] Meta tags sur chaque page (title, description)
- [ ] Images avec alt text
- [ ] Site déployé sur Vercel
- [ ] SSL actif (HTTPS)
- [ ] Domaine configuré (si applicable)
- [ ] Documentation client complète
- [ ] Package de livraison créé

---

## 📦 Livrables au Client

**Ce que le client reçoit :**

1. **Site live** : URL de production sur Vercel
2. **Accès dashboard** : Vercel dashboard en lecture
3. **Code source** : Repository GitHub (optionnel)
4. **Design system** : fichier styles.md réutilisable
5. **Documentation** :
   - Guide d'utilisation
   - Guide de déploiement
   - Guide de maintenance
6. **Package complet** : Archive ZIP avec tout

---

## ⏱️ Récapitulatif Timeline

| Phase | Temps | Actions Clés |
|-------|-------|--------------|
| 0. Setup | 5 min | Créer structure, installer dépendances |
| 1. Extraction | 30-45 min | Crawler site, générer inventory |
| 2. Design | 20-30 min | Créer styles.md |
| 3. Stack | 10 min | Décider stack technique |
| 4. Génération | 1-2h | Créer composants + pages |
| 5. Finalisation | 30-45 min | Tests, optimisation, déploiement |
| **TOTAL** | **2h30-4h** | **Site complet prêt** |

---

## 💡 Tips & Astuces

### Gagner du temps
- Gardez ce guide ouvert pendant toute la refonte
- Copiez-collez les scripts sans modification
- Utilisez les prompts Claude Code tels quels
- Ne pas chercher la perfection au premier coup
- Itérer rapidement

### Éviter les erreurs
- Toujours tester après chaque phase
- Vérifier les paths de fichiers
- Confirmer que Tailwind est bien configuré
- Tester le responsive immédiatement
- Valider les formulaires

### Optimiser
- Réutiliser styles.md pour d'autres clients similaires
- Créer une bibliothèque de composants
- Améliorer les scripts au fil des projets
- Documenter vos propres best practices

---

## 🆘 Troubleshooting

### Erreur "Cannot find module"
```bash
# Vérifier que vous êtes dans le bon dossier
pwd

# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

### Tailwind ne fonctionne pas
```bash
# Vérifier que global.css est importé dans BaseLayout
# Vérifier tailwind.config.mjs
# Redémarrer le serveur dev
npm run dev
```

### Images ne chargent pas
```bash
# Vérifier que les images sont dans public/
# Utiliser /images/... (pas ./images/...)
# Vérifier les extensions (WebP vs JPG)
```

### Build échoue
```bash
# Lire l'erreur complète
# Vérifier les imports (chemins relatifs)
# Vérifier la syntaxe TypeScript
# Chercher l'erreur dans Google
```

---

## 🚀 Vous êtes Prêt !

Vous avez maintenant **tout ce qu'il faut** pour réaliser une refonte complète en 2h30-4h :

✅ Scripts prêts à l'emploi  
✅ Prompts optimisés pour Claude Code  
✅ Workflow pas à pas détaillé  
✅ Checklist de validation  
✅ Documentation complète  

**Commencez par l'Étape 0 et suivez le guide linéairement.**

Bonne refonte ! 🎯

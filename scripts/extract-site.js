#!/usr/bin/env node

/**
 * 🕷️ Script d'extraction de site web
 * 
 * Utilise Playwright pour:
 * - Crawler toutes les pages du site
 * - Prendre des screenshots (desktop + mobile)
 * - Télécharger les images
 * - Générer un rapport JSON
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
  startUrl: process.argv[2] || 'https://www.puechoultres.fr',
  maxPages: parseInt(process.argv[3]) || 50,
  outputDir: path.join(process.cwd(), '01-extraction'),
  screenshotsDir: path.join(process.cwd(), '01-extraction', 'screenshots'),
  assetsDir: path.join(process.cwd(), '01-extraction', 'assets'),
  timeout: 30000,
  userAgent: 'Mozilla/5.0 (compatible; SiteRefonte/1.0; +https://example.com/bot)'
};

// État du crawl
const crawlState = {
  visited: new Set(),
  toVisit: [],
  errors: [],
  images: new Set(),
  startTime: Date.now()
};

/**
 * Normalise une URL
 */
function normalizeUrl(url, baseUrl) {
  try {
    const urlObj = new URL(url, baseUrl);
    // Enlever les fragments et query params pour la déduplication
    urlObj.hash = '';
    // Garder les query params car ils peuvent définir des pages différentes
    return urlObj.href;
  } catch (e) {
    return null;
  }
}

/**
 * Vérifie si l'URL appartient au même domaine
 */
function isSameDomain(url, baseUrl) {
  try {
    const urlObj = new URL(url);
    const baseObj = new URL(baseUrl);
    return urlObj.hostname === baseObj.hostname;
  } catch (e) {
    return false;
  }
}

/**
 * Crée les dossiers nécessaires
 */
async function setupDirectories() {
  await fs.mkdir(CONFIG.outputDir, { recursive: true });
  await fs.mkdir(CONFIG.screenshotsDir, { recursive: true });
  await fs.mkdir(path.join(CONFIG.screenshotsDir, 'desktop'), { recursive: true });
  await fs.mkdir(path.join(CONFIG.screenshotsDir, 'mobile'), { recursive: true });
  await fs.mkdir(CONFIG.assetsDir, { recursive: true });
  await fs.mkdir(path.join(CONFIG.assetsDir, 'images'), { recursive: true });
  await fs.mkdir(path.join(CONFIG.outputDir, 'html'), { recursive: true });
}

/**
 * Télécharge une image
 */
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

/**
 * Extrait les informations d'une page
 */
async function extractPageData(page, url) {
  try {
    // Attendre que la page soit chargée
    await page.waitForLoadState('networkidle', { timeout: CONFIG.timeout });

    // Extraire les données
    const data = await page.evaluate(() => {
      // Liens internes
      const links = Array.from(document.querySelectorAll('a[href]'))
        .map(a => a.href)
        .filter(href => href && !href.startsWith('mailto:') && !href.startsWith('tel:'));

      // Images
      const images = Array.from(document.querySelectorAll('img[src]'))
        .map(img => ({
          src: img.src,
          alt: img.alt || '',
          width: img.width,
          height: img.height
        }));

      // Meta tags
      const title = document.querySelector('title')?.textContent || '';
      const description = document.querySelector('meta[name="description"]')?.content || '';
      const h1 = document.querySelector('h1')?.textContent || '';

      // Contenu principal (tentative simple)
      const main = document.querySelector('main') || document.querySelector('.content') || document.querySelector('article') || document.body;
      const content = main?.innerText?.slice(0, 5000) || '';

      return {
        title,
        description,
        h1,
        links,
        images,
        content
      };
    });

    return data;
  } catch (error) {
    console.error(`❌ Erreur extraction ${url}:`, error.message);
    return null;
  }
}

/**
 * Prend les screenshots
 */
async function takeScreenshots(page, url, index) {
  const urlObj = new URL(url);
  const filename = `page-${String(index).padStart(3, '0')}-${urlObj.pathname.replace(/\//g, '_') || 'home'}`;

  try {
    // Desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.screenshot({
      path: path.join(CONFIG.screenshotsDir, 'desktop', `${filename}.png`),
      fullPage: true
    });

    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.screenshot({
      path: path.join(CONFIG.screenshotsDir, 'mobile', `${filename}.png`),
      fullPage: true
    });

    console.log(`  📸 Screenshots sauvegardés: ${filename}`);
  } catch (error) {
    console.error(`  ❌ Erreur screenshots ${url}:`, error.message);
  }
}

/**
 * Sauvegarde le HTML
 */
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

/**
 * Télécharge les images d'une page
 */
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
      console.log(`  🖼️  Image téléchargée: ${filename}`);
    } catch (error) {
      // Silent fail pour les images
    }
  }
}

/**
 * Crawle une page
 */
async function crawlPage(browser, url, index) {
  console.log(`\n[${index + 1}/${CONFIG.maxPages}] 🔍 Crawl: ${url}`);
  
  const page = await browser.newPage({
    userAgent: CONFIG.userAgent
  });

  try {
    // Navigation
    await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: CONFIG.timeout 
    });

    // Extraction des données
    const data = await extractPageData(page, url);
    
    if (!data) {
      crawlState.errors.push({ url, error: 'Extraction failed' });
      await page.close();
      return null;
    }

    // Screenshots
    await takeScreenshots(page, url, index);

    // Sauvegarde HTML
    await saveHtml(page, url, index);

    // Téléchargement des images
    if (data.images && data.images.length > 0) {
      await downloadImages(data.images, url);
    }

    // Ajout des nouveaux liens à crawler
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
    console.error(`  ❌ Erreur: ${error.message}`);
    crawlState.errors.push({ url, error: error.message });
    await page.close();
    return null;
  }
}

/**
 * Affiche la progression
 */
function showProgress() {
  const elapsed = ((Date.now() - crawlState.startTime) / 1000).toFixed(0);
  const pagesCount = crawlState.visited.size;
  const imagesCount = crawlState.images.size;
  const errorsCount = crawlState.errors.length;
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 Progression: ${pagesCount} pages | ${imagesCount} images | ${errorsCount} erreurs`);
  console.log(`⏱️  Temps écoulé: ${elapsed}s`);
  console.log(`🔜 Dans la queue: ${crawlState.toVisit.length} URLs`);
  console.log(`${'='.repeat(60)}\n`);
}

/**
 * Génère le rapport final
 */
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

/**
 * Main
 */
async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║           🕷️  EXTRACTION DE SITE WEB                     ║
╚═══════════════════════════════════════════════════════════╝

🌐 URL: ${CONFIG.startUrl}
📄 Max pages: ${CONFIG.maxPages}
📁 Output: ${CONFIG.outputDir}

`);

  // Setup
  await setupDirectories();

  // Lancement du navigateur
  console.log('🚀 Lancement de Chromium...\n');
  const browser = await chromium.launch({ 
    headless: true 
  });

  // Initialisation
  crawlState.toVisit.push(CONFIG.startUrl);
  const pages = [];

  // Crawl
  while (crawlState.toVisit.length > 0 && crawlState.visited.size < CONFIG.maxPages) {
    const url = crawlState.toVisit.shift();
    
    if (crawlState.visited.has(url)) continue;
    
    crawlState.visited.add(url);
    const pageData = await crawlPage(browser, url, crawlState.visited.size - 1);
    
    if (pageData) {
      pages.push(pageData);
    }

    // Progression toutes les 5 pages
    if (crawlState.visited.size % 5 === 0) {
      showProgress();
    }
  }

  await browser.close();

  // Rapport final
  console.log('\n📝 Génération du rapport...');
  const report = await generateReport(pages);

  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                  ✅ EXTRACTION TERMINÉE                   ║
╚═══════════════════════════════════════════════════════════╝

📊 Statistiques:
   • Pages crawlées: ${report.metadata.total_pages}
   • Images téléchargées: ${report.metadata.total_images}
   • Erreurs: ${report.metadata.total_errors}
   • Durée: ${report.metadata.duration_seconds}s

📂 Fichiers générés:
   • ${CONFIG.outputDir}/crawl-report.json
   • ${CONFIG.screenshotsDir}/desktop/ (${report.metadata.total_pages} screenshots)
   • ${CONFIG.screenshotsDir}/mobile/ (${report.metadata.total_pages} screenshots)
   • ${CONFIG.assetsDir}/images/ (${report.metadata.total_images} images)
   • ${CONFIG.outputDir}/html/ (${report.metadata.total_pages} fichiers HTML)

🚀 Prochaine étape:
   npm run generate-inventory

`);
}

// Exécution
main().catch(error => {
  console.error('\n💥 Erreur fatale:', error);
  process.exit(1);
});

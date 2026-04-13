#!/usr/bin/env node

/**
 * 📋 Script de génération du Content Inventory
 * 
 * Parse les fichiers HTML crawlés et génère un JSON structuré
 * avec tout le contenu du site
 */

const fs = require('fs').promises;
const path = require('path');
const cheerio = require('cheerio');
const TurndownService = require('turndown');

// Configuration
const CONFIG = {
  htmlDir: path.join(process.cwd(), '01-extraction', 'html'),
  crawlReport: path.join(process.cwd(), '01-extraction', 'crawl-report.json'),
  outputFile: path.join(process.cwd(), '01-extraction', 'content-inventory.json')
};

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced'
});

/**
 * Extrait le contenu principal d'une page HTML
 */
function extractMainContent($) {
  // Sélecteurs communs pour le contenu principal
  const selectors = [
    'main',
    'article',
    '[role="main"]',
    '.main-content',
    '.content',
    '#content',
    '.post-content',
    '.entry-content'
  ];

  for (const selector of selectors) {
    const element = $(selector).first();
    if (element.length > 0) {
      return element;
    }
  }

  // Fallback: body sans header/footer/nav
  const body = $('body').clone();
  body.find('header, footer, nav, aside, .header, .footer, .sidebar, .navigation').remove();
  return body;
}

/**
 * Extrait les données structurées d'une page
 */
async function parseHtmlFile(filepath, url) {
  try {
    const html = await fs.readFile(filepath, 'utf-8');
    const $ = cheerio.load(html);

    // Meta informations
    const title = $('title').text().trim() || '';
    const description = $('meta[name="description"]').attr('content') || '';
    const keywords = $('meta[name="keywords"]').attr('content') || '';
    
    // Headings
    const h1 = $('h1').first().text().trim() || '';
    const h2s = $('h2').map((i, el) => $(el).text().trim()).get();
    const h3s = $('h3').map((i, el) => $(el).text().trim()).get();

    // Contenu principal
    const mainContent = extractMainContent($);
    const textContent = mainContent.text().replace(/\s+/g, ' ').trim();
    
    // Conversion en Markdown
    let markdownContent = '';
    try {
      const contentHtml = mainContent.html() || '';
      markdownContent = turndownService.turndown(contentHtml);
    } catch (e) {
      // Fallback au texte brut si la conversion échoue
      markdownContent = textContent;
    }

    // Images
    const images = $('img').map((i, el) => ({
      src: $(el).attr('src') || '',
      alt: $(el).attr('alt') || '',
      title: $(el).attr('title') || ''
    })).get();

    // Liens
    const links = $('a[href]').map((i, el) => ({
      href: $(el).attr('href') || '',
      text: $(el).text().trim(),
      title: $(el).attr('title') || ''
    })).get();

    // Formulaires
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

    // Boutons CTA
    const ctas = $('a.btn, a.button, button, input[type="submit"]').map((i, el) => ({
      text: $(el).text().trim() || $(el).attr('value') || '',
      href: $(el).attr('href') || '',
      class: $(el).attr('class') || ''
    })).get();

    return {
      url,
      title,
      description,
      keywords,
      h1,
      h2s,
      h3s,
      content: {
        text: textContent.slice(0, 3000), // Limite à 3000 caractères
        markdown: markdownContent.slice(0, 5000), // Limite à 5000 caractères
        wordCount: textContent.split(/\s+/).length
      },
      images,
      links,
      forms,
      ctas,
      metadata: {
        hasH1: h1.length > 0,
        headingsCount: { h1: 1, h2: h2s.length, h3: h3s.length },
        imagesCount: images.length,
        linksCount: links.length,
        formsCount: forms.length,
        ctasCount: ctas.length
      }
    };

  } catch (error) {
    console.error(`❌ Erreur parsing ${filepath}:`, error.message);
    return null;
  }
}

/**
 * Extrait la navigation du site
 */
async function extractNavigation(htmlFiles) {
  if (htmlFiles.length === 0) return { header: [], footer: [] };

  // On prend la première page (généralement l'accueil)
  const firstFile = htmlFiles[0];
  const html = await fs.readFile(firstFile, 'utf-8');
  const $ = cheerio.load(html);

  // Navigation header
  const headerNav = $('header nav, nav.header, .header-nav, #header-nav, .main-nav, .primary-nav').first();
  const headerLinks = headerNav.find('a').map((i, el) => ({
    text: $(el).text().trim(),
    href: $(el).attr('href') || '',
    level: $(el).parents('ul, ol').length
  })).get();

  // Navigation footer
  const footerNav = $('footer nav, nav.footer, .footer-nav, #footer-nav').first();
  const footerLinks = footerNav.find('a').map((i, el) => ({
    text: $(el).text().trim(),
    href: $(el).attr('href') || ''
  })).get();

  return {
    header: headerLinks,
    footer: footerLinks
  };
}

/**
 * Analyse la structure du site
 */
function analyzeSiteStructure(pages) {
  // Pages par type
  const pageTypes = {
    home: [],
    about: [],
    contact: [],
    services: [],
    products: [],
    blog: [],
    other: []
  };

  for (const page of pages) {
    const url = page.url.toLowerCase();
    
    if (url === '/' || url.endsWith('/index.html') || url.endsWith('/home')) {
      pageTypes.home.push(page);
    } else if (url.includes('about') || url.includes('qui-sommes') || url.includes('a-propos')) {
      pageTypes.about.push(page);
    } else if (url.includes('contact')) {
      pageTypes.contact.push(page);
    } else if (url.includes('service') || url.includes('prestation')) {
      pageTypes.services.push(page);
    } else if (url.includes('product') || url.includes('produit')) {
      pageTypes.products.push(page);
    } else if (url.includes('blog') || url.includes('article') || url.includes('news')) {
      pageTypes.blog.push(page);
    } else {
      pageTypes.other.push(page);
    }
  }

  return pageTypes;
}

/**
 * Génère des insights sur le site
 */
function generateInsights(pages, navigation) {
  const totalWords = pages.reduce((sum, p) => sum + (p.content?.wordCount || 0), 0);
  const avgWords = Math.round(totalWords / pages.length);
  
  const pagesWithForms = pages.filter(p => p.forms && p.forms.length > 0);
  const pagesWithCTA = pages.filter(p => p.ctas && p.ctas.length > 0);

  // Couleurs dominantes (à partir des classes CSS communes)
  const allClasses = new Set();
  pages.forEach(p => {
    p.links?.forEach(l => {
      if (l.class) l.class.split(' ').forEach(c => allClasses.add(c));
    });
  });

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

/**
 * Main
 */
async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║         📋 GÉNÉRATION DU CONTENT INVENTORY                ║
╚═══════════════════════════════════════════════════════════╝
`);

  // Lecture du rapport de crawl
  console.log('📖 Lecture du crawl-report.json...');
  let crawlReport = null;
  try {
    const reportData = await fs.readFile(CONFIG.crawlReport, 'utf-8');
    crawlReport = JSON.parse(reportData);
  } catch (error) {
    console.log('⚠️  crawl-report.json non trouvé, on continue sans...');
  }

  // Lecture des fichiers HTML
  console.log('📂 Lecture des fichiers HTML...');
  const files = await fs.readdir(CONFIG.htmlDir);
  const htmlFiles = files
    .filter(f => f.endsWith('.html'))
    .map(f => path.join(CONFIG.htmlDir, f));

  console.log(`   Trouvé: ${htmlFiles.length} fichiers HTML\n`);

  // Parsing de chaque page
  console.log('🔍 Parsing des pages...');
  const pages = [];
  
  for (let i = 0; i < htmlFiles.length; i++) {
    const file = htmlFiles[i];
    const filename = path.basename(file);
    
    // Récupérer l'URL depuis le crawl report si possible
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

  // Extraction de la navigation
  console.log('\n🧭 Extraction de la navigation...');
  const navigation = await extractNavigation(htmlFiles);

  // Analyse de la structure
  console.log('📊 Analyse de la structure...');
  const structure = analyzeSiteStructure(pages);

  // Génération des insights
  console.log('💡 Génération des insights...');
  const insights = generateInsights(pages, navigation);

  // Construction du content inventory
  const inventory = {
    metadata: {
      generated_at: new Date().toISOString(),
      source: crawlReport?.metadata?.site_url || 'Unknown',
      total_pages: pages.length,
      ...insights.content
    },
    pages: pages.map(p => ({
      url: p.url,
      title: p.title,
      description: p.description,
      h1: p.h1,
      content: p.content,
      images: p.images,
      links: p.links.slice(0, 20), // Limite à 20 liens par page
      forms: p.forms,
      ctas: p.ctas,
      metadata: p.metadata
    })),
    navigation,
    structure,
    insights
  };

  // Sauvegarde
  console.log('\n💾 Sauvegarde du content inventory...');
  await fs.writeFile(
    CONFIG.outputFile,
    JSON.stringify(inventory, null, 2),
    'utf-8'
  );

  console.log(`
╔═══════════════════════════════════════════════════════════╗
║              ✅ CONTENT INVENTORY GÉNÉRÉ                  ║
╚═══════════════════════════════════════════════════════════╝

📊 Statistiques:
   • Pages analysées: ${pages.length}
   • Mots total: ${insights.content.totalWords}
   • Moyenne par page: ${insights.content.averageWordsPerPage} mots
   • Pages avec formulaire: ${insights.content.pagesWithForms}
   • Pages avec CTA: ${insights.content.pagesWithCTA}

📂 Fichier généré:
   ${CONFIG.outputFile}

💡 Insights:
   ${insights.recommendations.needsSEO ? '⚠️  Certaines pages manquent de meta description ou H1' : '✅ SEO de base OK'}
   ${insights.recommendations.needsAccessibility ? '⚠️  Certaines images manquent de texte alt' : '✅ Accessibilité images OK'}
   ${insights.recommendations.hasContactForm ? '✅ Formulaire de contact présent' : '⚠️  Pas de formulaire de contact détecté'}
   ${insights.recommendations.hasCTAs ? '✅ CTAs présents' : '⚠️  Peu ou pas de CTAs détectés'}

🚀 Prochaine étape:
   Définis le design system dans: 02-design/styles.md

`);
}

// Exécution
main().catch(error => {
  console.error('\n💥 Erreur fatale:', error);
  process.exit(1);
});

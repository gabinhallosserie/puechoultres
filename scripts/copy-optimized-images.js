#!/usr/bin/env node
/**
 * copy-optimized-images.js
 *
 * 1. Lit les images de  01-extraction/assets/images/
 * 2. Les copie dans     03-nouveau-site/public/images/
 * 3. Génère             03-nouveau-site/public/images/image-manifest.json
 * 4. Scanne les pages   src/pages/**\/*.astro pour lister les images référencées
 * 5. Crée des placeholders SVG pour les images héros manquantes
 * 6. Affiche un rapport détaillé
 *
 * Usage :
 *   node scripts/copy-optimized-images.js
 *   node scripts/copy-optimized-images.js --dry-run
 */

import { readdir, copyFile, mkdir, writeFile, readFile, stat } from 'fs/promises';
import { existsSync, createWriteStream } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const ROOT       = path.resolve(__dirname, '..');

const SRC_DIR      = path.join(ROOT, '01-extraction/assets/images');
const DST_DIR      = path.join(ROOT, '03-nouveau-site/public/images');
const PAGES_DIR    = path.join(ROOT, '03-nouveau-site/src/pages');
const SITE_NM      = path.join(ROOT, '03-nouveau-site/node_modules');
const MANIFEST     = path.join(DST_DIR, 'image-manifest.json');

const DRY_RUN = process.argv.includes('--dry-run');

// ─── Couleurs ANSI ────────────────────────────────────────────────────────────
const c = {
  reset: '\x1b[0m',  bold: '\x1b[1m',
  red:   '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
  blue:  '\x1b[34m', cyan:  '\x1b[36m', gray:  '\x1b[90m',
};
const ok    = (s) => `${c.green}✓${c.reset} ${s}`;
const warn  = (s) => `${c.yellow}⚠${c.reset} ${s}`;
const err   = (s) => `${c.red}✗${c.reset} ${s}`;
const info  = (s) => `${c.cyan}→${c.reset} ${s}`;
const head  = (s) => `\n${c.bold}${c.blue}${s}${c.reset}`;
const dim   = (s) => `${c.gray}${s}${c.reset}`;

// ─── Sharp (Astro l'embarque en dépendance) ───────────────────────────────────
async function loadSharp() {
  const sharpPath = path.join(SITE_NM, 'sharp/lib/index.js');
  try {
    const mod = await import(sharpPath);
    return mod.default ?? mod;
  } catch {
    return null;
  }
}

// ─── Obtenir les dimensions d'une image ───────────────────────────────────────
async function getDimensions(filePath, sharp) {
  if (!sharp) return { width: null, height: null };
  try {
    const meta = await sharp(filePath).metadata();
    return { width: meta.width ?? null, height: meta.height ?? null };
  } catch {
    return { width: null, height: null };
  }
}

// ─── Lister les fichiers images d'un dossier ──────────────────────────────────
const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg']);

async function listImages(dir) {
  if (!existsSync(dir)) return [];
  const files = await readdir(dir);
  return files.filter(f => IMAGE_EXT.has(path.extname(f).toLowerCase())).sort();
}

// ─── Lister toutes les pages .astro ───────────────────────────────────────────
async function listPages(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const pages   = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      pages.push(...(await listPages(full)));
    } else if (e.name.endsWith('.astro')) {
      pages.push(full);
    }
  }
  return pages;
}

// ─── Extraire les références d'images dans une page .astro ───────────────────
// Capture les patterns : '/images/...', "/images/..." et les variables hero: '...'
const IMG_PATH_RE = /['"`]\/images\/([^'"`\s]+)['"`]/g;

async function extractImageRefs(filePath) {
  const content = await readFile(filePath, 'utf8');
  const refs    = new Set();
  for (const match of content.matchAll(IMG_PATH_RE)) {
    refs.add('/images/' + match[1]);
  }
  return { file: filePath, refs: [...refs] };
}

// ─── Générer un placeholder JPEG via sharp (fond sombre dégradé) ──────────────
// Crée une image .jpg réelle avec le bon format MIME pour que le navigateur l'accepte.
async function makePlaceholderJPEG(destPath, label, sharp, w = 1920, h = 1080) {
  if (!sharp) {
    // Fallback : SVG sauvé avec l'extension originale (dépannage uniquement)
    const words = label.replace(/hero-/, '').replace(/-/g, ' ');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#1F1F1F"/><text x="${w/2}" y="${h/2}" text-anchor="middle" font-family="sans-serif" font-size="60" fill="#DC2626">${words}</text></svg>`;
    await writeFile(destPath, svg, 'utf8');
    return;
  }

  // Fond sombre uni (1F1F1F) avec une bande primaire (DC2626) au centre
  // On compose avec sharp.create() → raw buffer → jpeg
  const raw = Buffer.alloc(w * h * 3);
  const bg   = { r: 0x1F, g: 0x1F, b: 0x1F };
  const acc  = { r: 0xDC, g: 0x26, b: 0x26 };
  const bandY1 = Math.floor(h * 0.48);
  const bandY2 = Math.floor(h * 0.52);

  for (let y = 0; y < h; y++) {
    const inBand = y >= bandY1 && y <= bandY2;
    // Dégradé vertical : légèrement plus clair vers le haut
    const factor = 1 - (y / h) * 0.3;
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 3;
      if (inBand) {
        raw[i]     = Math.round(acc.r * 0.3);
        raw[i + 1] = Math.round(acc.g * 0.3);
        raw[i + 2] = Math.round(acc.b * 0.3);
      } else {
        raw[i]     = Math.round(bg.r * factor);
        raw[i + 1] = Math.round(bg.g * factor);
        raw[i + 2] = Math.round(bg.b * factor);
      }
    }
  }

  await sharp(raw, { raw: { width: w, height: h, channels: 3 } })
    .jpeg({ quality: 60, mozjpeg: false })
    .toFile(destPath);
}

// ─── Formatage taille fichier ─────────────────────────────────────────────────
function fmtSize(bytes) {
  if (bytes < 1024)       return `${bytes} B`;
  if (bytes < 1024 ** 2)  return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(head('═══ copy-optimized-images.js' + (DRY_RUN ? ' [DRY RUN]' : '') + ' ═══'));

  // 1. Charger sharp
  const sharp = await loadSharp();
  console.log(sharp ? ok('sharp chargé depuis node_modules') : warn('sharp non disponible — dimensions ignorées'));

  // 2. Créer le dossier de destination
  if (!DRY_RUN) {
    await mkdir(DST_DIR, { recursive: true });
  }
  console.log(info(`Source : ${path.relative(ROOT, SRC_DIR)}`));
  console.log(info(`Dest   : ${path.relative(ROOT, DST_DIR)}`));

  // 3. Lister les images sources
  const srcImages = await listImages(SRC_DIR);
  console.log(head(`Étape 1 — Images sources (${srcImages.length} trouvées)`));

  const manifest = { generated: new Date().toISOString(), images: {}, missing_heroes: [] };
  let copied = 0, skipped = 0;

  for (const filename of srcImages) {
    const srcPath = path.join(SRC_DIR, filename);
    const dstPath = path.join(DST_DIR, filename);
    const { width, height } = await getDimensions(srcPath, sharp);
    const { size } = await stat(srcPath);

    manifest.images[filename] = {
      src:    `/images/${filename}`,
      width,
      height,
      size,
      sizeHuman: fmtSize(size),
    };

    const exists = existsSync(dstPath);
    if (!DRY_RUN) {
      await copyFile(srcPath, dstPath);
    }

    const dims = width ? `${width}×${height}` : 'dim inconnues';
    const status = exists ? dim('[déjà présent]') : ok('copié');
    console.log(`  ${status} ${filename} ${dim(`(${dims}, ${fmtSize(size)})}`)}`);
    exists ? skipped++ : copied++;
  }

  // 4. Scanner les pages pour les références
  console.log(head('Étape 2 — Scan des pages .astro'));
  const pages    = await listPages(PAGES_DIR);
  const allRefs  = new Set();
  const refByPage = [];

  for (const page of pages) {
    const { refs } = await extractImageRefs(page);
    refs.forEach(r => allRefs.add(r));
    if (refs.length) {
      refByPage.push({ page: path.relative(ROOT, page), refs });
    }
  }

  for (const { page, refs } of refByPage) {
    console.log(`  ${dim(page)}`);
    refs.forEach(r => console.log(`    ${c.gray}→${c.reset} ${r}`));
  }

  // 5. Identifier les images manquantes
  console.log(head('Étape 3 — Images référencées vs disponibles'));
  const availableInDst = new Set(srcImages.map(f => `/images/${f}`));
  const missing = [];

  for (const ref of [...allRefs].sort()) {
    const inSrc = availableInDst.has(ref);
    const inDst = existsSync(path.join(DST_DIR, path.basename(ref)));

    if (inSrc || inDst) {
      console.log(ok(ref));
    } else {
      console.log(err(ref) + dim(' — MANQUANTE'));
      missing.push(ref);
      manifest.missing_heroes.push(ref);
    }
  }

  // 6. Créer des placeholders SVG pour les héros manquants
  if (missing.length > 0) {
    console.log(head(`Étape 4 — Création de ${missing.length} placeholder(s) SVG`));

    for (const ref of missing) {
      const basename    = path.basename(ref);           // "hero-travaux-publics.jpg"
      const nameNoExt   = path.parse(basename).name;   // "hero-travaux-publics"
      const ext         = path.extname(basename) || '.jpg';
      const destName    = nameNoExt + ext;              // même nom que la référence
      const destPath    = path.join(DST_DIR, destName);

      if (!DRY_RUN) {
        await makePlaceholderJPEG(destPath, nameNoExt, sharp, 1920, 1080);
      }

      // Ajouter au manifest
      manifest.images[destName] = {
        src:         `/images/${destName}`,
        width:       1920,
        height:      1080,
        sizeHuman:   'placeholder',
        placeholder: true,
      };

      console.log(warn(`Placeholder créé : /images/${destName}`));
    }
  } else {
    console.log(head('Étape 4 — Placeholders'));
    console.log(ok('Aucune image manquante — rien à créer'));
  }

  // 7. Écrire le manifest
  console.log(head('Étape 5 — Manifest JSON'));
  if (!DRY_RUN) {
    await writeFile(MANIFEST, JSON.stringify(manifest, null, 2), 'utf8');
    console.log(ok(`Manifest écrit : ${path.relative(ROOT, MANIFEST)}`));
  } else {
    console.log(dim('[DRY RUN] Manifest non écrit'));
  }

  // 8. Rapport final
  console.log(head('Rapport final'));
  console.log(`  Images sources   : ${c.bold}${srcImages.length}${c.reset}`);
  console.log(`  Copiées          : ${c.green}${copied}${c.reset}`);
  console.log(`  Déjà présentes   : ${skipped}`);
  console.log(`  Références pages : ${allRefs.size}`);
  console.log(`  Manquantes       : ${missing.length > 0 ? c.yellow + missing.length + c.reset : c.green + '0' + c.reset}`);

  if (missing.length > 0) {
    console.log(`\n${c.yellow}${c.bold}Action requise :${c.reset}`);
    console.log('  Des images héros sont manquantes. Des placeholders SVG ont été générés.');
    console.log('  Remplacez-les par de vraies photos de chantier dans :');
    console.log(`  ${dim(DST_DIR)}`);
    console.log('\n  Mapping suggéré (à compléter manuellement) :');
    const suggestions = {
      'hero-travaux-publics': 'Photo de terrassement / pelleteuse sur chantier',
      'hero-btp':             'Vue aérienne de chantier BTP',
      'hero-engins':          'Parc de camions ou engins en action',
      'hero-transport':       'Camion benne ou porte-chars',
      'hero-beton':           'Centrale à béton ou coulage',
      'hero-desamiantage':    'Opérateurs en combinaison de protection',
      'hero-goudronnage':     'Finisseur ou répandeuse sur route',
      'hero-demolition':      'Pelle de démolition sur bâtiment',
      'hero-voirie':          'Tranchée avec canalisations',
      'hero-location':        'Parc d\'engins alignés',
      'hero-assainissement':  'Pose de canalisation / fosse septique',
      'hero-recyclage':       'Site de concassage en activité',
      'hero-levage':          'Grue automotrice ou nacelle en hauteur',
      'hero-amenagement':     'Allée en béton désactivé ou parking',
    };
    for (const m of missing) {
      const key = path.parse(path.basename(m)).name;
      const hint = suggestions[key] ?? '(photo de chantier)';
      console.log(`  ${c.cyan}${key}${c.reset} → ${hint}`);
    }
  }

  console.log(`\n${c.green}${c.bold}Terminé${c.reset}${DRY_RUN ? dim(' [DRY RUN — aucun fichier créé]') : ''}\n`);
}

main().catch(e => {
  console.error(err('Erreur fatale :'), e.message);
  process.exit(1);
});

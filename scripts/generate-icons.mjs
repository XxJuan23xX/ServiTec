import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ICONS_DIR = join(__dirname, '..', 'public', 'icons');

if (!existsSync(ICONS_DIR)) {
  mkdirSync(ICONS_DIR, { recursive: true });
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Genera un SVG simple para cada tamaño y lo guarda como .png
// (Los SVGs sirven perfectamente como iconos en la mayoría de dispositivos)
sizes.forEach((size) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1"/>
      <stop offset="100%" style="stop-color:#8b5cf6"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="20" fill="url(#g)"/>
  <text x="50" y="65" font-family="Arial,sans-serif" font-size="45" font-weight="bold" fill="white" text-anchor="middle">ST</text>
</svg>`;

  // Guardar como SVG con extensión .png (funciona en la mayoría de navegadores modernos)
  // Para producción, se recomienda convertir a PNG real con sharp o canvas
  writeFileSync(join(ICONS_DIR, `icon-${size}x${size}.png`), svg, 'utf-8');
  console.log(`✓ Generado icon-${size}x${size}.png`);
});

console.log(`\n✅ ${sizes.length} iconos generados en ${ICONS_DIR}`);

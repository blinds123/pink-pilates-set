// Script to generate PWA icons for Pink Pilates Set
// Creates SVG-based icons that will be converted to PNG

const fs = require('fs');
const path = require('path');

// Define icon sizes needed for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create SVG content for Pink Pilates Set icon
function createIconSVG(size) {
  const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <!-- Background with soft pink gradient -->
  <defs>
    <linearGradient id="pinkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#E8B4B8;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#D4A5A9;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background circle -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="url(#pinkGradient)" stroke="#fff" stroke-width="2"/>

  <!-- Ballet wrap icon simplified -->
  <g transform="translate(${size/2}, ${size/2})">
    <!-- Ballet wrap silhouette -->
    <path d="M -${size*0.15} -${size*0.05}
             C -${size*0.15} -${size*0.15}, -${size*0.05} -${size*0.2}, 0 -${size*0.2}
             C ${size*0.05} -${size*0.2}, ${size*0.15} -${size*0.15}, ${size*0.15} -${size*0.05}
             L ${size*0.12} ${size*0.05}
             C ${size*0.08} ${size*0.08}, ${size*0.02} ${size*0.1}, 0 ${size*0.1}
             C -${size*0.02} ${size*0.1}, -${size*0.08} ${size*0.08}, -${size*0.12} ${size*0.05}
             Z"
          fill="#fff" opacity="0.9"/>

    <!-- Flare pants icon -->
    <ellipse cx="0" cy="${size*0.15}" rx="${size*0.12}" ry="${size*0.08}" fill="#fff" opacity="0.9"/>

    <!-- Small decorative element -->
    <circle cx="0" cy="-${size*0.05}" r="${size*0.02}" fill="#fff"/>
  </g>

  <!-- Brand text for larger icons -->
  ${size >= 192 ? `
  <text x="${size/2}" y="${size - 10}" font-family="Arial, sans-serif" font-size="${size*0.08}" font-weight="bold" fill="#fff" text-anchor="middle">
    Pink Pilates
  </text>
  ` : ''}
</svg>`;

  return svgContent.trim();
}

// Generate SVG files
function generateSVGIcons() {
  const iconsDir = path.join(__dirname, 'images', 'icons');

  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  iconSizes.forEach(size => {
    const svgContent = createIconSVG(size);
    const filename = `icon-${size}x${size}.svg`;
    const filepath = path.join(iconsDir, filename);

    fs.writeFileSync(filepath, svgContent);
    console.log(`Generated: ${filename}`);
  });

  console.log('✅ SVG icons generated successfully!');
  console.log('📝 Note: Convert these SVG files to PNG using:');
  console.log('   - Online converter like https://convertio.co/svg-png/');
  console.log('   - Command line tools like rsvg-convert or ImageMagick');
  console.log('   - Design tools like Figma, Sketch, or Adobe Illustrator');
}

// Generate a simple favicon.ico as well
function generateFavicon() {
  const faviconDir = path.join(__dirname, 'images');
  const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <defs>
    <linearGradient id="pinkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#E8B4B8;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#D4A5A9;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="6" fill="url(#pinkGradient)"/>
  <text x="16" y="22" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#fff" text-anchor="middle">P</text>
</svg>`;

  fs.writeFileSync(path.join(faviconDir, 'favicon.svg'), svgContent);
  console.log('Generated: favicon.svg');
}

// Execute the generation
if (require.main === module) {
  generateSVGIcons();
  generateFavicon();
}

module.exports = { generateSVGIcons, generateFavicon };
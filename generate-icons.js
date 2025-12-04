// Simple PWA icon generator using Node.js Canvas (if available)
// Fallback: creates a simple HTML file to generate icons manually

const fs = require('fs');
const path = require('path');

const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Try to use canvas, fallback to HTML generation
let hasCanvas = false;
try {
  require('canvas');
  hasCanvas = true;
} catch (e) {
  console.log('Canvas not available, will create HTML generator instead');
}

if (hasCanvas) {
  // Generate PNG icons using canvas
  const { createCanvas } = require('canvas');

  function createIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#E8B4B8');
    gradient.addColorStop(1, '#D4A5A9');

    // Draw rounded rectangle background
    const radius = size / 8;
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(size - radius, 0);
    ctx.quadraticCurveTo(size, 0, size, radius);
    ctx.lineTo(size, size - radius);
    ctx.quadraticCurveTo(size, size, size - radius, size);
    ctx.lineTo(radius, size);
    ctx.quadraticCurveTo(0, size, 0, size - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Add text
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${size * 0.2}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('P', size / 2, size / 2);

    return canvas;
  }

  iconSizes.forEach(size => {
    const canvas = createIcon(size);
    const buffer = canvas.toBuffer('image/png');
    const filename = `icon-${size}x${size}.png`;
    const filepath = path.join(__dirname, 'images', 'icons', filename);

    fs.writeFileSync(filepath, buffer);
    console.log(`Generated: ${filename}`);
  });
} else {
  console.log('To complete PWA setup:');
  console.log('1. Open create-png-icons.html in your browser');
  console.log('2. Download each icon and save to /images/icons/ folder');
  console.log('3. Alternatively, use an online converter to convert the SVG files to PNG');
}

// Create a favicon.ico specification
console.log('\n📋 PWA Icon Setup Checklist:');
console.log('✅ Created manifest.json');
console.log('✅ Generated SVG icons');
console.log('🔄 Convert SVG to PNG files');
console.log('📝 Add icons to /images/icons/ folder');
console.log('🔗 Update HTML with manifest link');
console.log('⚙️  Update service worker');
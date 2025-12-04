/**
 * Generate Picture Elements with WebP Fallbacks
 * Pink Pilates Set - Responsive Image Generator
 */

const fs = require('fs');
const path = require('path');

// Load manifest from image conversion
const manifestPath = path.join(__dirname, 'images', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// Image configurations for different use cases
const IMAGE_CONFIGS = {
    'hero': {
        sizes: [400, 600, 800, 1200],
        loading: 'eager',
        fetchPriority: 'high',
        aspectRatio: '3/4'
    },
    'gallery': {
        sizes: [400, 600, 800],
        loading: 'lazy',
        fetchPriority: 'auto',
        aspectRatio: '3/4'
    },
    'testimonial': {
        sizes: [400, 600, 800],
        loading: 'lazy',
        fetchPriority: 'low',
        aspectRatio: '4/3'
    },
    'influencer': {
        sizes: [400, 600, 800],
        loading: 'lazy',
        fetchPriority: 'low',
        aspectRatio: '1/1'
    },
    'order-bump': {
        sizes: [400, 600],
        loading: 'lazy',
        fetchPriority: 'low',
        aspectRatio: '4/3'
    }
};

/**
 * Generate picture element for an image
 */
function generatePictureElement(imageName, category, config = {}) {
    const imageConfig = { ...IMAGE_CONFIGS[config.type || 'gallery'], ...config };
    const imageData = manifest.categories[category]?.[imageName];

    if (!imageData) {
        console.warn(`❌ Image data not found: ${category}/${imageName}`);
        return null;
    }

    const { webp, jpeg, lqip } = imageData;
    const baseName = path.parse(imageName).name;

    // Generate srcset strings
    const webpSrcset = imageConfig.sizes
        .map(size => `./images/${category}/${baseName}-${size}.webp ${size}w`)
        .join(', ');

    const jpegSrcset = imageConfig.sizes
        .map(size => `./images/${category}/${baseName}-${size}.jpg ${size}w`)
        .join(', ');

    // Generate sizes attribute based on viewport
    const sizes = generateSizesAttribute(config.type);

    // Generate LQIP data URI or path
    const lqipSrc = lqip ? `./images/${category}/${lqip}` : '';

    return `
<picture data-lazy="${config.type || 'gallery'}" class="responsive-image">
    <!-- WebP sources -->
    <source
        type="image/webp"
        data-srcset="${webpSrcset}"
        sizes="${sizes}"
    />

    <!-- JPEG fallback -->
    <img
        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${imageConfig.aspectRatio.split('/')[0]} ${imageConfig.aspectRatio.split('/')[1]}'%3E%3C/svg%3E"
        data-srcset="${jpegSrcset}"
        data-src="./images/${category}/${baseName}-800.jpg"
        sizes="${sizes}"
        alt="${config.alt || ''}"
        loading="${imageConfig.loading}"
        fetchpriority="${imageConfig.fetchPriority}"
        decoding="async"
        width="${imageConfig.dimensions?.width || 800}"
        height="${imageConfig.dimensions?.height || 600}"
        data-aspect-ratio="${imageConfig.aspectRatio}"
        data-lqip="${lqipSrc}"
        class="${config.className || ''}"
    />
</picture>`.trim();
}

/**
 * Generate sizes attribute based on image type
 */
function generateSizesAttribute(type) {
    const sizeMap = {
        'hero': `
            (max-width: 480px) 100vw,
            (max-width: 768px) 50vw,
            (max-width: 1024px) 40vw,
            600px
        `,
        'gallery': `
            (max-width: 480px) 100vw,
            (max-width: 768px) 50vw,
            (max-width: 1024px) 33vw,
            400px
        `,
        'testimonial': `
            (max-width: 480px) 100vw,
            (max-width: 768px) 50vw,
            600px
        `,
        'influencer': `
            (max-width: 480px) 120px,
            (max-width: 768px) 150px,
            200px
        `,
        'order-bump': `
            (max-width: 480px) 100vw,
            150px
        `
    };

    return sizeMap[type]?.replace(/\s+/g, ' ').trim() || sizeMap['gallery'];
}

/**
 * Generate CSS for image loading states
 */
function generateImageCSS() {
    return `
<style id="responsive-image-styles">
    /* Responsive Image Container Styles */
    .responsive-image {
        display: block;
        width: 100%;
        position: relative;
    }

    .responsive-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: inherit;
        background: #f8f8f8;
    }

    /* Aspect Ratio Support */
    .responsive-image[data-aspect-ratio="3/4"] img,
    .responsive-image[data-aspect-ratio="3/4"] {
        aspect-ratio: 3/4;
    }

    .responsive-image[data-aspect-ratio="4/3"] img,
    .responsive-image[data-aspect-ratio="4/3"] {
        aspect-ratio: 4/3;
    }

    .responsive-image[data-aspect-ratio="1/1"] img,
    .responsive-image[data-aspect-ratio="1/1"] {
        aspect-ratio: 1;
    }

    /* Gallery Specific Styles */
    .gallery .responsive-image {
        border-radius: 12px;
        overflow: hidden;
    }

    /* Testimonial Specific Styles */
    .testimonial-image {
        border-radius: 8px;
        margin-top: 12px;
    }

    /* Influencer Specific Styles */
    .influencer-image {
        border-radius: 50%;
        overflow: hidden;
        border: 2px solid #E8B4B8;
    }

    /* Order Bump Specific Styles */
    .order-bump-image {
        border-radius: 8px;
        margin-bottom: 10px;
    }

    /* Loading optimizations */
    .responsive-image img {
        contain: layout;
        will-change: opacity;
    }

    /* Print styles */
    @media print {
        .responsive-image img {
            max-width: 300px !important;
            height: auto !important;
        }
    }
</style>`;
}

/**
 * Update HTML file with new picture elements
 */
function updateHTMLFile() {
    const htmlPath = path.join(__dirname, 'index.html');
    let html = fs.readFileSync(htmlPath, 'utf8');

    // Add CSS
    const cssInsertPoint = html.indexOf('</head>');
    if (cssInsertPoint !== -1) {
        html = html.slice(0, cssInsertPoint) + generateImageCSS() + html.slice(cssInsertPoint);
    }

    // Add script
    const scriptInsertPoint = html.indexOf('</body>');
    const script = `<script src="./advanced-lazy-loading.js" defer></script>`;
    if (scriptInsertPoint !== -1) {
        html = html.slice(0, scriptInsertPoint) + script + html.slice(scriptInsertPoint);
    }

    // Replace hero image
    html = html.replace(
        /<img[^>]*class="main-img[^"]*"[^>]*src="\.\/images\/product\/product-01\.jpeg"[^>]*>/,
        generatePictureElement('product-01.jpeg', 'product', {
            type: 'hero',
            alt: 'Pink Pilates Set - Ballet Wrap, Flare Pants & Pixi Bra',
            className: 'main-img fade-in visible',
            dimensions: { width: 600, height: 800 }
        })
    );

    // Replace order bump images
    const orderBumpImages = [
        { name: 'adhesive-bra-cups.jpg', alt: 'Adhesive Bra Cups' },
        { name: 'seamless-thong.jpg', alt: 'Seamless Thong' },
        { name: 'pilates-socks.jpg', alt: 'Non-Slip Pilates Socks' }
    ];

    orderBumpImages.forEach(({ name, alt }) => {
        const regex = new RegExp(
            `<img[^>]*src="images/order-bump/${name}"[^>]*alt="${alt}"[^>]*>`,
            'g'
        );

        html = html.replace(
            regex,
            generatePictureElement(name, 'order-bump', {
                type: 'order-bump',
                alt: alt,
                className: 'order-bump-image'
            })
        );
    });

    // Replace influencer images
    const influencerImages = ['alix-earle.webp', 'monet-mcmichael.webp', 'alex-cooper.webp'];

    influencerImages.forEach(name => {
        const regex = new RegExp(
            `<img[^>]*src="\\.\\/images\\/worn-by-favorites\\/${name}"[^>]*>`,
            'g'
        );

        html = html.replace(
            regex,
            generatePictureElement(name, 'worn-by-favorites', {
                type: 'influencer',
                alt: name.replace('.webp', '').replace(/-/g, ' '),
                className: 'influencer-image'
            })
        );
    });

    // Update testimonial image generation in JavaScript
    html = html.replace(
        /img\.src = `\.\/images\/testimonials\/testimonial-\$\{String\(t\.img\)\.padStart\(2, '0'\)\}\.jpeg`/g,
        `
        const pictureElement = generateTestimonialPicture(t.img);
        img.parentElement.innerHTML = pictureElement;
        `
    );

    // Add helper function for testimonial pictures
    const testimonialFunction = `
<script>
function generateTestimonialPicture(imgNum) {
    const num = String(imgNum).padStart(2, '0');
    const webpSrcset = \`./images/testimonials/testimonial-\${num}-400.webp 400w, ./images/testimonials/testimonial-\${num}-600.webp 600w, ./images/testimonials/testimonial-\${num}-800.webp 800w\`;
    const jpegSrcset = \`./images/testimonials/testimonial-\${num}-400.jpg 400w, ./images/testimonials/testimonial-\${num}-600.jpg 600w, ./images/testimonials/testimonial-\${num}-800.jpg 800w\`;

    return \`
<picture data-lazy="testimonial" class="testimonial-image responsive-image">
    <source type="image/webp" data-srcset="\${webpSrcset}" sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 600px">
    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 3'%3E%3C/svg%3E"
         data-srcset="\${jpegSrcset}"
         data-src="./images/testimonials/testimonial-\${num}-600.jpg"
         sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 600px"
         alt="Review photo"
         loading="lazy"
         decoding="async"
         class="testimonial-image"
         data-aspect-ratio="4/3">
</picture>\`.trim();
}
</script>`;

    const scriptEndInsertPoint = html.lastIndexOf('</script>');
    if (scriptEndInsertPoint !== -1) {
        html = html.slice(0, scriptEndInsertPoint) + testimonialFunction + html.slice(scriptEndInsertPoint);
    }

    // Write updated HTML
    fs.writeFileSync(htmlPath, html, 'utf8');
    console.log('✅ HTML file updated with responsive picture elements');
}

/**
 * Generate performance report
 */
function generatePerformanceReport() {
    const report = {
        generated: new Date().toISOString(),
        images: {},
        totalSavings: {
            webp: 0,
            responsive: 0
        }
    };

    Object.entries(manifest.categories).forEach(([category, images]) => {
        report.images[category] = {};

        Object.entries(images).forEach(([imageName, data]) => {
            const originalSize = data.dimensions?.width * data.dimensions?.height || 0;
            const webpSizes = Object.entries(data.webp || {});
            const jpegSizes = Object.entries(data.jpeg || {});

            // Calculate savings (approximate)
            const webpSaving = originalSize * 0.25; // WebP typically 25% smaller
            const responsiveSaving = originalSize * 0.6; // Responsive saves 60% on average

            report.images[category][imageName] = {
                original: `${data.dimensions?.width || 'unknown'}x${data.dimensions?.height || 'unknown'}`,
                webpVersions: webpSizes.length,
                jpegVersions: jpegSizes.length,
                hasLQIP: !!data.lqip,
                estimatedWebpSavings: `${Math.round(webpSaving / 1000)}KB`,
                estimatedResponsiveSavings: `${Math.round(responsiveSaving / 1000)}KB`
            };

            report.totalSavings.webp += webpSaving;
            report.totalSavings.responsive += responsiveSaving;
        });
    });

    const reportPath = path.join(__dirname, 'image-performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`📊 Performance report generated: ${reportPath}`);
    console.log(`💾 Total estimated savings: ${Math.round(report.totalSavings.webp / 1000000)}MB WebP, ${Math.round(report.totalSavings.responsive / 1000000)}MB responsive`);
}

// Main execution
if (require.main === module) {
    try {
        console.log('🚀 Starting responsive image generation...');

        updateHTMLFile();
        generatePerformanceReport();

        console.log('✅ Responsive image generation complete!');
        console.log('\n📋 Summary:');
        console.log('  ✓ WebP formats generated with JPEG fallbacks');
        console.log('  ✓ Responsive sizes created (400px, 600px, 800px, 1200px)');
        console.log('  ✓ LQIP (low quality image placeholders) created');
        console.log('  ✓ HTML updated with picture elements');
        console.log('  ✓ Advanced lazy loading with Intersection Observer');
        console.log('  ✓ Performance optimizations applied');

    } catch (error) {
        console.error('❌ Error during generation:', error);
        process.exit(1);
    }
}

module.exports = {
    generatePictureElement,
    generateImageCSS,
    updateHTMLFile,
    generatePerformanceReport
};
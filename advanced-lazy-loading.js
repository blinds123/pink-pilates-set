/**
 * Advanced Lazy Loading with LQIP and Skeleton Screens
 * Pink Pilates Set - Optimized Image Loading
 */

class AdvancedLazyLoader {
    constructor(options = {}) {
        this.options = {
            rootMargin: options.rootMargin || '200px',
            threshold: options.threshold || 0.01,
            fadeInDuration: options.fadeInDuration || 400,
            placeholderBlur: options.placeholderBlur || 10,
            preloadDistance: options.preloadDistance || 2, // Preload images N positions ahead
            ...options
        };

        this.observer = null;
        this.loadedImages = new Set();
        this.preloadQueue = [];
        this.isPreloading = false;

        this.init();
    }

    init() {
        this.createObserver();
        this.processImages();
        this.addStyles();

        // Performance monitoring
        if (window.performance && window.performance.mark) {
            performance.mark('lazy-loader-init');
        }
    }

    createObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    this.preloadNearbyImages(entry.target);
                }
            });
        }, {
            rootMargin: this.options.rootMargin,
            threshold: this.options.threshold
        });
    }

    processImages() {
        // Process all images with data-lazy attribute
        const lazyImages = document.querySelectorAll('img[data-lazy], picture[data-lazy]');

        lazyImages.forEach(img => {
            // Create skeleton if not already created
            if (!img.hasAttribute('data-skeleton-created')) {
                this.createSkeleton(img);
                img.setAttribute('data-skeleton-created', 'true');
            }

            // Start observing
            if (!this.loadedImages.has(img)) {
                this.observer.observe(img);
            }
        });

        console.log(`🖼️ Advanced lazy loading initialized for ${lazyImages.length} images`);
    }

    createSkeleton(img) {
        const container = img.parentElement;
        const skeleton = document.createElement('div');
        const aspectRatio = img.getAttribute('data-aspect-ratio') || '3/4';

        skeleton.className = 'image-skeleton';
        skeleton.setAttribute('data-aspect-ratio', aspectRatio);

        // Add shimmer animation
        skeleton.innerHTML = `
            <div class="skeleton-shimmer"></div>
            <div class="skeleton-content">
                <div class="skeleton-icon">📷</div>
                <div class="skeleton-text">Loading...</div>
            </div>
        `;

        // Insert skeleton before the image
        container.insertBefore(skeleton, img);

        // Store skeleton reference
        img.skeletonElement = skeleton;
    }

    loadImage(img) {
        if (this.loadedImages.has(img)) return;

        const picture = img.closest('picture');
        const sources = picture ? picture.querySelectorAll('source') : [];

        // Load LQIP first
        this.loadLQIP(img).then(() => {
            // Then load full image
            this.loadFullImage(img, sources);
        });
    }

    async loadLQIP(img) {
        const lqipSrc = img.getAttribute('data-lqip');
        if (!lqipSrc || img.hasAttribute('data-lqip-loaded')) return;

        return new Promise((resolve) => {
            const lqip = new Image();
            lqip.onload = () => {
                img.style.backgroundImage = `url(${lqipSrc})`;
                img.style.backgroundSize = 'cover';
                img.style.backgroundPosition = 'center';
                img.style.filter = `blur(${this.options.placeholderBlur}px)`;
                img.setAttribute('data-lqip-loaded', 'true');
                resolve();
            };
            lqip.src = lqipSrc;
        });
    }

    loadFullImage(img, sources) {
        // Load sources for picture element
        if (sources.length > 0) {
            sources.forEach(source => {
                const srcset = source.getAttribute('data-srcset');
                if (srcset) {
                    source.setAttribute('srcset', srcset);
                }
            });
        }

        // Load the main image
        const src = img.getAttribute('data-src') || img.getAttribute('src');
        const srcset = img.getAttribute('data-srcset');

        if (src) img.setAttribute('src', src);
        if (srcset) img.setAttribute('srcset', srcset);

        img.onload = () => {
            this.handleImageLoad(img);
        };

        img.onerror = () => {
            this.handleImageError(img);
        };
    }

    handleImageLoad(img) {
        this.loadedImages.add(img);
        this.observer.unobserve(img);

        // Fade in effect
        setTimeout(() => {
            img.style.transition = `opacity ${this.options.fadeInDuration}ms ease-in-out, filter ${this.options.fadeInDuration}ms ease-in-out`;
            img.style.opacity = '1';
            img.style.filter = 'blur(0px)';

            // Remove skeleton
            if (img.skeletonElement) {
                img.skeletonElement.style.opacity = '0';
                setTimeout(() => {
                    if (img.skeletonElement && img.skeletonElement.parentNode) {
                        img.skeletonElement.parentNode.removeChild(img.skeletonElement);
                    }
                }, this.options.fadeInDuration);
            }

            // Add loaded attribute
            img.setAttribute('data-loaded', 'true');
        }, 50);

        // Performance tracking
        if (window.performance && window.performance.mark) {
            const imgName = img.alt || img.src.split('/').pop();
            performance.mark(`image-loaded-${imgName}`);
        }
    }

    handleImageError(img) {
        console.error('❌ Failed to load image:', img.src);

        // Show error state
        if (img.skeletonElement) {
            img.skeletonElement.classList.add('skeleton-error');
            img.skeletonElement.innerHTML = `
                <div class="skeleton-error-content">
                    <div class="skeleton-icon">❌</div>
                    <div class="skeleton-text">Failed to load image</div>
                </div>
            `;
        }

        // Add error attribute
        img.setAttribute('data-error', 'true');
    }

    preloadNearbyImages(currentImg) {
        if (this.isPreloading) return;

        const gallery = currentImg.closest('.gallery, .testimonials-grid, .worn-by-grid');
        if (!gallery) return;

        const allImages = gallery.querySelectorAll('img[data-lazy]:not([data-loaded])');
        const currentIndex = Array.from(allImages).indexOf(currentImg);

        // Preload next N images
        for (let i = 1; i <= this.options.preloadDistance; i++) {
            const nextIndex = currentIndex + i;
            if (nextIndex < allImages.length) {
                this.preloadImage(allImages[nextIndex]);
            }
        }
    }

    preloadImage(img) {
        if (this.preloadQueue.includes(img)) return;

        this.preloadQueue.push(img);

        // Preload after a short delay to prioritize current images
        setTimeout(() => {
            if (!this.loadedImages.has(img) && !img.hasAttribute('data-preloaded')) {
                const preloadImg = new Image();
                preloadImg.onload = () => {
                    img.setAttribute('data-preloaded', 'true');
                };

                const src = img.getAttribute('data-src') || img.getAttribute('src');
                if (src) preloadImg.src = src;

                this.preloadQueue = this.preloadQueue.filter(i => i !== img);
            }
        }, 1000);
    }

    addStyles() {
        const styles = `
            <style id="advanced-lazy-loading-styles">
                /* Image Skeleton Styles */
                .image-skeleton {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    border-radius: 12px;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1;
                    transition: opacity 0.3s ease;
                }

                .image-skeleton[data-aspect-ratio="3/4"] {
                    aspect-ratio: 3/4;
                }

                .image-skeleton[data-aspect-ratio="4/3"] {
                    aspect-ratio: 4/3;
                }

                .image-skeleton[data-aspect-ratio="1/1"] {
                    aspect-ratio: 1;
                }

                .skeleton-shimmer {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                    animation: shimmer 1.5s infinite;
                }

                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }

                .skeleton-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    z-index: 2;
                    position: relative;
                }

                .skeleton-icon {
                    font-size: 24px;
                    opacity: 0.5;
                }

                .skeleton-text {
                    font-size: 14px;
                    color: #666;
                    font-weight: 500;
                }

                .skeleton-error {
                    background: #fee;
                    border: 2px solid #fcc;
                }

                .skeleton-error-content .skeleton-icon {
                    color: #c66;
                }

                /* Image Loading States */
                img[data-lazy] {
                    opacity: 0;
                    transition: opacity 0.4s ease, filter 0.4s ease;
                }

                img[data-loaded="true"] {
                    opacity: 1;
                }

                img[data-error="true"] {
                    opacity: 0.5;
                    filter: grayscale(100%);
                }

                /* Container Styles */
                .gallery img,
                .testimonial-card img,
                .worn-by-favorite img,
                .order-bump-item img {
                    position: relative;
                }

                .gallery,
                .testimonial-card,
                .worn-by-favorite,
                .order-bump-item {
                    position: relative;
                    overflow: hidden;
                }

                /* Performance optimizations */
                img {
                    will-change: opacity, filter;
                    contain: layout;
                }

                /* Reduce motion for users who prefer it */
                @media (prefers-reduced-motion: reduce) {
                    .skeleton-shimmer {
                        animation: none;
                    }

                    img[data-lazy] {
                        transition: none;
                    }

                    .image-skeleton {
                        transition: none;
                    }
                }

                /* Dark mode support */
                @media (prefers-color-scheme: dark) {
                    .image-skeleton {
                        background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
                    }

                    .skeleton-text {
                        color: #aaa;
                    }
                }
            </style>
        `;

        if (!document.getElementById('advanced-lazy-loading-styles')) {
            document.head.insertAdjacentHTML('beforeend', styles);
        }
    }

    // Public methods
    refresh() {
        this.processImages();
    }

    loadImageManually(img) {
        this.loadImage(img);
    }

    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }

        // Remove styles
        const styles = document.getElementById('advanced-lazy-loading-styles');
        if (styles) {
            styles.remove();
        }

        console.log('🗑️ Advanced lazy loading destroyed');
    }

    // Performance monitoring
    getStats() {
        return {
            totalImages: document.querySelectorAll('img[data-lazy]').length,
            loadedImages: this.loadedImages.size,
            queuedImages: this.preloadQueue.length,
            preloadDistance: this.options.preloadDistance
        };
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.advancedLazyLoader = new AdvancedLazyLoader();
    });
} else {
    window.advancedLazyLoader = new AdvancedLazyLoader();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedLazyLoader;
}
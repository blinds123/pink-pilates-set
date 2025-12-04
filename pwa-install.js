// PWA Installation Handler for Pink Pilates Set
// Manages installation prompts and iOS fallback instructions

class PWAInstallManager {
  constructor() {
    this.deferredPrompt = null;
    this.installButton = null;
    this.iosInstallPrompt = null;
    this.isIOS = this.detectIOS();
    this.isInstalled = this.detectInstalled();
    this.userDismissed = localStorage.getItem('pwa-install-dismissed') === 'true';

    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupInstallHandlers());
    } else {
      this.setupInstallHandlers();
    }
  }

  setupInstallHandlers() {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('PWA: Install prompt available');
      e.preventDefault();
      this.deferredPrompt = e;

      // Only show if not dismissed and not already installed
      if (!this.userDismissed && !this.isInstalled) {
        this.showInstallButton();
      }
    });

    // Listen for appinstalled event
    window.addEventListener('appinstalled', () => {
      console.log('PWA: App was installed');
      this.isInstalled = true;
      this.hideInstallUI();
      this.trackInstallation('success');
    });

    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SERVICE_WORKER_UPDATED') {
          this.showUpdateNotification(event.data.version);
        } else if (event.data && event.data.type === 'CONTENT_UPDATED') {
          this.showContentUpdated(event.data.updates);
        }
      });
    }

    // Show iOS install instructions if applicable
    if (this.isIOS && !this.isInstalled && !this.userDismissed) {
      setTimeout(() => this.showIOSInstallPrompt(), 3000);
    }

    // Create install button styles
    this.createInstallButtonStyles();
  }

  detectIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }

  detectInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true ||
           document.referrer.includes('android-app://');
  }

  showInstallButton() {
    // Create install button if it doesn't exist
    if (!this.installButton) {
      this.installButton = document.createElement('div');
      this.installButton.className = 'pwa-install-banner';
      this.installButton.innerHTML = `
        <div class="pwa-install-content">
          <div class="pwa-install-icon">
            <img src="/images/icons/icon-96x96.png" alt="Pink Pilates Set" width="48" height="48">
          </div>
          <div class="pwa-install-text">
            <div class="pwa-install-title">Install Pink Pilates App</div>
            <div class="pwa-install-description">Get the best shopping experience - even offline!</div>
          </div>
          <div class="pwa-install-actions">
            <button class="pwa-install-btn" onclick="pwaInstallManager.installApp()">Install</button>
            <button class="pwa-install-dismiss" onclick="pwaInstallManager.dismissInstall()">×</button>
          </div>
        </div>
      `;

      document.body.appendChild(this.installButton);

      // Animate in
      setTimeout(() => {
        this.installButton.classList.add('visible');
      }, 100);
    }
  }

  showIOSInstallPrompt() {
    if (this.iosInstallPrompt) return;

    this.iosInstallPrompt = document.createElement('div');
    this.iosInstallPrompt.className = 'pwa-ios-prompt';
    this.iosInstallPrompt.innerHTML = `
      <div class="pwa-ios-overlay">
        <div class="pwa-ios-content">
          <h3>🎀 Install Pink Pilates App</h3>
          <p>Install our app for the best shopping experience:</p>
          <ol>
            <li>Tap the Share button <span class="share-icon">⬆️</span> at the bottom</li>
            <li>Scroll down and tap "Add to Home Screen" 📱</li>
            <li>Tap "Add" to install the app</li>
          </ol>
          <div class="pwa-ios-actions">
            <button class="pwa-ios-close" onclick="pwaInstallManager.dismissIOSPrompt()">Got it!</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.iosInstallPrompt);

    // Animate in
    setTimeout(() => {
      this.iosInstallPrompt.classList.add('visible');
    }, 100);

    this.trackInstallation('ios_prompt_shown');
  }

  async installApp() {
    if (!this.deferredPrompt) {
      console.log('PWA: Install prompt not available');
      return;
    }

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('PWA: User accepted install prompt');
      this.trackInstallation('prompt_accepted');
    } else {
      console.log('PWA: User dismissed install prompt');
      this.trackInstallation('prompt_dismissed');
    }

    this.deferredPrompt = null;
    this.hideInstallUI();
  }

  dismissInstall() {
    this.userDismissed = true;
    localStorage.setItem('pwa-install-dismissed', 'true');
    this.hideInstallUI();
    this.trackInstallation('banner_dismissed');
  }

  dismissIOSPrompt() {
    this.userDismissed = true;
    localStorage.setItem('pwa-install-dismissed', 'true');
    this.hideIOSPrompt();
    this.trackInstallation('ios_prompt_dismissed');
  }

  hideInstallUI() {
    if (this.installButton) {
      this.installButton.classList.remove('visible');
      setTimeout(() => {
        if (this.installButton && this.installButton.parentNode) {
          this.installButton.parentNode.removeChild(this.installButton);
          this.installButton = null;
        }
      }, 300);
    }
  }

  hideIOSPrompt() {
    if (this.iosInstallPrompt) {
      this.iosInstallPrompt.classList.remove('visible');
      setTimeout(() => {
        if (this.iosInstallPrompt && this.iosInstallPrompt.parentNode) {
          this.iosInstallPrompt.parentNode.removeChild(this.iosInstallPrompt);
          this.iosInstallPrompt = null;
        }
      }, 300);
    }
  }

  showUpdateNotification(version) {
    const updateBanner = document.createElement('div');
    updateBanner.className = 'pwa-update-banner';
    updateBanner.innerHTML = `
      <div class="pwa-update-content">
        <span class="pwa-update-text">🚀 New version available! Refresh to update.</span>
        <button class="pwa-update-btn" onclick="window.location.reload()">Update</button>
        <button class="pwa-update-dismiss" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;

    document.body.appendChild(updateBanner);

    setTimeout(() => {
      updateBanner.classList.add('visible');
    }, 100);

    // Auto-hide after 30 seconds
    setTimeout(() => {
      if (updateBanner.parentNode) {
        updateBanner.remove();
      }
    }, 30000);
  }

  showContentUpdated(updates) {
    const notification = document.createElement('div');
    notification.className = 'pwa-content-notification';
    notification.innerHTML = `
      <div class="pwa-content-toast">
        📦 Content updated with new offers!
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('visible');
    }, 100);

    setTimeout(() => {
      notification.classList.remove('visible');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, 3000);
  }

  createInstallButtonStyles() {
    if (document.getElementById('pwa-install-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'pwa-install-styles';
    styles.textContent = `
      /* PWA Install Banner Styles */
      .pwa-install-banner {
        position: fixed;
        bottom: -100px;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #E8B4B8, #D4A5A9);
        color: white;
        padding: 16px;
        box-shadow: 0 -4px 20px rgba(0,0,0,0.15);
        z-index: 9999;
        transition: bottom 0.3s ease;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }

      .pwa-install-banner.visible {
        bottom: 0;
      }

      .pwa-install-content {
        max-width: 400px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .pwa-install-icon img {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        border: 2px solid rgba(255,255,255,0.3);
      }

      .pwa-install-text {
        flex: 1;
      }

      .pwa-install-title {
        font-weight: 600;
        font-size: 14px;
        margin-bottom: 2px;
      }

      .pwa-install-description {
        font-size: 12px;
        opacity: 0.9;
      }

      .pwa-install-actions {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .pwa-install-btn {
        background: rgba(255,255,255,0.2);
        color: white;
        border: 1px solid rgba(255,255,255,0.3);
        padding: 8px 16px;
        border-radius: 6px;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .pwa-install-btn:hover {
        background: rgba(255,255,255,0.3);
      }

      .pwa-install-dismiss {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        opacity: 0.7;
        padding: 4px;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
      }

      .pwa-install-dismiss:hover {
        opacity: 1;
        background: rgba(255,255,255,0.1);
      }

      /* iOS Install Prompt Styles */
      .pwa-ios-prompt {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
      }

      .pwa-ios-prompt.visible {
        opacity: 1;
        visibility: visible;
      }

      .pwa-ios-overlay {
        background: white;
        margin: 20px;
        border-radius: 16px;
        max-width: 400px;
        padding: 30px;
        text-align: center;
      }

      .pwa-ios-content h3 {
        color: #333;
        margin-bottom: 16px;
        font-size: 20px;
      }

      .pwa-ios-content p {
        color: #666;
        margin-bottom: 20px;
      }

      .pwa-ios-content ol {
        text-align: left;
        color: #333;
        margin-bottom: 24px;
        padding-left: 20px;
      }

      .pwa-ios-content li {
        margin-bottom: 12px;
        line-height: 1.4;
      }

      .share-icon {
        font-size: 18px;
      }

      .pwa-ios-close {
        background: #E8B4B8;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
      }

      /* Update Banner Styles */
      .pwa-update-banner {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(90deg, #4CAF50, #45a049);
        color: white;
        z-index: 10000;
        transform: translateY(-100%);
        transition: transform 0.3s ease;
      }

      .pwa-update-banner.visible {
        transform: translateY(0);
      }

      .pwa-update-content {
        max-width: 400px;
        margin: 0 auto;
        padding: 12px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .pwa-update-text {
        flex: 1;
        font-size: 14px;
      }

      .pwa-update-btn {
        background: rgba(255,255,255,0.2);
        color: white;
        border: 1px solid rgba(255,255,255,0.3);
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      }

      .pwa-update-dismiss {
        background: none;
        border: none;
        color: white;
        font-size: 16px;
        cursor: pointer;
        opacity: 0.7;
      }

      /* Content Notification Styles */
      .pwa-content-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
      }

      .pwa-content-toast {
        background: #333;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
      }

      .pwa-content-toast.visible {
        opacity: 1;
        transform: translateX(0);
      }

      /* Mobile Responsive */
      @media (max-width: 480px) {
        .pwa-install-content {
          flex-direction: column;
          text-align: center;
          gap: 16px;
        }

        .pwa-install-actions {
          width: 100%;
        }

        .pwa-install-btn {
          flex: 1;
        }

        .pwa-ios-overlay {
          margin: 10px;
          padding: 20px;
        }

        .pwa-update-content {
          flex-direction: column;
          gap: 8px;
          text-align: center;
        }
      }
    `;

    document.head.appendChild(styles);
  }

  trackInstallation(action) {
    // Track installation events
    if (typeof gtag !== 'undefined') {
      gtag('event', 'pwa_install', {
        'event_category': 'PWA',
        'event_label': action
      });
    }

    // Send to analytics API
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'pwa_install',
        action: action,
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      })
    }).catch(() => {}); // Ignore errors

    console.log('PWA Install Event:', action);
  }
}

// Initialize PWA Install Manager
const pwaInstallManager = new PWAInstallManager();

// Export for global access
window.pwaInstallManager = pwaInstallManager;
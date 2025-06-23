// Comprehensive Vercel Analytics Implementation
import { inject, track } from '@vercel/analytics';

class AnalyticsManager {
  constructor() {
    this.isInitialized = false;
    this.init();
  }

  async init() {
    try {
      // Inject Vercel Analytics
      inject();
      this.isInitialized = true;
      console.log('Analytics initialized successfully');
      
      // Track initial page load
      this.trackPageLoad();
      
      // Set up automatic tracking
      this.setupAutomaticTracking();
      
    } catch (error) {
      console.warn('Analytics initialization failed:', error);
    }
  }

  // Track page load with device and browser info
  trackPageLoad() {
    if (!this.isInitialized) return;

    try {
      const deviceInfo = this.getDeviceInfo();
      const browserInfo = this.getBrowserInfo();
      
      track('page_load', {
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
        referrer: document.referrer || 'direct',
        device_type: deviceInfo.type,
        screen_resolution: `${window.screen.width}x${window.screen.height}`,
        viewport_size: `${window.innerWidth}x${window.innerHeight}`,
        browser: browserInfo.name,
        browser_version: browserInfo.version,
        user_agent: navigator.userAgent,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        connection_type: this.getConnectionType()
      });
    } catch (error) {
      console.warn('Failed to track page load:', error);
    }
  }

  // Track contact form interactions
  trackContactForm(action, data = {}) {
    if (!this.isInitialized) return;

    try {
      track(`contact_form_${action}`, {
        timestamp: new Date().toISOString(),
        action: action,
        ...data
      });
    } catch (error) {
      console.warn('Failed to track contact form:', error);
    }
  }

  // Track email copy action
  trackEmailCopy(method = 'button') {
    if (!this.isInitialized) return;

    try {
      track('email_copied', {
        timestamp: new Date().toISOString(),
        method: method,
        email: 'yaduraj.manu@gmail.com'
      });
    } catch (error) {
      console.warn('Failed to track email copy:', error);
    }
  }

  // Track scroll behavior
  trackScrollBehavior(section, percentage) {
    if (!this.isInitialized) return;

    try {
      // Only track significant scroll milestones
      if ([25, 50, 75, 100].includes(percentage)) {
        track('scroll_milestone', {
          timestamp: new Date().toISOString(),
          section: section,
          percentage: percentage,
          total_scroll_height: document.documentElement.scrollHeight,
          viewport_height: window.innerHeight
        });
      }
    } catch (error) {
      console.warn('Failed to track scroll:', error);
    }
  }

  // Track resume download
  trackResumeDownload() {
    if (!this.isInitialized) return;

    try {
      track('resume_download', {
        timestamp: new Date().toISOString(),
        file_name: 'YadurajSingh_Resume.pdf',
        source: 'portfolio_website'
      });
    } catch (error) {
      console.warn('Failed to track resume download:', error);
    }
  }

  // Track navigation clicks
  trackNavigation(destination, source = 'unknown') {
    if (!this.isInitialized) return;

    try {
      track('navigation_click', {
        timestamp: new Date().toISOString(),
        destination: destination,
        source: source,
        current_page: window.location.pathname
      });
    } catch (error) {
      console.warn('Failed to track navigation:', error);
    }
  }

  // Track social media clicks
  trackSocialClick(platform, url) {
    if (!this.isInitialized) return;

    try {
      track('social_media_click', {
        timestamp: new Date().toISOString(),
        platform: platform,
        url: url,
        source: 'contact_section'
      });
    } catch (error) {
      console.warn('Failed to track social click:', error);
    }
  }

  // Track user engagement time
  trackEngagementTime() {
    if (!this.isInitialized) return;

    let startTime = Date.now();
    let isActive = true;
    let totalActiveTime = 0;

    // Track when user becomes inactive
    const trackInactivity = () => {
      if (isActive) {
        totalActiveTime += Date.now() - startTime;
        isActive = false;
      }
    };

    // Track when user becomes active
    const trackActivity = () => {
      if (!isActive) {
        startTime = Date.now();
        isActive = true;
      }
    };

    // Set up event listeners
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        trackInactivity();
      } else {
        trackActivity();
      }
    });

    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, trackActivity, { passive: true });
    });

    // Track engagement on page unload
    window.addEventListener('beforeunload', () => {
      if (isActive) {
        totalActiveTime += Date.now() - startTime;
      }

      try {
        track('engagement_time', {
          timestamp: new Date().toISOString(),
          total_time_seconds: Math.round(totalActiveTime / 1000),
          page: window.location.pathname
        });
      } catch (error) {
        console.warn('Failed to track engagement time:', error);
      }
    });
  }

  // Track performance metrics
  trackPerformance() {
    if (!this.isInitialized) return;

    try {
      // Wait for page load to complete
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0];
          
          if (perfData) {
            track('performance_metrics', {
              timestamp: new Date().toISOString(),
              load_time: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
              dom_content_loaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
              first_paint: this.getFirstPaint(),
              page_size: this.getPageSize(),
              resource_count: performance.getEntriesByType('resource').length
            });
          }
        }, 1000);
      });
    } catch (error) {
      console.warn('Failed to track performance:', error);
    }
  }

  // Track errors
  trackError(error, context = 'unknown') {
    if (!this.isInitialized) return;

    try {
      track('javascript_error', {
        timestamp: new Date().toISOString(),
        error_message: error.message || 'Unknown error',
        error_stack: error.stack || 'No stack trace',
        context: context,
        page: window.location.pathname,
        user_agent: navigator.userAgent
      });
    } catch (trackingError) {
      console.warn('Failed to track error:', trackingError);
    }
  }

  // Set up automatic tracking for common interactions
  setupAutomaticTracking() {
    // Track all link clicks
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (link) {
        const href = link.getAttribute('href') || '';
        const text = link.textContent.trim();
        
        // Determine link type
        let linkType = 'internal';
        if (href.startsWith('http') && !href.includes(window.location.hostname)) {
          linkType = 'external';
        } else if (href.startsWith('mailto:')) {
          linkType = 'email';
        } else if (href.startsWith('tel:')) {
          linkType = 'phone';
        }

        this.trackNavigation(href, `${linkType}_link`);
      }
    });

    // Track button clicks
    document.addEventListener('click', (e) => {
      const button = e.target.closest('button');
      if (button) {
        const buttonText = button.textContent.trim();
        const buttonClass = button.className;
        
        track('button_click', {
          timestamp: new Date().toISOString(),
          button_text: buttonText,
          button_class: buttonClass,
          page: window.location.pathname
        });
      }
    });

    // Track form interactions
    document.addEventListener('focus', (e) => {
      if (e.target.matches('input, textarea, select')) {
        track('form_field_focus', {
          timestamp: new Date().toISOString(),
          field_name: e.target.name || e.target.id,
          field_type: e.target.type || e.target.tagName.toLowerCase(),
          form_id: e.target.closest('form')?.id || 'unknown'
        });
      }
    }, true);

    // Set up engagement and performance tracking
    this.trackEngagementTime();
    this.trackPerformance();

    // Set up error tracking
    window.addEventListener('error', (e) => {
      this.trackError(e.error, 'window_error');
    });

    window.addEventListener('unhandledrejection', (e) => {
      this.trackError(new Error(e.reason), 'unhandled_promise_rejection');
    });
  }

  // Utility functions
  getDeviceInfo() {
    const userAgent = navigator.userAgent;
    
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return { type: 'tablet' };
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return { type: 'mobile' };
    }
    return { type: 'desktop' };
  }

  getBrowserInfo() {
    const userAgent = navigator.userAgent;
    let browserName = 'Unknown';
    let browserVersion = 'Unknown';

    if (userAgent.indexOf('Chrome') > -1) {
      browserName = 'Chrome';
      browserVersion = userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || 'Unknown';
    } else if (userAgent.indexOf('Safari') > -1) {
      browserName = 'Safari';
      browserVersion = userAgent.match(/Safari\/([0-9.]+)/)?.[1] || 'Unknown';
    } else if (userAgent.indexOf('Firefox') > -1) {
      browserName = 'Firefox';
      browserVersion = userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || 'Unknown';
    } else if (userAgent.indexOf('Edge') > -1) {
      browserName = 'Edge';
      browserVersion = userAgent.match(/Edge\/([0-9.]+)/)?.[1] || 'Unknown';
    }

    return { name: browserName, version: browserVersion };
  }

  getConnectionType() {
    if ('connection' in navigator) {
      return navigator.connection.effectiveType || 'unknown';
    }
    return 'unknown';
  }

  getFirstPaint() {
    try {
      const paintEntries = performance.getEntriesByType('paint');
      const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
      return firstPaint ? Math.round(firstPaint.startTime) : null;
    } catch (error) {
      return null;
    }
  }

  getPageSize() {
    try {
      const navEntry = performance.getEntriesByType('navigation')[0];
      return navEntry ? Math.round(navEntry.transferSize / 1024) : null; // Size in KB
    } catch (error) {
      return null;
    }
  }
}

// Create and export singleton instance
const analytics = new AnalyticsManager();

export default analytics;

// Export specific tracking functions for easy use
export const trackContactForm = (action, data) => analytics.trackContactForm(action, data);
export const trackEmailCopy = (method) => analytics.trackEmailCopy(method);
export const trackScrollBehavior = (section, percentage) => analytics.trackScrollBehavior(section, percentage);
export const trackResumeDownload = () => analytics.trackResumeDownload();
export const trackNavigation = (destination, source) => analytics.trackNavigation(destination, source);
export const trackSocialClick = (platform, url) => analytics.trackSocialClick(platform, url);
export const trackError = (error, context) => analytics.trackError(error, context); 
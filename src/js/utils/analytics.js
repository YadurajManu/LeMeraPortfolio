class AnalyticsManager {
  constructor() {
    this.isInitialized = false;
    this.init();
  }

  init() {
    // Telemetry is intentionally disabled in production to avoid
    // third-party network noise and blocked-resource console errors.
    this.isInitialized = false;
  }

  // Track page load with device and browser info
  trackPageLoad() {
    return;
  }

  // Track contact form interactions
  trackContactForm(action, data = {}) {
    return;
  }

  // Track email copy action
  trackEmailCopy(method = 'button') {
    return;
  }

  // Track scroll behavior
  trackScrollBehavior(section, percentage) {
    return;
  }

  // Track resume download
  trackResumeDownload(fileName = 'resume.pdf') {
    return;
  }

  // Track navigation clicks
  trackNavigation(destination, source = 'unknown') {
    return;
  }

  // Track social media clicks
  trackSocialClick(platform, url) {
    return;
  }

  // Track user engagement time
  trackEngagementTime() {
    return;
  }

  // Track performance metrics
  trackPerformance() {
    return;
  }

  // Track errors
  trackError(error, context = 'unknown') {
    return;
  }

  // Set up automatic tracking for common interactions
  setupAutomaticTracking() {
    return;
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
export const trackResumeDownload = (fileName) => analytics.trackResumeDownload(fileName);
export const trackNavigation = (destination, source) => analytics.trackNavigation(destination, source);
export const trackSocialClick = (platform, url) => analytics.trackSocialClick(platform, url);
export const trackError = (error, context) => analytics.trackError(error, context); 

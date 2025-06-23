import DitheredWaveBackground from './Dither.js';

// Ensure Three.js is available

class DitheredBackgroundManager {
  constructor() {
    this.background = null;
    this.currentSection = 'hero';
    this.isInitialized = false;
    this.container = null;
    
    // Base configuration - same for all sections
    const baseConfig = {
      waveSpeed: 0.05,
      waveFrequency: 3.0,
      waveAmplitude: 0.4,
      waveColor: [0.6, 0.6, 0.6], // Light grey
      colorNum: 4,
      pixelSize: 2,
      opacity: 0.7,
      enableMouseInteraction: true,
      mouseRadius: 0.3
    };

    // All sections use the same configuration
    this.sectionConfigs = {
      hero: { ...baseConfig },
      projects: { ...baseConfig },
      awards: { ...baseConfig },
      contact: { ...baseConfig }
    };

    // Mobile optimizations - higher resolution and faster animation for mobile
    const baseMobileConfig = { 
      pixelSize: 1, // Even smaller pixels for ultra-high resolution on mobile
      colorNum: 4, 
      opacity: 0.7, 
      enableMouseInteraction: false,
      waveSpeed: 0.08 // Faster animation speed for mobile (60% faster than desktop)
    };

    this.mobileConfigs = {
      hero: { ...baseMobileConfig },
      projects: { ...baseMobileConfig },
      awards: { ...baseMobileConfig },
      contact: { ...baseMobileConfig }
    };

    this.init();
  }

  init() {
    this.createContainer();
    this.setupIntersectionObserver();
    this.initializeBackground();
    this.setupEventListeners();
  }

  createContainer() {
    // Create background container
    this.container = document.createElement('div');
    this.container.className = 'dithered-background loading';
    this.container.setAttribute('aria-hidden', 'true');
    this.container.setAttribute('role', 'presentation');
    
    // Insert at the beginning of body
    document.body.insertBefore(this.container, document.body.firstChild);
  }

  initializeBackground() {
    try {
      // Get initial configuration
      const config = this.getCurrentConfig();
      console.log('Initializing dithered background with config:', config);
      
      this.background = new DitheredWaveBackground(this.container, config);
      this.isInitialized = true;
      
      // Remove loading state
      setTimeout(() => {
        this.container.classList.remove('loading');
        console.log('Background loading state removed');
      }, 500);
      
      console.log('Dithered background initialized successfully');
    } catch (error) {
      console.error('Failed to initialize dithered background:', error);
      console.error('Error details:', error.message, error.stack);
      this.handleError();
    }
  }

  getCurrentConfig() {
    const isMobile = window.innerWidth <= 768;
    const baseConfig = this.sectionConfigs[this.currentSection];
    const mobileOverrides = isMobile ? this.mobileConfigs[this.currentSection] : {};
    
    return {
      ...baseConfig,
      ...mobileOverrides,
      disableAnimation: this.shouldDisableAnimation()
    };
  }

  shouldDisableAnimation() {
    // Disable animation for performance on low-end devices
    const isLowEndDevice = this.isLowEndDevice();
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    return isLowEndDevice || prefersReducedMotion;
  }

  isLowEndDevice() {
    // Simple heuristic for low-end device detection
    const hardwareConcurrency = navigator.hardwareConcurrency || 2;
    const deviceMemory = navigator.deviceMemory || 2;
    const isMobile = window.innerWidth <= 768;
    
    return hardwareConcurrency < 4 || deviceMemory < 4 || (isMobile && hardwareConcurrency < 2);
  }

  setupIntersectionObserver() {
    const sections = document.querySelectorAll('.home__hero, .home__projects, .home__awards, .home__contact');
    
    console.log(`Found ${sections.length} sections to observe:`, Array.from(sections).map(s => s.className));
    
    const observer = new IntersectionObserver((entries) => {
      // Find the section with the highest intersection ratio
      let maxIntersectionEntry = null;
      let maxRatio = 0;
      
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
          maxRatio = entry.intersectionRatio;
          maxIntersectionEntry = entry;
        }
      });
      
      // Only transition if we have a clear winner with sufficient intersection
      if (maxIntersectionEntry && maxRatio > 0.3) {
        const section = this.getSectionFromElement(maxIntersectionEntry.target);
        console.log(`Section ${section} intersection:`, {
          isIntersecting: maxIntersectionEntry.isIntersecting,
          intersectionRatio: maxRatio,
          currentSection: this.currentSection
        });
        
        if (section && section !== this.currentSection) {
          console.log(`Section transition: ${this.currentSection} → ${section}`);
          this.transitionToSection(section);
        }
      }
    }, {
      threshold: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8],
      rootMargin: '-15% 0px -15% 0px'
    });

    sections.forEach(section => {
      observer.observe(section);
      console.log(`Observing section: ${section.className}`);
    });
  }

  getSectionFromElement(element) {
    if (element.classList.contains('home__hero')) return 'hero';
    if (element.classList.contains('home__projects')) return 'projects';
    if (element.classList.contains('home__awards')) return 'awards';
    if (element.classList.contains('home__contact')) return 'contact';
    return null;
  }

  transitionToSection(newSection) {
    if (!this.isInitialized || newSection === this.currentSection) return;

    console.log(`🎨 Transitioning background from ${this.currentSection} to ${newSection}`);
    
    // Add visual feedback for the transition
    this.container.classList.add('transitioning');
    
    // Update current section
    const previousSection = this.currentSection;
    this.currentSection = newSection;
    
    // Get new configuration with enhanced transition effects
    const newConfig = this.getCurrentConfig();
    console.log(`New config for ${newSection}:`, newConfig);
    
    if (this.background) {
      // Apply the new configuration
      this.background.updateOptions(newConfig);
      
      // Add some visual flair during transition
      setTimeout(() => {
        this.background.updateOptions({
          ...newConfig,
          waveAmplitude: newConfig.waveAmplitude * 1.2 // Brief amplitude boost
        });
      }, 100);
      
      // Return to normal amplitude
      setTimeout(() => {
        this.background.updateOptions(newConfig);
      }, 300);
    }

    // Remove transition class after animation
    setTimeout(() => {
      this.container.classList.remove('transitioning');
    }, 600);

    // Update container class for section-specific styling
    this.updateContainerClass();
    
    // Announce the transition
    console.log(`✨ Background transition complete: ${previousSection} → ${newSection}`);
  }

  updateContainerClass() {
    // Remove previous section classes
    this.container.classList.remove('section-hero', 'section-projects', 'section-awards', 'section-contact');
    
    // Add current section class
    this.container.classList.add(`section-${this.currentSection}`);
  }

  setupEventListeners() {
    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (this.background) {
          const newConfig = this.getCurrentConfig();
          this.background.updateOptions(newConfig);
        }
      }, 250);
    });

    // Handle visibility change (performance optimization)
    document.addEventListener('visibilitychange', () => {
      if (this.background) {
        if (document.hidden) {
          this.background.stop();
        } else {
          this.background.start();
        }
      }
    });

    // Handle scroll for performance optimization and contact section detection
    let scrollTimeout;
    let isScrolling = false;
    
    window.addEventListener('scroll', () => {
      // Check contact section visibility on scroll
      this.checkContactSection();
      
      if (!isScrolling && this.background) {
        isScrolling = true;
        // Optionally reduce quality during scroll for performance
        this.background.updateOptions({ pixelSize: this.getCurrentConfig().pixelSize + 1 });
      }
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (isScrolling && this.background) {
          isScrolling = false;
          // Restore quality after scroll ends
          this.background.updateOptions({ pixelSize: this.getCurrentConfig().pixelSize });
        }
      }, 150);
    }, { passive: true });

    // Handle reduced motion preference changes
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaQuery.addEventListener('change', () => {
      if (this.background) {
        const newConfig = this.getCurrentConfig();
        this.background.updateOptions(newConfig);
      }
    });
  }

  handleError() {
    console.warn('Falling back to simple background due to WebGL issues');
    this.container.classList.add('error');
    this.container.classList.remove('loading');
    
    // Simple fallback with CSS animation
    this.container.innerHTML = '<div class="fallback-pattern"></div>';
  }

  // Public API methods
  pause() {
    if (this.background) {
      this.background.stop();
    }
  }

  resume() {
    if (this.background) {
      this.background.start();
    }
  }

  destroy() {
    if (this.background) {
      this.background.destroy();
    }
    
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }

  // Development/testing methods
  setSection(section) {
    if (this.sectionConfigs[section]) {
      this.transitionToSection(section);
    }
  }

  // Force contact section detection
  checkContactSection() {
    const contactSection = document.querySelector('.home__contact');
    if (contactSection) {
      const rect = contactSection.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Check if contact section is in view
      if (rect.top < windowHeight && rect.bottom > 0) {
        console.log('Contact section is in view, forcing transition');
        this.transitionToSection('contact');
      }
    }
  }

  updateSectionConfig(section, config) {
    if (this.sectionConfigs[section]) {
      this.sectionConfigs[section] = { ...this.sectionConfigs[section], ...config };
      
      if (section === this.currentSection && this.background) {
        this.background.updateOptions(this.getCurrentConfig());
      }
    }
  }
}

export default DitheredBackgroundManager; 
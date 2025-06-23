import LocomotiveScroll from "locomotive-scroll";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { copyText } from "./utils/index";
import { mapEach } from "./utils/dom";
// import Home from "./pages/home";
import Time from "./components/Time";
import * as THREE from "three";
import DitheredBackgroundManager from "./components/DitheredBackgroundManager";
import ContactForm from "./components/ContactForm";
// Import comprehensive analytics system
import analytics, { trackScrollBehavior, trackResumeDownload, trackError } from "./utils/analytics";
// Import Vercel Speed Insights
import { injectSpeedInsights } from '@vercel/speed-insights';

// Initialize Vercel Speed Insights
injectSpeedInsights();

// Make Three.js available globally
window.THREE = THREE;

// Initialize the new dithered background system
let backgroundManager = null;

// Custom cursor and background initialization with safety checks
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing background...');
  
  // Check if Three.js is available
  if (typeof THREE === 'undefined') {
    console.error('Three.js is not loaded!');
    return;
  }
  console.log('Three.js version:', THREE.REVISION);
  
  // Initialize dithered wave background system
  try {
    backgroundManager = new DitheredBackgroundManager();
    console.log('Dithered background system initialized');
    
    // Expose background manager globally for debugging/testing
    if (typeof window !== 'undefined') {
      window.backgroundManager = backgroundManager;
      console.log('Background manager exposed to window.backgroundManager');
    }
  } catch (error) {
    console.error('Failed to initialize dithered background:', error);
    console.error('Error stack:', error.stack);
    trackError(error, 'background_initialization');
  }

  // Track resume downloads
  const resumeButtons = document.querySelectorAll('a[href*="YadurajSingh_Resume.pdf"]');
  resumeButtons.forEach(button => {
    button.addEventListener('click', () => {
      trackResumeDownload();
    });
  });
});

const toContactButtons = document.querySelectorAll(".contact-scroll");
const footer = document.getElementById("js-footer");
const scrollEl = document.querySelector("[data-scroll-container]");
const emailButton = document.querySelector("button.email");
const toCopyText = document.querySelector(".to-copy span");
// const body = document.body;
const time = new Time();

gsap.registerPlugin(ScrollTrigger);

const scroll = new LocomotiveScroll({
  el: scrollEl,
  smooth: true,
  lerp: 0.06,
  tablet: {
    breakpoint: 768,
  },
});

setTimeout(() => {
  scroll.update();
}, 1000);

scroll.on("scroll", (args) => {
  ScrollTrigger.update();
  
  // Track scroll behavior for analytics
  try {
    const scrollProgress = Math.round((args.scroll.y / (args.limit.y || 1)) * 100);
    trackScrollBehavior('main_page', scrollProgress);
  } catch (error) {
    // Silently handle scroll tracking errors
  }
});

ScrollTrigger.scrollerProxy(scroll.el, {
  scrollTop(value) {
    return arguments.length
      ? scroll.scrollTo(value, 0, 0)
      : scroll.scroll.instance.scroll.y;
  },

  getBoundingClientRect() {
    return {
      top: 0,
      left: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    };
  },
});

// Enhanced 3D text effect with safety checks
document.addEventListener('DOMContentLoaded', () => {
  const heroTitle = document.querySelector('.hero__title');
  const iOSText = document.querySelector('.hero__title__left');
  const devText = document.querySelector('.bottom__left');
  
  if (heroTitle && iOSText && devText) {
    // Fix perspective origin
    gsap.set(heroTitle, { 
      perspective: '1000px',
      transformStyle: 'preserve-3d'
    });
    
    // Add initial transforms and shadows with safety checks
    const letters = heroTitle.querySelectorAll('.hero__hover');
    if (letters.length > 0) {
      gsap.set(letters, { 
        transformOrigin: 'center center -10px',
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden'
      });
    }
    
    // Track mouse movement for 3D effect
    let isInViewport = true;
    let rafId = null;
    
    const updateAnimation = (e) => {
      if (!isInViewport) return;
      
      const rect = heroTitle.getBoundingClientRect();
      
      // Calculate distance from center as percentage
      const x = (e.clientX - (rect.left + rect.width/2)) / (window.innerWidth/2);
      const y = (e.clientY - (rect.top + rect.height/2)) / (window.innerHeight/2);
      
      // Calculate rotation and movement values
      const tiltX = y * 10; // Reduced from 15 to 10 for subtlety
      const tiltY = -x * 10; // Reduced from 15 to 10 for subtlety
      const moveX = x * 8;  // Reduced from 10 to 8 for subtlety
      const moveY = y * 8;  // Reduced from 10 to 8 for subtlety
      
      // Apply transforms for iOS text
      gsap.to(iOSText, {
        rotateX: tiltX,
        rotateY: tiltY,
        x: moveX,
        z: 30, // Reduced depth
        textShadow: `${-x * 5}px ${-y * 5}px 10px rgba(119, 119, 119, 0.3)`,
        duration: 0.5,
        ease: "power2.out",
        overwrite: 'auto'
      });
      
      // Apply transforms for DEVELOPER text
      gsap.to(devText, {
        rotateX: tiltX * 0.7,
        rotateY: tiltY * 0.7,
        x: moveX * 0.8,
        z: 20, // Reduced depth
        textShadow: `${-x * 4}px ${-y * 4}px 8px rgba(119, 119, 119, 0.3)`,
        duration: 0.5,
        ease: "power2.out",
        overwrite: 'auto'
      });
      
      // Apply subtle letter-by-letter effect
      if (letters.length > 0) {
        letters.forEach((letter, index) => {
          const delay = index * 0.01; // Reduced delay
          const distance = (Math.sin(index + (Date.now() / 2000)) * 3); // Reduced movement and slowed oscillation
          
          gsap.to(letter, {
            z: 10 + distance, // Reduced depth
            duration: 0.8,
            delay: delay,
            ease: "power2.out",
            overwrite: 'auto'
          });
        });
      }
    };
    
    // Throttle mousemove for better performance
    let lastMoveTime = 0;
    window.addEventListener('mousemove', (e) => {
      const now = Date.now();
      if (now - lastMoveTime > 16) { // Roughly 60fps
        lastMoveTime = now;
        updateAnimation(e);
      }
    });
    
    // Reset transforms when mouse leaves window
    window.addEventListener('mouseleave', () => {
      gsap.to([iOSText, devText], {
        rotateX: 0,
        rotateY: 0,
        x: 0,
        z: 0,
        textShadow: '0px 0px 0px rgba(119, 119, 119, 0.3)',
        duration: 0.7,
        ease: "elastic.out(1, 0.5)",
        overwrite: 'auto'
      });
      
      // Reset letter animations
      if (letters.length > 0) {
        gsap.to(letters, {
          z: 0,
          duration: 0.5,
          ease: "power2.out",
          overwrite: 'auto'
        });
      }
    });
    
    // Check if element is in viewport for better performance
    const checkVisibility = () => {
      const rect = heroTitle.getBoundingClientRect();
      isInViewport = (
        rect.top >= -rect.height &&
        rect.left >= -rect.width &&
        rect.bottom <= (window.innerHeight + rect.height) &&
        rect.right <= (window.innerWidth + rect.width)
      );
      
      rafId = requestAnimationFrame(checkVisibility);
    };
    
    // Start visibility checking
    checkVisibility();
    
    // Clean up on page leave
    window.addEventListener('beforeunload', () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    });
    
    // Parallax effect on scroll with safety checks
    const scrollTrigger = ScrollTrigger.create({
      trigger: heroTitle,
      start: 'top bottom',
      end: 'bottom top',
      scroller: "[data-scroll-container]",
      onUpdate: (self) => {
        const scrollProgress = self.progress;
        const moveAmount = 30 * scrollProgress; // Reduced from 50 to 30
        
        gsap.to(iOSText, {
          y: -moveAmount,
          duration: 0.1,
          ease: "none",
          overwrite: 'auto'
        });
        
        gsap.to(devText, {
          y: -moveAmount * 1.2,
          duration: 0.1,
          ease: "none",
          overwrite: 'auto'
        });
      }
    });
  }
});

// Fix resume button animation
document.addEventListener('DOMContentLoaded', () => {
  const resumeBtn = document.querySelector('.download-resume-btn');
  const resumeSvg = document.querySelector('.download-resume-btn svg');
  
  if (resumeBtn && resumeSvg) {
    // Initial state setup
    gsap.set(resumeSvg, { y: 0 });
    
    // Create a clean hover animation with proper cleanup
    resumeBtn.addEventListener('mouseenter', () => {
      gsap.killTweensOf(resumeSvg);
      gsap.to(resumeSvg, {
        y: -5,
        duration: 0.3,
        ease: "power2.out",
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          gsap.set(resumeSvg, { y: 0 });
        }
      });
    });
    
    // Add click animation for feedback
    resumeBtn.addEventListener('click', () => {
      gsap.killTweensOf(resumeSvg);
      gsap.to(resumeSvg, {
        scale: 0.8,
        duration: 0.1,
        ease: "power2.in",
        yoyo: true,
        repeat: 1
      });
      
      // Add subtle button pulse
      gsap.to(resumeBtn, {
        backgroundColor: 'rgba(55, 170, 59, 0.7)',
        duration: 0.2,
        ease: "power2.inOut",
        yoyo: true,
        repeat: 1
      });
    });
  }
});

// Implement layered parallax effect for hero elements
document.addEventListener('DOMContentLoaded', () => {
  const heroSection = document.querySelector('.home__hero');
  const floatingElements = document.querySelectorAll('.floating-element');
  const codeSnippet = document.querySelector('.code-snippet');
  const expertiseWrapper = document.querySelector('.expertise-wrapper');
  const heroTitle = document.querySelector('.hero__title');
  const isMobile = window.innerWidth <= 768;
  const isSmallMobile = window.innerWidth <= 480;
  
  if (heroSection && floatingElements.length) {
    // Create a main timeline for hero animations with optimized settings for mobile
    const heroTl = gsap.timeline({
      defaults: {
        ease: "power2.out",
        duration: isSmallMobile ? 0.7 : 1 // Faster animations on mobile
      }
    });
    
    // Fade in elements with staggered timing for a smoother intro
    gsap.set([floatingElements, codeSnippet, expertiseWrapper], { 
      autoAlpha: 0
    });
    
    // Add floating elements with subtle fade in (skip on small mobile for performance)
    if (!isSmallMobile) {
      heroTl.to(floatingElements, {
        autoAlpha: isMobile ? 0.4 : 0.6, 
        stagger: 0.1,
        duration: isMobile ? 0.8 : 1.2,
        delay: isMobile ? 0.3 : 0.5
      });
    }
    
    // Add expertise section
    heroTl.to(expertiseWrapper, {
      autoAlpha: 1,
      y: 0,
      duration: isMobile ? 0.6 : 0.8,
      delay: isMobile ? 0.1 : 0.2
    }, "-=0.3");
    
    // Add code snippet
    heroTl.to(codeSnippet, {
      autoAlpha: 1,
      y: 0,
      duration: isMobile ? 0.8 : 1
    }, "-=0.2");
    
    // Enhanced parallax on scroll with performance optimizations for mobile
    if (!isSmallMobile) { // Skip heavy animations on small mobile for better performance
      ScrollTrigger.create({
        trigger: heroSection,
        start: 'top top',
        end: 'bottom top',
        scroller: "[data-scroll-container]",
        onUpdate: (self) => {
          const scrollProgress = self.progress;
          
          // Apply different parallax rates to floating elements
          floatingElements.forEach((element, index) => {
            const depth = index * 0.2 + 0.5; // Different depths for each element
            const yMove = scrollProgress * (isMobile ? 50 : 100) * depth;
            const xMove = (index % 2 === 0) ? scrollProgress * (isMobile ? 15 : 30) : scrollProgress * (isMobile ? -15 : -30);
            const rotate = (index % 2 === 0) ? scrollProgress * (isMobile ? 8 : 15) : scrollProgress * (isMobile ? -8 : -15);
            
            gsap.to(element, {
              y: yMove,
              x: xMove,
              rotate: rotate,
              opacity: Math.max(0, (isMobile ? 0.4 : 0.6) - scrollProgress * 1.2),
              duration: isMobile ? 0.2 : 0.3,
              ease: "power1.out",
              overwrite: 'auto'
            });
          });
          
          // Move title up slightly for parallax effect
          if (heroTitle) {
            gsap.to(heroTitle, {
              y: -scrollProgress * (isMobile ? 40 : 80),
              duration: isMobile ? 0.2 : 0.3,
              ease: "power1.out",
              overwrite: 'auto'
            });
          }
          
          // Parallax for code snippet with improved animation
          if (codeSnippet) {
            gsap.to(codeSnippet, {
              y: scrollProgress * (isMobile ? 30 : 60),
              scale: Math.max(isMobile ? 0.8 : 0.85, (isMobile ? 0.9 : 0.95) - scrollProgress * 0.15),
              opacity: Math.max(0, 1 - scrollProgress * 2.5),
              duration: isMobile ? 0.2 : 0.3,
              ease: "power1.out",
              overwrite: 'auto'
            });
          }
          
          // Adjust expertise wrapper on scroll
          if (expertiseWrapper) {
            gsap.to(expertiseWrapper, {
              y: scrollProgress * (isMobile ? 20 : 40),
              opacity: Math.max(0, 1 - scrollProgress * 2), 
              duration: isMobile ? 0.2 : 0.3,
              ease: "power1.out",
              overwrite: 'auto'
            });
          }
        }
      });
    }
  }
  
  // Staggered text reveal for hero titles with improved animation
  const revealHeroText = () => {
    const heroLetters = document.querySelectorAll('.hero__hover');
    
    if (heroLetters.length) {
      // Initial setup - hide all letters
      gsap.set(heroLetters, { 
        opacity: 0, 
        y: isMobile ? 10 : 20,
        rotationX: isMobile ? 20 : 40, // Less 3D effect on mobile for better performance
        transformOrigin: "50% 100%" 
      });
      
      // Staggered reveal animation
      gsap.to(heroLetters, {
        opacity: 1,
        y: 0,
        rotationX: 0,
        duration: isMobile ? 0.7 : 1,
        stagger: isMobile ? 0.04 : 0.06,
        ease: "power3.out",
        delay: isMobile ? 0.3 : 0.5
      });
    }
  };
  
  // Run the text reveal animation
  revealHeroText();
  
  // Implement morphing text animation with improved timing
  const startMorphingAnimation = () => {
    const morphTexts = document.querySelectorAll('.morph-text');
    
    if (morphTexts.length > 0) {
      let currentIndex = 0;
      
      const morphText = () => {
        // Current active text
        const currentText = morphTexts[currentIndex];
        
        // Update current index
        currentIndex = (currentIndex + 1) % morphTexts.length;
        
        // Next active text
        const nextText = morphTexts[currentIndex];
        
        // Animate current text out
        gsap.to(currentText, {
          opacity: 0,
          y: -20,
          duration: isMobile ? 0.3 : 0.4,
          ease: "power2.in",
          onComplete: () => {
            currentText.classList.remove('active');
            // Immediately position next text
            gsap.set(nextText, {
              y: 20,
              opacity: 0
            });
            nextText.classList.add('active');
            // Animate next text in
            gsap.to(nextText, {
              y: 0,
              opacity: 1,
              duration: isMobile ? 0.4 : 0.5,
              ease: "back.out(1.2)"
            });
          }
        });
      };
      
      // Set first item as active initially
      morphTexts[0].classList.add('active');
      gsap.set(morphTexts[0], { opacity: 1, y: 0 });
      
      // Start the interval (slightly faster for better effect)
      setInterval(morphText, isMobile ? 2000 : 2500);
    }
  };
  
  // Start the morphing animation
  startMorphingAnimation();
  
  // Add subtle hover interaction to code snippet
  if (codeSnippet && !isMobile) { // Skip hover effects on mobile
    codeSnippet.addEventListener('mouseenter', () => {
      gsap.to(codeSnippet, {
        scale: 0.98,
        duration: 0.3,
        ease: "power2.out",
        boxShadow: "0 15px 35px rgba(0, 0, 0, 0.35)"
      });
    });
    
    codeSnippet.addEventListener('mouseleave', () => {
      gsap.to(codeSnippet, {
        scale: 0.95,
        duration: 0.5,
        ease: "power2.out",
        boxShadow: "0 12px 28px rgba(0, 0, 0, 0.25)"
      });
    });
  }
  
  // Handle resize events to update mobile detection
  window.addEventListener('resize', () => {
    const newIsMobile = window.innerWidth <= 768;
    const newIsSmallMobile = window.innerWidth <= 480;
    
    if (newIsMobile !== isMobile || newIsSmallMobile !== isSmallMobile) {
      // Reload page to apply correct mobile optimizations
      // This is a simple approach; a more sophisticated one would
      // be to update all the animations without reload
      location.reload();
    }
  });
});

// Button click microinteraction
document.querySelectorAll('.c-button').forEach(btn => {
  btn.addEventListener('mousedown', () => {
    gsap.to(btn, { scale: 0.95, duration: 0.1, ease: "power1.out" });
  });
  btn.addEventListener('mouseup', () => {
    gsap.to(btn, { scale: 1, duration: 0.2, ease: "elastic.out(1, 0.4)" });
  });
  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, { scale: 1, duration: 0.2, ease: "power1.out" });
  });
});

// Section fade-in on scroll
gsap.utils.toArray('.fade-section').forEach(section => {
  gsap.from(section, {
    opacity: 0,
    y: 40,
    duration: 1,
    scrollTrigger: {
      trigger: section,
      start: "top 80%",
      toggleActions: "play none none none"
    }
  });
});

export default class Home {
  constructor(scroll) {
    this.locomotive = scroll;
    this.heroTextAnimation();
    this.homeIntro();
    this.homeAnimations();
    this.homeActions();
  }

  homeActions() {
    mapEach(toContactButtons, (button) => {
      button.onclick = () => {
        this.locomotive.scrollTo(footer);
      };
    });

    emailButton.addEventListener("click", (e) => {
      copyText(e);
      toCopyText.textContent = "copied";

      setTimeout(() => {
        toCopyText.textContent = "Click To Copy";
      }, 2000);
    });
  }

  homeIntro() {
    const tl = gsap.timeline();

    gsap.to(scrollEl, {
      autoAlpha: 1,
    });

    tl.from(".home__nav", {
      duration: 0.5,
      delay: 0.3,
      opacity: 0,
      yPercent: -100,
      ease: "power4.out",
    })
      .from(".hero__title [title-overflow]", {
        duration: 0.7,
        yPercent: 100,
        stagger: {
          amount: 0.2,
        },
        ease: "power4.out",
      })
      .from(
        ".hero__title .bottom__right",
        {
          duration: 1,
          yPercent: 100,
          opacity: 0,
          ease: "power4.out",
        },
        "<20%"
      )
      .set(".hero__title .overflow", { overflow: "unset" })
      .from(
        ".hero__title .mobile",
        {
          duration: 0.7,
          yPercent: 100,
          stagger: {
            amount: 0.2,
          },
          ease: "power4.out",
        },
        "-=1.4"
      );
  }

  homeAnimations() {
    // Add safety check for GSAP targets
    const projectLines = gsap.utils.toArray(".home__projects__line");
    if (projectLines.length > 0) {
      gsap.to(".home__projects__line", { autoAlpha: 1 });
      projectLines.forEach((el) => {
        const line = el.querySelector("span");
        gsap.from(line, {
          duration: 1.5,
          scrollTrigger: {
            trigger: el,
            scroller: "[data-scroll-container]",
          },
          scaleX: 0,
        });
      });
    }

    gsap.utils.toArray("[data-fade-in]").forEach((el) => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          scroller: "[data-scroll-container]",
        },
        duration: 1.5,
        yPercent: 100,
        opacity: 0,
        ease: "power4.out",
      });
    });

    if (window.innerWidth <= 768) {
      gsap.utils.toArray(".home__projects__project").forEach((el) => {
        const text = el.querySelector(".title__main");
        const link = el.querySelector(".project__link");
        gsap.from([text, link], {
          scrollTrigger: {
            trigger: el,
            scroller: "[data-scroll-container]",
          },
          duration: 1.5,
          yPercent: 100,
          stagger: {
            amount: 0.2,
          },
          ease: "power4.out",
        });
      });

      const awardsTl = gsap.timeline({
        defaults: {
          ease: "power1.out",
        },
        scrollTrigger: {
          trigger: ".home__awards",
          scroller: "[data-scroll-container]",
        },
      });
      awardsTl.from(".awards__title span", {
        duration: 1,
        opacity: 0,
        yPercent: 100,
        stagger: {
          amount: 0.2,
        },
      });
    }
  }

  heroTextAnimation() {
    gsap.to(".hero__title__dash.desktop", {
      scrollTrigger: {
        trigger: ".hero__title",
        scroller: "[data-scroll-container]",
        scrub: true,
        start: "-8% 9%",
        end: "110% 20%",
      },
      scaleX: 4,
      ease: "none",
    });
  }
}

new Home(scroll);

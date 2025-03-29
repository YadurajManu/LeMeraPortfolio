import LocomotiveScroll from "locomotive-scroll";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { copyText } from "./utils/index";
import { mapEach } from "./utils/dom";
// import Home from "./pages/home";
import Time from "./components/Time";

// Custom cursor initialization
const cursor = document.querySelector('.custom-cursor');
const cursorSmall = cursor.querySelector('.custom-cursor__ball--small');
const cursorBig = cursor.querySelector('.custom-cursor__ball--big');

let mouseX = 0;
let mouseY = 0;
let cursorSmallX = 0;
let cursorSmallY = 0;
let cursorBigX = 0;
let cursorBigY = 0;

// Set initial position off-screen to avoid flash
gsap.set(cursor, { xPercent: -50, yPercent: -50 });
gsap.set(cursorSmall, { xPercent: -50, yPercent: -50 });
gsap.set(cursorBig, { xPercent: -50, yPercent: -50 });

// Track mouse position
document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// Animate cursor position with some lag for smoothness
gsap.ticker.add(() => {
  // Calculate speed of mouse movement
  const deltaX = mouseX - cursorSmallX;
  const deltaY = mouseY - cursorSmallY;
  const speed = Math.sqrt(deltaX * deltaX + deltaY * deltaY) * 0.1;
  
  // Apply different easing based on speed
  const smallEase = 0.4;
  const bigEase = 0.15;
  
  // Update small cursor with less lag
  cursorSmallX += (mouseX - cursorSmallX) * smallEase;
  cursorSmallY += (mouseY - cursorSmallY) * smallEase;
  
  // Update big cursor with more lag
  cursorBigX += (mouseX - cursorBigX) * bigEase;
  cursorBigY += (mouseY - cursorBigY) * bigEase;
  
  // Apply positions
  gsap.set(cursorSmall, { x: cursorSmallX, y: cursorSmallY });
  gsap.set(cursorBig, { x: cursorBigX, y: cursorBigY });
  
  // Scale big cursor based on mouse speed
  if (speed > 1) {
    gsap.to(cursorBig, { 
      duration: 0.3, 
      scale: 1 + speed * 0.05,
      ease: "sine.out" 
    });
  } else {
    gsap.to(cursorBig, { 
      duration: 0.6, 
      scale: 1,
      ease: "power2.out" 
    });
  }
});

// Handle cursor state when leaving/entering window
document.addEventListener('mouseenter', () => {
  gsap.to(cursor, { opacity: 1, duration: 0.3 });
});

document.addEventListener('mouseleave', () => {
  gsap.to(cursor, { opacity: 0, duration: 0.3 });
});

// Enhanced button press effect
const buttons = document.querySelectorAll('.c-button, .email, a');
buttons.forEach(button => {
  button.addEventListener('mousedown', () => {
    gsap.to(cursorBig, { scale: 0.8, duration: 0.2, ease: "power2.out" });
  });
  
  button.addEventListener('mouseup', () => {
    gsap.to(cursorBig, { scale: 1, duration: 0.6, ease: "elastic.out(1, 0.3)" });
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

scroll.on("scroll", ScrollTrigger.update);

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

// Enhanced 3D text effect
const heroTitle = document.querySelector('.hero__title');
const iOSText = document.querySelector('.hero__title__left');
const devText = document.querySelector('.bottom__left');

if (heroTitle && iOSText && devText) {
  // Add perspective to parent container
  heroTitle.style.perspective = '1000px';
  
  // Add initial transforms for depth
  iOSText.style.transform = 'translateZ(0px)';
  devText.style.transform = 'translateZ(0px)';
  
  // Add initial text shadow for depth
  iOSText.style.textShadow = '0px 0px 0px rgba(119, 119, 119, 0.3)';
  devText.style.textShadow = '0px 0px 0px rgba(119, 119, 119, 0.3)';
  
  // Track mouse movement across entire window for smoother effect
  window.addEventListener('mousemove', (e) => {
    if (isElementInViewport(heroTitle)) {
      const rect = heroTitle.getBoundingClientRect();
      
      // Calculate distance from center as percentage
      const x = (e.clientX - (rect.left + rect.width/2)) / (window.innerWidth/2);
      const y = (e.clientY - (rect.top + rect.height/2)) / (window.innerHeight/2);
      
      // Calculate rotation and movement values
      const tiltX = y * 15; // Max 15 degrees tilt
      const tiltY = -x * 15; // Max 15 degrees tilt
      const moveX = x * 10; // Max 10px movement
      const moveY = y * 10; // Max 10px movement
      const shadowX = -x * 10;
      const shadowY = -y * 10;
      const shadowBlur = 20;
      
      // Apply transforms with easing
      gsap.to(iOSText, {
        rotateX: tiltX,
        rotateY: tiltY,
        translateX: moveX,
        translateZ: 50, // Add some depth
        textShadow: `${shadowX}px ${shadowY}px ${shadowBlur}px rgba(119, 119, 119, 0.3)`,
        duration: 0.5,
        ease: "power2.out"
      });
      
      gsap.to(devText, {
        rotateX: tiltX * 0.7, // Slightly less rotation for contrast
        rotateY: tiltY * 0.7,
        translateX: moveX * 0.8,
        translateZ: 30, // Less depth than iOS text
        textShadow: `${shadowX * 0.8}px ${shadowY * 0.8}px ${shadowBlur}px rgba(119, 119, 119, 0.3)`,
        duration: 0.5,
        ease: "power2.out"
      });
      
      // Add subtle hover effect to each letter
      const letters = heroTitle.querySelectorAll('.hero__hover');
      letters.forEach((letter, index) => {
        const delay = index * 0.02;
        const distance = (Math.sin(index + (Date.now() / 1000)) * 5);
        
        gsap.to(letter, {
          translateZ: 20 + distance,
          duration: 0.8,
          delay: delay,
          ease: "power2.out"
        });
      });
    }
  });
  
  // Reset transforms when mouse leaves
  window.addEventListener('mouseleave', () => {
    gsap.to([iOSText, devText], {
      rotateX: 0,
      rotateY: 0,
      translateX: 0,
      translateZ: 0,
      textShadow: '0px 0px 0px rgba(119, 119, 119, 0.3)',
      duration: 0.7,
      ease: "elastic.out(1, 0.5)"
    });
    
    // Reset letter animations
    const letters = heroTitle.querySelectorAll('.hero__hover');
    letters.forEach((letter) => {
      gsap.to(letter, {
        translateZ: 0,
        duration: 0.5,
        ease: "power2.out"
      });
    });
  });
  
  // Helper function to check if element is visible
  function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= -rect.height &&
      rect.left >= -rect.width &&
      rect.bottom <= (window.innerHeight + rect.height) &&
      rect.right <= (window.innerWidth + rect.width)
    );
  }
  
  // Add parallax effect on scroll
  ScrollTrigger.create({
    trigger: heroTitle,
    start: 'top bottom',
    end: 'bottom top',
    scroller: "[data-scroll-container]",
    onUpdate: (self) => {
      const scrollProgress = self.progress;
      const moveAmount = 50 * scrollProgress;
      
      gsap.to(iOSText, {
        translateY: -moveAmount,
        duration: 0.1,
        ease: "none"
      });
      
      gsap.to(devText, {
        translateY: -moveAmount * 1.2, // Slightly different movement for parallax effect
        duration: 0.1,
        ease: "none"
      });
    }
  });
}

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
    gsap.to(".home__projects__line", { autoAlpha: 1 });
    gsap.utils.toArray(".home__projects__line").forEach((el) => {
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

// Particle system for portfolio website
// Creates a subtle, interactive background with code/astronomy-themed particles

class Particle {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Configure particle properties with defaults
    this.x = options.x || Math.random() * canvas.width;
    this.y = options.y || Math.random() * canvas.height;
    this.size = options.size || Math.random() * 3 + 1;
    this.speedX = options.speedX || (Math.random() - 0.5) * 0.5;
    this.speedY = options.speedY || (Math.random() - 0.5) * 0.5;
    this.color = options.color || '#777777';
    this.opacity = options.opacity || Math.random() * 0.5 + 0.1;
    this.type = options.type || this.getRandomType();
    
    // For code-like particles
    this.text = options.text || this.getRandomSymbol();
    this.font = options.font || `${this.size * 6}px monospace`;
    
    // For astronomy themes
    this.glowing = Math.random() > 0.7; // Some particles will have glow effect
    this.pulseSpeed = Math.random() * 0.02 + 0.01;
    this.pulseAmount = 0;
    
    // For orbital particles
    this.angle = Math.random() * Math.PI * 2;
    this.orbitSpeed = (Math.random() * 0.01 + 0.005) * (Math.random() > 0.5 ? 1 : -1);
    this.orbitRadius = options.orbitRadius || 0;
    this.orbitCenterX = options.orbitCenterX || 0;
    this.orbitCenterY = options.orbitCenterY || 0;
    this.isOrbiting = options.isOrbiting || false;
  }
  
  getRandomType() {
    // Different particle types with weighted distribution
    const types = [
      'circle', 'circle', 'circle', 'circle', // More common
      'dot', 'dot', 'dot', 
      'square', 'square',
      'symbol', 'symbol',
      'star', 'star',
      'planet'
    ];
    return types[Math.floor(Math.random() * types.length)];
  }
  
  getRandomSymbol() {
    // Code and astronomy related symbols
    const codeSymbols = ['{', '}', '()', '[]', '<>', '//', '/*', '*/', '=>', '+=', '&&', '||', '!=', '=='];
    const astroSymbols = ['✧', '✦', '★', '☆', '⋆', '✫', '✬', '✭', '✮', '✯', '✰', '⊛', '○', '◌', '◍', '◎', '●', '◐', '◑', '◒', '◓', '◔', '◕', '◖', '◗', '◘', '◙', '◚', '◛', '◜', '◝', '◞', '◟', '◠', '◡', '◢', '◣', '◤', '◥', '◦', '◧', '◨', '◩', '◪', '◫', '◬', '◭', '◮', '◯'];
    
    const symbolType = Math.random() > 0.6 ? 'code' : 'astro';
    
    if (symbolType === 'code') {
      return codeSymbols[Math.floor(Math.random() * codeSymbols.length)];
    } else {
      return astroSymbols[Math.floor(Math.random() * astroSymbols.length)];
    }
  }
  
  update(mouseX, mouseY) {
    // Pulsing effect for glowing particles
    if (this.glowing) {
      this.pulseAmount += this.pulseSpeed;
      if (this.pulseAmount > Math.PI * 2) {
        this.pulseAmount = 0;
      }
    }
    
    // Handle orbital movement if this is an orbiting particle
    if (this.isOrbiting) {
      this.angle += this.orbitSpeed;
      this.x = this.orbitCenterX + Math.cos(this.angle) * this.orbitRadius;
      this.y = this.orbitCenterY + Math.sin(this.angle) * this.orbitRadius;
      return; // Skip regular movement for orbiting particles
    }
    
    // Regular movement for non-orbiting particles
    this.x += this.speedX;
    this.y += this.speedY;
    
    // Boundary check - wrap around canvas
    if (this.x > this.canvas.width) this.x = 0;
    if (this.x < 0) this.x = this.canvas.width;
    if (this.y > this.canvas.height) this.y = 0;
    if (this.y < 0) this.y = this.canvas.height;
    
    // React to mouse if close enough
    if (mouseX && mouseY) {
      const dx = mouseX - this.x;
      const dy = mouseY - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 100) {
        // Create gentle repulsion effect
        const angle = Math.atan2(dy, dx);
        const force = (100 - distance) / 2000;
        
        this.speedX -= Math.cos(angle) * force;
        this.speedY -= Math.sin(angle) * force;
        
        // Add subtle variation
        this.opacity = Math.min(this.opacity + 0.01, 0.8);
        
        // Make particles glow when near mouse
        if (distance < 50) {
          this.glowing = true;
        }
      } else {
        // Return to normal state
        this.opacity = Math.max(this.opacity - 0.01, 0.1);
      }
    }
    
    // Apply drag to gradually slow particles
    this.speedX *= 0.99;
    this.speedY *= 0.99;
  }
  
  draw() {
    // Apply glowing effect
    let currentOpacity = this.opacity;
    let currentSize = this.size;
    
    if (this.glowing) {
      // Pulsing opacity for glowing effect
      const pulseOpacity = Math.sin(this.pulseAmount) * 0.2 + 0.8;
      currentOpacity = this.opacity * pulseOpacity;
      
      // Optional: slightly pulse the size too
      currentSize = this.size * (1 + Math.sin(this.pulseAmount) * 0.1);
      
      // Draw glow effect
      this.ctx.globalAlpha = currentOpacity * 0.3;
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = this.color;
    } else {
      this.ctx.shadowBlur = 0;
    }
    
    this.ctx.globalAlpha = currentOpacity;
    
    switch(this.type) {
      case 'circle':
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        break;
        
      case 'dot':
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, currentSize / 2, 0, Math.PI * 2);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        break;
        
      case 'square':
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.x - currentSize/2, this.y - currentSize/2, currentSize, currentSize);
        break;
        
      case 'symbol':
        this.ctx.font = `${Math.round(currentSize * 6)}px monospace`;
        this.ctx.fillStyle = this.color;
        this.ctx.fillText(this.text, this.x, this.y);
        break;
        
      case 'star':
        this.drawStar(currentSize);
        break;
        
      case 'planet':
        this.drawPlanet(currentSize);
        break;
    }
    
    // Reset shadow and opacity
    this.ctx.shadowBlur = 0;
    this.ctx.globalAlpha = 1;
  }
  
  drawStar(size) {
    const spikes = 5;
    const outerRadius = size;
    const innerRadius = size / 2;
    
    let rot = Math.PI / 2 * 3;
    let x = this.x;
    let y = this.y;
    let step = Math.PI / spikes;
    
    this.ctx.beginPath();
    this.ctx.moveTo(x, y - outerRadius);
    
    for (let i = 0; i < spikes; i++) {
      x = this.x + Math.cos(rot) * outerRadius;
      y = this.y + Math.sin(rot) * outerRadius;
      this.ctx.lineTo(x, y);
      rot += step;
      
      x = this.x + Math.cos(rot) * innerRadius;
      y = this.y + Math.sin(rot) * innerRadius;
      this.ctx.lineTo(x, y);
      rot += step;
    }
    
    this.ctx.lineTo(this.x, this.y - outerRadius);
    this.ctx.closePath();
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
  }
  
  drawPlanet(size) {
    // Draw the main planet
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
    
    // Draw a subtle ring for some planets
    if (Math.random() > 0.7) {
      this.ctx.beginPath();
      
      // Check if ellipse is supported (for older browsers)
      if (typeof this.ctx.ellipse === 'function') {
        this.ctx.ellipse(
          this.x, this.y, 
          size * 1.8, size * 0.5, 
          Math.random() * Math.PI, 
          0, Math.PI * 2
        );
      } else {
        // Fallback to circle if ellipse is not supported
        this.ctx.arc(this.x, this.y, size * 1.2, 0, Math.PI * 2);
      }
      
      this.ctx.strokeStyle = this.color;
      this.ctx.lineWidth = 0.5;
      this.ctx.stroke();
    }
  }
}

class ParticleSystem {
  constructor(selector, options = {}) {
    this.canvas = document.querySelector(selector);
    if (!this.canvas) {
      console.error(`Canvas element with selector ${selector} not found`);
      return;
    }
    
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.planetarySystems = []; // Array to hold planetary systems with orbiting particles
    this.mouseX = null;
    this.mouseY = null;
    this.isRunning = false;
    this.lastFrameTime = 0;
    this.fps = 60;
    
    // Configuration
    this.options = {
      particleCount: options.particleCount || 80,
      colors: options.colors || ['#777777', '#555555', '#cb450c'],
      maxSize: options.maxSize || 3,
      responsive: options.responsive !== false,
      connectParticles: options.connectParticles || false,
      connectionDistance: options.connectionDistance || 100,
      connectionOpacity: options.connectionOpacity || 0.25,
      includeAstronomyElements: options.includeAstronomyElements !== false,
      ...options
    };
    
    // Initialize
    this.init();
    this.setupEventListeners();
  }
  
  init() {
    // Set canvas size
    this.setCanvasSize();
    
    // Create particles
    this.createParticles();
    
    // Create planetary systems if astronomy elements are enabled
    if (this.options.includeAstronomyElements) {
      this.createPlanetarySystems();
    }
    
    // Start animation loop
    this.animate();
  }
  
  setCanvasSize() {
    if (this.options.responsive) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  }
  
  createPlanetarySystems() {
    // Create 1-3 planetary systems based on screen size
    const systemCount = Math.max(1, Math.min(3, Math.floor(this.canvas.width / 800)));
    
    for (let i = 0; i < systemCount; i++) {
      // Create a planetary system at a random position
      const centerX = Math.random() * this.canvas.width;
      const centerY = Math.random() * this.canvas.height;
      
      // Create a "sun" particle
      const sunColor = '#cb450c'; // Orange "sun"
      const sunSize = Math.random() * 2 + 3; // Slightly larger than regular particles
      
      const sun = new Particle(this.canvas, {
        x: centerX,
        y: centerY,
        size: sunSize,
        color: sunColor,
        type: 'circle',
        glowing: true
      });
      
      this.particles.push(sun);
      
      // Create 2-5 orbiting planets
      const planetCount = Math.floor(Math.random() * 4) + 2;
      
      for (let j = 0; j < planetCount; j++) {
        const orbitRadius = (j + 1) * (Math.random() * 15 + 15); // Increasing orbit radius
        const planetColor = this.options.colors[Math.floor(Math.random() * this.options.colors.length)];
        const planetSize = Math.random() * 1.5 + 1;
        
        // Create a planet particle that will orbit the sun
        const planet = new Particle(this.canvas, {
          size: planetSize,
          color: planetColor,
          type: Math.random() > 0.7 ? 'planet' : 'circle',
          isOrbiting: true,
          orbitCenterX: centerX,
          orbitCenterY: centerY,
          orbitRadius: orbitRadius,
          glowing: Math.random() > 0.7
        });
        
        this.particles.push(planet);
      }
    }
  }
  
  createParticles() {
    // Clear existing particles
    this.particles = [];
    
    // Create new set
    for (let i = 0; i < this.options.particleCount; i++) {
      const color = this.options.colors[Math.floor(Math.random() * this.options.colors.length)];
      const size = Math.random() * this.options.maxSize + 1;
      
      this.particles.push(new Particle(this.canvas, {
        color,
        size,
        opacity: Math.random() * 0.5 + 0.2
      }));
    }
  }
  
  setupEventListeners() {
    // Mouse movement
    window.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });
    
    // Resize handling
    if (this.options.responsive) {
      window.addEventListener('resize', () => {
        this.setCanvasSize();
        this.createParticles();
        
        if (this.options.includeAstronomyElements) {
          this.createPlanetarySystems();
        }
      });
    }
    
    // Touch events for mobile
    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.mouseX = e.touches[0].clientX;
        this.mouseY = e.touches[0].clientY;
      }
    });
    
    this.canvas.addEventListener('touchend', () => {
      this.mouseX = null;
      this.mouseY = null;
    });
  }
  
  draw() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw connections if enabled
    if (this.options.connectParticles) {
      this.drawConnections();
    }
    
    // Draw particles
    for (const particle of this.particles) {
      particle.draw();
    }
  }
  
  drawConnections() {
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.options.connectionDistance) {
          // Calculate opacity based on distance
          const opacity = 
            (1 - distance / this.options.connectionDistance) * 
            this.options.connectionOpacity;
          
          // Draw line
          this.ctx.beginPath();
          this.ctx.strokeStyle = `rgba(203, 69, 12, ${opacity})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
        }
      }
    }
  }
  
  update() {
    for (const particle of this.particles) {
      particle.update(this.mouseX, this.mouseY);
    }
  }
  
  animate(timestamp = 0) {
    this.isRunning = true;
    
    // Limit FPS for performance optimization
    const elapsed = timestamp - this.lastFrameTime;
    
    if (elapsed > 1000 / this.fps) {
      this.lastFrameTime = timestamp - (elapsed % (1000 / this.fps));
      
      this.update();
      this.draw();
    }
    
    requestAnimationFrame((time) => this.animate(time));
  }
  
  stop() {
    this.isRunning = false;
  }
  
  start() {
    if (!this.isRunning) {
      this.animate();
    }
  }
}

export default ParticleSystem; 
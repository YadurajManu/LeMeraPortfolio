/* eslint-disable no-undef */
// Three.js will be available globally via window.THREE

// Vertex shader for both wave and dither effects
const vertexShader = `
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Wave pattern fragment shader
const waveFragmentShader = `
  precision mediump float;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_waveSpeed;
  uniform float u_waveFrequency;
  uniform float u_waveAmplitude;
  uniform vec3 u_waveColor;
  uniform vec2 u_mouse;
  uniform float u_mouseRadius;
  uniform bool u_enableMouseInteraction;
  
  varying vec2 vUv;
  
  // Simple noise function
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }
  
  float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  
  float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = u_waveAmplitude;
    float frequency = u_waveFrequency;
    
    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(st * frequency);
      frequency *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }
  
  void main() {
    vec2 uv = vUv;
    vec2 st = uv * 3.0;
    
    // Animate the pattern
    vec2 q = vec2(0.0);
    q.x = fbm(st + 0.00 * u_time * u_waveSpeed);
    q.y = fbm(st + vec2(1.0));
    
    vec2 r = vec2(0.0);
    r.x = fbm(st + 1.0 * q + vec2(1.7, 9.2) + 0.15 * u_time * u_waveSpeed);
    r.y = fbm(st + 1.0 * q + vec2(8.3, 2.8) + 0.126 * u_time * u_waveSpeed);
    
    float f = fbm(st + r);
    
    // Mouse interaction
    if (u_enableMouseInteraction) {
      vec2 mouseNorm = u_mouse / u_resolution;
      float dist = distance(uv, mouseNorm);
      float mouseEffect = 1.0 - smoothstep(0.0, u_mouseRadius, dist);
      f += mouseEffect * 0.3;
    }
    
    vec3 color = mix(vec3(0.0), u_waveColor, f);
    gl_FragColor = vec4(color, 1.0);
  }
`;

// Dither effect fragment shader
const ditherFragmentShader = `
  precision mediump float;
  uniform sampler2D u_texture;
  uniform vec2 u_resolution;
  uniform float u_colorLevels;
  uniform float u_pixelSize;
  
  varying vec2 vUv;
  
  // 4x4 Bayer matrix for dithering
  float bayerMatrix4x4[16] = float[16](
    0.0/16.0,  8.0/16.0,  2.0/16.0,  10.0/16.0,
    12.0/16.0, 4.0/16.0,  14.0/16.0, 6.0/16.0,
    3.0/16.0,  11.0/16.0, 1.0/16.0,  9.0/16.0,
    15.0/16.0, 7.0/16.0,  13.0/16.0, 5.0/16.0
  );
  
  vec3 dither(vec3 color, vec2 uv) {
    ivec2 pixelCoord = ivec2(floor(uv * u_resolution / u_pixelSize));
    int x = pixelCoord.x % 4;
    int y = pixelCoord.y % 4;
    float threshold = bayerMatrix4x4[y * 4 + x];
    
    color += (threshold - 0.5) / u_colorLevels;
    return floor(color * u_colorLevels) / u_colorLevels;
  }
  
  void main() {
    vec2 pixelUv = floor(vUv * u_resolution / u_pixelSize) * u_pixelSize / u_resolution;
    vec4 color = texture2D(u_texture, pixelUv);
    
    color.rgb = dither(color.rgb, vUv);
    gl_FragColor = color;
  }
`;

export default class DitheredWaveBackground {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    
    if (!this.container) {
      throw new Error('Container not found');
    }

    this.options = {
      waveSpeed: 0.05,
      waveFrequency: 3.0,
      waveAmplitude: 0.3,
      waveColor: [0.5, 0.5, 0.5],
      colorNum: 4,
      pixelSize: 2,
      disableAnimation: false,
      enableMouseInteraction: true,
      mouseRadius: 0.3,
      opacity: 0.7,
      ...options
    };

    this.mouse = new THREE.Vector2(0, 0);
    this.time = 0;
    this.isAnimating = false;
    this.animationId = null;

    // Check WebGL support
    if (!this.checkWebGLSupport()) {
      throw new Error('WebGL not supported');
    }

    this.init();
  }

  checkWebGLSupport() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!gl;
    } catch (e) {
      return false;
    }
  }

  init() {
    this.setupRenderer();
    this.createScene();
    this.createWaveMaterial();
    this.createDitherMaterial();
    this.setupRenderTargets();
    this.setupEventListeners();
    this.resize();
    this.start();
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: 'default'
    });
    
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    
    // Style the canvas
    this.renderer.domElement.style.position = 'absolute';
    this.renderer.domElement.style.top = '0';
    this.renderer.domElement.style.left = '0';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.zIndex = '-1';
    this.renderer.domElement.style.pointerEvents = 'none';
    this.renderer.domElement.style.opacity = this.options.opacity;
    
    this.container.appendChild(this.renderer.domElement);
  }

  createScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    // Create fullscreen quad geometry using PlaneGeometry
    this.quadGeometry = new THREE.PlaneGeometry(2, 2);
  }

  createWaveMaterial() {
    this.waveUniforms = {
      u_resolution: { value: new THREE.Vector2() },
      u_time: { value: 0 },
      u_waveSpeed: { value: this.options.waveSpeed },
      u_waveFrequency: { value: this.options.waveFrequency },
      u_waveAmplitude: { value: this.options.waveAmplitude },
      u_waveColor: { value: new THREE.Vector3(...this.options.waveColor) },
      u_mouse: { value: new THREE.Vector2() },
      u_mouseRadius: { value: this.options.mouseRadius },
      u_enableMouseInteraction: { value: this.options.enableMouseInteraction }
    };

    this.waveMaterial = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: waveFragmentShader,
      uniforms: this.waveUniforms,
      transparent: true
    });

    this.waveMesh = new THREE.Mesh(this.quadGeometry, this.waveMaterial);
    this.scene.add(this.waveMesh);
  }

  createDitherMaterial() {
    this.ditherUniforms = {
      u_texture: { value: null },
      u_resolution: { value: new THREE.Vector2() },
      u_colorLevels: { value: this.options.colorNum },
      u_pixelSize: { value: this.options.pixelSize }
    };

    this.ditherMaterial = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: ditherFragmentShader,
      uniforms: this.ditherUniforms,
      transparent: true
    });

    this.ditherMesh = new THREE.Mesh(this.quadGeometry, this.ditherMaterial);
  }

  setupRenderTargets() {
    const width = Math.max(this.container.clientWidth, 1);
    const height = Math.max(this.container.clientHeight, 1);
    
    this.waveTarget = new THREE.WebGLRenderTarget(width, height, {
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      generateMipmaps: false
    });
  }

  setupEventListeners() {
    if (this.options.enableMouseInteraction) {
      this.container.addEventListener('mousemove', this.onMouseMove.bind(this));
      this.container.addEventListener('touchmove', this.onTouchMove.bind(this));
    }

    window.addEventListener('resize', this.resize.bind(this));
  }

  onMouseMove(event) {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = event.clientX - rect.left;
    this.mouse.y = rect.height - (event.clientY - rect.top); // Flip Y coordinate
    this.waveUniforms.u_mouse.value.copy(this.mouse);
  }

  onTouchMove(event) {
    if (event.touches.length > 0) {
      const rect = this.container.getBoundingClientRect();
      this.mouse.x = event.touches[0].clientX - rect.left;
      this.mouse.y = rect.height - (event.touches[0].clientY - rect.top);
      this.waveUniforms.u_mouse.value.copy(this.mouse);
    }
  }

  resize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.renderer.setSize(width, height);
    
    this.waveUniforms.u_resolution.value.set(width, height);
    this.ditherUniforms.u_resolution.value.set(width, height);
    
    if (this.waveTarget) {
      this.waveTarget.setSize(width, height);
    }
  }

  updateUniforms() {
    this.waveUniforms.u_waveSpeed.value = this.options.waveSpeed;
    this.waveUniforms.u_waveFrequency.value = this.options.waveFrequency;
    this.waveUniforms.u_waveAmplitude.value = this.options.waveAmplitude;
    this.waveUniforms.u_waveColor.value.set(...this.options.waveColor);
    this.waveUniforms.u_mouseRadius.value = this.options.mouseRadius;
    this.waveUniforms.u_enableMouseInteraction.value = this.options.enableMouseInteraction;
    
    this.ditherUniforms.u_colorLevels.value = this.options.colorNum;
    this.ditherUniforms.u_pixelSize.value = this.options.pixelSize;
  }

  render() {
    if (!this.options.disableAnimation) {
      this.time += 0.016; // 60fps target
      this.waveUniforms.u_time.value = this.time;
    }

    this.updateUniforms();

    // Render wave pattern to texture
    this.renderer.setRenderTarget(this.waveTarget);
    this.renderer.render(this.scene, this.camera);

    // Apply dither effect
    this.ditherUniforms.u_texture.value = this.waveTarget.texture;
    
    // Create temporary scene for dither pass
    const ditherScene = new THREE.Scene();
    ditherScene.add(this.ditherMesh);
    
    // Render final result to screen
    this.renderer.setRenderTarget(null);
    this.renderer.render(ditherScene, this.camera);
  }

  animate() {
    if (this.isAnimating) {
      this.render();
      this.animationId = requestAnimationFrame(this.animate.bind(this));
    }
  }

  start() {
    this.isAnimating = true;
    this.animate();
  }

  stop() {
    this.isAnimating = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
    this.updateUniforms();
    this.renderer.domElement.style.opacity = this.options.opacity;
  }

  destroy() {
    this.stop();
    
    // Remove event listeners
    if (this.options.enableMouseInteraction) {
      this.container.removeEventListener('mousemove', this.onMouseMove);
      this.container.removeEventListener('touchmove', this.onTouchMove);
    }
    window.removeEventListener('resize', this.resize);

    // Dispose of Three.js objects
    if (this.quadGeometry) this.quadGeometry.dispose();
    if (this.waveMaterial) this.waveMaterial.dispose();
    if (this.ditherMaterial) this.ditherMaterial.dispose();
    if (this.waveTarget) this.waveTarget.dispose();
    if (this.renderer) this.renderer.dispose();

    // Remove canvas
    if (this.container && this.renderer.domElement.parentNode) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
} 
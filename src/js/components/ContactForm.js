// Contact Form Component - Custom Backend Email Sending
import { trackContactForm, trackEmailCopy, trackSocialClick } from '../utils/analytics';

class ContactForm {
  constructor() {
    this.form = document.getElementById('contactForm');
    this.submitBtn = document.getElementById('submitBtn');
    this.successMessage = document.getElementById('successMessage');
    
    // Backend API endpoint - automatically detects environment
    this.apiEndpoint = window.location.hostname === 'localhost' 
      ? 'http://localhost:3001/api/contact'
      : 'https://api.yaduraj.me/api/contact';
    
    if (this.form) {
      this.init();
    }
  }

  init() {
    this.bindEvents();
    this.initTypingAnimation();
    this.initFormValidation();
    this.initGSAPAnimations();
    this.initSocialTracking();
  }



  bindEvents() {
    // Form submission
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    // Track form start
    let formStarted = false;
    
    // Real-time validation
    const inputs = this.form.querySelectorAll('.form__input, .form__textarea, .form__select');
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearError(input));
      input.addEventListener('focus', (e) => {
        this.handleInputFocus(input);
        
        // Track form start on first interaction
        if (!formStarted) {
          formStarted = true;
          try {
            trackContactForm('started', {
              first_field: e.target.name || e.target.id
            });
          } catch (error) {
            console.log('Failed to track form start:', error);
          }
        }
      });
    });

    // Copy email functionality
    window.copyEmail = (event) => this.copyEmail(event);
  }

  initGSAPAnimations() {
    // Animate contact section elements on scroll
    if (window.gsap && window.ScrollTrigger) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.home__contact',
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse'
        }
      });

      // Animate header elements
      tl.from('.contact__title', {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out'
      })
      .from('.contact__subtitle', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out'
      }, '-=0.4')
      .from('.contact__response-time', {
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out'
      }, '-=0.3');

      // Animate form elements
      gsap.from('.form__group', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.contact__form',
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      });

      // Animate contact methods
      gsap.from('.method__item', {
        x: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.contact__methods',
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      });
    }
  }

  initTypingAnimation() {
    const typingText = document.querySelector('.typing-text');
    if (typingText) {
      const text = typingText.textContent;
      typingText.textContent = '';
      
      let i = 0;
      const typeWriter = () => {
        if (i < text.length) {
          typingText.textContent += text.charAt(i);
          i++;
          setTimeout(typeWriter, 80);
        }
      };
      
      // Start typing animation after a delay
      setTimeout(typeWriter, 800);
    }
  }

  handleInputFocus(input) {
    // Add subtle animation on focus
    if (window.gsap) {
      gsap.to(input, {
        scale: 1.02,
        duration: 0.2,
        ease: 'power2.out'
      });
      
      // Reset scale on blur
      input.addEventListener('blur', () => {
        gsap.to(input, {
          scale: 1,
          duration: 0.2,
          ease: 'power2.out'
        });
      }, { once: true });
    }
  }

  initFormValidation() {
    // Add custom validation messages
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');

    if (nameInput) {
      nameInput.addEventListener('invalid', () => {
        nameInput.setCustomValidity('Please enter your full name');
      });
      nameInput.addEventListener('input', () => {
        nameInput.setCustomValidity('');
      });
    }

    if (emailInput) {
      emailInput.addEventListener('invalid', () => {
        emailInput.setCustomValidity('Please enter a valid email address');
      });
      emailInput.addEventListener('input', () => {
        emailInput.setCustomValidity('');
      });
    }
  }

  initSocialTracking() {
    // Track social media clicks in contact section
    const socialLinks = document.querySelectorAll('.method__item[href*="linkedin"], .method__item[href*="github"], .method__item[href*="wa.me"], a[href*="instagram"], a[href*="github"], a[href*="linkedin"], a[href*="wa.me"]');
    
    socialLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href') || '';
        let platform = 'unknown';
        
        if (href.includes('linkedin')) {
          platform = 'linkedin';
        } else if (href.includes('github')) {
          platform = 'github';
        } else if (href.includes('instagram')) {
          platform = 'instagram';
        } else if (href.includes('twitter')) {
          platform = 'twitter';
        } else if (href.includes('wa.me') || href.includes('whatsapp')) {
          platform = 'whatsapp';
        }
        
        try {
          trackSocialClick(platform, href);
        } catch (error) {
          console.log('Failed to track social click:', error);
        }
      });
    });
  }

  validateField(field) {
    const errorElement = document.getElementById(field.name + 'Error');
    let isValid = true;
    let errorMessage = '';

    // Clear previous error state
    field.classList.remove('error');
    if (errorElement) {
      errorElement.classList.remove('show');
      errorElement.textContent = '';
    }

    // Validate based on field type
    switch (field.type) {
      case 'text':
        if (field.value.trim().length < 2) {
          errorMessage = 'Name must be at least 2 characters';
          isValid = false;
        }
        break;
      
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(field.value)) {
          errorMessage = 'Please enter a valid email';
          isValid = false;
        }
        break;
      
      case 'select-one':
        if (!field.value) {
          errorMessage = 'Please select an option';
          isValid = false;
        }
        break;
      
      case 'textarea':
        if (field.value.trim().length < 10) {
          errorMessage = 'Please provide more details';
          isValid = false;
        }
        break;
    }

    // Show error if validation failed
    if (!isValid) {
      field.classList.add('error');
      if (errorElement) {
        errorElement.textContent = errorMessage;
        errorElement.classList.add('show');
        
        // Animate error message
        if (window.gsap) {
          gsap.from(errorElement, {
            y: -10,
            opacity: 0,
            duration: 0.3,
            ease: 'power2.out'
          });
        }
      }
    }

    return isValid;
  }

  clearError(field) {
    const errorElement = document.getElementById(field.name + 'Error');
    field.classList.remove('error');
    if (errorElement) {
      errorElement.classList.remove('show');
    }
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    // Validate all fields
    const inputs = this.form.querySelectorAll('.form__input, .form__textarea, .form__select');
    let isFormValid = true;
    
    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isFormValid = false;
      }
    });

    if (!isFormValid) {
      this.showFormErrors();
      return;
    }

    // Show loading state
    this.setSubmitState('loading');

    try {
      // Send email using custom backend
      await this.submitForm();
      
      // Get form data for tracking
      const formData = new FormData(this.form);
      
      // Track successful form submission
      try {
        trackContactForm('submitted', {
          projectType: formData.get('projectType'),
          budget: formData.get('budget'),
          name: formData.get('name') ? 'provided' : 'missing',
          email: formData.get('email') ? 'provided' : 'missing',
          message_length: formData.get('message')?.length || 0
        });
      } catch (trackError) {
        console.log('Analytics tracking failed:', trackError);
      }
      
      // Show success state
      this.setSubmitState('success');
      
      // Show success message
      this.showSuccessMessage();
      
      // Reset form after delay
      setTimeout(() => {
        this.resetForm();
      }, 4000);
      
    } catch (error) {
      console.error('Form submission error:', error);
      this.setSubmitState('error');
      this.showErrorMessage('Failed to send message. Please try again.');
    }
  }

    async submitForm() {
    // Prepare form data for backend
    const formData = new FormData(this.form);
    const emailData = {
      name: formData.get('name'),
      email: formData.get('email'),
      company: formData.get('company') || '', // Optional field
      projectType: formData.get('projectType'),
      budget: formData.get('budget'),
      message: formData.get('message')
    };

    console.log('Sending to backend:', emailData);

    // Send to custom backend
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Email sent successfully:', result);
      return result;
    } catch (error) {
      console.error('Backend error:', error);
      throw error;
    }
  }

  setSubmitState(state) {
    this.submitBtn.classList.remove('loading', 'success', 'error');
    
    switch (state) {
      case 'loading':
        this.submitBtn.classList.add('loading');
        this.submitBtn.disabled = true;
        break;
      
      case 'success':
        this.submitBtn.classList.add('success');
        this.submitBtn.disabled = true;
        break;
      
      case 'error':
        this.submitBtn.disabled = false;
        break;
      
      default:
        this.submitBtn.disabled = false;
    }
  }

  showSuccessMessage() {
    this.successMessage.classList.add('show');
    
    // Animate success message with GSAP
    if (window.gsap) {
      gsap.from(this.successMessage, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out'
      });
    }
  }

  showErrorMessage(message) {
    // Create and show error message with website styling
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form__error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
      color: #ff4444;
      margin-top: 1.6rem;
      padding: 1.6rem 0;
      border-top: 1px solid #ff4444;
      text-transform: uppercase;
      font-size: 1.2rem;
      letter-spacing: 0.05em;
    `;
    
    this.form.appendChild(errorDiv);
    
    // Animate error message
    if (window.gsap) {
      gsap.from(errorDiv, {
        y: 20,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
    
    // Remove error message after 5 seconds
    setTimeout(() => {
      if (window.gsap) {
        gsap.to(errorDiv, {
          y: -20,
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out',
          onComplete: () => errorDiv.remove()
        });
      } else {
        errorDiv.remove();
      }
    }, 5000);
  }

  showFormErrors() {
    // Scroll to first error
    const firstError = this.form.querySelector('.form__input.error, .form__textarea.error, .form__select.error');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstError.focus();
    }
  }

  resetForm() {
    this.form.reset();
    this.setSubmitState('default');
    this.successMessage.classList.remove('show');
    
    // Clear all error states
    const inputs = this.form.querySelectorAll('.form__input, .form__textarea, .form__select');
    inputs.forEach(input => {
      this.clearError(input);
    });
  }

  copyEmail(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const email = 'yadurajsingham@gmail.com';
    
    // Modern clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(email).then(() => {
        this.showCopySuccess(event.target);
      }).catch(() => {
        this.fallbackCopyEmail(email, event.target);
      });
    } else {
      this.fallbackCopyEmail(email, event.target);
    }
  }

  fallbackCopyEmail(email, target) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = email;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      this.showCopySuccess(target);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
    
    document.body.removeChild(textArea);
  }

  showCopySuccess(target) {
    // Track email copy event
    try {
      trackEmailCopy('copy_button');
    } catch (trackError) {
      console.log('Analytics tracking failed:', trackError);
    }
    
    const copyButton = target.closest('.method__copy');
    if (copyButton) {
      const originalHTML = copyButton.innerHTML;
      copyButton.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
      copyButton.style.borderColor = '#cb450c';
      copyButton.style.color = '#cb450c';
      
      // Animate the success state
      if (window.gsap) {
        gsap.to(copyButton, {
          scale: 1.2,
          duration: 0.2,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1
        });
      }
      
      setTimeout(() => {
        copyButton.innerHTML = originalHTML;
        copyButton.style.borderColor = '';
        copyButton.style.color = '';
      }, 2000);
    }
    
    // Show toast notification
    this.showToast('Email copied to clipboard!');
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: #cb450c;
      color: white;
      padding: 1.2rem 2rem;
      border-radius: 4px;
      font-size: 1.2rem;
      font-weight: 500;
      z-index: 10000;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    `;
    
    document.body.appendChild(toast);
    
    // Animate toast with GSAP
    if (window.gsap) {
      gsap.from(toast, {
        y: 50,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out'
      });
      
      setTimeout(() => {
        gsap.to(toast, {
          y: 50,
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out',
          onComplete: () => toast.remove()
        });
      }, 3000);
    } else {
      setTimeout(() => {
        toast.remove();
      }, 3000);
    }
  }
}

// Initialize contact form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ContactForm();
});

export default ContactForm; 
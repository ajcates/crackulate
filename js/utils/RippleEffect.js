/**
 * Material 3 Expressive Ripple Effect Utility
 * Implements M3 expressive design guidelines with unbounded ripples for icon buttons
 */
export class RippleEffect {
  /**
   * Initialize ripple effects on specified elements
   * @param {string|NodeList|HTMLElement} selector - CSS selector, NodeList, or single element
   * @param {Object} options - Ripple configuration
   * @param {boolean} options.unbounded - Use unbounded ripple (default: true for icon buttons)
   */
  static init(selector, options = { unbounded: true }) {
    let elements;

    if (typeof selector === 'string') {
      elements = document.querySelectorAll(selector);
    } else if (selector instanceof NodeList) {
      elements = selector;
    } else if (selector instanceof HTMLElement) {
      elements = [selector];
    } else {
      console.warn('Invalid selector for RippleEffect.init()');
      return;
    }

    elements.forEach(element => {
      this.#addRippleToElement(element, options);
    });
  }

  /**
   * Add ripple effect to a single element
   * @param {HTMLElement} element
   * @param {Object} options
   * @private
   */
  static #addRippleToElement(element, options) {
    // Avoid double-initialization
    if (element.dataset.rippleInitialized) {
      return;
    }

    element.dataset.rippleInitialized = 'true';

    // Store unbounded preference
    if (options.unbounded) {
      element.dataset.rippleUnbounded = 'true';
    }

    // Add ripple on pointer down
    element.addEventListener('pointerdown', (e) => {
      this.#createRipple(element, e, options.unbounded);
    });
  }

  /**
   * Create and animate a ripple at the click position
   * M3 Expressive: Unbounded ripples for icon buttons with emphasized motion
   * @param {HTMLElement} element
   * @param {PointerEvent} event
   * @param {boolean} unbounded - Whether ripple extends beyond element bounds
   * @private
   */
  static #createRipple(element, event, unbounded = true) {
    // Don't create ripple if disabled
    if (element.disabled) {
      return;
    }

    // Create ripple element
    const ripple = document.createElement('span');
    ripple.classList.add('m3-ripple');
    if (unbounded) {
      ripple.classList.add('m3-ripple-unbounded');
    }

    // Get element dimensions
    const rect = element.getBoundingClientRect();

    // Calculate ripple size
    // For unbounded: ripple is larger than the element (M3 expressive spec)
    // For bounded: ripple fits within element
    let size;
    if (unbounded) {
      // Unbounded ripple is 2.5x the element size for expressive effect
      size = Math.max(rect.width, rect.height) * 2.5;
    } else {
      // Bounded ripple covers diagonal distance
      const diagonal = Math.sqrt(rect.width ** 2 + rect.height ** 2);
      size = diagonal * 2;
    }

    // Calculate ripple position (centered on click point)
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    // Apply size and position
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    // Add ripple to element
    element.appendChild(ripple);

    // Force animation to start
    requestAnimationFrame(() => {
      ripple.style.animation = 'm3-ripple-expressive 500ms ease-out';
    });

    // Remove ripple after animation completes
    const removeRipple = () => {
      if (ripple && ripple.parentNode) {
        ripple.remove();
      }
    };

    // Use timeout for reliable cleanup (animationend can be unreliable)
    setTimeout(removeRipple, 550);
  }

  /**
   * Remove ripple effect from element
   * @param {HTMLElement} element
   */
  static remove(element) {
    delete element.dataset.rippleInitialized;
    delete element.dataset.rippleUnbounded;
    // Note: Event listeners will be cleaned up when element is removed from DOM
  }

  /**
   * Create a ripple programmatically at center of element
   * Useful for keyboard activation (Enter/Space)
   * @param {HTMLElement} element
   */
  static trigger(element) {
    const unbounded = element.dataset.rippleUnbounded === 'true';
    const ripple = document.createElement('span');
    ripple.classList.add('m3-ripple');
    if (unbounded) {
      ripple.classList.add('m3-ripple-unbounded');
    }

    // Center the ripple
    const rect = element.getBoundingClientRect();
    let size;
    if (unbounded) {
      size = Math.max(rect.width, rect.height) * 2.5;
    } else {
      const diagonal = Math.sqrt(rect.width ** 2 + rect.height ** 2);
      size = diagonal * 2;
    }

    const x = rect.width / 2 - size / 2;
    const y = rect.height / 2 - size / 2;

    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    element.appendChild(ripple);

    // Force animation to start
    requestAnimationFrame(() => {
      ripple.style.animation = 'm3-ripple-expressive 500ms ease-out';
    });

    // Remove ripple after animation completes
    const removeRipple = () => {
      if (ripple && ripple.parentNode) {
        ripple.remove();
      }
    };

    setTimeout(removeRipple, 550);
  }
}

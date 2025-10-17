/**
 * Material 3 Ripple Effect Utility
 * Adds authentic M3 ripple animations to buttons and interactive elements
 */
export class RippleEffect {
  /**
   * Initialize ripple effects on specified elements
   * @param {string|NodeList|HTMLElement} selector - CSS selector, NodeList, or single element
   */
  static init(selector) {
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
      this.#addRippleToElement(element);
    });
  }

  /**
   * Add ripple effect to a single element
   * @param {HTMLElement} element
   * @private
   */
  static #addRippleToElement(element) {
    // Avoid double-initialization
    if (element.dataset.rippleInitialized) {
      return;
    }

    element.dataset.rippleInitialized = 'true';

    // Add ripple on click/touch
    element.addEventListener('pointerdown', (e) => {
      this.#createRipple(element, e);
    });
  }

  /**
   * Create and animate a ripple at the click position
   * @param {HTMLElement} element
   * @param {PointerEvent} event
   * @private
   */
  static #createRipple(element, event) {
    // Don't create ripple if disabled
    if (element.disabled) {
      return;
    }

    // Create ripple element
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');

    // Calculate ripple size and position
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    // Position and size the ripple
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    // Add ripple to element
    element.appendChild(ripple);

    // Remove ripple after animation completes (500ms from CSS)
    setTimeout(() => {
      ripple.remove();
    }, 500);
  }

  /**
   * Remove ripple effect from element
   * @param {HTMLElement} element
   */
  static remove(element) {
    delete element.dataset.rippleInitialized;
    // Note: Event listeners will be cleaned up when element is removed from DOM
  }

  /**
   * Create a ripple programmatically at center of element
   * Useful for keyboard activation (Enter/Space)
   * @param {HTMLElement} element
   */
  static trigger(element) {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');

    // Center the ripple
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = rect.width / 2 - size / 2;
    const y = rect.height / 2 - size / 2;

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    element.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 500);
  }
}

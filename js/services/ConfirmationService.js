/**
 * Confirmation Service - Handles user confirmations
 * High cohesion: Only responsible for confirmation dialogs
 */
export class ConfirmationService {
  #modal;
  #elements;
  #currentResolver = null;
  
  constructor() {
    this.#initializeModal();
  }
  
  /**
   * Initialize confirmation modal
   */
  #initializeModal() {
    this.#modal = document.getElementById('confirm-modal');
    
    if (!this.#modal) {
      throw new Error('Confirmation modal not found in DOM');
    }
    
    this.#elements = {
      title: document.getElementById('confirm-title'),
      message: document.getElementById('confirm-message'),
      yesBtn: document.getElementById('confirm-yes'),
      noBtn: document.getElementById('confirm-no')
    };
    
    this.#bindEvents();
  }
  
  /**
   * Bind modal events
   */
  #bindEvents() {
    this.#elements.yesBtn.addEventListener('click', () => {
      this.#resolve(true);
    });
    
    this.#elements.noBtn.addEventListener('click', () => {
      this.#resolve(false);
    });
    
    this.#modal.addEventListener('click', (e) => {
      if (e.target === this.#modal) {
        this.#resolve(false);
      }
    });
  }
  
  /**
   * Show confirmation dialog
   */
  async confirm(title, message, options = {}) {
    const {
      confirmText = 'Yes',
      cancelText = 'No'
    } = options;
    
    this.#elements.title.textContent = title;
    this.#elements.message.textContent = message;
    this.#elements.yesBtn.textContent = confirmText;
    this.#elements.noBtn.textContent = cancelText;
    
    this.#show();
    
    return new Promise((resolve) => {
      this.#currentResolver = resolve;
    });
  }
  
  /**
   * Show the modal
   */
  #show() {
    this.#modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
  }
  
  /**
   * Hide the modal
   */
  #hide() {
    this.#modal.classList.add('hidden');
    document.body.classList.remove('modal-open');
  }
  
  /**
   * Resolve current confirmation
   */
  #resolve(result) {
    if (this.#currentResolver) {
      this.#currentResolver(result);
      this.#currentResolver = null;
    }
    
    this.#hide();
  }
}
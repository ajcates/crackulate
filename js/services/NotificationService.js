/**
 * Notification Service - Handles user notifications
 * High cohesion: Only responsible for showing notifications
 */
export class NotificationService {
  #container;
  #notifications = new Set();
  
  constructor() {
    this.#ensureContainer();
  }
  
  /**
   * Ensure notification container exists
   */
  #ensureContainer() {
    this.#container = document.getElementById('notification-container');
    
    if (!this.#container) {
      this.#container = document.createElement('div');
      this.#container.id = 'notification-container';
      this.#container.className = 'notification-container';
      document.body.appendChild(this.#container);
    }
  }
  
  /**
   * Show success notification
   */
  async success(message, duration = 3000) {
    return this.#showNotification(message, 'success', duration);
  }
  
  /**
   * Show error notification
   */
  async error(message, duration = 5000) {
    return this.#showNotification(message, 'error', duration);
  }
  
  /**
   * Show notification with custom type
   */
  async #showNotification(message, type, duration) {
    const notification = this.#createNotificationElement(message, type);
    
    this.#container.appendChild(notification);
    this.#notifications.add(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto-remove after duration
    setTimeout(async () => {
      await this.#removeNotification(notification);
    }, duration);
    
    notification.addEventListener('click', async () => {
      await this.#removeNotification(notification);
    });
  }
  
  /**
   * Create notification DOM element
   */
  #createNotificationElement(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    
    const icon = type === 'success' ? '✅' : '❌';
    
    notification.innerHTML = `
      <span class="notification-icon">${icon}</span>
      <span class="notification-message">${this.#escapeHtml(message)}</span>
      <button class="notification-close">×</button>
    `;
    
    return notification;
  }
  
  /**
   * Remove notification
   */
  async #removeNotification(notification) {
    if (!this.#notifications.has(notification)) return;
    
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
      this.#notifications.delete(notification);
    }, 300);
  }
  
  /**
   * Escape HTML characters
   */
  #escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  /**
   * Clean up resources
   */
  destroy() {
    if (this.#container?.parentNode) {
      this.#container.parentNode.removeChild(this.#container);
    }
  }
}
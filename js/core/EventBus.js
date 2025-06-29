/**
 * Modern Event Bus implementation using ES2022+ features
 * Provides loose coupling between application components
 */
export class EventBus {
  #listeners = new Map();
  
  /**
   * Subscribe to an event with callback
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(event, callback) {
    if (!this.#listeners.has(event)) {
      this.#listeners.set(event, new Set());
    }
    this.#listeners.get(event).add(callback);
    
    // Return unsubscribe function for cleanup
    return () => this.#listeners.get(event)?.delete(callback);
  }
  
  /**
   * Emit event with data to all subscribers
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  async emit(event, data) {
    const callbacks = this.#listeners.get(event);
    if (!callbacks) return;
    
    // Execute all callbacks in parallel
    await Promise.allSettled(
      [...callbacks].map(callback => {
        try {
          return Promise.resolve(callback(data));
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
          return Promise.reject(error);
        }
      })
    );
  }
  
  /**
   * Get count of subscribers for an event
   * @param {string} event - Event name
   * @returns {number} Number of subscribers
   */
  getSubscriberCount(event) {
    return this.#listeners.get(event)?.size ?? 0;
  }
  
  /**
   * Clear all subscribers for an event
   * @param {string} event - Event name
   */
  clear(event) {
    if (event) {
      this.#listeners.delete(event);
    } else {
      this.#listeners.clear();
    }
  }
}

// Global event bus instance
export const eventBus = new EventBus();
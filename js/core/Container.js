/**
 * Dependency Injection Container
 * Manages service registration and resolution with singleton support
 */
export class DIContainer {
  #services = new Map();
  #singletons = new Map();
  #resolving = new Set();
  
  /**
   * Register a service with the container
   * @param {string} name - Service name
   * @param {Function} factory - Factory function that creates the service
   * @param {Object} options - Options including singleton flag
   */
  register(name, factory, options = { singleton: false }) {
    if (typeof factory !== 'function') {
      throw new Error(`Factory for service ${name} must be a function`);
    }
    
    this.#services.set(name, { factory, options });
  }
  
  /**
   * Register a singleton service
   * @param {string} name - Service name
   * @param {Function} factory - Factory function
   */
  registerSingleton(name, factory) {
    this.register(name, factory, { singleton: true });
  }
  
  /**
   * Register an instance as a singleton
   * @param {string} name - Service name
   * @param {*} instance - Service instance
   */
  registerInstance(name, instance) {
    this.#singletons.set(name, instance);
  }
  
  /**
   * Resolve a service by name
   * @param {string} name - Service name
   * @returns {*} Service instance
   */
  resolve(name) {
    // Check for circular dependencies
    if (this.#resolving.has(name)) {
      throw new Error(`Circular dependency detected: ${name}`);
    }
    
    // Check for registered instances first
    if (this.#singletons.has(name)) {
      return this.#singletons.get(name);
    }
    
    const service = this.#services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not found`);
    }
    
    // Return singleton if already created
    if (service.options.singleton && this.#singletons.has(name)) {
      return this.#singletons.get(name);
    }
    
    try {
      this.#resolving.add(name);
      const instance = service.factory(this);
      
      // Cache singleton instances
      if (service.options.singleton) {
        this.#singletons.set(name, instance);
      }
      
      return instance;
    } finally {
      this.#resolving.delete(name);
    }
  }
  
  /**
   * Check if service is registered
   * @param {string} name - Service name
   * @returns {boolean} True if registered
   */
  has(name) {
    return this.#services.has(name) || this.#singletons.has(name);
  }
  
  /**
   * Clear all services and singletons
   */
  clear() {
    this.#services.clear();
    this.#singletons.clear();
    this.#resolving.clear();
  }
  
  /**
   * Get list of registered service names
   * @returns {string[]} Service names
   */
  getServiceNames() {
    return [...this.#services.keys(), ...this.#singletons.keys()];
  }
}
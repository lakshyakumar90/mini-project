import { lazy } from 'react';

/**
 * Enhanced lazy loading utility that supports preloading
 * @param {Function} importFunc - Dynamic import function
 * @param {Object} options - Additional options
 * @returns {React.LazyExoticComponent} - Lazy loaded component with preload method
 */
export const lazyLoad = (importFunc, options = {}) => {
  const LazyComponent = lazy(importFunc);
  
  // Add preload method to the lazy component
  LazyComponent.preload = importFunc;
  
  return LazyComponent;
};

/**
 * Preload multiple components in advance
 * @param {Array} components - Array of lazy components created with lazyLoad
 */
export const preloadComponents = (components) => {
  components.forEach(component => {
    if (component.preload) {
      component.preload();
    }
  });
};

export default lazyLoad;

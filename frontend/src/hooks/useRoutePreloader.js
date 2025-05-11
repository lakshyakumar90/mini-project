import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { preloadComponents } from '@/utils/lazyLoad';

/**
 * A custom hook that preloads components based on the current route
 * @param {Object} routeMap - Map of routes to components that should be preloaded
 */
const useRoutePreloader = (routeMap) => {
  const location = useLocation();
  
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Find matching routes and preload their components
    Object.entries(routeMap).forEach(([route, components]) => {
      if (currentPath.startsWith(route)) {
        preloadComponents(components);
      }
    });
  }, [location.pathname, routeMap]);
};

export default useRoutePreloader;

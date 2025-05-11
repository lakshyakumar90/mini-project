import useRoutePreloader from '@/hooks/useRoutePreloader';

/**
 * Component that preloads routes based on the current path
 * @param {Object} props - Component props
 * @param {Object} props.routeMap - Map of routes to components that should be preloaded
 */
const RoutePreloader = ({ routeMap }) => {
  // Use the custom hook to preload components
  useRoutePreloader(routeMap);
  
  // This component doesn't render anything
  return null;
};

export default RoutePreloader;

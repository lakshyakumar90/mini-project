import useRoutePreloader from '@/hooks/useRoutePreloader';

const RoutePreloader = ({ routeMap }) => {
  useRoutePreloader(routeMap);
  return null;
};

export default RoutePreloader;

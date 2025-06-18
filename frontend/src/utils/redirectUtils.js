export const getIntendedDestination = (searchParams) => {
  const redirectParam = searchParams.get('redirect');
  if (redirectParam && isValidRedirectPath(redirectParam)) {
    return redirectParam;
  }
  
  const savedDestination = localStorage.getItem('intendedDestination');
  if (savedDestination && isValidRedirectPath(savedDestination)) {
    localStorage.removeItem('intendedDestination'); 
    return savedDestination;
  }
  
  return '/dashboard';
};

export const saveIntendedDestination = (path) => {
  if (isValidRedirectPath(path) && !isAuthPage(path)) {
    localStorage.setItem('intendedDestination', path);
  }
};

export const clearIntendedDestination = () => {
  localStorage.removeItem('intendedDestination');
};

const isValidRedirectPath = (path) => {
  if (!path || typeof path !== 'string') return false;
  
  if (!path.startsWith('/')) return false;
  
  if (path.includes('://')) return false;
  
  const excludedPaths = [
    '/login',
    '/signup', 
    '/terms',
    '/privacy',
    '/contact',
    '/'
  ];
  
  return !excludedPaths.some(excluded => 
    path === excluded || path.startsWith(excluded + '/')
  );
};

const isAuthPage = (path) => {
  const authPaths = ['/login', '/signup'];
  return authPaths.some(authPath => 
    path === authPath || path.startsWith(authPath + '/')
  );
};

export const getLoginRedirectUrl = (currentPath) => {
  if (isValidRedirectPath(currentPath)) {
    return `/login?redirect=${encodeURIComponent(currentPath)}`;
  }
  return '/login';
};

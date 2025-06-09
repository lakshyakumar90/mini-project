// Utility functions for handling redirects after authentication

/**
 * Get the intended destination from URL params or localStorage
 * @param {URLSearchParams} searchParams - URL search parameters
 * @returns {string} - The intended destination path
 */
export const getIntendedDestination = (searchParams) => {
  // First check URL params (e.g., /login?redirect=/chat)
  const redirectParam = searchParams.get('redirect');
  if (redirectParam && isValidRedirectPath(redirectParam)) {
    return redirectParam;
  }
  
  // Then check localStorage for saved intended destination
  const savedDestination = localStorage.getItem('intendedDestination');
  if (savedDestination && isValidRedirectPath(savedDestination)) {
    localStorage.removeItem('intendedDestination'); // Clean up
    return savedDestination;
  }
  
  // Default to dashboard
  return '/dashboard';
};

/**
 * Save the current path as intended destination
 * @param {string} path - Current path to save
 */
export const saveIntendedDestination = (path) => {
  if (isValidRedirectPath(path) && !isAuthPage(path)) {
    localStorage.setItem('intendedDestination', path);
  }
};

/**
 * Clear saved intended destination
 */
export const clearIntendedDestination = () => {
  localStorage.removeItem('intendedDestination');
};

/**
 * Check if a path is valid for redirection
 * @param {string} path - Path to validate
 * @returns {boolean} - Whether the path is valid
 */
const isValidRedirectPath = (path) => {
  if (!path || typeof path !== 'string') return false;
  
  // Must start with /
  if (!path.startsWith('/')) return false;
  
  // Exclude external URLs
  if (path.includes('://')) return false;
  
  // Exclude auth pages and public pages
  const excludedPaths = [
    '/login',
    '/signup', 
    '/forgot-password',
    '/reset-password',
    '/terms',
    '/privacy',
    '/contact',
    '/'
  ];
  
  return !excludedPaths.some(excluded => 
    path === excluded || path.startsWith(excluded + '/')
  );
};

/**
 * Check if a path is an authentication page
 * @param {string} path - Path to check
 * @returns {boolean} - Whether the path is an auth page
 */
const isAuthPage = (path) => {
  const authPaths = ['/login', '/signup', '/forgot-password'];
  return authPaths.some(authPath => 
    path === authPath || path.startsWith(authPath + '/')
  );
};

/**
 * Get redirect URL for login with current path
 * @param {string} currentPath - Current path
 * @returns {string} - Login URL with redirect parameter
 */
export const getLoginRedirectUrl = (currentPath) => {
  if (isValidRedirectPath(currentPath)) {
    return `/login?redirect=${encodeURIComponent(currentPath)}`;
  }
  return '/login';
};

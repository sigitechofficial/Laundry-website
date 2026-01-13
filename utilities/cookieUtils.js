/**
 * Utility functions for cookie management
 */

/**
 * Clear all cookies for the current domain
 */
export const clearAllCookies = () => {
  if (typeof document === "undefined") return;

  // Get all cookies
  const cookies = document.cookie.split(";");

  // Clear each cookie by setting it to expire in the past
  cookies.forEach((cookie) => {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    
    // Clear cookie for current path
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
    
    // Clear cookie for root path
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname};`;
    
    // Clear cookie without domain (for localhost)
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=;`;
  });
};

/**
 * Clear a specific cookie by name
 */
export const clearCookie = (name, path = "/", domain = null) => {
  if (typeof document === "undefined") return;

  let cookieString = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path};`;
  
  if (domain) {
    cookieString += `domain=${domain};`;
  }
  
  document.cookie = cookieString;
  
  // Also try without domain
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path};`;
};


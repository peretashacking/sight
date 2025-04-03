// Theme management for Sight for MacSploit

// Function to apply theme to document
function applyTheme(theme) {
  // Default to dark theme if none is provided
  theme = theme || 'dark';
  
  // Apply theme to document
  document.documentElement.setAttribute('data-theme', theme);
  
  // Apply theme to all iframes
  document.querySelectorAll('iframe').forEach(iframe => {
    try {
      if (iframe.contentDocument) {
        iframe.contentDocument.documentElement.setAttribute('data-theme', theme);
      }
    } catch (e) {
      // Ignore cross-origin errors
      console.warn('Could not apply theme to iframe:', e);
    }
  });
  
  // Save theme preference to localStorage
  localStorage.setItem('sight-theme', theme);
  
  console.log('[Theme] Applied theme:', theme);
}

// Function to get current theme
function getCurrentTheme() {
  return localStorage.getItem('sight-theme') || 'dark';
}

// Function to change theme
function changeTheme(theme) {
  applyTheme(theme);
  
  // If MacSploit settings are available, save there too
  if (typeof writeMacsploitSetting === 'function') {
    writeMacsploitSetting('theme', theme);
  }
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', () => {
  // Try to load theme from localStorage first
  let savedTheme = localStorage.getItem('sight-theme');
  
  // If not found in localStorage, try to get from MacSploit settings
  if (!savedTheme && typeof readMacsploitSettings === 'function') {
    readMacsploitSettings().then(settings => {
      if (settings && settings.theme) {
        applyTheme(settings.theme);
      } else {
        applyTheme('dark'); // Default theme
      }
    }).catch(() => {
      applyTheme('dark'); // Default theme on error
    });
  } else {
    // Apply theme from localStorage or default
    applyTheme(savedTheme);
  }
});

// Apply theme to iframes when they load
window.addEventListener('load', () => {
  const currentTheme = getCurrentTheme();
  
  // Add event listeners to all iframes
  document.querySelectorAll('iframe').forEach(iframe => {
    iframe.addEventListener('load', () => {
      try {
        if (iframe.contentDocument) {
          iframe.contentDocument.documentElement.setAttribute('data-theme', currentTheme);
        }
      } catch (e) {
        // Ignore cross-origin errors
        console.warn('Could not apply theme to iframe on load:', e);
      }
    });
  });
});

// Export functions for use in other scripts
window.themeManager = {
  apply: applyTheme,
  get: getCurrentTheme,
  change: changeTheme
};
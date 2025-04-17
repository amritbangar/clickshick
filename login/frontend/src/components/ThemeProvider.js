import React, { createContext, useContext, useEffect } from 'react';

// Create a context for theme-related functions
const ThemeContext = createContext();

// Custom hook to use theme context
export const useTheme = () => useContext(ThemeContext);

const ThemeProvider = ({ children }) => {
  // Ensure CSS variables are available consistently
  useEffect(() => {
    // Add a class to the body for global styling
    document.body.classList.add('photography-portal-theme');
    
    // Optional: Add theme toggle functionality in the future
    
    return () => {
      // Clean up when component unmounts
      document.body.classList.remove('photography-portal-theme');
    };
  }, []);

  // Theme utility functions
  const themeUtils = {
    // Common style objects that can be reused
    styles: {
      // Card style for consistent cards across the application
      card: {
        backgroundColor: 'var(--accent-color-2)',
        borderRadius: '8px',
        boxShadow: 'var(--shadow-md)',
        padding: '25px',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      },
      
      // Button styles
      primaryButton: {
        backgroundColor: 'var(--accent-color-1)',
        color: 'var(--primary-color)',
        border: 'none',
        borderRadius: '6px',
        padding: '10px 18px',
        fontWeight: 'bold',
        fontSize: '16px',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      },
      
      secondaryButton: {
        background: 'transparent',
        border: '1px solid var(--accent-color-1)',
        color: 'var(--accent-color-2)', 
        borderRadius: '6px',
        padding: '9px 18px',
        fontWeight: '500',
        fontSize: '16px',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      },
      
      // Form input styles
      input: {
        padding: '12px 15px',
        border: '1px solid var(--border-color)',
        borderRadius: '5px',
        width: '100%',
        fontSize: '16px',
        transition: 'border-color 0.2s ease'
      },
      
      // Label styles
      label: {
        fontWeight: 'bold', 
        color: 'var(--primary-color)', 
        marginBottom: '8px', 
        display: 'block'
      },
      
      // Container styles
      container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
      },
      
      // Section styles
      section: {
        padding: '60px 0'
      }
    },
    
    // Function to add hover effects
    applyHoverEffects: (element, effects) => {
      if (!element) return;
      
      const original = {};
      
      // Store original values
      Object.keys(effects).forEach(key => {
        original[key] = element.style[key];
      });
      
      // Apply hover effects
      element.addEventListener('mouseenter', () => {
        Object.keys(effects).forEach(key => {
          element.style[key] = effects[key];
        });
      });
      
      // Restore original values
      element.addEventListener('mouseleave', () => {
        Object.keys(original).forEach(key => {
          element.style[key] = original[key];
        });
      });
    }
  };

  return (
    <ThemeContext.Provider value={themeUtils}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider; 
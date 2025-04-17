import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  
  // State to track login status
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userCategory, setUserCategory] = useState('');
  
  // Check login status when component mounts and when it changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    const category = localStorage.getItem('userCategory');
    
    setIsLoggedIn(token !== null);
    if (category) {
      setUserCategory(category);
    }
  }, []);

  // Handle sign up click - navigate to signup page
  const handleSignUpClick = () => {
    navigate("/signup");
  };

  const handleSignIn = () => {
    navigate("/login");
  };

  const handleSignOut = () => {
    // Clear all authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userCategory');
    
    // Update state to reflect logged out status
    setIsLoggedIn(false);
    setUserCategory('');
    
    navigate('/login');
  };

  // Handle dashboard navigation based on user type
  const handleDashboardAccess = () => {
    if (userCategory === 'user') {
      navigate('/user-dashboard');
    } else if (userCategory === 'photographer') {
      navigate('/photographer-dashboard');
    }
  };

  // Force display of Sign In and Sign Up for development/testing
  // REMOVE THIS LINE FOR PRODUCTION
  const forceShowLoginOptions = true;

  return (
    <nav className="fixed top-0 left-0 w-full z-50" style={{
      background: 'var(--primary-color)',
      boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
    }}>
      <div style={{ 
        width: "100%", 
        maxWidth: "1200px", 
        margin: "0 auto", 
        padding: "0 15px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        height: "70px"
      }}>
        {/* Logo on left */}
        <Link to="/" style={{ 
          textDecoration: "none",
          display: "flex",
          alignItems: "center"
        }}>
          <span style={{ 
            color: "var(--accent-color-2)",
            fontWeight: "bold", 
            fontSize: "26px",
            letterSpacing: "0.5px"
          }}>
            Photography<span style={{ color: "var(--accent-color-1)" }}>Portal</span>
          </span>
        </Link>
        
        {/* Navigation Items on right */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <Link to="/#categories" style={{ 
            color: "var(--accent-color-2)", 
            textDecoration: "none", 
            marginRight: "25px",
            fontWeight: "500",
            fontSize: "16px",
            opacity: 0.9,
            transition: "opacity 0.2s"
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = 1}
          onMouseOut={(e) => e.currentTarget.style.opacity = 0.9}
          >
            Explore
          </Link>
          <Link to="/#features" style={{ 
            color: "var(--accent-color-2)", 
            textDecoration: "none", 
            marginRight: "25px",
            fontWeight: "500",
            fontSize: "16px",
            opacity: 0.9,
            transition: "opacity 0.2s"
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = 1}
          onMouseOut={(e) => e.currentTarget.style.opacity = 0.9}
          >
            How It Works
          </Link>
          
          {isLoggedIn && !forceShowLoginOptions ? (
            // Show Dashboard and Sign Out for logged-in users
            <>
              <button 
                onClick={handleDashboardAccess}
                style={{ 
                  background: "transparent",
                  border: "1px solid var(--accent-color-1)",
                  color: "var(--accent-color-2)", 
                  borderRadius: "6px",
                  padding: "9px 18px",
                  fontWeight: "500",
                  fontSize: "16px",
                  cursor: "pointer",
                  marginRight: "15px",
                  transition: "all 0.2s ease"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                Dashboard
              </button>
              <button 
                onClick={handleSignOut}
                style={{ 
                  backgroundColor: "var(--accent-color-1)",
                  color: "var(--primary-color)",
                  border: "none",
                  borderRadius: "6px",
                  padding: "10px 18px",
                  fontWeight: "bold",
                  fontSize: "16px",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--accent-color-2)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--accent-color-1)";
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            // Show Sign In and Sign Up for non-logged-in users
            <>
              <button 
                onClick={handleSignIn}
                style={{ 
                  background: "transparent",
                  border: "1px solid var(--accent-color-1)",
                  color: "var(--accent-color-2)", 
                  borderRadius: "6px",
                  padding: "9px 18px",
                  fontWeight: "500",
                  fontSize: "16px",
                  cursor: "pointer",
                  marginRight: "15px",
                  transition: "all 0.2s ease"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                Sign In
              </button>
              <button 
                onClick={handleSignUpClick}
                style={{ 
                  backgroundColor: "var(--accent-color-1)",
                  color: "var(--primary-color)",
                  border: "none",
                  borderRadius: "6px",
                  padding: "10px 18px",
                  fontWeight: "bold",
                  fontSize: "16px",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--accent-color-2)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--accent-color-1)";
                }}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 
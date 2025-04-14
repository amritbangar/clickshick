import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  
  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('token') !== null;
  const userCategory = localStorage.getItem('userCategory');

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

  // Add this function below handleDashboardAccess
  const handleTestDashboard = () => {
    // Set mock values in localStorage for testing
    localStorage.setItem('token', 'test-token-123');
    localStorage.setItem('userId', 'test-user-123');
    localStorage.setItem('userCategory', 'user');
    
    // Navigate to dashboard
    navigate('/user-dashboard');
  };

  // Images for the hero slider
  const heroImages = [
    "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
    "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
    "https://images.unsplash.com/photo-1554080353-a576cf803bda?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
  ];

  // Auto rotate the slides every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroImages.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Features data
  const features = [
    {
      icon: "📸",
      title: "Professional Photographers",
      description: "Connect with verified professional photographers specializing in various styles and events."
    },
    {
      icon: "🔍",
      title: "Easy Search",
      description: "Find the perfect photographer for your needs with our intuitive search and filter system."
    },
    {
      icon: "📅",
      title: "Simple Booking",
      description: "Book your photography session with just a few clicks. Our streamlined process makes planning easy."
    },
    {
      icon: "💰",
      title: "Transparent Pricing",
      description: "No hidden fees. Get clear pricing upfront and choose packages that fit your budget."
    }
  ];

  return (
    <div>
      {/* Improved Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50" style={{
        background: 'linear-gradient(to right, rgba(0,0,0,0.85), rgba(98,0,234,0.85))',
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
          height: "60px"
        }}>
          {/* Logo on left */}
          <a href="/" style={{ textDecoration: "none" }}>
            <span style={{ color: "#6200ea", fontWeight: "bold", fontSize: "24px" }}>Photography</span>
            <span style={{ color: "white", fontWeight: "bold", fontSize: "24px" }}>Portal</span>
          </a>
          
          {/* Navigation Items on right */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <a href="/" style={{ 
              color: "white", 
              textDecoration: "none", 
              marginRight: "25px",
              fontWeight: "500",
              fontSize: "17px"
            }}>
              Home
            </a>
            <a href="#features" style={{ 
              color: "white", 
              textDecoration: "none", 
              marginRight: "25px",
              fontWeight: "500",
              fontSize: "17px"
            }}>
              Features
            </a>
            
            {isLoggedIn ? (
              <>
                <button 
                  onClick={handleDashboardAccess}
                  style={{ 
                    background: "transparent",
                    border: "none",
                    color: "white", 
                    cursor: "pointer",
                    marginRight: "25px",
                    fontWeight: "500",
                    fontSize: "17px",
                    padding: 0
                  }}
                >
                  Dashboard
                </button>
                <button 
                  onClick={handleSignOut}
                  style={{ 
                    backgroundColor: "#6200ea",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "8px 16px",
                    fontWeight: "500",
                    fontSize: "17px",
                    cursor: "pointer"
                  }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={handleSignIn}
                  style={{ 
                    background: "transparent",
                    border: "none",
                    color: "white", 
                    cursor: "pointer",
                    marginRight: "25px",
                    fontWeight: "500",
                    fontSize: "17px",
                    padding: 0
                  }}
                >
                  Sign In
                </button>
                <button 
                  onClick={handleSignUpClick}
                  style={{ 
                    backgroundColor: "#6200ea",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "8px 16px",
                    fontWeight: "500",
                    fontSize: "17px",
                    cursor: "pointer"
                  }}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Image Animation/Carousel - update padding top to match new navbar height */}
      <div style={{ position: "relative", height: "100vh", overflow: "hidden", marginTop: "0" }}>
        {heroImages.map((image, index) => (
          <div 
            key={index}
            style={{ 
              position: "absolute", 
              top: 0,
              left: index === activeSlide ? "0%" : index > activeSlide ? "100%" : "-100%",
              width: "100%", 
              height: "100%",
              transition: "left 1.5s ease",
              backgroundImage: `url(${image})`,
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          >
            <div style={{ 
              position: "absolute", 
              top: 0, 
              left: 0, 
              width: "100%", 
              height: "100%",
              backgroundImage: "linear-gradient(rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.6) 100%)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              color: "white",
              textAlign: "center",
              padding: "0 20px",
              paddingTop: "60px" /* Update padding equal to new navbar height */
            }}>
              <h1 style={{ 
                fontSize: "3rem", 
                fontWeight: "bold", 
                marginBottom: "20px",
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)"
              }}>
                Capture Life's Beautiful Moments
              </h1>
              <p style={{ 
                fontSize: "1.5rem", 
                maxWidth: "800px",
                marginBottom: "30px",
                textShadow: "1px 1px 3px rgba(0, 0, 0, 0.5)"
              }}>
                Connect with photographers who can turn your special occasions into lasting memories
              </p>
              <button 
                onClick={handleSignUpClick}
                style={{
                  backgroundColor: "#2563EB",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  padding: "12px 24px",
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)"
                }}
              >
                Get Started
              </button>
            </div>
          </div>
        ))}

        {/* Slider Indicators */}
        <div style={{ 
          position: "absolute", 
          bottom: "30px", 
          left: "50%", 
          transform: "translateX(-50%)",
          display: "flex",
          zIndex: 2
        }}>
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveSlide(index)}
              style={{
                width: "12px",
                height: "12px",
                margin: "0 6px",
                backgroundColor: index === activeSlide ? "#2563EB" : "rgba(255, 255, 255, 0.6)",
                border: "none",
                borderRadius: "50%",
                cursor: "pointer",
                transition: "background-color 0.3s ease"
              }}
            />
          ))}
        </div>
      </div>

      {/* Features Section */}
      <section id="features" style={{ padding: "80px 0", backgroundColor: "#f8f9fa" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h2 style={{ 
              fontSize: "2.5rem", 
              fontWeight: "bold", 
              color: "#1e3a8a", 
              marginBottom: "15px" 
            }}>
              Why Choose Our Platform
            </h2>
            <p style={{ 
              fontSize: "1.2rem", 
              color: "#6b7280", 
              maxWidth: "700px", 
              margin: "0 auto" 
            }}>
              We connect talented photographers with clients looking for quality photography services
            </p>
          </div>

          <div style={{ 
            display: "flex", 
            flexWrap: "wrap", 
            justifyContent: "center", 
            gap: "30px" 
          }}>
            {features.map((feature, index) => (
              <div key={index} style={{ 
                flex: "1 1 250px", 
                maxWidth: "280px",
                backgroundColor: "white",
                borderRadius: "8px",
                padding: "30px 25px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                cursor: "pointer"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.1)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
              }}
              onClick={handleSignUpClick}
              >
                <div style={{ 
                  fontSize: "3rem", 
                  marginBottom: "20px",
                  textAlign: "center" 
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ 
                  fontSize: "1.5rem", 
                  fontWeight: "bold", 
                  marginBottom: "15px", 
                  color: "#1e3a8a",
                  textAlign: "center"
                }}>
                  {feature.title}
                </h3>
                <p style={{ 
                  fontSize: "1.05rem", 
                  color: "#6b7280", 
                  lineHeight: "1.6",
                  textAlign: "center"
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

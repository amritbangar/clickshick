import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/reset.css';

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

  // Create animation keyframes
  useEffect(() => {
    const styles = document.createElement('style');
    styles.innerHTML = `
      @keyframes backgroundShift {
        0% {
          background-position: 0 0, 15px 15px;
        }
        100% {
          background-position: 40px 40px, 55px 55px;
        }
      }
      
      @keyframes float {
        0%, 100% {
          transform: translateY(0) rotate(0);
        }
        25% {
          transform: translateY(-20px) rotate(5deg);
        }
        50% {
          transform: translateY(0) rotate(0);
        }
        75% {
          transform: translateY(20px) rotate(-5deg);
        }
      }
      
      @keyframes floatUpDown {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-30px);
        }
      }
      
      @keyframes pulse {
        0%, 100% {
          transform: scale(1);
          opacity: 0.05;
        }
        50% {
          transform: scale(1.1);
          opacity: 0.1;
        }
      }
      
      @keyframes particle-float {
        0% {
          transform: translate(0, 0);
          opacity: 0;
        }
        10% {
          opacity: 0.8;
        }
        90% {
          opacity: 0.8;
        }
        100% {
          transform: translate(var(--end-x, 100px), var(--end-y, 100px));
          opacity: 0;
        }
      }
      
      @keyframes flare-movement {
        0%, 100% {
          transform: translate(0, 0);
        }
        50% {
          transform: translate(-100px, 100px);
        }
      }
      
      @keyframes flare-pulse {
        0%, 100% {
          transform: scale(1);
          opacity: 0.1;
        }
        50% {
          transform: scale(1.5);
          opacity: 0.2;
        }
      }
    `;
    document.head.appendChild(styles);
    
    return () => {
      // Clean up styles on component unmount
      if (styles && document.head.contains(styles)) {
        document.head.removeChild(styles);
      }
    };
  }, []);

  // Add useEffect to handle background particles movement
  useEffect(() => {
    // Create custom animations for each particle
    const particles = document.querySelectorAll('.particle');
    
    particles.forEach((particle) => {
      // Generate random end position for each particle
      const endX = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 200 + 50);
      const endY = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 200 + 50);
      
      // Apply unique animation to each particle
      particle.style.setProperty('--end-x', `${endX}px`);
      particle.style.setProperty('--end-y', `${endY}px`);
    });
    
    // Optional: add interactive particle movement if needed
    const handleMouseMove = (e) => {
      const mouseX = (e.clientX / window.innerWidth) - 0.5;
      const mouseY = (e.clientY / window.innerHeight) - 0.5;
      
      particles.forEach((particle, index) => {
        const speed = 0.5 + (index / particles.length);
        const offsetX = mouseX * speed * 20;
        const offsetY = mouseY * speed * 20;
        
        particle.style.setProperty('--mouse-x', `${offsetX}px`);
        particle.style.setProperty('--mouse-y', `${offsetY}px`);
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Add a style element to the document head for custom scrollbar
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .home-container {
        height: 100vh;
        overflow-y: auto;
        scroll-behavior: smooth;
      }
      
      .home-container::-webkit-scrollbar {
        width: 10px;
      }
      
      .home-container::-webkit-scrollbar-track {
        background: rgba(18, 22, 57, 0.1);
        border-radius: 10px;
      }
      
      .home-container::-webkit-scrollbar-thumb {
        background: var(--accent-color-1);
        border-radius: 10px;
        border: 2px solid var(--primary-color);
      }
      
      .home-container::-webkit-scrollbar-thumb:hover {
        background: var(--accent-color-2);
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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
    <div className="home-container scrollable">
      {/* Navigation Bar */}
      <nav style={{
        position: 'sticky',
        top: 0,
        backgroundColor: '#7DA5B9',
        padding: '15px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        zIndex: 100
      }}>
        {/* Logo/Brand */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          color: '#FFFFFF',
          fontWeight: 'bold',
          fontSize: '1.5rem',
          cursor: 'pointer'
        }} onClick={() => navigate('/')}>
          <i className="fas fa-camera" style={{ marginRight: '10px' }}></i>
          <span>clickshick.com</span>
        </div>

        {/* Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <a href="#features" style={{ 
            color: '#FFFFFF',
            margin: '0 15px',
            textDecoration: 'none',
            opacity: 0.9,
            transition: 'opacity 0.2s'
          }} 
          onMouseOver={(e) => e.currentTarget.style.opacity = 1}
          onMouseOut={(e) => e.currentTarget.style.opacity = 0.9}>
            Features
          </a>
          <a href="#categories" style={{ 
            color: '#FFFFFF',
            margin: '0 15px',
            textDecoration: 'none',
            opacity: 0.9,
            transition: 'opacity 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = 1}
          onMouseOut={(e) => e.currentTarget.style.opacity = 0.9}>
            Categories
          </a>
          
          {isLoggedIn ? (
            <>
              <button 
                onClick={handleDashboardAccess}
                style={{ 
                  background: 'transparent',
                  border: '1px solid #FFFFFF',
                  color: '#FFFFFF',
                  borderRadius: '6px',
                  padding: '8px 15px',
                  marginLeft: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Dashboard
              </button>
              <button 
                onClick={handleSignOut}
                style={{ 
                  backgroundColor: '#BFD8E4',
                  color: '#1F1F1F',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 15px',
                  marginLeft: '15px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#A6C7D8';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#BFD8E4';
                  e.currentTarget.style.transform = 'translateY(0)';
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
                  background: 'transparent',
                  border: '1px solid #FFFFFF',
                  color: '#FFFFFF',
                  borderRadius: '6px',
                  padding: '8px 15px',
                  marginLeft: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Sign In
              </button>
              <button 
                onClick={handleSignUpClick}
                style={{ 
                  backgroundColor: '#BFD8E4',
                  color: '#1F1F1F',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 15px',
                  marginLeft: '15px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#A6C7D8';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#BFD8E4';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section - Updated to White + Cool Mist Blue Theme */}
      <div style={{ 
        background: '#FFFFFF',
        color: '#1F1F1F',
        minHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        position: 'relative',
        padding: '70px 20px 40px 20px',
        overflow: 'hidden',
        borderBottom: '1px solid #C5D3DC'
      }}>
        {/* Enhanced background pattern with animation */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(rgba(125, 165, 185, 0.15) 1px, transparent 1px), radial-gradient(rgba(125, 165, 185, 0.1) 2px, transparent 2px)',
          backgroundSize: '20px 20px, 30px 30px',
          backgroundPosition: '0 0, 15px 15px',
          animation: 'backgroundShift 30s linear infinite',
          opacity: 0.5,
          zIndex: 0
        }} />
        
        {/* Hero content */}
        <div style={{ maxWidth: '800px', zIndex: 1, position: 'relative' }}>
          <h1 style={{ 
            fontSize: '3.2rem', 
            fontWeight: 'bold', 
            marginBottom: '20px',
            color: '#1F1F1F',
            lineHeight: 1.2
          }}>
            Find the best <br/> photographers in your area
          </h1>
          
          <p style={{ 
            fontSize: '1.2rem', 
            lineHeight: '1.6',
            marginBottom: '20px',
            color: '#666666'
          }}>
            Get free quotes within minutes
          </p>
          
          <button 
            onClick={handleSignUpClick}
            style={{ 
              backgroundColor: '#7DA5B9', 
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '30px',
              padding: '15px 35px', 
              fontSize: '1.2rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#5C90A3';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#7DA5B9';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Get Started Now
          </button>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" style={{ padding: "80px 0", backgroundColor: "#DCE7EE" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h2 style={{ 
              fontSize: "2.5rem", 
              fontWeight: "bold", 
              color: "#1F1F1F", 
              marginBottom: "15px" 
            }}>
              Why Choose Our Platform
            </h2>
            <p style={{ 
              fontSize: "1.2rem", 
              color: "#666666", 
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
                backgroundColor: "#FFFFFF",
                borderRadius: "8px",
                padding: "30px 25px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease",
                cursor: "pointer",
                border: `1px solid #C5D3DC`
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.1)";
                e.currentTarget.style.backgroundColor = "#DCE7EE";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.05)";
                e.currentTarget.style.backgroundColor = "#FFFFFF";
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
                  color: "#1F1F1F",
                  textAlign: "center"
                }}>
                  {feature.title}
                </h3>
                <p style={{ 
                  fontSize: "1.05rem", 
                  color: "#666666", 
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

      {/* Categories section */}
      <section id="categories" style={{ padding: "60px 0", backgroundColor: "#FFFFFF" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
          <div style={{ textAlign: "center", marginBottom: "50px" }}>
            <h2 style={{ 
              fontSize: "2.2rem", 
              fontWeight: "bold", 
              color: "#1F1F1F", 
              marginBottom: "15px" 
            }}>
              Discover Photography Services
            </h2>
            <p style={{ 
              fontSize: "1.1rem", 
              color: "#666666", 
              maxWidth: "700px", 
              margin: "0 auto" 
            }}>
              Browse our popular photography categories
            </p>
          </div>

          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
            gap: "25px",
            marginBottom: "40px"
          }}>
            {[
              { title: "Wedding Photography", icon: "🤵👰" },
              { title: "Portrait Sessions", icon: "👤" },
              { title: "Family Photography", icon: "👨‍👩‍👧‍👦" },
              { title: "Event Photography", icon: "🎉" },
              { title: "Commercial Photography", icon: "🏢" },
              { title: "Real Estate Photography", icon: "🏠" }
            ].map((category, index) => (
              <div 
                key={index} 
                style={{ 
                  backgroundColor: index % 2 === 0 ? "#DCE7EE" : "#FFFFFF",
                  border: `1px solid #C5D3DC`,
                  borderRadius: "8px",
                  padding: "25px 20px",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  textAlign: "center"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
                  e.currentTarget.style.backgroundColor = "#BFD8E4";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#DCE7EE" : "#FFFFFF";
                }}
                onClick={handleSignUpClick}
              >
                <div style={{ fontSize: "2rem", marginBottom: "15px" }}>
                  {category.icon}
                </div>
                <h3 style={{ 
                  fontSize: "1.2rem", 
                  fontWeight: "bold", 
                  color: "#1F1F1F"
                }}>
                  {category.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials section */}
      <section style={{ padding: "70px 0", backgroundColor: "#7DA5B9" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
          <div style={{ textAlign: "center", marginBottom: "50px" }}>
            <h2 style={{ 
              fontSize: "2.2rem", 
              fontWeight: "bold", 
              color: "#FFFFFF", 
              marginBottom: "15px" 
            }}>
              What Our Clients Say
            </h2>
            <p style={{ 
              fontSize: "1.1rem", 
              color: "#DCE7EE", 
              maxWidth: "700px", 
              margin: "0 auto" 
            }}>
              Real experiences from people who found their perfect photographer
            </p>
          </div>

          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
            gap: "30px" 
          }}>
            {[
              { 
                quote: "Found an amazing wedding photographer within hours! The platform made it so easy to compare portfolios.", 
                name: "Sarah & Michael"
              },
              { 
                quote: "As a busy parent, I appreciate how quick it was to book our family photoshoot. Great selection of photographers!", 
                name: "James T."
              },
              { 
                quote: "Used this platform for our company's product photos and headshots. Excellent service and professional results.", 
                name: "Emily Chen"
              }
            ].map((testimonial, index) => (
              <div 
                key={index} 
                style={{ 
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  borderRadius: "8px",
                  padding: "30px 25px",
                  transition: "transform 0.3s ease",
                  position: "relative",
                  border: "1px solid rgba(255, 255, 255, 0.3)"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.2)";
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.25)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.15)";
                }}
              >
                <div style={{ 
                  fontSize: "4rem", 
                  position: "absolute", 
                  top: "10px", 
                  left: "15px", 
                  opacity: 0.2,
                  color: "#FFFFFF"
                }}>
                  "
                </div>
                <p style={{ 
                  fontSize: "1.05rem", 
                  color: "#FFFFFF", 
                  lineHeight: "1.6",
                  position: "relative",
                  zIndex: 1,
                  marginBottom: "20px"
                }}>
                  {testimonial.quote}
                </p>
                <p style={{ 
                  fontSize: "1rem", 
                  fontWeight: "bold",
                  color: "#DCE7EE"
                }}>
                  {testimonial.name}
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

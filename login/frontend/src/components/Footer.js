import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{ 
      backgroundColor: 'var(--primary-color)',
      color: 'var(--accent-color-2)',
      padding: '60px 0 30px',
      marginTop: '60px'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 20px' 
      }}>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: '30px'
        }}>
          <div style={{ flex: '1 1 300px' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>
              Photography<span style={{ color: 'var(--accent-color-1)' }}>Portal</span>
            </h3>
            <p style={{ lineHeight: '1.6', marginBottom: '20px' }}>
              We connect talented photographers with clients looking for quality photography services.
            </p>
            <div style={{ display: 'flex', gap: '15px' }}>
              {/* Social Media Icons */}
              {['facebook', 'instagram', 'twitter', 'linkedin'].map(platform => (
                <a 
                  key={platform}
                  href={`https://${platform}.com`} 
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'var(--accent-color-2)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--accent-color-1)';
                    e.currentTarget.style.color = 'var(--primary-color)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.color = 'var(--accent-color-2)';
                  }}
                >
                  {platform.charAt(0).toUpperCase()}
                </a>
              ))}
            </div>
          </div>
          
          <div style={{ flex: '1 1 200px' }}>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { label: 'Home', path: '/' },
                { label: 'Find Photographers', path: '/#categories' },
                { label: 'How It Works', path: '/#features' },
                { label: 'Login', path: '/login' },
                { label: 'Sign Up', path: '/signup' }
              ].map((link) => (
                <li key={link.label} style={{ marginBottom: '12px' }}>
                  <Link 
                    to={link.path} 
                    style={{ 
                      color: 'var(--accent-color-2)', 
                      textDecoration: 'none',
                      transition: 'color 0.2s ease',
                      display: 'block'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-color-1)'}
                    onMouseOut={(e) => e.currentTarget.style.color = 'var(--accent-color-2)'}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div style={{ flex: '1 1 200px' }}>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>For Photographers</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { label: 'Join as Photographer', path: '/signup?type=photographer' },
                { label: 'How It Works', path: '/#photographer-features' },
                { label: 'Success Stories', path: '/#testimonials' }
              ].map((link) => (
                <li key={link.label} style={{ marginBottom: '12px' }}>
                  <Link 
                    to={link.path} 
                    style={{ 
                      color: 'var(--accent-color-2)', 
                      textDecoration: 'none',
                      transition: 'color 0.2s ease',
                      display: 'block'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent-color-1)'}
                    onMouseOut={(e) => e.currentTarget.style.color = 'var(--accent-color-2)'}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div style={{ flex: '1 1 300px' }}>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Contact Us</h4>
            <p style={{ lineHeight: '1.6', marginBottom: '15px' }}>
              Have questions or need support? Reach out to our team.
            </p>
            <a 
              href="mailto:support@photographyportal.com" 
              style={{ 
                color: 'var(--accent-color-1)', 
                textDecoration: 'none',
                fontWeight: 'bold',
                display: 'block',
                marginBottom: '15px'
              }}
            >
              support@photographyportal.com
            </a>
            <p style={{ lineHeight: '1.6' }}>
              123 Photography Lane<br />
              Studio City, CA 91604
            </p>
          </div>
        </div>
        
        <div style={{ 
          borderTop: '1px solid rgba(255,255,255,0.1)', 
          marginTop: '40px', 
          paddingTop: '20px',
          textAlign: 'center',
          fontSize: '0.9rem',
          color: 'rgba(255,255,255,0.7)'
        }}>
          <p>© {new Date().getFullYear()} Photography Portal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('token') !== null;
  
  const handleSignOut = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-black bg-opacity-70 shadow-lg fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          {/* Left side - Logo */}
          <div>
            <Link to="/" className="text-[#6200ea] font-bold text-2xl">
              Photography <span className="text-white">Portal</span>
            </Link>
          </div>
          
          {/* Right side - Navigation items */}
          <div className="flex items-center">
            <Link to="/" className={`text-white hover:text-[#6200ea] mx-4 ${location.pathname === '/' ? 'font-bold' : ''}`}>
              Home
            </Link>
            <Link to="#features" className="text-white hover:text-[#6200ea] mx-4">
              Features
            </Link>
            
            {isLoggedIn ? (
              <button 
                onClick={handleSignOut}
                className="text-white hover:text-[#6200ea] mx-4"
              >
                Sign Out
              </button>
            ) : (
              <Link to="/login" className="text-white hover:text-[#6200ea] mx-4">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 
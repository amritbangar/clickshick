import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/reset.css';
import PinCodePopup from '../components/PinCodePopup';

const Signup = () => {
    // Add useEffect for custom scrollbar
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            .signup-container {
                height: 100vh;
                overflow-y: auto;
                scroll-behavior: smooth;
            }
            
            .signup-container::-webkit-scrollbar {
                width: 10px;
            }
            
            .signup-container::-webkit-scrollbar-track {
                background: rgba(18, 22, 57, 0.1);
                border-radius: 10px;
            }
            
            .signup-container::-webkit-scrollbar-thumb {
                background: var(--accent-color-1);
                border-radius: 10px;
                border: 2px solid rgba(18, 22, 57, 0.1);
            }
            
            .signup-container::-webkit-scrollbar-thumb:hover {
                background: #FFC107;
            }
        `;
        document.head.appendChild(style);
        
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [category, setCategory] = useState('user'); // Default category
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showPinCodePopup, setShowPinCodePopup] = useState(false);
    const navigate = useNavigate();
    
    // Check for existing session on component mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const category = localStorage.getItem('userCategory');
        
        // If all required auth items exist, redirect to appropriate dashboard
        if (token && userId && category) {
            console.log('Found existing session, redirecting to dashboard');
            
            // Redirect to the appropriate dashboard
            if (category === 'photographer') {
                navigate('/photographer-dashboard');
            } else {
                navigate('/user-dashboard');
            }
        }
    }, [navigate]);

    // Add fullscreen toggle function
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    // Listen for fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Basic validation
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        if (password.length < 4) {
            setError('Password must be at least 4 characters long');
            setIsLoading(false);
            return;
        }

        try {
            // Connect to your existing backend API
            const response = await axios.post('http://localhost:8080/api/auth/signup', {
                name,
                email,
                password,
                category
            });

            console.log("Registration response:", response.data);
            setMessage(response.data.message || 'Registration successful!');
            
            // Redirect to login page after short delay
            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (error) {
            console.error('Signup failed:', error.response?.data || error.message);
            
            if (error.response?.status === 0) {
                // Network error - server not running
                setError('Cannot connect to server. Please make sure the backend server is running.');
            } else if (error.response?.status === 409) {
                // Email already exists (common status code for conflict)
                setError('This email is already registered. Please use a different email or try logging in.');
            } else {
                setError(error.response?.data?.message || 'Registration failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handlePinCodeSubmit = (pin) => {
        // Handle pin code submission
        console.log('Pin code submitted:', pin);
        setShowPinCodePopup(false);
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: window.innerWidth < 768 ? '20px 15px' : '40px',
            background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color-2) 100%)'
        }}>
            <div style={{
                backgroundColor: '#fff',
                borderRadius: '15px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                width: window.innerWidth < 768 ? '100%' : '600px',
                maxWidth: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                maxHeight: window.innerWidth < 768 ? '100vh' : '90vh'
            }}>
                <div style={{
                    background: 'var(--primary-color)',
                    color: '#fff',
                    padding: window.innerWidth < 768 ? '15px 20px' : '25px 30px',
                    borderTopLeftRadius: '15px',
                    borderTopRightRadius: '15px'
                }}>
                    <h1 style={{ 
                        fontWeight: 'bold', 
                        margin: 0,
                        fontSize: window.innerWidth < 768 ? '1.5rem' : '2rem' 
                    }}>
                        <i className="fas fa-user-plus mr-2"></i>
                        Create Account
                    </h1>
                    <p className="mt-2 mb-0" style={{
                        fontSize: window.innerWidth < 768 ? '0.9rem' : '1rem'
                    }}>Join clickshick.com today</p>
                </div>

                <div className="signup-body scrollable" style={{ 
                    padding: window.innerWidth < 768 ? '20px 15px' : '30px 25px',
                    overflowY: 'auto',
                    flex: 1,
                    maxHeight: window.innerWidth < 768 ? 'calc(100vh - 80px)' : 'calc(90vh - 100px)',
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(18, 22, 57, 0.4) rgba(0, 0, 0, 0.05)'
                }}>
                    {error && (
                        <div style={{
                            backgroundColor: 'rgba(220, 53, 69, 0.1)',
                            color: 'var(--error-color)',
                            padding: '12px 15px',
                            borderRadius: '5px',
                            marginBottom: '20px',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <i className="fas fa-exclamation-circle mr-2"></i> {error}
                        </div>
                    )}

                    {message && (
                        <div style={{
                            backgroundColor: 'rgba(40, 167, 69, 0.1)',
                            color: 'var(--success-color)',
                            padding: '12px 15px',
                            borderRadius: '5px',
                            marginBottom: '20px',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <i className="fas fa-check-circle mr-2"></i> {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group mb-4">
                            <label style={{ 
                                fontWeight: 'bold', 
                                color: 'var(--primary-color)', 
                                marginBottom: '8px', 
                                display: 'block',
                                fontSize: window.innerWidth < 768 ? '0.9rem' : '1rem'
                            }}>
                                Full Name
                            </label>
                            <div className="input-group" style={{ 
                                display: 'flex', 
                                width: '100%',
                                flexDirection: window.innerWidth < 480 ? 'column' : 'row'
                            }}>
                                <div style={{ 
                                    background: 'rgba(0, 0, 0, 0.05)', 
                                    border: `1px solid var(--border-color)`, 
                                    borderRight: 'none',
                                    borderRadius: '5px 0 0 5px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    width: '46px',
                                    height: '46px'
                                }}>
                                    <i className="fas fa-user" style={{ color: 'var(--primary-color)' }}></i>
                                </div>
                                <input
                                    type="text"
                                    style={{ 
                                        padding: '12px 15px',
                                        border: `1px solid var(--border-color)`,
                                        borderLeft: 'none',
                                        borderRadius: '0 5px 5px 0',
                                        flex: '1',
                                        height: '46px',
                                        fontSize: '16px'
                                    }}
                                    placeholder="Enter your full name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group mb-4">
                            <label style={{ 
                                fontWeight: 'bold', 
                                color: 'var(--primary-color)', 
                                marginBottom: '8px', 
                                display: 'block',
                                fontSize: window.innerWidth < 768 ? '0.9rem' : '1rem'
                            }}>
                                Email Address
                            </label>
                            <div className="input-group" style={{ 
                                display: 'flex', 
                                width: '100%',
                                flexDirection: window.innerWidth < 480 ? 'column' : 'row'
                            }}>
                                <div style={{ 
                                    background: 'rgba(0, 0, 0, 0.05)', 
                                    border: `1px solid var(--border-color)`, 
                                    borderRight: 'none',
                                    borderRadius: '5px 0 0 5px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    width: '46px',
                                    height: '46px'
                                }}>
                                    <i className="fas fa-envelope" style={{ color: 'var(--primary-color)' }}></i>
                                </div>
                                <input
                                    type="email"
                                    style={{ 
                                        padding: '12px 15px',
                                        border: `1px solid var(--border-color)`,
                                        borderLeft: 'none',
                                        borderRadius: '0 5px 5px 0',
                                        flex: '1',
                                        height: '46px',
                                        fontSize: '16px'
                                    }}
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group mb-4">
                            <label style={{ 
                                fontWeight: 'bold', 
                                color: 'var(--primary-color)', 
                                marginBottom: '8px', 
                                display: 'block',
                                fontSize: window.innerWidth < 768 ? '0.9rem' : '1rem'
                            }}>
                                Password
                            </label>
                            <div className="input-group" style={{ 
                                display: 'flex', 
                                width: '100%',
                                flexDirection: window.innerWidth < 480 ? 'column' : 'row'
                            }}>
                                <div style={{ 
                                    background: 'rgba(0, 0, 0, 0.05)', 
                                    border: `1px solid var(--border-color)`, 
                                    borderRight: 'none',
                                    borderRadius: '5px 0 0 5px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    width: '46px',
                                    height: '46px'
                                }}>
                                    <i className="fas fa-lock" style={{ color: 'var(--primary-color)' }}></i>
                                </div>
                                <input
                                    type="password"
                                    style={{ 
                                        padding: '12px 15px',
                                        border: `1px solid var(--border-color)`,
                                        borderLeft: 'none',
                                        borderRadius: '0 5px 5px 0',
                                        flex: '1',
                                        height: '46px',
                                        fontSize: '16px'
                                    }}
                                    placeholder="Create a password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <small style={{ color: 'var(--text-light)', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                                Password must be at least 4 characters long
                            </small>
                        </div>

                        <div className="form-group mb-4">
                            <label style={{ 
                                fontWeight: 'bold', 
                                color: 'var(--primary-color)', 
                                marginBottom: '8px', 
                                display: 'block',
                                fontSize: window.innerWidth < 768 ? '0.9rem' : '1rem'
                            }}>
                                Confirm Password
                            </label>
                            <div className="input-group" style={{ 
                                display: 'flex', 
                                width: '100%',
                                flexDirection: window.innerWidth < 480 ? 'column' : 'row'
                            }}>
                                <div style={{ 
                                    background: 'rgba(0, 0, 0, 0.05)', 
                                    border: `1px solid var(--border-color)`, 
                                    borderRight: 'none',
                                    borderRadius: '5px 0 0 5px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    width: '46px',
                                    height: '46px'
                                }}>
                                    <i className="fas fa-lock" style={{ color: 'var(--primary-color)' }}></i>
                                </div>
                                <input
                                    type="password"
                                    style={{ 
                                        padding: '12px 15px',
                                        border: `1px solid var(--border-color)`,
                                        borderLeft: 'none',
                                        borderRadius: '0 5px 5px 0',
                                        flex: '1',
                                        height: '46px',
                                        fontSize: '16px'
                                    }}
                                    placeholder="Confirm your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group mb-4">
                            <label style={{ 
                                fontWeight: 'bold', 
                                color: 'var(--primary-color)', 
                                marginBottom: '8px', 
                                display: 'block',
                                fontSize: window.innerWidth < 768 ? '0.9rem' : '1rem'
                            }}>
                                Account Type
                            </label>
                            <div style={{ 
                                display: 'grid',
                                gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr',
                                gap: window.innerWidth < 768 ? '15px' : '20px'
                            }}>
                                <label style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    cursor: 'pointer',
                                    padding: window.innerWidth < 768 ? '12px' : '15px',
                                    border: `1px solid ${category === 'user' ? 'var(--accent-color-1)' : 'var(--border-color)'}`,
                                    borderRadius: '5px',
                                    backgroundColor: category === 'user' ? 'rgba(255, 165, 0, 0.1)' : 'transparent'
                                }}>
                                    <input 
                                        type="radio" 
                                        name="category"
                                        value="user"
                                        checked={category === 'user'}
                                        onChange={() => setCategory('user')}
                                        style={{ marginRight: '10px' }}
                                    />
                                    <div>
                                        <strong style={{ color: 'var(--primary-color)' }}>Client</strong>
                                        <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: 'var(--text-light)' }}>
                                            I want to hire photographers
                                        </p>
                                    </div>
                                </label>
                                
                                <label style={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    padding: window.innerWidth < 768 ? '12px' : '15px',
                                    border: `1px solid ${category === 'photographer' ? 'var(--accent-color-1)' : 'var(--border-color)'}`,
                                    borderRadius: '5px',
                                    backgroundColor: category === 'photographer' ? 'rgba(255, 165, 0, 0.1)' : 'transparent'
                                }}>
                                    <input 
                                        type="radio" 
                                        name="category"
                                        value="photographer"
                                        checked={category === 'photographer'}
                                        onChange={() => setCategory('photographer')}
                                        style={{ marginRight: '10px' }}
                                    />
                                    <div>
                                        <strong style={{ color: 'var(--primary-color)' }}>Photographer</strong>
                                        <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: 'var(--text-light)' }}>
                                            I want to offer my services
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            style={{
                                width: '100%',
                                padding: window.innerWidth < 768 ? '12px' : '15px',
                                backgroundColor: 'var(--accent-color-1)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '5px',
                                fontSize: window.innerWidth < 768 ? '0.9rem' : '1rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background-color 0.3s ease'
                            }}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="spinner-border spinner-border-sm mr-2" role="status">
                                    <span className="sr-only">Loading...</span>
                                </div>
                            ) : (
                                <i className="fas fa-user-plus mr-2"></i>
                            )}
                            {isLoading ? 'Creating Account...' : 'Sign Up'}
                        </button>

                        <p style={{ 
                            textAlign: 'center', 
                            marginTop: '20px',
                            fontSize: window.innerWidth < 768 ? '0.9rem' : '1rem'
                        }}>
                            Already have an account? <a href="/login" style={{ color: 'var(--accent-color-1)', textDecoration: 'none' }}>Sign In</a>
                        </p>
                    </form>
                </div>

                {/* Fullscreen toggle button */}
                <button
                    onClick={toggleFullscreen}
                    style={{
                        position: 'absolute',
                        top: window.innerWidth < 768 ? '10px' : '15px',
                        right: window.innerWidth < 768 ? '10px' : '15px',
                        background: 'none',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: window.innerWidth < 768 ? '0.9rem' : '1rem'
                    }}
                >
                    <i className={`fas fa-${isFullscreen ? 'compress' : 'expand'}`}></i>
                </button>
            </div>

            {/* Pin Code Popup */}
            {showPinCodePopup && (
                <PinCodePopup
                    onClose={() => setShowPinCodePopup(false)}
                    onSubmit={handlePinCodeSubmit}
                />
            )}
        </div>
    );
};

export default Signup;
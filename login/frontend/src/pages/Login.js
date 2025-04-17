import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import PinCodePopup from '../components/PinCodePopup';
import '../styles/reset.css';

const Login = ({ setUserType }) => {
    // Add useEffect for custom scrollbar
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            .login-container {
                height: 100vh;
                overflow-y: auto;
                scroll-behavior: smooth;
            }
            
            .login-container::-webkit-scrollbar {
                width: 10px;
            }
            
            .login-container::-webkit-scrollbar-track {
                background: rgba(18, 22, 57, 0.1);
                border-radius: 10px;
            }
            
            .login-container::-webkit-scrollbar-thumb {
                background: var(--accent-color-1);
                border-radius: 10px;
                border: 2px solid rgba(18, 22, 57, 0.1);
            }
            
            .login-container::-webkit-scrollbar-thumb:hover {
                background: #FFC107;
            }
        `;
        document.head.appendChild(style);
        
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPinCodePopup, setShowPinCodePopup] = useState(false);
    const [loginData, setLoginData] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const navigate = useNavigate();

    // Check for existing session on component mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const category = localStorage.getItem('userCategory');
        
        // If all required auth items exist, redirect to appropriate dashboard
        if (token && userId && category) {
            console.log('Found existing session, redirecting to dashboard');
            setUserType(category);
            
            // Redirect to the appropriate dashboard
            if (category === 'photographer') {
                navigate('/photographer-dashboard');
            } else {
                navigate('/user-dashboard');
            }
        }
    }, [navigate, setUserType]);

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

    // Add a test login function
    const handleTestLogin = () => {
        // Set test credentials
        setEmail('test@example.com');
        setPassword('password123');
        
        // Show debug info
        setShowDebugInfo(true);
        
        // Optional: auto-submit the form
        setTimeout(() => {
            handleSubmit(new Event('submit'));
        }, 1000);
    };

    // Add a function to create a test user
    const handleCreateTestUser = async () => {
        setShowDebugInfo(true);
        addDebugLog('Creating test user...');
        
        try {
            const testUser = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                category: 'user'
            };
            
            addDebugLog(`Sending signup request to create test user: ${testUser.email}`);
            const response = await axios.post('http://localhost:8080/api/auth/signup', testUser);
            
            addDebugLog(`Response: ${JSON.stringify(response.data)}`);
            
            // Auto-fill the form with test credentials
            setEmail(testUser.email);
            setPassword(testUser.password);
            
        } catch (error) {
            if (error.response && error.response.status === 400 && error.response.data.message === 'Email already in use') {
                addDebugLog('Test user already exists. You can now use the Test Login button.');
                // Auto-fill the form with test credentials
                setEmail('test@example.com');
                setPassword('password123');
            } else {
                addDebugLog(`Error creating test user: ${error.message}`);
                if (error.response) {
                    addDebugLog(`Response data: ${JSON.stringify(error.response.data)}`);
                }
                setError('Failed to create test user. See debug logs for details.');
            }
        }
    };

    // Add a function to create a test photographer
    const handleCreateTestPhotographer = async () => {
        setShowDebugInfo(true);
        addDebugLog('Creating test photographer...');
        
        try {
            const testPhotographer = {
                name: 'Test Photographer',
                email: 'photographer@example.com',
                password: 'password123',
                category: 'photographer'
            };
            
            addDebugLog(`Sending signup request to create test photographer: ${testPhotographer.email}`);
            const response = await axios.post('http://localhost:8080/api/auth/signup', testPhotographer);
            
            addDebugLog(`Response: ${JSON.stringify(response.data)}`);
            
            // Auto-fill the form with test credentials
            setEmail(testPhotographer.email);
            setPassword(testPhotographer.password);
            
        } catch (error) {
            if (error.response && error.response.status === 400 && error.response.data.message === 'Email already in use') {
                addDebugLog('Test photographer already exists. You can now use these credentials to login.');
                // Auto-fill the form with test credentials
                setEmail('photographer@example.com');
                setPassword('password123');
            } else {
                addDebugLog(`Error creating test photographer: ${error.message}`);
                if (error.response) {
                    addDebugLog(`Response data: ${JSON.stringify(error.response.data)}`);
                }
                setError('Failed to create test photographer. See debug logs for details.');
            }
        }
    };

    // Add a function to create test users with the backend endpoint
    const handleCreateAllTestUsers = async () => {
        setShowDebugInfo(true);
        addDebugLog('Creating all test users via backend endpoint...');
        
        try {
            const response = await axios.post('http://localhost:8080/api/auth/create-test-users');
            
            addDebugLog(`Response: ${JSON.stringify(response.data)}`);
            
            // Set a success message
            setError(''); // Clear any existing errors
            
            // Display the success message above the debug logs
            addDebugLog(`SUCCESS: ${response.data.message}`);
            
            // Auto-fill the form with test user credentials
            setEmail('test@example.com');
            setPassword('password123');
            
        } catch (error) {
            addDebugLog(`Error creating test users: ${error.message}`);
            if (error.response) {
                addDebugLog(`Response data: ${JSON.stringify(error.response.data)}`);
            }
            setError('Failed to create test users. See debug logs for details.');
        }
    };

    // Add debug state
    const [showDebugInfo, setShowDebugInfo] = useState(false);
    const [debugLogs, setDebugLogs] = useState([]);
    
    // Debug log function
    const addDebugLog = (message) => {
        const timestamp = new Date().toLocaleTimeString();
        const log = `[${timestamp}] ${message}`;
        setDebugLogs(prevLogs => [log, ...prevLogs].slice(0, 10)); // Keep last 10 logs
        console.log(log);
    };
    
    // Toggle debug panel
    const toggleDebugPanel = () => {
        setShowDebugInfo(!showDebugInfo);
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission
        setIsLoading(true);
        setError('');
        
        addDebugLog(`Attempting login with email: ${email}`);
        console.log('Attempting login with:', { email, password });

        try {
            addDebugLog(`Sending POST request to http://localhost:8080/api/auth/login`);
            // Send login request to the backend
            const response = await axios.post('http://localhost:8080/api/auth/login', {
                email,
                password,
            });

            addDebugLog(`Received response: ${JSON.stringify(response.data)}`);
            console.log('Login API response:', response.data);

            // Extract data from the response
            const { token, userId, category } = response.data;
            
            if (!token || !userId || !category) {
                addDebugLog(`ERROR: Missing required fields in response`);
                console.error('Missing required fields in response:', response.data);
                setError('Invalid response from server. Please try again.');
                setIsLoading(false);
                return;
            }
            
            addDebugLog(`Login successful with category: ${category}`);
            console.log('Login successful:', { category, userId }); // Debugging

            // Store login data temporarily (we'll save to localStorage after pin code)
            setLoginData({ category, userId, token });
            
            // Update user type in the parent component
            if (typeof setUserType === 'function') {
                addDebugLog(`Setting user type to: ${category}`);
                setUserType(category);
            } else {
                addDebugLog(`ERROR: setUserType is not a function`);
                console.error('setUserType is not a function');
                setIsLoading(false);
                return;
            }

            // If the user is a photographer, show the pin code popup
            if (category === 'photographer') {
                addDebugLog(`User is a photographer, showing PIN code popup`);
                setShowPinCodePopup(true);
            } else {
                // For regular users, we'll just proceed with login as usual
                addDebugLog(`User is not a photographer, proceeding with login`);
                completeLogin({ category, userId, token });
            }
        } catch (error) {
            addDebugLog(`Login failed: ${error.message}`);
            console.error('Login failed:', error);
            
            if (error.response) {
                addDebugLog(`Error response (${error.response.status}): ${JSON.stringify(error.response.data)}`);
                console.error('Error response:', error.response.data);
                setError(error.response.data.message || 'Invalid credentials. Please try again.');
            } else if (error.request) {
                addDebugLog(`No response received from server`);
                console.error('No response received:', error.request);
                setError('No response from server. Please check your connection.');
            } else {
                addDebugLog(`Error setting up request: ${error.message}`);
                console.error('Error setting up request:', error.message);
                setError('Error setting up request: ' + error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    // Function to complete the login process after pin code (if applicable)
    const completeLogin = (data) => {
        addDebugLog(`Completing login with data: ${JSON.stringify(data)}`);
        
        try {
            // Validate that we have the required data
            if (!data || !data.token || !data.userId || !data.category) {
                addDebugLog(`ERROR: Invalid login data: ${JSON.stringify(data)}`);
                setError('Invalid login data. Missing required fields.');
                return;
            }
            
        // Store user info in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('userCategory', data.category);
            
            addDebugLog(`Stored authentication data in localStorage: token=${data.token.substring(0, 10)}..., userId=${data.userId}, category=${data.category}`);
        
        // Store additional user information if available
        if (data.userData) {
                addDebugLog(`User data available, storing additional fields`);
            // If we have complete user data object
            if (data.userData.name) {
                localStorage.setItem('userName', data.userData.name);
                    addDebugLog(`Stored userName: ${data.userData.name}`);
            }
            if (data.userData.email) {
                localStorage.setItem('userEmail', data.userData.email);
                    addDebugLog(`Stored userEmail: ${data.userData.email}`);
            }
            if (data.userData.phone) {
                localStorage.setItem('userPhone', data.userData.phone);
                    addDebugLog(`Stored userPhone: ${data.userData.phone}`);
            }
        } else {
            // If we just have userName directly in the response
            if (data.userName) {
                localStorage.setItem('userName', data.userName);
                    addDebugLog(`Stored userName: ${data.userName}`);
            }
            
            // Store the email from the form for future use
            if (email) {
                localStorage.setItem('userEmail', email);
                    addDebugLog(`Stored userEmail from form: ${email}`);
                }
            }
            
            addDebugLog(`User category for redirection: ${data.category}`);
        
        // Redirect based on category
        if (data.category === 'user') {
                addDebugLog(`Redirecting to user dashboard...`);
            navigate('/user-dashboard');
        } else if (data.category === 'photographer') {
                addDebugLog(`Redirecting to photographer dashboard...`);
            navigate('/photographer-dashboard');
        } else {
                addDebugLog(`ERROR: Invalid user category: ${data.category}`);
                setError(`Invalid user category: ${data.category}`);
            }
        } catch (error) {
            addDebugLog(`ERROR during login completion: ${error.message}`);
            console.error('Error during login completion:', error);
            setError('An error occurred during login completion. Please try again.');
        }
    };
    
    // Handle pin code submission
    const handlePinCodeSubmit = (pinCode) => {
        // Save the pin code to localStorage for later use
        localStorage.setItem('pinCode', pinCode);
        
        // Complete the login process
        completeLogin(loginData);
        
        // Close the popup
        setShowPinCodePopup(false);
    };
    
    // Handle skip pin code
    const handleSkipPinCode = () => {
        // Just complete the login without setting a pin code
        completeLogin(loginData);
        
        // Close the popup
        setShowPinCodePopup(false);
    };

    return (
        <div className="login-container" style={{ 
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color-1) 100%)',
            padding: '20px',
            position: 'relative'
        }}>
            {/* Fullscreen button */}
            <div 
                onClick={toggleFullscreen}
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 100
                }}
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
                <i className={`fas ${isFullscreen ? 'fa-compress' : 'fa-expand'}`}></i>
            </div>

            <div className="login-card" style={{
                width: '100%',
                maxWidth: '450px',
                maxHeight: '80vh',
                backgroundColor: 'var(--accent-color-2)',
                borderRadius: '15px',
                boxShadow: 'var(--shadow-lg)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div className="signup-header" style={{
                    background: 'var(--primary-color)',
                    color: 'var(--accent-color-2)',
                    padding: '30px 25px',
                    textAlign: 'center',
                    borderTopLeftRadius: '15px',
                    borderTopRightRadius: '15px'
                }}>
                    <h1 style={{ fontWeight: 'bold', margin: 0 }}>
                        <i className="fas fa-sign-in-alt mr-2"></i>
                        Sign In
                    </h1>
                    <p className="mt-2 mb-0">Welcome back to clickshick.com</p>
                </div>

                <div className="login-body scrollable" style={{ 
                    padding: '30px 25px',
                    overflowY: 'auto',
                    flex: 1,
                    maxHeight: 'calc(80vh - 100px)'
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

                    <form onSubmit={handleSubmit}>
                        <div className="form-group mb-4">
                            <label style={{ fontWeight: 'bold', color: 'var(--primary-color)', marginBottom: '8px', display: 'block' }}>
                                Email Address
                            </label>
                            <div className="input-group" style={{ display: 'flex', width: '100%' }}>
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
                            <label style={{ fontWeight: 'bold', color: 'var(--primary-color)', marginBottom: '8px', display: 'block' }}>
                                Password
                            </label>
                            <div className="input-group" style={{ display: 'flex', width: '100%' }}>
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
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group mb-4 d-flex justify-content-between align-items-center" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div className="custom-control custom-checkbox">
                                <input type="checkbox" className="custom-control-input" id="rememberMe" />
                                <label className="custom-control-label" htmlFor="rememberMe" style={{
                                    marginLeft: '5px',
                                    color: 'var(--text-light)'
                                }}>Remember me</label>
                            </div>
                            <a href="#" style={{ color: 'var(--accent-color-1)', textDecoration: 'none', fontWeight: 'bold' }}>Forgot password?</a>
                        </div>

                        <button 
                            type="submit" 
                            className="btn-primary"
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: 'var(--accent-color-1)',
                                color: 'var(--primary-color)',
                                border: 'none',
                                borderRadius: '5px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                marginBottom: '20px',
                                transition: 'all 0.3s ease'
                            }}
                            disabled={isLoading}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-color-2)'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-color-1)'}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>

                        <div className="text-center" style={{ textAlign: 'center' }}>
                            <p style={{ color: 'var(--text-light)' }}>
                                Don't have an account? 
                                <Link to="/signup" style={{ color: 'var(--accent-color-1)', fontWeight: 'bold', marginLeft: '5px', textDecoration: 'none' }}>
                                    Sign up now
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
            {showPinCodePopup && (
            <PinCodePopup 
                isOpen={showPinCodePopup}
                onClose={handleSkipPinCode}
                onSubmit={handlePinCodeSubmit}
            />
            )}
        </div>
    );
};

export default Login;
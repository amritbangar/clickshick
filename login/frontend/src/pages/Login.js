import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = ({ setUserType }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission
        setIsLoading(true);
        setError('');

        try {
            // Send login request to the backend
            const response = await axios.post('http://localhost:8080/api/auth/login', {
                email,
                password,
            });

            // Extract data from the response
            const { category, userId, token } = response.data;
            console.log('Login successful:', { category, userId }); // Debugging

            // Store user info in localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('userId', userId);
            localStorage.setItem('userCategory', category);

            // Update user type in the parent component
            if (typeof setUserType === 'function') {
                setUserType(category);
            } else {
                console.error('setUserType is not a function');
                setIsLoading(false);
                return;
            }

            // Redirect based on category
            if (category === 'user') {
                navigate('/user-dashboard');
            } else if (category === 'photographer') {
                navigate('/photographer-dashboard');
            } else {
                setError('Invalid user category');
            }
        } catch (error) {
            console.error('Login failed:', error.response?.data || error.message);
            setError(error.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container" style={{ 
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e2e6ea 100%)',
            padding: '20px'
        }}>
            <div className="login-card" style={{
                width: '100%',
                maxWidth: '450px',
                backgroundColor: '#fff',
                borderRadius: '15px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden'
            }}>
                <div className="login-header" style={{
                    background: '#6200ea',
                    color: 'white',
                    padding: '30px 25px',
                    textAlign: 'center',
                    borderTopLeftRadius: '15px',
                    borderTopRightRadius: '15px'
                }}>
                    <h1 style={{ fontWeight: 'bold', margin: 0 }}>
                        <i className="fas fa-camera-retro mr-2"></i>
                        Photography Portal
                    </h1>
                    <p className="mt-2 mb-0">Sign in to access your account</p>
                </div>

                <div className="login-body" style={{ padding: '30px 25px' }}>
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            <i className="fas fa-exclamation-circle mr-2"></i> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group mb-4">
                            <label style={{ fontWeight: 'bold', color: '#495057', marginBottom: '8px', display: 'block' }}>
                                Email Address
                            </label>
                            <div className="input-group" style={{ display: 'flex', width: '100%' }}>
                                <div style={{ 
                                    background: '#f8f9fa', 
                                    border: '1px solid #ced4da', 
                                    borderRight: 'none',
                                    borderRadius: '5px 0 0 5px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    width: '46px',
                                    height: '46px'
                                }}>
                                    <i className="fas fa-user" style={{ color: '#6c757d' }}></i>
                                </div>
                                <input
                                    type="email"
                                    style={{ 
                                        padding: '12px 15px',
                                        border: '1px solid #ced4da',
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
                            <label style={{ fontWeight: 'bold', color: '#495057', marginBottom: '8px', display: 'block' }}>
                                Password
                            </label>
                            <div className="input-group" style={{ display: 'flex', width: '100%' }}>
                                <div style={{ 
                                    background: '#f8f9fa', 
                                    border: '1px solid #ced4da', 
                                    borderRight: 'none',
                                    borderRadius: '5px 0 0 5px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    width: '46px',
                                    height: '46px'
                                }}>
                                    <i className="fas fa-lock" style={{ color: '#6c757d' }}></i>
                                </div>
                                <input
                                    type="password"
                                    style={{ 
                                        padding: '12px 15px',
                                        border: '1px solid #ced4da',
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

                        <div className="form-group mb-4 d-flex justify-content-between align-items-center">
                            <div className="custom-control custom-checkbox">
                                <input type="checkbox" className="custom-control-input" id="rememberMe" />
                                <label className="custom-control-label" htmlFor="rememberMe">Remember me</label>
                            </div>
                            <a href="#" style={{ color: '#6200ea', textDecoration: 'none' }}>Forgot password?</a>
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-block" 
                            style={{ 
                                backgroundColor: '#6200ea',
                                color: 'white',
                                padding: '12px',
                                borderRadius: '5px',
                                fontWeight: 'bold',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'background-color 0.3s'
                            }}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-sign-in-alt mr-2"></i>
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center mt-4">
                        <p style={{ color: '#6c757d' }}>
                            Don't have an account? <Link to="/signup" style={{ color: '#6200ea', fontWeight: 'bold', textDecoration: 'none' }}>Sign Up</Link>
                        </p>
                    </div>
                </div>

                <div className="login-footer" style={{
                    padding: '15px',
                    textAlign: 'center',
                    borderTop: '1px solid #eee',
                    backgroundColor: '#f8f9fa'
                }}>
                    <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                        © 2024 Photography Portal. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
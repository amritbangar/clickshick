import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [category, setCategory] = useState('user'); // Default category
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

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

    return (
        <div className="signup-container" style={{ 
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e2e6ea 100%)',
            padding: '20px'
        }}>
            <div className="signup-card" style={{
                width: '100%',
                maxWidth: '500px',
                backgroundColor: '#fff',
                borderRadius: '15px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden'
            }}>
                <div className="signup-header" style={{
                    background: '#6200ea',
                    color: 'white',
                    padding: '30px 25px',
                    textAlign: 'center',
                    borderTopLeftRadius: '15px',
                    borderTopRightRadius: '15px'
                }}>
                    <h1 style={{ fontWeight: 'bold', margin: 0 }}>
                        <i className="fas fa-user-plus mr-2"></i>
                        Create Account
                    </h1>
                    <p className="mt-2 mb-0">Join Photography Portal today</p>
                </div>

                <div className="signup-body" style={{ padding: '30px 25px' }}>
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            <i className="fas fa-exclamation-circle mr-2"></i> {error}
                        </div>
                    )}

                    {message && (
                        <div className="alert alert-success" role="alert">
                            <i className="fas fa-check-circle mr-2"></i> {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group mb-4">
                            <label style={{ fontWeight: 'bold', color: '#495057', marginBottom: '8px', display: 'block' }}>
                                Full Name
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
                                    type="text"
                                    style={{ 
                                        padding: '12px 15px',
                                        border: '1px solid #ced4da',
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
                                    <i className="fas fa-envelope" style={{ color: '#6c757d' }}></i>
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
                                    placeholder="Create a password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <small className="form-text text-muted">Password must be at least 4 characters long</small>
                        </div>

                        <div className="form-group mb-4">
                            <label style={{ fontWeight: 'bold', color: '#495057', marginBottom: '8px', display: 'block' }}>
                                Confirm Password
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
                                    placeholder="Confirm your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group mb-4">
                            <label style={{ fontWeight: 'bold', color: '#495057', marginBottom: '8px', display: 'block', fontSize: '16px' }}>
                                Account Type
                            </label>
                            <div style={{ 
                                display: 'flex', 
                                width: '100%', 
                                marginTop: '10px', 
                                borderRadius: '5px',
                                padding: '5px'
                            }}>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    marginRight: '20px',
                                    padding: '8px 15px',
                                    cursor: 'pointer',
                                    backgroundColor: category === 'user' ? '#f0e6ff' : 'transparent',
                                    borderRadius: '5px',
                                    border: category === 'user' ? '1px solid #6200ea' : '1px solid #ced4da' 
                                }} onClick={() => setCategory('user')}>
                                    <input 
                                        type="radio" 
                                        id="userRadio" 
                                        name="category"
                                        style={{ marginRight: '10px', transform: 'scale(1.2)', cursor: 'pointer' }}
                                        checked={category === 'user'}
                                        onChange={() => setCategory('user')}
                                    />
                                    <label htmlFor="userRadio" style={{ margin: 0, fontSize: '16px', cursor: 'pointer' }}>
                                        <i className="fas fa-user mr-2" style={{ color: '#6200ea' }}></i> User
                                    </label>
                                </div>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    padding: '8px 15px',
                                    cursor: 'pointer',
                                    backgroundColor: category === 'photographer' ? '#f0e6ff' : 'transparent',
                                    borderRadius: '5px',
                                    border: category === 'photographer' ? '1px solid #6200ea' : '1px solid #ced4da' 
                                }} onClick={() => setCategory('photographer')}>
                                    <input 
                                        type="radio" 
                                        id="photographerRadio" 
                                        name="category"
                                        style={{ marginRight: '10px', transform: 'scale(1.2)', cursor: 'pointer' }}
                                        checked={category === 'photographer'}
                                        onChange={() => setCategory('photographer')}
                                    />
                                    <label htmlFor="photographerRadio" style={{ margin: 0, fontSize: '16px', cursor: 'pointer' }}>
                                        <i className="fas fa-camera mr-2" style={{ color: '#6200ea' }}></i> Photographer
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="form-group mb-4">
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                padding: '10px 15px',
                                borderRadius: '5px',
                                border: '1px solid #ced4da',
                                backgroundColor: '#f8f9fa'
                            }}>
                                <input 
                                    type="checkbox" 
                                    id="termsCheck" 
                                    style={{ 
                                        marginRight: '15px', 
                                        transform: 'scale(1.2)',
                                        cursor: 'pointer' 
                                    }}
                                    required 
                                />
                                <label htmlFor="termsCheck" style={{ 
                                    margin: 0, 
                                    fontSize: '16px',
                                    cursor: 'pointer' 
                                }}>
                                    I agree to the <a href="#" style={{ color: '#6200ea', fontWeight: 'bold' }}>Terms of Service</a> and <a href="#" style={{ color: '#6200ea', fontWeight: 'bold' }}>Privacy Policy</a>
                                </label>
                            </div>
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
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-user-plus mr-2"></i>
                                    Sign Up
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center mt-4">
                        <p style={{ color: '#6c757d' }}>
                            Already have an account? <Link to="/login" style={{ color: '#6200ea', fontWeight: 'bold', textDecoration: 'none' }}>Sign In</Link>
                        </p>
                    </div>
                </div>

                <div className="signup-footer" style={{
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

export default Signup;
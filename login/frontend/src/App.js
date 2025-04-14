import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserDashboard from './pages/UserDashboard';
import PhotographerDashboard from './pages/PhotographerDashboard';
import './App.css';

const App = () => {
    const [userType, setUserType] = useState(null);
    
    // Check authentication status on app load
    useEffect(() => {
        const token = localStorage.getItem('token');
        const category = localStorage.getItem('userCategory');
        
        if (token && category) {
            setUserType(category);
        }
    }, []);

    // Protected route component
    const ProtectedRoute = ({ element, allowedUserType }) => {
        const token = localStorage.getItem('token');
        const category = localStorage.getItem('userCategory');
        
        if (!token) {
            // Not logged in, redirect to login
            return <Navigate to="/login" replace />;
        }
        
        if (category !== allowedUserType) {
            // Wrong user type, redirect to home
            return <Navigate to="/" replace />;
        }
        
        // User is authenticated and has correct type
        return element;
    };

    return (
        <Router>
            <div className="flex flex-col min-h-screen">
                <main className="flex-grow">
                    <Routes>
                        {/* Home Page */}
                        <Route path="/" element={<Home />} />

                        {/* Login Page */}
                        <Route
                            path="/login"
                            element={<Login setUserType={setUserType} />}
                        />

                        {/* Signup Page */}
                        <Route path="/signup" element={<Signup />} />

                        {/* User Dashboard */}
                        <Route
                            path="/user-dashboard"
                            element={
                                <ProtectedRoute 
                                    element={<UserDashboard />} 
                                    allowedUserType="user" 
                                />
                            }
                        />

                        {/* Photographer Dashboard */}
                        <Route
                            path="/photographer-dashboard"
                            element={
                                <ProtectedRoute 
                                    element={<PhotographerDashboard />} 
                                    allowedUserType="photographer" 
                                />
                            }
                        />
                    </Routes>
                </main>
            </div>
        </Router>
    );
};

export default App;
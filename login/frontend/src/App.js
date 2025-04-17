import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserDashboard from './pages/UserDashboard';
import PhotographerDashboard from './pages/PhotographerDashboard';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ThemeProvider from './components/ThemeProvider';
import './styles/reset.css';
import './styles/globalStyles.css';

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
    const ProtectedRoute = ({ children, allowedUserType }) => {
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
        return children;
    };

    // Layout component with navbar for public pages (excluding Home, Login, and Signup)
    const PublicLayout = ({ children, hideFooter = false }) => {
        return (
            <div className="app-container">
                <Navbar />
                <main className="flex-grow">
                    {children}
                </main>
                {!hideFooter && <Footer />}
            </div>
        );
    };
    
    // Layout component for Home, Login and Signup pages without navbar
    const CleanLayout = ({ children, hideFooter = false }) => {
        return (
            <div className="app-container">
                <main className="flex-grow">
                    {children}
                </main>
                {!hideFooter && <Footer />}
            </div>
        );
    };

    // Dashboard Layout without navbar
    const DashboardLayout = ({ children, hideFooter = false }) => {
        return (
            <div className="app-container dashboard-container">
                <main className="flex-grow">
                    {children}
                </main>
                {!hideFooter && <Footer />}
            </div>
        );
    };

    return (
        <ThemeProvider>
            <Router>
                <Routes>
                    {/* Home Page - use CleanLayout without navbar */}
                    <Route 
                        path="/" 
                        element={
                            <CleanLayout>
                                <Home />
                            </CleanLayout>
                        } 
                    />

                    {/* Login Page - use CleanLayout without navbar */}
                    <Route
                        path="/login"
                        element={
                            <CleanLayout>
                                <Login setUserType={setUserType} />
                            </CleanLayout>
                        }
                    />

                    {/* Signup Page - use CleanLayout without navbar */}
                    <Route 
                        path="/signup" 
                        element={
                            <CleanLayout>
                                <Signup />
                            </CleanLayout>
                        } 
                    />

                    {/* User Dashboard */}
                    <Route
                        path="/user-dashboard"
                        element={
                            <ProtectedRoute allowedUserType="user">
                                <DashboardLayout>
                                    <UserDashboard />
                                </DashboardLayout>
                            </ProtectedRoute>
                        }
                    />

                    {/* Photographer Dashboard */}
                    <Route
                        path="/photographer-dashboard"
                        element={
                            <ProtectedRoute allowedUserType="photographer">
                                <DashboardLayout>
                                    <PhotographerDashboard />
                                </DashboardLayout>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Router>
        </ThemeProvider>
    );
};

export default App;
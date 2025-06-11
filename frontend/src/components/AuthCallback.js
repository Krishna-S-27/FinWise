// src/components/AuthCallback.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthCallback = () => {
    const navigate = useNavigate();

    // Best Practice: Use an environment variable for the API URL
    const API_URL = "https://finwise-backend-latest2.onrender.com/api";

    useEffect(() => {
        const handleAuthCallback = async () => {
            if (!API_URL) {
                console.error("API URL is not defined. Please set REACT_APP_API_URL environment variable.");
                navigate('/'); // Redirect home on configuration error
                return;
            }

            try {
                // Check user authentication status after OAuth callback
                const res = await axios.get(`${API_URL}/auth/user`, {
                    withCredentials: true
                });

                if (res.data && res.data.isAuthenticated) {
                    const user = res.data.user;

                    // FIX: Store the authentication status and the entire user object once.
                    // Avoid storing each property individually, as it's redundant.
                    // Other components can parse the 'user' object to get the details they need.
                    localStorage.setItem('isAuthenticated', 'true');
                    localStorage.setItem('user', JSON.stringify(user));
                    
                    // You might still want to store the familyProfileId separately for convenience, as it's used in API calls.
                    if (user.familyProfileId) {
                        localStorage.setItem('familyProfileId', user.familyProfileId);
                    }
                    
                    console.log('User data stored successfully:', user);

                    // Redirect based on the isNewUser flag
                    if (user.isNewUser) {
                        navigate('/family-details');
                    } else {
                        navigate('/dashboard');
                    }
                } else {
                    // Handle cases where the request succeeds but the user is not authenticated
                    localStorage.clear(); // Clear any stale auth data
                    navigate('/');
                }
            } catch (error) {
                console.error('Auth callback error:', error);
                localStorage.clear(); // Clear any stale auth data on error
                navigate('/');
            }
        };

        handleAuthCallback();
    }, [navigate, API_URL]); // Add API_URL to the dependency array

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-indigo-950">
            <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
                <p className="text-lg">Completing your login...</p>
            </div>
        </div>
    );
};

export default AuthCallback;

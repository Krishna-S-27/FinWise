// src/components/AuthCallback.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthCallback = () => {
const navigate = useNavigate();

useEffect(() => {
const handleAuthCallback = async () => {
try {
// Check user authentication status after OAuth callback
const res = await axios.get("https://fullstack-backend-kosy.onrender.com/api/auth/user", {
withCredentials: true
});

if (res.data.isAuthenticated) {
// Store user data in local storage based on your backend response
localStorage.setItem('user', JSON.stringify(res.data.user));
localStorage.setItem('isAuthenticated', 'true');

// Store individual user properties for easy access
localStorage.setItem('userId', res.data.user.id);
localStorage.setItem('userEmail', res.data.user.email);
localStorage.setItem('userFirstName', res.data.user.firstName);
localStorage.setItem('userLastName', res.data.user.lastName);
localStorage.setItem('userImage', res.data.user.image || '');
localStorage.setItem('isNewUser', res.data.user.isNewUser)
localStorage.setItem('familyProfileId',res.data.user.familyProfileId)

console.log('User data stored:', res.data.user);

// Check the isNewUser flag and redirect accordingly
if (res.data.user.isNewUser) {
navigate('/family-details');
} else {
navigate('/dashboard');
}
} else {
// Authentication failed, redirect to landing
navigate('/');
}
} catch (error) {
console.error('Auth callback error:', error);
navigate('/');
}
};

handleAuthCallback();
}, [navigate]);

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

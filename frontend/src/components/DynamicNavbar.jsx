import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    DollarSign,
    Bell,
    Settings,
    User,
    Users,
    MapPin,
    LogOut,
    ChevronDown,
    Home,
    PieChart
} from 'lucide-react';
import axios from 'axios';

const DynamicNavbar = () => {
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState(null);
    const [familyProfile, setFamilyProfile] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUserAndFamilyData();
        fetchNotifications();
    }, []);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.dropdown-container')) {
                setShowProfileMenu(false);
                setShowNotifications(false);
            }
        };

        if (showProfileMenu || showNotifications) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showProfileMenu, showNotifications]);

    const fetchUserAndFamilyData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch current user info
            const userResponse = await axios.get('https://finwise-backend-latest2.onrender.com/api/auth/user', {
                withCredentials: true,
                timeout: 10000
            });

            if (userResponse.data && userResponse.data.isAuthenticated) {
                setUserProfile(userResponse.data.user);

                // Fetch family profile data
                try {
                    const familyResponse = await axios.get('https://finwise-backend-latest2.onrender.com/api/familyProfile', {
                        withCredentials: true,
                        timeout: 10000
                    });

                    if (familyResponse.data && familyResponse.data.length > 0) {
                        setFamilyProfile(familyResponse.data[0]);
                    }
                } catch (familyError) {
                    // It's okay if no family profile yet
                    console.log('No family profile found');
                }
            } else {
                navigate('/');
                return;
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            setError(error.message);

            if (error.response?.status === 401) {
                navigate('/');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchNotifications = async () => {
        try {
            const response = await axios.get('https://finwise-backend-latest2.onrender.com/api/notifications', {
                withCredentials: true,
                timeout: 5000
            });
            setNotifications(response.data || []);
        } catch (error) {
            // Set mock notifications if API fails
            setNotifications([
                { id: 1, title: 'Welcome!', message: 'Complete your family profile', type: 'INFO', isRead: false },
                { id: 2, title: 'Investment Alert', message: 'New investment opportunity available', type: 'SUCCESS', isRead: false }
            ]);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post('https://finwise-backend-latest2.onrender.com/api/auth/logout', {}, {
                withCredentials: true
            });
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = '/';
        }
    };

    const markNotificationAsRead = async (notificationId) => {
        try {
            await axios.patch(`https://finwise-backend-latest2.onrender.com/api/notifications/${notificationId}/read`, {}, {
                withCredentials: true
            });
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === notificationId ? { ...notif, isRead: true } : notif
                )
            );
        } catch (error) {
            // Still update locally even if API call fails
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === notificationId ? { ...notif, isRead: true } : notif
                )
            );
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'WARNING': return '⚠️';
            case 'SUCCESS': return '✅';
            case 'INFO': return 'ℹ️';
            default: return '📢';
        }
    };

    const getFullName = (user) => {
        if (!user) return 'User';
        const firstName = user.firstName || '';
        const lastName = user.lastName || '';
        return `${firstName} ${lastName}`.trim() || 'User';
    };

    const unreadNotifications = notifications.filter(n => !n.isRead);

    if (error) {
        return (
            <nav className="px-6 py-4 flex justify-between items-center md:px-16 lg:px-24 border-b border-white/10 bg-gradient-to-r from-blue-900/50 to-indigo-900/50">
                <div className="flex items-center space-x-3">
                    <DollarSign size={24} className="text-emerald-400" />
                    <h1 className="text-2xl font-bold tracking-tight">
                        <span className="text-emerald-400">Fin</span>Wise
                    </h1>
                </div>
                <div className="text-red-400 text-sm">
                    Connection Error - Please refresh
                </div>
            </nav>
        );
    }

    if (loading) {
        return (
            <nav className="px-6 py-4 flex justify-between items-center md:px-16 lg:px-24 border-b border-white/10 bg-gradient-to-r from-blue-900/50 to-indigo-900/50">
                <div className="flex items-center space-x-3">
                    <DollarSign size={24} className="text-emerald-400" />
                    <h1 className="text-2xl font-bold tracking-tight">
                        <span className="text-emerald-400">Fin</span>Wise
                    </h1>
                </div>
                <div className="animate-pulse flex items-center space-x-4">
                    <div className="h-8 w-8 bg-gray-600 rounded-full"></div>
                    <div className="h-4 w-20 bg-gray-600 rounded"></div>
                </div>
            </nav>
        );
    }

    return (
        <nav className="relative px-6 py-4 flex justify-between items-center md:px-16 lg:px-24 border-b border-white/10 bg-gradient-to-r from-blue-900/50 to-indigo-900/50 backdrop-blur-sm z-50">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
                <DollarSign size={24} className="text-emerald-400" />
                <h1 className="text-2xl font-bold tracking-tight">
                    <span className="text-emerald-400">Fin</span>Wise
                </h1>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                >
                    <Home size={18}/>
                    <span>Dashboard</span>
                </button>
                <button
                    onClick={() => navigate('/Education')}
                    className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                >
                    <PieChart size={18}/>
                    <span>Education</span>
                </button>
                <button
                    onClick={() => navigate('/Marriage')}
                    className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                >
                    <PieChart size={18}/>
                    <span>Marriage</span>
                </button>
                <button
                    onClick={() => navigate('/investment')}
                    className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                >
                    <PieChart size={18}/>
                    <span>Investments</span>
                </button>
                <button
                    onClick={() => navigate('/investment-options')}
                    className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                >
                    <PieChart size={18}/>
                    <span>Investment Options</span>
                </button>
                <button
                    onClick={() => navigate('/report')}
                    className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                >
                    <PieChart size={18}/>
                    <span>Reports</span>
                </button>
            </div>

            {/* Right Side - User Info and Actions */}
            <div className="flex items-center space-x-4">
                {/* Notifications */}
                <div className="relative dropdown-container">
                    <button
                        className="p-2 rounded-full hover:bg-white/5 relative transition-colors"
                        onClick={() => {
                            setShowNotifications(!showNotifications);
                            setShowProfileMenu(false);
                        }}
                    >
                        <Bell size={20} className="text-gray-300" />
                        {unreadNotifications.length > 0 && (
                            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-semibold">
                                {unreadNotifications.length > 9 ? '9+' : unreadNotifications.length}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-white text-gray-900 rounded-lg shadow-2xl border border-gray-200 z-[100] transform transition-all duration-200 ease-out">
                            <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                                <h3 className="font-semibold text-gray-800">Notifications</h3>
                                {unreadNotifications.length > 0 && (
                                    <p className="text-xs text-gray-600 mt-1">
                                        {unreadNotifications.length} unread
                                    </p>
                                )}
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-6 text-gray-500 text-center">
                                        <Bell size={24} className="mx-auto mb-2 text-gray-400" />
                                        <p>No notifications</p>
                                    </div>
                                ) : (
                                    notifications.slice(0, 5).map(notification => (
                                        <div
                                            key={notification.id}
                                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                                                !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                                            }`}
                                            onClick={() => markNotificationAsRead(notification.id)}
                                        >
                                            <div className="flex items-start space-x-3">
                                                <span className="text-lg flex-shrink-0">
                                                    {getNotificationIcon(notification.type)}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm text-gray-900 truncate">
                                                        {notification.title}
                                                    </p>
                                                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                </div>
                                                {!notification.isRead && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            {notifications.length > 5 && (
                                <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                                    <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                                        View all notifications
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="relative dropdown-container">
                    <button
                        className="flex items-center space-x-3 hover:bg-white/5 rounded-lg p-2 transition-colors"
                        onClick={() => {
                            setShowProfileMenu(!showProfileMenu);
                            setShowNotifications(false);
                        }}
                    >
                        {/* Profile Picture */}
                        <div className="relative flex-shrink-0">
                            {userProfile?.image ? (
                                <img
                                    src={userProfile.image}
                                    alt="Profile"
                                    className="h-8 w-8 rounded-full border-2 border-emerald-400/50 object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            <div
                                className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400"
                                style={{ display: userProfile?.image ? 'none' : 'flex' }}
                            >
                                <User size={18} />
                            </div>
                        </div>
                        <div className="text-left hidden md:block min-w-0">
                            <div className="text-sm font-medium text-gray-300 truncate">
                                {getFullName(userProfile)}
                            </div>
                            {familyProfile && (
                                <div className="flex items-center text-xs text-gray-400">
                                    <Users size={10} className="mr-1 flex-shrink-0" />
                                    <span className="truncate">
                                        {familyProfile.familySize} members
                                        {familyProfile.location && (
                                            <>
                                                <MapPin size={10} className="ml-2 mr-1 inline" />
                                                {familyProfile.location}
                                            </>
                                        )}
                                    </span>
                                </div>
                            )}
                        </div>
                        <ChevronDown
                            size={16}
                            className={`text-gray-400 transition-transform duration-200 ${
                                showProfileMenu ? 'rotate-180' : ''
                            }`}
                        />
                    </button>

                    {/* Profile Dropdown Menu */}
                    {showProfileMenu && (
                        <div className="absolute right-0 mt-2 w-72 bg-white text-gray-900 rounded-lg shadow-2xl border border-gray-200 z-[100] transform transition-all duration-200 ease-out">
                            {/* Profile Header */}
                            <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="flex-shrink-0">
                                        {userProfile?.image ? (
                                            <img
                                                src={userProfile.image}
                                                alt="Profile"
                                                className="h-12 w-12 rounded-full border-2 border-emerald-400/50 object-cover"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div
                                            className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400"
                                            style={{ display: userProfile?.image ? 'none' : 'flex' }}
                                        >
                                            <User size={24} />
                                        </div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-gray-900 font-semibold truncate">
                                            {getFullName(userProfile)}
                                        </p>
                                        <p className="text-gray-600 text-sm truncate">
                                            {userProfile?.email || 'user@example.com'}
                                        </p>
                                    </div>
                                </div>
                                {familyProfile && (
                                    <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                        <div className="text-xs text-emerald-700 font-semibold mb-2">
                                            Family Profile
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-xs text-gray-700">
                                                Monthly Savings: ₹{(familyProfile.monthlyIncome - familyProfile.monthlyExpenses).toLocaleString()}
                                            </div>
                                            <div className="text-xs text-gray-600">
                                                Risk Tolerance: {familyProfile.riskTolerance}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Menu Items */}
                            <div className="py-2">
                                <button
                                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors flex items-center space-x-2"
                                    onClick={() => {
                                        navigate('/profile');
                                        setShowProfileMenu(false);
                                    }}
                                >
                                    <User size={16} />
                                    <span>View Profile</span>
                                </button>
                                <button
                                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors flex items-center space-x-2"
                                    onClick={() => {
                                        navigate('/updateFamilyDetails');
                                        setShowProfileMenu(false);
                                    }}
                                >
                                    <Users size={16} />
                                    <span>Edit Family Profile</span>
                                </button>
                                <hr className="my-2 border-gray-200" />
                                <button
                                    className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center space-x-2"
                                    onClick={() => {
                                        handleLogout();
                                        setShowProfileMenu(false);
                                    }}
                                >
                                    <LogOut size={16} />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default DynamicNavbar;

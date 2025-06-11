import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Users,
    DollarSign,
    MapPin,
    Shield,
    GraduationCap,
    Edit,
    Calendar,
    TrendingUp,
    Home,
    RefreshCw,
    AlertCircle,
    ArrowUpRight
} from 'lucide-react';
import axios from 'axios';
import DynamicNavbar from './DynamicNavbar';

const ProfilePage = () => {
    const [familyData, setFamilyData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const navigate = useNavigate();


    useEffect(() => {
        fetchFamilyProfile();
    }, []);

    const fetchFamilyProfile = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get familyProfileId from localStorage
            const familyProfileId = localStorage.getItem('familyProfileId');

            if (!familyProfileId) {
                setError('Family profile ID not found. Please complete your profile setup.');
                setLoading(false);
                return;
            }

            // Create axios instance with default config
            const apiClient = axios.create({
                baseURL: 'https://finwise-backend-latest2.onrender.com/api',
                timeout: 10000,
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            // Add request interceptor for authentication
            apiClient.interceptors.request.use(
                (config) => {
                    const token = localStorage.getItem('authToken');
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                    return config;
                },
                (error) => Promise.reject(error)
            );

            // Add response interceptor for error handling
            apiClient.interceptors.response.use(
                (response) => response,
                (error) => {
                    if (error.response?.status === 401) {
                        localStorage.removeItem('authToken');
                        window.location.href = '/login';
                    }
                    return Promise.reject(error);
                }
            );

            // Fetch family profile using the ID
            const response = await apiClient.get(`/familyProfile/${familyProfileId}`);

            setFamilyData(response.data);
        } catch (error) {
            console.error('Error fetching family profile:', error);
            setError(error.response?.data?.message || error.message || 'Failed to load family profile');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchFamilyProfile();
    };

    const getRiskToleranceDisplay = (riskTolerance) => {
        switch (riskTolerance) {
            case 'LOW': return { label: 'Conservative', color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
            case 'MEDIUM': return { label: 'Moderate', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
            case 'HIGH': return { label: 'Aggressive', color: 'text-red-400', bg: 'bg-red-500/20' };
            default: return { label: 'Not Set', color: 'text-gray-400', bg: 'bg-gray-500/20' };
        }
    };

    const calculateAge = (dateOfBirth) => {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-950">
                <DynamicNavbar />
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
                        <p className="text-white">Loading profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-950 text-white">
                <DynamicNavbar />
                <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24 py-8">
                    {/* Error Alert */}
                    <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-lg p-4 flex items-center space-x-3">
                        <AlertCircle className="text-red-400 w-5 h-5" />
                        <div>
                            <p className="text-red-300 font-medium">Profile Not Found</p>
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    </div>

                    <div className="text-center">
                        <button
                            onClick={handleRefresh}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-4"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => window.location.href = '/family-details'}
                            className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                        >
                            Complete Profile
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const riskDisplay = getRiskToleranceDisplay(familyData?.riskTolerance);
    const monthlySavings = familyData ? familyData.monthlyIncome - familyData.monthlyExpenses : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-950 text-white">
            <DynamicNavbar />

            <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24 py-8">
                {/* Profile Header with Refresh Button */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Family Profile</h1>
                        <p className="text-gray-300">Manage your family's financial information and goals</p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </button>
                </div>

                {/* Profile Header Card */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 mb-8">
                    <div className="flex items-center space-x-6">
                        {/* Profile Picture */}
                        <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center">
                            <Home size={40} className="text-white/60" />
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-white mb-2">Family Financial Profile</h2>
                            <p className="text-gray-300 flex items-center mb-2">
                                <MapPin size={16} className="mr-2" />
                                {familyData?.location || 'Location not set'}
                            </p>
                            <p className="text-gray-400">
                                Managing finances for a family of {familyData?.familySize || 0} members
                            </p>
                        </div>

                        {/* Edit Button */}
                        <button
                            className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
                            onClick={() => navigate('/updateFamilyDetails')}
                        >
                            <Edit size={16}/>
                            <span>Edit Profile</span>
                        </button>
                    </div>
                </div>

                {/* Financial Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Monthly Income Card */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-emerald-500/20 rounded-lg">
                                <DollarSign className="text-emerald-400" size={24} />
                            </div>
                            <ArrowUpRight className="text-emerald-400" size={20} />
                        </div>
                        <h3 className="text-gray-300 text-sm font-medium">Monthly Income</h3>
                        <p className="text-2xl font-bold text-white">
                            {familyData?.monthlyIncome ? formatCurrency(familyData.monthlyIncome) : '₹0'}
                        </p>
                        <p className="text-emerald-400 text-sm mt-1">Stable income</p>
                    </div>

                    {/* Monthly Expenses Card */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-red-500/20 rounded-lg">
                                <TrendingUp className="text-red-400" size={24} />
                            </div>
                        </div>
                        <h3 className="text-gray-300 text-sm font-medium">Monthly Expenses</h3>
                        <p className="text-2xl font-bold text-white">
                            {familyData?.monthlyExpenses ? formatCurrency(familyData.monthlyExpenses) : '₹0'}
                        </p>
                        <p className="text-red-400 text-sm mt-1">Well managed</p>
                    </div>

                    {/* Monthly Savings Card */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <TrendingUp className="text-blue-400" size={24} />
                            </div>
                            <ArrowUpRight className="text-blue-400" size={20} />
                        </div>
                        <h3 className="text-gray-300 text-sm font-medium">Monthly Savings</h3>
                        <p className={`text-2xl font-bold ${monthlySavings >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                            {formatCurrency(monthlySavings)}
                        </p>
                        <p className="text-blue-400 text-sm mt-1">
                            {familyData?.monthlyIncome > 0 ?
                                `${((monthlySavings / familyData.monthlyIncome) * 100).toFixed(1)}% savings rate` :
                                'Set income first'
                            }
                        </p>
                    </div>

                    {/* Family Size Card */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <Users className="text-purple-400" size={24} />
                            </div>
                        </div>
                        <h3 className="text-gray-300 text-sm font-medium">Family Members</h3>
                        <p className="text-2xl font-bold text-white">{familyData?.familySize || 0}</p>
                        <p className="text-purple-400 text-sm mt-1">Total members</p>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Family Overview */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                            <Users className="mr-2 text-blue-400" size={20} />
                            Family Overview
                        </h2>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Family Size</span>
                                <span className="text-white font-medium">{familyData?.familySize || 0} members</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Location</span>
                                <span className="text-white font-medium">{familyData?.location || 'Not set'}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Risk Tolerance</span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${riskDisplay.bg} ${riskDisplay.color}`}>
                                    {riskDisplay.label}
                                </span>
                            </div>

                            {/* Savings Rate Progress */}
                            {familyData?.monthlyIncome > 0 && (
                                <div className="mt-6">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-300 text-sm">Savings Rate</span>
                                        <span className="text-gray-300 text-sm">
                                            {((monthlySavings / familyData.monthlyIncome) * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${monthlySavings >= 0 ? 'bg-blue-400' : 'bg-red-400'}`}
                                            style={{
                                                width: `${Math.min(Math.abs((monthlySavings / familyData.monthlyIncome) * 100), 100)}%`
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Investment Profile */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                            <Shield className="mr-2 text-purple-400" size={20} />
                            Investment Profile
                        </h2>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Risk Tolerance</span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${riskDisplay.bg} ${riskDisplay.color}`}>
                                    {riskDisplay.label}
                                </span>
                            </div>

                            <div className="p-4 bg-white/5 rounded-lg">
                                <p className="text-gray-300 text-sm">
                                    {familyData?.riskTolerance === 'LOW' &&
                                        "You prefer stable, low-risk investments with predictable returns. Consider fixed deposits, government bonds, and conservative mutual funds."}
                                    {familyData?.riskTolerance === 'MEDIUM' &&
                                        "You're comfortable with moderate risk for potentially higher returns. Consider a balanced portfolio of stocks, bonds, and mutual funds."}
                                    {familyData?.riskTolerance === 'HIGH' &&
                                        "You're willing to take higher risks for potentially higher returns. Consider growth stocks, equity mutual funds, and emerging market investments."}
                                    {!familyData?.riskTolerance &&
                                        "Set your risk tolerance to get personalized investment recommendations."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Children Information */}
                {familyData?.children && familyData.children.length > 0 && (
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                            <GraduationCap className="mr-2 text-indigo-400" size={20} />
                            Children ({familyData.children.length})
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {familyData.children.map((child, index) => (
                                <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-medium text-white">{child.name}</h3>
                                        <span className="text-sm text-gray-400 flex items-center">
                                            <Calendar size={14} className="mr-1" />
                                            {calculateAge(child.dateOfBirth)} years
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-300 mb-1">
                                        <strong>Education:</strong> {child.currentEducationLevel?.replace('_', ' ') || 'Not specified'}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        <strong>DOB:</strong> {new Date(child.dateOfBirth).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                    <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button className="flex items-center space-x-3 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-left">
                            <Edit className="text-blue-400" size={20} />
                            <div>
                                <p className="text-white font-medium">Update Family Details</p>
                                <p className="text-gray-400 text-sm">Modify your profile information</p>
                            </div>
                        </button>

                        <button className="flex items-center space-x-3 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-left">
                            <TrendingUp className="text-green-400" size={20} />
                            <div>
                                <p className="text-white font-medium">View Financial Goals</p>
                                <p className="text-gray-400 text-sm">Track your progress</p>
                            </div>
                        </button>

                        <button className="flex items-center space-x-3 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-left">
                            <Shield className="text-purple-400" size={20} />
                            <div>
                                <p className="text-white font-medium">Investment Recommendations</p>
                                <p className="text-gray-400 text-sm">Get personalized advice</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;

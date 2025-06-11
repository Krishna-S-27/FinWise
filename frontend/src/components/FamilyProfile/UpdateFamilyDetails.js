import React, { useState, useEffect } from 'react';
import {
    Users,
    DollarSign,
    MapPin,
    Shield,
    Save,
    ArrowLeft,
    AlertCircle,
    CheckCircle,
    RefreshCw,
    Edit,
    TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DynamicNavbar from '../DynamicNavbar';

const UpdateFamilyProfile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [updateMode, setUpdateMode] = useState(null);

    // Form state - exactly like FamilyDetails
    const [familySize, setFamilySize] = useState('');
    const [monthlyIncome, setMonthlyIncome] = useState('');
    const [monthlyExpenses, setMonthlyExpenses] = useState('');
    const [location, setLocation] = useState('');
    const [riskTolerance, setRiskTolerance] = useState('moderate');

    useEffect(() => {
        fetchFamilyProfile();
    }, []);

    // Risk tolerance mapping - exactly like FamilyDetails
    const getRiskToleranceForDb = (riskTolerance) => {
        switch (riskTolerance) {
            case 'conservative': return 'LOW';
            case 'moderate': return 'MEDIUM';
            case 'aggressive': return 'HIGH';
            default: return 'MEDIUM';
        }
    };

    const getRiskToleranceFromDb = (riskTolerance) => {
        switch (riskTolerance) {
            case 'LOW': return 'conservative';
            case 'MEDIUM': return 'moderate';
            case 'HIGH': return 'aggressive';
            default: return 'moderate';
        }
    };

    const fetchFamilyProfile = async () => {
        try {
            setLoading(true);
            setError(null);

            const familyProfileId = localStorage.getItem('familyProfileId');

            if (!familyProfileId) {
                setError('Family profile ID not found. Please complete your profile setup.');
                setLoading(false);
                return;
            }

            // Use exact same axios configuration as FamilyDetails
            const response = await axios.get(`https://fullstack-backend-kosy.onrender.com/api/familyProfile/${familyProfileId}`, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = response.data;

            // Populate form with existing data
            setFamilySize(data.familySize?.toString() || '');
            setMonthlyIncome(data.monthlyIncome?.toString() || '');
            setMonthlyExpenses(data.monthlyExpenses?.toString() || '');
            setLocation(data.location || '');
            setRiskTolerance(getRiskToleranceFromDb(data.riskTolerance) || 'moderate');

        } catch (error) {
            console.error('Error fetching family profile:', error);
            setError('Failed to load family profile data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            const familyProfileId = localStorage.getItem('familyProfileId');

            if (!familyProfileId) {
                setError('Family profile ID not found');
                setSaving(false);
                return;
            }

            let familyData;

            if (updateMode === 'financial') {
                // Only update financial data
                familyData = {
                    monthlyIncome: parseFloat(monthlyIncome),
                    monthlyExpenses: parseFloat(monthlyExpenses)
                };
            } else {
                // Update all data - use exact same structure as FamilyDetails
                familyData = {
                    familySize: parseInt(familySize),
                    monthlyIncome: parseFloat(monthlyIncome),
                    monthlyExpenses: parseFloat(monthlyExpenses),
                    location: location.trim(),
                    riskTolerance: getRiskToleranceForDb(riskTolerance)
                };
            }

            // Use exact same axios configuration as FamilyDetails
            if (updateMode === 'financial') {
                // Use PATCH for partial updates
                await axios.patch(`https://fullstack-backend-kosy.onrender.com/api/familyProfile/${familyProfileId}`, familyData, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            } else {
                // Use PUT for full updates
                await axios.put(`https://fullstack-backend-kosy.onrender.com/api/familyProfile/${familyProfileId}`, familyData, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }

            setSuccess(true);
            setTimeout(() => {
                navigate('/profile');
            }, 2000);

        } catch (error) {
            console.error('Error updating family profile:', error);

            // Use exact same error handling as FamilyDetails
            if (error.response) {
                const status = error.response.status;
                const errorData = error.response.data;

                if (status === 401 || status === 403) {
                    setError('Session expired. Please log in again.');
                } else if (status === 400) {
                    setError(errorData.message || 'Invalid data provided. Please check your inputs.');
                } else if (status === 500) {
                    setError('Server error. Please try again later.');
                } else {
                    setError(`Error: ${errorData.message || 'Failed to update family profile'}`);
                }
            } else if (error.request) {
                setError('Network error. Please check your connection.');
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-950">
                <DynamicNavbar />
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
                        <p className="text-white">Loading profile data...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Update Mode Selection Screen
    if (!updateMode) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-950 text-white">
                <DynamicNavbar />

                <div className="max-w-4xl mx-auto px-6 md:px-16 lg:px-24 py-8">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/profile')}
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="text-white" size={20} />
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-white">Update Family Profile</h1>
                                <p className="text-gray-300">Choose what you'd like to update</p>
                            </div>
                        </div>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-lg p-4 flex items-center space-x-3">
                            <AlertCircle className="text-red-400 w-5 h-5" />
                            <div>
                                <p className="text-red-300 font-medium">Error</p>
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Update Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Financial Update Option */}
                        <div
                            onClick={() => setUpdateMode('financial')}
                            className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 cursor-pointer hover:bg-white/10 transition-all group"
                        >
                            <div className="flex items-center justify-center mb-6">
                                <div className="p-4 bg-emerald-500/20 rounded-full group-hover:bg-emerald-500/30 transition-colors">
                                    <DollarSign className="text-emerald-400" size={32} />
                                </div>
                            </div>
                            <h2 className="text-xl font-semibold text-white mb-3 text-center">
                                Update Financial Information
                            </h2>
                            <p className="text-gray-300 text-center mb-6">
                                Quickly update only your monthly income and expenses
                            </p>
                            <div className="space-y-2 text-sm text-gray-400">
                                <div className="flex items-center space-x-2">
                                    <TrendingUp size={16} />
                                    <span>Monthly Income</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <TrendingUp size={16} />
                                    <span>Monthly Expenses</span>
                                </div>
                            </div>
                            <div className="mt-6 text-center">
                                <span className="text-emerald-400 text-sm font-medium">Quick Update</span>
                            </div>
                        </div>

                        {/* Full Update Option */}
                        <div
                            onClick={() => setUpdateMode('full')}
                            className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 cursor-pointer hover:bg-white/10 transition-all group"
                        >
                            <div className="flex items-center justify-center mb-6">
                                <div className="p-4 bg-blue-500/20 rounded-full group-hover:bg-blue-500/30 transition-colors">
                                    <Edit className="text-blue-400" size={32} />
                                </div>
                            </div>
                            <h2 className="text-xl font-semibold text-white mb-3 text-center">
                                Update Complete Profile
                            </h2>
                            <p className="text-gray-300 text-center mb-6">
                                Update all your family profile information including personal details
                            </p>
                            <div className="space-y-2 text-sm text-gray-400">
                                <div className="flex items-center space-x-2">
                                    <Users size={16} />
                                    <span>Family Size & Location</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <DollarSign size={16} />
                                    <span>Financial Information</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Shield size={16} />
                                    <span>Risk Tolerance</span>
                                </div>
                            </div>
                            <div className="mt-6 text-center">
                                <span className="text-blue-400 text-sm font-medium">Complete Update</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-950 text-white">
            <DynamicNavbar />

            <div className="max-w-4xl mx-auto px-6 md:px-16 lg:px-24 py-8">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setUpdateMode(null)}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="text-white" size={20} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-white">
                                {updateMode === 'financial' ? 'Update Financial Information' : 'Update Complete Profile'}
                            </h1>
                            <p className="text-gray-300">
                                {updateMode === 'financial'
                                    ? 'Update your monthly income and expenses'
                                    : 'Modify your complete family profile information'
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* Success Alert */}
                {success && (
                    <div className="mb-6 bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-4 flex items-center space-x-3">
                        <CheckCircle className="text-emerald-400 w-5 h-5" />
                        <div>
                            <p className="text-emerald-300 font-medium">Profile Updated Successfully!</p>
                            <p className="text-emerald-400 text-sm">Redirecting to profile page...</p>
                        </div>
                    </div>
                )}

                {/* Error Alert */}
                {error && (
                    <div className="mb-6 bg-red-500/20 border border-red-500/30 rounded-lg p-4 flex items-center space-x-3">
                        <AlertCircle className="text-red-400 w-5 h-5" />
                        <div>
                            <p className="text-red-300 font-medium">Update Failed</p>
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                {/* Update Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Financial Information - Always shown */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                            <DollarSign className="mr-2 text-emerald-400" size={24} />
                            Financial Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Monthly Income (₹) *
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={monthlyIncome}
                                    onChange={(e) => setMonthlyIncome(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Total monthly income"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Monthly Expenses (₹) *
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={monthlyExpenses}
                                    onChange={(e) => setMonthlyExpenses(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Total monthly expenses"
                                    required
                                />
                            </div>
                        </div>

                        {/* Savings Preview */}
                        {monthlyIncome && monthlyExpenses && (
                            <div className="mt-6 p-4 bg-white/5 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">Monthly Savings:</span>
                                    <span className={`font-bold text-lg ${
                                        (parseFloat(monthlyIncome) - parseFloat(monthlyExpenses)) >= 0
                                            ? 'text-emerald-400'
                                            : 'text-red-400'
                                    }`}>
                                        ₹{(parseFloat(monthlyIncome) - parseFloat(monthlyExpenses)).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Additional Information - Only shown for full update */}
                    {updateMode === 'full' && (
                        <>
                            {/* Basic Family Information */}
                            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                                    <Users className="mr-2 text-blue-400" size={24} />
                                    Basic Information
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Family Size *
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={familySize}
                                            onChange={(e) => setFamilySize(e.target.value)}
                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Number of family members"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            <MapPin className="inline mr-1" size={16} />
                                            Location *
                                        </label>
                                        <input
                                            type="text"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="City, State"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Risk Tolerance */}
                            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                                    <Shield className="mr-2 text-purple-400" size={24} />
                                    Investment Risk Tolerance
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { value: 'conservative', label: 'Conservative', desc: 'Low risk, stable returns' },
                                        { value: 'moderate', label: 'Moderate', desc: 'Balanced risk and returns' },
                                        { value: 'aggressive', label: 'Aggressive', desc: 'High risk, high potential returns' }
                                    ].map((option) => (
                                        <label key={option.value} className="cursor-pointer">
                                            <input
                                                type="radio"
                                                name="riskTolerance"
                                                value={option.value}
                                                checked={riskTolerance === option.value}
                                                onChange={(e) => setRiskTolerance(e.target.value)}
                                                className="sr-only"
                                            />
                                            <div className={`p-4 border-2 rounded-lg transition-all ${
                                                riskTolerance === option.value
                                                    ? 'border-blue-400 bg-blue-500/20'
                                                    : 'border-white/20 bg-white/5 hover:bg-white/10'
                                            }`}>
                                                <h3 className="text-white font-medium mb-1">{option.label}</h3>
                                                <p className="text-gray-400 text-sm">{option.desc}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => setUpdateMode(null)}
                            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                        >
                            Back to Options
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? (
                                <>
                                    <RefreshCw className="animate-spin" size={16} />
                                    <span>Updating...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    <span>Update Profile</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateFamilyProfile;
